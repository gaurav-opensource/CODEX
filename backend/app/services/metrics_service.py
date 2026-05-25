from __future__ import annotations

from uuid import UUID

from app.core.events import FailureInjectionRequest
from app.schemas.workflow import WorkflowStatus
from app.services.websocket_events import sandbox_ws
from app.services.workflow_service import workflow_service


class MetricsService:
    async def spike_metrics(self, request: FailureInjectionRequest, workflow_id: UUID) -> dict[str, float | int]:
        workflow = await workflow_service.get_workflow(workflow_id)
        if workflow is None:
            metrics = {"latency": 900, "error_rate": 0.18, "saturation": 0.92}
        else:
            latency = max(workflow.avg_latency_ms, 400)
            error_rate = round(max(0.02, (100 - workflow.success_rate) / 100), 3)
            saturation = 0.95 if workflow.status == WorkflowStatus.FAILED else 0.78
            metrics = {"latency": latency, "error_rate": error_rate, "saturation": saturation}
        await sandbox_ws.broadcast({"type": "metrics_update", "metrics": metrics, "workflow_id": str(workflow_id)})
        return metrics

    async def get_summary(self, workflow_id: UUID) -> dict[str, float | int]:
        workflow = await workflow_service.get_workflow(workflow_id)
        if workflow is None:
            return {"latency": 120, "error_rate": 0.02, "saturation": 0.7}
        return {
            "latency": workflow.avg_latency_ms,
            "error_rate": round(max(0.01, (100 - workflow.success_rate) / 100), 3),
            "saturation": round(min(1.0, workflow.avg_latency_ms / 800), 2),
        }


metrics_service = MetricsService()
