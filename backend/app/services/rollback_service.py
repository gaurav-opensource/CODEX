from uuid import UUID

from pydantic import ValidationError

from app.core.logging import get_logger
from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.schemas.workflow import RollbackInfo, Workflow
from app.services.event_bus import event_bus
from app.services.workflow_service import workflow_service

logger = get_logger(__name__)


class RollbackService:
    async def attempt_rollback(self, *, workflow_id: UUID, timeline: list[str], reason: str, incident_id: UUID | None = None) -> RollbackInfo:
        workflow = await workflow_service.get_workflow(workflow_id)
        workflow_name = workflow.name if workflow else str(workflow_id)
        await event_bus.publish(
            CortexEvent(
                type="rollback.started",
                message=f"Rollback started for {workflow_name}",
                channel=EventChannel.RECOVERY,
                payload={"workflowId": str(workflow_id), "incidentId": str(incident_id), "reason": reason},
            )
        )
        timeline.append("Rollback: locating latest stable checkpoint")
        checkpoint = await hydradb_memory.get_latest_stable_checkpoint(workflow_id)
        if checkpoint is None:
            return await self._fail(workflow_id, incident_id, timeline, reason, "No stable checkpoint available")

        parsed_workflow, checkpoint_reason = self._load_checkpoint_workflow(checkpoint)
        if parsed_workflow is None:
            return await self._fail(workflow_id, incident_id, timeline, reason, "Checkpoint data is invalid", str(checkpoint.get("reason")))

        try:
            restored = await workflow_service.restore_from_checkpoint(parsed_workflow, checkpoint_reason)
        except Exception as exc:
            logger.exception("rollback_restore_failed workflow_id=%s", workflow_id)
            return await self._fail(workflow_id, incident_id, timeline, reason, f"Restore failed: {exc}", checkpoint_reason)

        timeline.append(f"Rollback restored workflow to {restored.status.value} from checkpoint ({checkpoint_reason})")
        await hydradb_memory.store_rollback_history(
            workflow_id=workflow_id,
            incident_id=incident_id,
            restored=True,
            checkpoint_reason=checkpoint_reason,
            timeline=timeline,
            metadata={"reason": reason, "restored_status": restored.status.value},
        )
        await event_bus.publish(
            CortexEvent(
                type="rollback.restored",
                message=f"Workflow restored from checkpoint ({checkpoint_reason})",
                channel=EventChannel.RECOVERY,
                payload={"workflowId": str(workflow_id), "status": restored.status.value, "checkpointReason": checkpoint_reason},
            )
        )
        return RollbackInfo(attempted=True, restored=True, checkpoint_reason=checkpoint_reason, message=f"Workflow restored to {restored.status.value}")

    async def _fail(self, workflow_id: UUID, incident_id: UUID | None, timeline: list[str], reason: str, message: str, checkpoint_reason: str | None = None) -> RollbackInfo:
        timeline.append(f"Rollback failed: {message}")
        await hydradb_memory.store_rollback_history(
            workflow_id=workflow_id,
            incident_id=incident_id,
            restored=False,
            checkpoint_reason=checkpoint_reason,
            timeline=timeline,
            metadata={"reason": reason, "error": message},
        )
        await event_bus.publish(
            CortexEvent(
                type="rollback.failed",
                message=message,
                channel=EventChannel.RECOVERY,
                payload={"workflowId": str(workflow_id), "incidentId": str(incident_id), "reason": reason},
            )
        )
        return RollbackInfo(attempted=True, restored=False, checkpoint_reason=checkpoint_reason, message=message)

    @staticmethod
    def _load_checkpoint_workflow(checkpoint: dict) -> tuple[Workflow | None, str]:
        try:
            payload = checkpoint.get("workflow")
            if not isinstance(payload, dict):
                return None, ""
            return Workflow.model_validate(payload), str(checkpoint.get("reason", ""))
        except ValidationError:
            return None, ""


rollback_service = RollbackService()
