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
from app.schemas.workflow import Incident, RecoveryRequest, RecoveryResult, WorkflowStatus
from app.services.event_bus import event_bus
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

        await workflow_service.update_status(workflow.id, WorkflowStatus.RECOVERING)
        start = time.perf_counter()
        context = AgentContext(signal=request.signal, severity=request.severity, workflow_name=workflow.name)

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
        recovered = bool(context.facts.get("verified") and context.facts.get("approved"))
        await workflow_service.update_status(workflow.id, WorkflowStatus.HEALTHY if recovered else WorkflowStatus.FAILED)

        incident = Incident(
            workflow_id=workflow.id,
            title=f"{request.signal.replace('_', ' ').title()} on {workflow.name}",
            severity=request.severity,
            status=WorkflowStatus.HEALTHY if recovered else WorkflowStatus.FAILED,
            root_cause=context.facts.get("root_cause"),
            recovery_action=context.facts.get("action"),
            elapsed_ms=elapsed_ms,
        )
        await event_bus.publish(
            CortexEvent(
                type="recovery.completed",
                message=f"Recovery completed in {elapsed_ms}ms",
                payload={"recovered": recovered, "incidentId": str(incident.id)},
            )
        )
        await hydradb_memory.store_incident(incident)
        await hydradb_memory.store_recovery_history(incident, context.timeline, recovered)
        return RecoveryResult(incident=incident, timeline=context.timeline, recovered=recovered)


recovery_service = RecoveryService()
