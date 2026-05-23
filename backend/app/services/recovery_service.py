import time

from app.agents.base import AgentContext
from app.agents.diagnostician import DiagnosticianAgent
from app.agents.executor import ExecutorAgent
from app.agents.governor import GovernorAgent
from app.agents.historian import HistorianAgent
from app.agents.sentinel import SentinelAgent
from app.agents.strategist import StrategistAgent
from app.agents.verifier import VerifierAgent
from app.core.exceptions import CortexError
from app.memory import hydradb_memory
from app.schemas.events import CortexEvent
from app.schemas.workflow import Incident, RecoveryRequest, RecoveryResult, RollbackInfo, WorkflowStatus
from app.services.event_bus import event_bus
from app.services.rollback_service import rollback_service
from app.services.workflow_service import workflow_service


class RecoveryService:
    def __init__(self) -> None:
        self._agents = [
            SentinelAgent(),
            DiagnosticianAgent(),
            StrategistAgent(),
            GovernorAgent(),
            ExecutorAgent(),
            VerifierAgent(),
            HistorianAgent(),
        ]

    async def recover(self, request: RecoveryRequest) -> RecoveryResult:
        workflow = await workflow_service.get_workflow(request.workflow_id)
        if workflow is None:
            raise CortexError("Workflow not found", status_code=404)

        await hydradb_memory.store_checkpoint(workflow, reason="pre_recovery:stable")
        await workflow_service.update_status(workflow.id, WorkflowStatus.RECOVERING)
        start = time.perf_counter()
        context = AgentContext(signal=request.signal, severity=request.severity, workflow_name=workflow.name)
        if request.force_verification_failure:
            context.facts["force_verification_failure"] = True

        await event_bus.publish(CortexEvent(type="recovery.started", message=f"Recovery started for {workflow.name}"))
        for agent in self._agents:
            context = await agent.run(context)
            await hydradb_memory.store_agent_state(
                workflow_id=workflow.id,
                agent_name=agent.name,
                facts=context.facts,
                timeline=context.timeline,
            )
            await event_bus.publish(
                CortexEvent(
                    type=f"agent.{agent.name}.completed",
                    message=context.timeline[-1],
                    payload={"agent": agent.name, "workflowId": str(workflow.id)},
                )
            )

        elapsed_ms = int((time.perf_counter() - start) * 1000)
        agent_recovered = bool(context.facts.get("verified") and context.facts.get("approved"))
        rollback_info: RollbackInfo | None = None
        final_status = WorkflowStatus.HEALTHY

        if agent_recovered:
            await workflow_service.update_status(workflow.id, WorkflowStatus.HEALTHY)
        else:
            rollback_info = await rollback_service.attempt_rollback(
                workflow_id=workflow.id,
                timeline=context.timeline,
                reason="recovery_verification_failed",
            )
            if rollback_info.restored:
                restored_workflow = await workflow_service.get_workflow(workflow.id)
                final_status = restored_workflow.status if restored_workflow else WorkflowStatus.DEGRADED
            else:
                final_status = WorkflowStatus.FAILED
                await workflow_service.update_status(workflow.id, WorkflowStatus.FAILED)

        recovered = agent_recovered or bool(rollback_info and rollback_info.restored)

        incident = Incident(
            workflow_id=workflow.id,
            title=f"{request.signal.replace('_', ' ').title()} on {workflow.name}",
            severity=request.severity,
            status=final_status,
            root_cause=context.facts.get("root_cause"),
            recovery_action=context.facts.get("action"),
            elapsed_ms=elapsed_ms,
        )
        completion_message = (
            f"Recovery completed in {elapsed_ms}ms"
            if agent_recovered
            else f"Recovery finished in {elapsed_ms}ms — rollback {'succeeded' if recovered else 'failed'}"
        )
        await event_bus.publish(
            CortexEvent(
                type="recovery.completed",
                message=completion_message,
                payload={
                    "recovered": recovered,
                    "incidentId": str(incident.id),
                    "rollback": rollback_info.model_dump() if rollback_info else None,
                },
            )
        )
        await hydradb_memory.store_incident(incident)
        await hydradb_memory.store_recovery_history(incident, context.timeline, recovered)
        return RecoveryResult(
            incident=incident,
            timeline=context.timeline,
            recovered=recovered,
            rollback=rollback_info,
        )


recovery_service = RecoveryService()
