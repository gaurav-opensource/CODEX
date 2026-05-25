import json
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ValidationError

from app.core.logging import get_logger
from app.integrations.hydradb import HydraDBClient, HydraDBConnectionError
from app.schemas.workflow import Incident, Workflow, WorkflowStatus

logger = get_logger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class HydraDBMemoryService:
    def __init__(self) -> None:
        self._client = HydraDBClient()
        self._fallback_reason: str | None = None
        self._local: dict[str, dict[str, dict[str, Any]]] = {
            "workflow": {},
            "snapshot": {},
            "checkpoint": {},
            "incident": {},
            "recovery_history": {},
            "rollback_history": {},
            "agent_state": {},
            "reasoning_trace": {},
        }

    @property
    def using_hydradb(self) -> bool:
        return self._client.connected

    @property
    def fallback_reason(self) -> str | None:
        return self._fallback_reason

    async def start(self) -> None:
        try:
            await self._client.connect()
            self._fallback_reason = None
            logger.info("hydradb_connected project_id=%s", self._client.project_id)
        except HydraDBConnectionError as exc:
            self._fallback_reason = str(exc)
            logger.warning("hydradb_fallback_to_local reason=%s", exc)

    async def stop(self) -> None:
        await self._client.close()

    async def list_workflows(self) -> list[Workflow]:
        return sorted(
            (Workflow.model_validate(item) for item in self._local["workflow"].values()),
            key=lambda item: item.name,
        )

    async def get_workflow(self, workflow_id: UUID) -> Workflow | None:
        item = self._local["workflow"].get(str(workflow_id))
        return Workflow.model_validate(item) if item else None

    async def upsert_workflow(self, workflow: Workflow) -> Workflow:
        updated = workflow.model_copy(update={"updated_at": utcnow()})
        await self._store("workflow", str(updated.id), updated, metadata={"workflow_id": str(updated.id)})
        await self.store_snapshot(updated)
        return updated

    async def store_snapshot(self, workflow: Workflow) -> None:
        key = f"{workflow.id}:{workflow.updated_at.isoformat()}"
        await self._store("snapshot", key, workflow, metadata={"workflow_id": str(workflow.id)})

    async def store_checkpoint(self, workflow: Workflow, reason: str) -> None:
        key = f"{workflow.id}:{utcnow().isoformat()}"
        await self._store(
            "checkpoint",
            key,
            {"workflow": workflow, "reason": reason, "stored_at": utcnow().isoformat()},
            metadata={"workflow_id": str(workflow.id), "reason": reason},
        )

    async def list_checkpoints(self, workflow_id: UUID) -> list[dict[str, Any]]:
        prefix = f"{workflow_id}:"
        items: list[tuple[str, dict[str, Any]]] = []
        for key, payload in self._local.get("checkpoint", {}).items():
            if key.startswith(prefix):
                items.append((key, payload))
        return [payload for _, payload in sorted(items, key=lambda item: item[0], reverse=True)]

    def _parse_checkpoint(self, payload: dict[str, Any]) -> tuple[Workflow, str] | None:
        try:
            workflow_payload = payload.get("workflow")
            if not isinstance(workflow_payload, dict):
                return None
            workflow = Workflow.model_validate(workflow_payload)
            reason = str(payload.get("reason", ""))
            return workflow, reason
        except ValidationError:
            return None

    async def get_latest_stable_checkpoint(self, workflow_id: UUID) -> dict[str, Any] | None:
        stable_statuses = {WorkflowStatus.HEALTHY, WorkflowStatus.DEGRADED}
        unstable_reason_markers = ("recovering", "rollback:", "status:failed")

        candidates: list[tuple[str, dict[str, Any], Workflow, str]] = []
        for payload in await self.list_checkpoints(workflow_id):
            parsed = self._parse_checkpoint(payload)
            if parsed is None:
                continue
            workflow, reason = parsed
            reason_lower = reason.lower()
            if workflow.status not in stable_statuses:
                continue
            if any(marker in reason_lower for marker in unstable_reason_markers):
                continue
            key = f"{workflow_id}:{payload.get('stored_at', '')}"
            candidates.append((key, payload, workflow, reason))

        if not candidates:
            return None

        preferred = [item for item in candidates if item[3].startswith("pre_recovery:") or item[3].startswith("bootstrap:")]
        pool = preferred or candidates
        pool.sort(key=lambda item: item[0], reverse=True)
        return pool[0][1]

    async def list_snapshots(self, workflow_id: UUID) -> list[dict[str, Any]]:
        prefix = f"{workflow_id}:"
        items = [
            payload
            for key, payload in self._local.get("snapshot", {}).items()
            if key.startswith(prefix)
        ]
        return list(reversed(items))

    async def list_rollback_history(self, workflow_id: UUID) -> list[dict[str, Any]]:
        items = [
            payload
            for key, payload in self._local.get("rollback_history", {}).items()
            if str(payload.get("workflow_id")) == str(workflow_id)
        ]
        return list(reversed(items))

    async def list_recovery_history(self, workflow_id: UUID) -> list[dict[str, Any]]:
        items = [
            payload
            for key, payload in self._local.get("recovery_history", {}).items()
            if str(payload.get("incident", {}).get("workflow_id")) == str(workflow_id)
        ]
        return items

    async def list_agent_states(self, workflow_id: UUID) -> list[dict[str, Any]]:
        return [
            payload
            for payload in self._local.get("agent_state", {}).values()
            if str(payload.get("workflow_id")) == str(workflow_id)
        ]

    async def store_reasoning_trace(
        self,
        *,
        workflow_id: UUID,
        incident_id: UUID,
        workflow_name: str,
        agent_name: str,
        signal: str,
        selected_strategy: str,
        alternatives: list[str],
        confidence: int,
        risk: str,
        reasoning_summary: list[str],
        execution_explanation: str,
        success: bool | None,
        recovery_duration_ms: int | None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        key = f"{workflow_id}:{incident_id}:{agent_name}:{utcnow().isoformat()}"
        payload = {
            "workflow_id": workflow_id,
            "incident_id": incident_id,
            "workflow_name": workflow_name,
            "agent_name": agent_name,
            "signal": signal,
            "selected_strategy": selected_strategy,
            "alternatives": alternatives,
            "confidence": confidence,
            "risk": risk,
            "reasoning_summary": reasoning_summary,
            "execution_explanation": execution_explanation,
            "success": success,
            "recovery_duration_ms": recovery_duration_ms,
            "created_at": utcnow().isoformat(),
            "metadata": metadata or {},
        }
        await self._store(
            "reasoning_trace",
            key,
            payload,
            metadata={
                "workflow_id": str(workflow_id),
                "incident_id": str(incident_id),
                "agent": agent_name,
                "strategy": selected_strategy,
                "signal": signal,
            },
        )

    async def list_reasoning_traces(self, workflow_id: UUID | None) -> list[dict[str, Any]]:
        items = list(self._local.get("reasoning_trace", {}).values())
        if workflow_id is not None:
            items = [payload for payload in items if str(payload.get("workflow_id")) == str(workflow_id)]
        return sorted(items, key=lambda item: str(item.get("created_at", "")), reverse=True)

    async def store_rollback_history(
        self,
        *,
        workflow_id: UUID,
        incident_id: UUID | None,
        restored: bool,
        checkpoint_reason: str | None,
        timeline: list[str],
        metadata: dict[str, Any] | None = None,
    ) -> None:
        key = f"{workflow_id}:{utcnow().isoformat()}"
        payload = {
            "workflow_id": workflow_id,
            "incident_id": incident_id,
            "restored": restored,
            "checkpoint_reason": checkpoint_reason,
            "timeline": timeline,
            "metadata": metadata or {},
        }
        await self._store(
            "rollback_history",
            key,
            payload,
            metadata={
                "workflow_id": str(workflow_id),
                "restored": str(restored).lower(),
                "incident_id": str(incident_id) if incident_id else "",
            },
        )

    async def store_incident(self, incident: Incident) -> None:
        await self._store(
            "incident",
            str(incident.id),
            incident,
            metadata={"workflow_id": str(incident.workflow_id), "severity": incident.severity},
        )

    async def list_incidents(self) -> list[Incident]:
        return sorted(
            (Incident.model_validate(item) for item in self._local["incident"].values()),
            key=lambda item: item.created_at,
            reverse=True,
        )

    async def get_incident(self, incident_id: UUID) -> Incident | None:
        item = self._local["incident"].get(str(incident_id))
        return Incident.model_validate(item) if item else None

    async def store_recovery_history(self, incident: Incident, timeline: list[str], recovered: bool) -> None:
        await self._store(
            "recovery_history",
            str(incident.id),
            {"incident": incident, "timeline": timeline, "recovered": recovered},
            metadata={"workflow_id": str(incident.workflow_id), "recovered": str(recovered).lower()},
        )

    async def store_agent_state(
        self,
        *,
        workflow_id: UUID,
        agent_name: str,
        facts: dict[str, Any],
        timeline: list[str],
    ) -> None:
        key = f"{workflow_id}:{agent_name}:{utcnow().isoformat()}"
        await self._store(
            "agent_state",
            key,
            {"workflow_id": workflow_id, "agent_name": agent_name, "facts": facts, "timeline": timeline},
            metadata={"workflow_id": str(workflow_id), "agent": agent_name},
        )

    def counts(self) -> dict[str, int]:
        return {kind: len(items) for kind, items in self._local.items()}

    async def latest_checkpoint_label(self) -> str | None:
        checkpoints = self._local.get("checkpoint", {})
        if not checkpoints:
            return None
        key = sorted(checkpoints)[-1]
        return str(checkpoints[key].get("reason"))

    async def _store(
        self,
        kind: str,
        key: str,
        payload: BaseModel | dict[str, Any],
        metadata: dict[str, Any] | None = None,
    ) -> None:
        serialized = self._serialize(payload)
        self._local.setdefault(kind, {})[key] = serialized

        if not self._client.connected:
            return

        try:
            await self._client.add_memory(
                text=json.dumps({"kind": kind, "key": key, "payload": serialized}, separators=(",", ":")),
                kind=kind,
                key=key,
                metadata=metadata,
            )
        except Exception as exc:
            self._fallback_reason = str(exc)
            logger.warning("hydradb_write_failed_using_local kind=%s key=%s reason=%s", kind, key, exc)

    def _serialize(self, payload: BaseModel | dict[str, Any]) -> dict[str, Any]:
        if isinstance(payload, BaseModel):
            return payload.model_dump(mode="json")
        return {
            key: value.model_dump(mode="json") if isinstance(value, BaseModel) else self._jsonable(value)
            for key, value in payload.items()
        }

    def _jsonable(self, value: Any) -> Any:
        if isinstance(value, UUID):
            return str(value)
        if isinstance(value, datetime):
            return value.isoformat()
        if isinstance(value, dict):
            return {key: self._jsonable(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self._jsonable(item) for item in value]
        return value


hydradb_memory = HydraDBMemoryService()
