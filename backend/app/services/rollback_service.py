from uuid import UUID

from pydantic import ValidationError

from app.core.logging import get_logger
from app.memory import hydradb_memory
from app.schemas.events import CortexEvent
from app.schemas.workflow import RollbackInfo, Workflow, WorkflowStatus
from app.services.event_bus import event_bus
from app.services.workflow_service import workflow_service

logger = get_logger(__name__)


class RollbackService:
    async def attempt_rollback(
        self,
        *,
        workflow_id: UUID,
        timeline: list[str],
        reason: str,
        incident_id: UUID | None = None,
    ) -> RollbackInfo:
        workflow = await workflow_service.get_workflow(workflow_id)
        workflow_name = workflow.name if workflow else str(workflow_id)

        await event_bus.publish(
            CortexEvent(
                type="rollback.started",
                message=f"Rollback started for {workflow_name}",
                payload={"workflowId": str(workflow_id), "reason": reason},
            )
        )
        timeline.append("Rollback: locating latest stable checkpoint")

        checkpoint = await hydradb_memory.get_latest_stable_checkpoint(workflow_id)
        if checkpoint is None:
            message = "No stable checkpoint available for rollback"
            timeline.append(f"Rollback failed — {message}")
            await self._complete_rollback(
                workflow_id=workflow_id,
                incident_id=incident_id,
                timeline=timeline,
                restored=False,
                checkpoint_reason=None,
                metadata={"reason": reason, "error": "no_checkpoint"},
            )
            await event_bus.publish(
                CortexEvent(
                    type="rollback.failed",
                    message=message,
                    payload={"workflowId": str(workflow_id), "reason": "no_checkpoint"},
                )
            )
            return RollbackInfo(attempted=True, restored=False, message=message)

        parsed_workflow, checkpoint_reason = self._load_checkpoint_workflow(checkpoint)
        if parsed_workflow is None:
            message = "Checkpoint data is corrupted or invalid"
            timeline.append(f"Rollback failed — {message}")
            await self._complete_rollback(
                workflow_id=workflow_id,
                incident_id=incident_id,
                timeline=timeline,
                restored=False,
                checkpoint_reason=checkpoint.get("reason"),
                metadata={"reason": reason, "error": "corrupted_checkpoint"},
            )
            await event_bus.publish(
                CortexEvent(
                    type="rollback.failed",
                    message=message,
                    payload={"workflowId": str(workflow_id), "reason": "corrupted_checkpoint"},
                )
            )
            return RollbackInfo(
                attempted=True,
                restored=False,
                checkpoint_reason=str(checkpoint.get("reason")),
                message=message,
            )

        try:
            restored_workflow = await workflow_service.restore_from_checkpoint(parsed_workflow, checkpoint_reason)
        except Exception as exc:
            logger.exception("rollback_restore_failed workflow_id=%s", workflow_id)
            message = f"Rollback restore failed: {exc}"
            timeline.append(f"Rollback failed — {message}")
            await self._complete_rollback(
                workflow_id=workflow_id,
                incident_id=incident_id,
                timeline=timeline,
                restored=False,
                checkpoint_reason=checkpoint_reason,
                metadata={"reason": reason, "error": str(exc)},
            )
            await event_bus.publish(
                CortexEvent(
                    type="rollback.failed",
                    message=message,
                    payload={"workflowId": str(workflow_id), "reason": "restore_error"},
                )
            )
            return RollbackInfo(
                attempted=True,
                restored=False,
                checkpoint_reason=checkpoint_reason,
                message=message,
            )

        timeline.append(
            f"Rollback restored workflow to {restored_workflow.status.value} "
            f"from checkpoint ({checkpoint_reason})"
        )
        await self._complete_rollback(
            workflow_id=workflow_id,
            incident_id=incident_id,
            timeline=timeline,
            restored=True,
            checkpoint_reason=checkpoint_reason,
            metadata={"reason": reason, "restored_status": restored_workflow.status.value},
        )
        await event_bus.publish(
            CortexEvent(
                type="rollback.restored",
                message=f"Workflow restored from checkpoint ({checkpoint_reason})",
                payload={
                    "workflowId": str(workflow_id),
                    "status": restored_workflow.status.value,
                    "checkpointReason": checkpoint_reason,
                },
            )
        )
        return RollbackInfo(
            attempted=True,
            restored=True,
            checkpoint_reason=checkpoint_reason,
            message=f"Workflow restored to {restored_workflow.status.value}",
        )

    @staticmethod
    def _load_checkpoint_workflow(checkpoint: dict) -> tuple[Workflow | None, str]:
        try:
            workflow_payload = checkpoint.get("workflow")
            if not isinstance(workflow_payload, dict):
                return None, ""
            workflow = Workflow.model_validate(workflow_payload)
            reason = str(checkpoint.get("reason", ""))
            return workflow, reason
        except ValidationError:
            return None, ""

    async def _complete_rollback(
        self,
        *,
        workflow_id: UUID,
        incident_id: UUID | None,
        timeline: list[str],
        restored: bool,
        checkpoint_reason: str | None,
        metadata: dict,
    ) -> None:
        await hydradb_memory.store_rollback_history(
            workflow_id=workflow_id,
            incident_id=incident_id,
            restored=restored,
            checkpoint_reason=checkpoint_reason,
            timeline=timeline,
            metadata=metadata,
        )


rollback_service = RollbackService()
