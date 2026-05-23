from uuid import UUID

from app.schemas.workflow import MetricSnapshot, Workflow, WorkflowStatus
from app.memory import hydradb_memory


class WorkflowService:
    def __init__(self) -> None:
        self._bootstrapped = False

    async def bootstrap(self) -> None:
        if self._bootstrapped:
            return
        if not await hydradb_memory.list_workflows():
            for workflow in self._seed_workflows():
                await hydradb_memory.upsert_workflow(workflow)
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
        return updated

    def metrics(self) -> MetricSnapshot:
        return MetricSnapshot(
            detection_latency_ms=73,
            recovery_time_ms=842,
            recovery_success_rate=99.97,
            websocket_latency_ms=32,
            api_response_ms=118,
        )

    @staticmethod
    def _seed_workflows() -> list[Workflow]:
        return [
            Workflow(name="Claims Intake", status=WorkflowStatus.HEALTHY, owner="Ops AI", success_rate=99.98, avg_latency_ms=118),
            Workflow(name="Patient Triage", status=WorkflowStatus.DEGRADED, owner="Clinical AI", success_rate=98.84, avg_latency_ms=391),
            Workflow(name="Invoice Reconciliation", status=WorkflowStatus.HEALTHY, owner="Finance AI", success_rate=99.91, avg_latency_ms=144),
            Workflow(name="Prior Auth Routing", status=WorkflowStatus.RECOVERING, owner="Care AI", success_rate=99.12, avg_latency_ms=267),
        ]


workflow_service = WorkflowService()
