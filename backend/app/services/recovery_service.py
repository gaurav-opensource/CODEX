import asyncio
import random
import time

from app.agents.base import AgentContext, CortexAgent
from app.agents.diagnostician import DiagnosticianAgent
from app.agents.executor import ExecutorAgent
from app.agents.governor import GovernorAgent
from app.agents.historian import HistorianAgent
from app.agents.sentinel import SentinelAgent
from app.agents.strategist import StrategistAgent
from app.agents.verifier import VerifierAgent
from app.core.exceptions import CortexError
from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel, EventType
from app.schemas.workflow import IncidentStatus, RecoveryRequest, RecoveryResult, RollbackInfo, WorkflowStatus
from app.services.analytics_service import analytics_service
from app.services.event_bus import event_bus
from app.services.incident_service import incident_service
from app.services.reasoning_service import reasoning_service
from app.services.rollback_service import rollback_service
from app.services.topology_service import topology_service
from app.services.workflow_service import workflow_service


class RecoveryService:
    @property
    def active_recovery_count(self) -> int:
        return len(self._active)

    def __init__(self) -> None:
        self._agents: list[CortexAgent] = [
            SentinelAgent(), GovernorAgent(), DiagnosticianAgent(), StrategistAgent(),
            ExecutorAgent(), VerifierAgent(), HistorianAgent(),
        ]
        self._active: set[str] = set()

    async def recover(self, request: RecoveryRequest) -> RecoveryResult:
        workflow = await workflow_service.get_workflow(request.workflow_id)
        if workflow is None:
            raise CortexError("Workflow not found", status_code=404)
        if str(workflow.id) in self._active:
            raise CortexError("Recovery already running for workflow", status_code=409)

        self._active.add(str(workflow.id))
        start = time.perf_counter()
        incident = await incident_service.open_for_workflow(workflow.id, workflow.name, request.signal, request.severity)
        context = AgentContext(
            workflow_id=workflow.id,
            incident_id=incident.id,
            signal=request.signal,
            severity=request.severity.value,
            workflow_name=workflow.name,
            facts={"latency_ms": workflow.avg_latency_ms, "force_verification_failure": request.force_verification_failure},
        )

        try:
            await hydradb_memory.store_checkpoint(workflow, reason="pre_recovery:stable")
            await workflow_service.update_status(workflow.id, WorkflowStatus.RECOVERING)
            incident = await incident_service.update_status(incident, IncidentStatus.INVESTIGATING)
            await self._publish("recovery.started", f"Recovery pipeline initiated for {workflow.name}", workflow.id, incident.id)

            for agent in self._agents:
                context = await self._run_agent(workflow, agent, context)
                if agent.name == "diagnostician":
                    context.facts["similar_incidents"] = len(await hydradb_memory.list_incidents())
                    incident = await incident_service.update_status(incident, IncidentStatus.RECOVERING)
                if agent.name == "verifier":
                    incident = await incident_service.update_status(incident, IncidentStatus.VERIFYING)

            elapsed_ms = int((time.perf_counter() - start) * 1000)
            rollback_info = await self._finalize_workflow(context)
            verified = bool(context.facts.get("verified"))
            rollback_restored = bool(rollback_info and rollback_info.restored)
            recovered = verified or rollback_restored
            partial = rollback_restored and not verified
            if partial:
                await workflow_service.update_status(workflow.id, WorkflowStatus.DEGRADED)
                context.timeline.append("Recovery partially successful — residual instability observed")
            incident = await incident_service.update(
                incident,
                status=IncidentStatus.RESOLVED if recovered and not partial else IncidentStatus.VERIFYING if partial else IncidentStatus.FAILED,
                root_cause=context.facts.get("root_cause"),
                recovery_action=context.facts.get("action") or ("Partial recovery with rollback restore" if partial else None),
                elapsed_ms=elapsed_ms,
            )
            await reasoning_service.finalize(workflow=workflow, context=context, recovered=recovered, elapsed_ms=elapsed_ms)
            await hydradb_memory.store_recovery_history(incident, context.timeline, recovered)
            await event_bus.publish(
                CortexEvent(
                    type=EventType.MEMORY_UPDATED,
                    message=f"HydraDB stored recovery pattern for {workflow.name}",
                    channel=EventChannel.RECOVERY,
                    payload={"workflowId": str(workflow.id), "incidentId": str(incident.id), "recovered": recovered},
                )
            )
            await topology_service.apply_recovery(workflow.id)
            analytics_service.record_recovery(elapsed_ms)
            await event_bus.publish(
                CortexEvent(
                    type=EventType.RECOVERY_COMPLETED,
                    message=f"Recovery completed in {elapsed_ms}ms",
                    channel=EventChannel.RECOVERY,
                    payload={
                        "workflowId": str(workflow.id),
                        "incidentId": str(incident.id),
                        "recovered": recovered,
                        "partial": partial,
                        "rollback": rollback_info.model_dump() if rollback_info else None,
                    },
                )
            )
            return RecoveryResult(incident=incident, timeline=context.timeline, recovered=recovered, rollback=rollback_info)
        finally:
            self._active.discard(str(workflow.id))

    async def recover_background(self, request: RecoveryRequest) -> None:
        try:
            await self.recover(request)
        except Exception as exc:
            await event_bus.publish(CortexEvent(type=EventType.RECOVERY_FAILED, message=str(exc), channel=EventChannel.RECOVERY))

    async def _run_agent(self, workflow, agent: CortexAgent, context: AgentContext) -> AgentContext:
        analytics_service.mark_agent(agent.name, "active", agent.activity)
        await event_bus.publish(
            CortexEvent(
                type=f"agent.{agent.name}.started",
                message=f"{agent.name.title()} started",
                channel=EventChannel.RUNTIME,
                payload={"agent": agent.name, "workflowId": str(context.workflow_id), "incidentId": str(context.incident_id)},
            )
        )
        start = time.perf_counter()
        await asyncio.sleep(0.12 + random.uniform(0, 0.22))
        context = await agent.run(context)
        if agent.name == "strategist":
            decision = reasoning_service.decide_strategy(context)
            context.facts["strategy"] = decision.selected_strategy
            context.facts["validated_strategy"] = decision.selected_strategy
            context.facts["approved"] = decision.approved
            context.facts["confidence"] = decision.confidence
            context.facts["fallback_strategy"] = decision.fallback_strategy
            context.timeline.append(f"Governor safety gate validated strategy={decision.selected_strategy} reason={decision.reason}")
        duration_ms = int((time.perf_counter() - start) * 1000)
        analytics_service.mark_agent(agent.name, "done", "DONE", duration_ms)
        reasoning = await reasoning_service.build_reasoning(workflow=workflow, agent_name=agent.name, context=context)
        context.reasoning.append(reasoning)
        await reasoning_service.publish(workflow=workflow, context=context, reasoning=reasoning)
        await hydradb_memory.store_agent_state(
            workflow_id=context.workflow_id,
            agent_name=agent.name,
            facts=context.facts,
            timeline=context.timeline,
        )
        await event_bus.publish(
            CortexEvent(
                type=f"agent.{agent.name}.completed",
                message=context.timeline[-1],
                channel=EventChannel.RUNTIME,
                payload={"agent": agent.name, "workflowId": str(context.workflow_id), "incidentId": str(context.incident_id)},
            )
        )
        return context

    async def _finalize_workflow(self, context: AgentContext) -> RollbackInfo | None:
        if context.facts.get("verified"):
            await workflow_service.update_status(context.workflow_id, WorkflowStatus.HEALTHY)
            return None
        rollback = await rollback_service.attempt_rollback(
            workflow_id=context.workflow_id,
            timeline=context.timeline,
            reason="recovery_verification_failed",
            incident_id=context.incident_id,
        )
        if rollback.restored:
            await workflow_service.update_status(context.workflow_id, WorkflowStatus.DEGRADED)
        else:
            await workflow_service.update_status(context.workflow_id, WorkflowStatus.FAILED)
        return rollback

    async def _publish(self, event_type: str, message: str, workflow_id, incident_id) -> None:
        await event_bus.publish(
            CortexEvent(
                type=event_type,
                message=message,
                channel=EventChannel.RECOVERY,
                payload={"workflowId": str(workflow_id), "incidentId": str(incident_id)},
            )
        )


recovery_service = RecoveryService()
