import asyncio
import random
from uuid import UUID

from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.schemas.workflow import RecoveryRequest, Severity, Workflow, WorkflowStatus
from app.services.event_bus import event_bus
from app.services.recovery_service import recovery_service
from app.services.workflow_service import workflow_service


class RuntimeService:
    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                return

    async def inject_failure(self, workflow_id: UUID, signal: str = "latency_spike", auto_recover: bool = True):
        workflow = await workflow_service.fail_workflow(workflow_id, signal)
        if workflow and auto_recover:
            asyncio.create_task(
                recovery_service.recover_background(
                    RecoveryRequest(workflow_id=workflow.id, signal=signal, severity=Severity.HIGH)
                )
            )
        return workflow

    async def _drift_workflow(self, workflow: Workflow) -> Workflow:
        if workflow.status == WorkflowStatus.HEALTHY and random.random() < 0.15:
            drift_latency = max(80, workflow.avg_latency_ms + random.randint(-12, 28))
            drift_rate = round(min(99.99, max(88.0, workflow.success_rate + random.uniform(-0.4, 0.2))), 2)
        else:
            drift_latency = max(90, workflow.avg_latency_ms + random.randint(-35, 85))
            drift_rate = round(max(82.0, min(99.5, workflow.success_rate + random.uniform(-1.2, 0.6))), 2)
        updated = workflow.model_copy(
            update={
                "avg_latency_ms": drift_latency,
                "success_rate": drift_rate,
                "retries": workflow.retries + (1 if random.random() < 0.08 else 0),
            }
        )
        return await hydradb_memory.upsert_workflow(updated)

    async def _loop(self) -> None:
        while self._running:
            await asyncio.sleep(3 + random.random() * 2)
            workflows = await workflow_service.list_workflows()
            if not workflows:
                continue
            workflow = random.choice(workflows)
            workflow = await self._drift_workflow(workflow)
            error_rate = round(max(0.5, (100 - workflow.success_rate) / 10), 2)
            saturation = round(min(1.0, workflow.avg_latency_ms / 900), 2)
            await event_bus.publish(
                CortexEvent(
                    type="metrics.tick",
                    message=f"{workflow.name} latency={workflow.avg_latency_ms}ms err={error_rate}%",
                    channel=EventChannel.RUNTIME,
                    payload={
                        "workflowId": str(workflow.id),
                        "latencyMs": workflow.avg_latency_ms,
                        "status": workflow.status.value,
                        "successRate": workflow.success_rate,
                        "retries": workflow.retries,
                        "errorRate": error_rate,
                        "saturation": saturation,
                    },
                )
            )
            if workflow.status in {WorkflowStatus.DEGRADED, WorkflowStatus.FAILED} and random.random() < 0.06:
                await self.inject_failure(
                    workflow.id,
                    signal=random.choice(["latency_spike", "redis_failure", "cpu_spike"]),
                    auto_recover=True,
                )


runtime_service = RuntimeService()
