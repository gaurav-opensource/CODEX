from __future__ import annotations

import asyncio
from typing import Any

from app.core.logging import get_logger
from app.core.events import CortexEvent, EventChannel
from app.schemas.reasoning import AgentReasoningEvent
from app.services.event_bus import event_bus
from app.services.websocket_events import sandbox_ws

logger = get_logger(__name__)

_AGENT_LABELS = {
    "sentinel": "Sentinel",
    "governor": "Governor",
    "diagnostician": "Diagnostician",
    "strategist": "Strategist",
    "executor": "Executor",
    "verifier": "Verifier",
    "historian": "Historian",
}

# step index → UI stage (0..5)
_TIMELINE_MAP: dict[str, int] = {
    "failure_injected": 0,
    "workflow.failed": 0,
    "incident.created": 0,
    "root_cause.identified": 1,
    "agent.diagnostician.completed": 1,
    "strategy.selected": 2,
    "agent.strategist.completed": 2,
    "recovery.started": 3,
    "verification.passed": 4,
    "agent.verifier.completed": 4,
    "memory.updated": 5,
    "agent.historian.completed": 5,
    "recovery.completed": 5,
}

# semantic stage id for frontend (matches expected event names)
_TIMELINE_STAGE: dict[str, str] = {
    "failure_injected": "failure.detected",
    "workflow.failed": "failure.detected",
    "incident.created": "incident.created",
    "root_cause.identified": "root_cause.identified",
    "agent.diagnostician.completed": "root_cause.identified",
    "strategy.selected": "strategy.selected",
    "agent.strategist.completed": "strategy.selected",
    "recovery.started": "recovery.started",
    "verification.passed": "verification.passed",
    "agent.verifier.completed": "verification.passed",
    "memory.updated": "memory.updated",
    "agent.historian.completed": "memory.updated",
    "recovery.completed": "memory.updated",
}


class SandboxBridge:
    def __init__(self) -> None:
        self._tasks: list[asyncio.Task] = []
        self._running = False

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        for channel in (EventChannel.EVENTS, EventChannel.RUNTIME, EventChannel.RECOVERY, EventChannel.REASONING):
            self._tasks.append(asyncio.create_task(self._listen(channel), name=f"sandbox-bridge-{channel.value}"))

    async def stop(self) -> None:
        self._running = False
        for task in self._tasks:
            task.cancel()
        for task in self._tasks:
            try:
                await task
            except asyncio.CancelledError:
                pass
        self._tasks.clear()

    async def _listen(self, channel: EventChannel) -> None:
        try:
            async for event in event_bus.subscribe(channel):
                if not self._running:
                    break
                translated = self._translate(event)
                if translated is not None:
                    await sandbox_ws.broadcast(translated)
                timeline = self._translate_timeline(event)
                if timeline is not None:
                    await sandbox_ws.broadcast(timeline)
        except asyncio.CancelledError:
            return

    def _translate(self, event: CortexEvent) -> dict[str, Any] | None:
        if event.channel == EventChannel.REASONING:
            return self._translate_reasoning(event)
        if event.type == "metrics.tick":
            payload = event.payload
            latency = int(payload.get("latencyMs", 0))
            return {
                "type": "metrics_update",
                "metrics": {
                    "latency": latency,
                    "error_rate": round(min(0.35, latency / 4000), 3),
                    "saturation": round(min(1.0, latency / 900), 2),
                    "workflow_id": payload.get("workflowId"),
                    "status": payload.get("status"),
                },
            }
        if event.type.startswith("agent.") and event.type.endswith(".completed"):
            agent = str(event.payload.get("agent", "unknown"))
            label = _AGENT_LABELS.get(agent, agent.title())
            return AgentReasoningEvent(
                agent=label,
                reasoning=event.message,
                confidence=float(event.payload.get("confidence", 72)),
                strategy=event.payload.get("strategy"),
                risk=event.payload.get("risk"),
                status="completed",
                incident_id=str(event.payload.get("incidentId", "")),
                workflow_id=str(event.payload.get("workflowId", "")),
            ).model_dump(mode="json")
        if event.type.startswith("agent.") and event.type.endswith(".started"):
            agent = str(event.payload.get("agent", "unknown"))
            label = _AGENT_LABELS.get(agent, agent.title())
            return {
                "id": event.id,
                "type": "agent_execution",
                "agent": label,
                "status": "running",
                "incident_id": str(event.payload.get("incidentId", "")),
                "workflow_id": str(event.payload.get("workflowId", "")),
            }
        if event.channel in {EventChannel.RECOVERY, EventChannel.RUNTIME, EventChannel.EVENTS}:
            return {
                "id": event.id,
                "type": event.type,
                "message": event.message,
                "channel": event.channel.value,
                "payload": event.payload,
                "created_at": event.created_at.isoformat(),
            }
        return None

    def _translate_timeline(self, event: CortexEvent) -> dict[str, Any] | None:
        step = _TIMELINE_MAP.get(event.type)
        if step is None:
            return None
        return {
            "type": "timeline_update",
            "step": step,
            "stage": _TIMELINE_STAGE.get(event.type, event.type),
            "message": event.message,
            "workflow_id": event.payload.get("workflowId"),
            "incident_id": event.payload.get("incidentId"),
        }

    def _translate_reasoning(self, event: CortexEvent) -> dict[str, Any] | None:
        payload = event.payload
        reasoning = payload.get("reasoning") if isinstance(payload.get("reasoning"), dict) else payload
        if not isinstance(reasoning, dict):
            return None
        agent_key = str(reasoning.get("agent") or payload.get("agent") or "unknown")
        label = _AGENT_LABELS.get(agent_key, agent_key.title())
        lines = reasoning.get("reasoning", [])
        text = " | ".join(lines) if isinstance(lines, list) else str(lines)
        risk = reasoning.get("risk")
        translated = AgentReasoningEvent(
            agent=label,
            reasoning=text,
            confidence=float(reasoning.get("confidence", 0)),
            strategy=reasoning.get("selected_strategy"),
            risk=risk.value if hasattr(risk, "value") else risk,
            status="completed",
            incident_id=str(reasoning.get("incident_id") or payload.get("incident_id", "")),
            workflow_id=str(reasoning.get("workflow_id") or payload.get("workflow_id", "")),
        ).model_dump(mode="json")
        translated["id"] = event.id
        return translated


sandbox_bridge = SandboxBridge()
