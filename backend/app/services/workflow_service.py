import random
from uuid import UUID

from app.schemas.workflow import Incident, IncidentStatus, MetricSnapshot, Severity, Workflow, WorkflowStatus
from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.services.event_bus import event_bus


class WorkflowService:
    def __init__(self) -> None:
        self._bootstrapped = False

    async def bootstrap(self) -> None:
        if self._bootstrapped:
            return
        if not await hydradb_memory.list_workflows():
            for workflow in self._seed_workflows():
                await hydradb_memory.upsert_workflow(workflow)
                await hydradb_memory.store_checkpoint(workflow, reason="bootstrap:stable")
            await self._seed_memory()
        self._bootstrapped = True

    async def list_workflows(self) -> list[Workflow]:
        await self.bootstrap()
        return await hydradb_memory.list_workflows()

    async def get_workflow(self, workflow_id: UUID) -> Workflow | None:
        await self.bootstrap()
        return await hydradb_memory.get_workflow(workflow_id)

    async def update_status(self, workflow_id: UUID, status: WorkflowStatus) -> Workflow | None:
        workflow = await self.get_workflow(workflow_id)
        if workflow is None:
            return None
        updated = workflow.model_copy(update={"status": status})
        await hydradb_memory.upsert_workflow(updated)
        await hydradb_memory.store_checkpoint(updated, reason=f"status:{status}")
        await event_bus.publish(
            CortexEvent(
                type="workflow.updated",
                message=f"{updated.name} status changed to {status.value}",
                channel=EventChannel.RUNTIME,
                payload={"workflowId": str(updated.id), "status": status.value},
            )
        )
        return updated

    async def fail_workflow(self, workflow_id: UUID, signal: str = "latency_spike") -> Workflow | None:
        workflow = await self.get_workflow(workflow_id)
        if workflow is None:
            return None
        updated = workflow.model_copy(
            update={
                "status": WorkflowStatus.FAILED,
                "avg_latency_ms": max(workflow.avg_latency_ms * 3, 900),
                "success_rate": max(workflow.success_rate - 4.5, 80),
                "retries": workflow.retries + 3,
            }
        )
        stored = await hydradb_memory.upsert_workflow(updated)
        await event_bus.publish(
            CortexEvent(
                type="workflow.failed",
                message=f"{stored.name} emitted {signal}",
                channel=EventChannel.RUNTIME,
                payload={"workflowId": str(stored.id), "signal": signal, "status": stored.status.value},
            )
        )
        return stored

    async def restore_from_checkpoint(self, workflow: Workflow, checkpoint_reason: str) -> Workflow:
        restored = await hydradb_memory.upsert_workflow(workflow)
        await hydradb_memory.store_checkpoint(restored, reason=f"rollback:restored:{checkpoint_reason}")
        return restored

    async def metrics(self) -> MetricSnapshot:
        workflows = await self.list_workflows()
        avg_latency = int(sum(w.avg_latency_ms for w in workflows) / max(len(workflows), 1))
        unhealthy = sum(1 for w in workflows if w.status != WorkflowStatus.HEALTHY)
        return MetricSnapshot(
            detection_latency_ms=max(42, min(150, avg_latency // 4)),
            recovery_time_ms=640 + unhealthy * 120,
            recovery_success_rate=round(99.7 - unhealthy * 0.55, 2),
            websocket_latency_ms=random.randint(18, 42),
            api_response_ms=random.randint(70, 140),
        )

    @staticmethod
    def _seed_workflows() -> list[Workflow]:
        return [
            Workflow(name="payment-processing", status=WorkflowStatus.HEALTHY, owner="Finance AI", success_rate=99.41, avg_latency_ms=128, retries=1, uptime_pct=99.91),
            Workflow(name="healthcare-ai-pipeline", status=WorkflowStatus.DEGRADED, owner="Clinical AI", success_rate=96.12, avg_latency_ms=518, retries=4, uptime_pct=98.4),
            Workflow(name="customer-support-agent", status=WorkflowStatus.DEGRADED, owner="CX AI", success_rate=97.88, avg_latency_ms=312, retries=2, uptime_pct=99.1),
            Workflow(name="fraud-detection-runtime", status=WorkflowStatus.RECOVERING, owner="Risk AI", success_rate=94.2, avg_latency_ms=742, retries=6, uptime_pct=97.8),
            Workflow(name="api-orchestrator", status=WorkflowStatus.FAILED, owner="Platform AI", success_rate=88.5, avg_latency_ms=1240, retries=8, uptime_pct=96.2),
            Workflow(name="claims-adjudication", status=WorkflowStatus.DEGRADED, owner="Insurance AI", success_rate=95.6, avg_latency_ms=890, retries=5, uptime_pct=98.0),
        ]

    async def _seed_memory(self) -> None:
        workflows = await hydradb_memory.list_workflows()
        if not workflows:
            return
        primary = workflows[1] if len(workflows) > 1 else workflows[0]
        await hydradb_memory.store_checkpoint(primary, reason="checkpoint_v1")
        await hydradb_memory.store_checkpoint(primary, reason="checkpoint_v2")
        await hydradb_memory.store_checkpoint(primary, reason="checkpoint_v3")
        await hydradb_memory.store_rollback_history(
            workflow_id=primary.id,
            incident_id=None,
            restored=True,
            checkpoint_reason="checkpoint_v3",
            timeline=["Bootstrap rollback checkpoint stored", "Snapshot verified"],
            metadata={"seed": True},
        )
        from app.services.operational_text import incident_title

        await hydradb_memory.store_incident(
            Incident(
                workflow_id=primary.id,
                title=incident_title(workflow_name=primary.name, signal="redis_failure", severity="high"),
                severity=Severity.HIGH,
                status=IncidentStatus.INVESTIGATING,
                root_cause="Redis replication drift with partial checkpoint lineage",
                recovery_action="Rollback arbitration in progress",
                elapsed_ms=0,
            )
        )
        secondary = workflows[3] if len(workflows) > 3 else primary
        await hydradb_memory.store_incident(
            Incident(
                workflow_id=secondary.id,
                title="Agent quorum instability in fraud-detection-runtime",
                severity=Severity.CRITICAL,
                status=IncidentStatus.OPEN,
                root_cause="Semantic recovery plan diverged from historical baseline",
                recovery_action="Awaiting governor policy consensus",
            )
        )
        await hydradb_memory.store_incident(
            Incident(
                workflow_id=workflows[4].id if len(workflows) > 4 else primary.id,
                title="HydraDB checkpoint replay exceeded recovery threshold",
                severity=Severity.HIGH,
                status=IncidentStatus.VERIFYING,
                root_cause="Workflow consensus mismatch during rollback arbitration",
                recovery_action="Verifier observing residual instability",
                elapsed_ms=1840,
            )
        )


workflow_service = WorkflowService()
