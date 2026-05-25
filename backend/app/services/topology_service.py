from __future__ import annotations

from uuid import UUID

from app.core.logging import get_logger
from app.services.websocket_events import sandbox_ws

logger = get_logger(__name__)


class TopologyService:
    def __init__(self) -> None:
        self.topology: dict[str, dict] = {
            "nodes": [
                {"id": "gateway", "label": "API Gateway", "status": "healthy"},
                {"id": "orchestrator", "label": "Workflow Orchestrator", "status": "healthy"},
                {"id": "worker", "label": "Agent Worker Pool", "status": "healthy"},
                {"id": "memory", "label": "HydraDB Memory", "status": "healthy"},
                {"id": "metrics", "label": "Metrics Pipeline", "status": "healthy"},
            ],
            "edges": [
                {"from": "gateway", "to": "orchestrator"},
                {"from": "orchestrator", "to": "worker"},
                {"from": "worker", "to": "memory"},
                {"from": "worker", "to": "metrics"},
            ],
        }

    def _set_status(self, node_id: str, status: str) -> None:
        for node in self.topology["nodes"]:
            if node["id"] == node_id:
                node["status"] = status

    async def apply_failure(self, workflow_id: UUID, signal: str) -> dict:
        self._set_status("gateway", "degraded")
        self._set_status("worker", "failed")
        self._set_status("metrics", "degraded")
        if "database" in signal or "redis" in signal:
            self._set_status("memory", "degraded")
        await self.broadcast_topology(workflow_id=str(workflow_id), signal=signal)
        return self.topology

    async def apply_recovery(self, workflow_id: UUID) -> dict:
        for node in self.topology["nodes"]:
            node["status"] = "healthy"
        await self.broadcast_topology(workflow_id=str(workflow_id), signal="recovered")
        return self.topology

    async def broadcast_topology(self, *, workflow_id: str, signal: str) -> None:
        await sandbox_ws.broadcast(
            {
                "type": "topology_update",
                "topology": self.topology,
                "workflow_id": workflow_id,
                "signal": signal,
            }
        )


topology_service = TopologyService()
