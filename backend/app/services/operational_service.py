from __future__ import annotations

import asyncio
import random

from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.schemas.workflow import WorkflowStatus
from app.services.analytics_service import analytics_service
from app.services.event_bus import event_bus
from app.services.operational_text import ambient_event
from app.services.recovery_service import recovery_service
from app.services.workflow_service import workflow_service


class OperationalService:
    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._running = False
        self.hydra_sync_state: str = "synced"
        self.policy_arbitration_pending = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        if hydradb_memory.fallback_reason:
            self.hydra_sync_state = "degraded"
        self._task = asyncio.create_task(self._ambient_loop())

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def status(self) -> dict:
        workflows = await workflow_service.list_workflows()
        incidents = await hydradb_memory.list_incidents()
        degraded = sum(1 for w in workflows if w.status == WorkflowStatus.DEGRADED)
        failed = sum(1 for w in workflows if w.status == WorkflowStatus.FAILED)
        recovering = sum(1 for w in workflows if w.status == WorkflowStatus.RECOVERING)
        open_incidents = sum(1 for i in incidents if i.status.value not in {"resolved"})
        active_recoveries = recovery_service.active_recovery_count
        agents_active = sum(1 for a in analytics_service.agent_stats.values() if a.state == "active")

        runtime_health = "healthy"
        if failed or self.hydra_sync_state == "degraded":
            runtime_health = "degraded"
        elif degraded or recovering or open_incidents or self.policy_arbitration_pending:
            runtime_health = "strained"

        return {
            "runtime_health": runtime_health,
            "websocket_connected": True,
            "hydradb_sync": self.hydra_sync_state,
            "active_recoveries": active_recoveries,
            "degraded_workflows": degraded,
            "recovering_workflows": recovering,
            "open_incidents": open_incidents,
            "agents_active": agents_active,
            "policy_arbitration_pending": self.policy_arbitration_pending,
        }

    async def _ambient_loop(self) -> None:
        while self._running:
            await asyncio.sleep(6 + random.random() * 4)
            if random.random() < 0.35:
                self.hydra_sync_state = random.choice(["synced", "synced", "degraded", "reconciling"])
            self.policy_arbitration_pending = random.random() < 0.18
            if random.random() < 0.55:
                event_type, message, extra = ambient_event()
                await event_bus.publish(
                    CortexEvent(
                        type=event_type,
                        message=message,
                        channel=EventChannel.EVENTS,
                        payload=extra,
                    )
                )


operational_service = OperationalService()
