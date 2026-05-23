import json
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.core.logging import get_logger
from app.integrations.hydradb import HydraDBClient, HydraDBConnectionError
from app.schemas.workflow import Incident, Workflow

logger = get_logger(__name__)


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
            "agent_state": {},
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
        updated = workflow.model_copy(update={"updated_at": datetime.utcnow()})
        await self._store("workflow", str(updated.id), updated, metadata={"workflow_id": str(updated.id)})
        await self.store_snapshot(updated)
        return updated

    async def store_snapshot(self, workflow: Workflow) -> None:
        key = f"{workflow.id}:{workflow.updated_at.isoformat()}"
        await self._store("snapshot", key, workflow, metadata={"workflow_id": str(workflow.id)})

    async def store_checkpoint(self, workflow: Workflow, reason: str) -> None:
        key = f"{workflow.id}:{datetime.utcnow().isoformat()}"
        await self._store(
            "checkpoint",
            key,
            {"workflow": workflow, "reason": reason},
            metadata={"workflow_id": str(workflow.id), "reason": reason},
        )

    async def store_incident(self, incident: Incident) -> None:
        await self._store(
            "incident",
            str(incident.id),
            incident,
            metadata={"workflow_id": str(incident.workflow_id), "severity": incident.severity},
        )

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
        key = f"{workflow_id}:{agent_name}:{datetime.utcnow().isoformat()}"
        await self._store(
            "agent_state",
            key,
            {"workflow_id": workflow_id, "agent_name": agent_name, "facts": facts, "timeline": timeline},
            metadata={"workflow_id": str(workflow_id), "agent": agent_name},
        )

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
