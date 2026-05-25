from fastapi import APIRouter

from app.core.config import settings
from app.memory import hydradb_memory
from app.schemas.workflow import HydraDBStatus
from uuid import UUID

router = APIRouter()


@router.get("/status", response_model=HydraDBStatus)
async def hydradb_status() -> HydraDBStatus:
    return HydraDBStatus(
        connected=hydradb_memory.using_hydradb,
        project_id=settings.hydradb_project_id,
        fallback_reason=hydradb_memory.fallback_reason,
        memory_counts=hydradb_memory.counts(),
        latest_checkpoint=await hydradb_memory.latest_checkpoint_label(),
    )


@router.get("/workflows/{workflow_id}/memory")
async def hydradb_workflow_memory(workflow_id: UUID) -> dict:
    return {
        "checkpoints": await hydradb_memory.list_checkpoints(workflow_id),
        "snapshots": await hydradb_memory.list_snapshots(workflow_id),
        "rollback_history": await hydradb_memory.list_rollback_history(workflow_id),
        "recovery_history": await hydradb_memory.list_recovery_history(workflow_id),
        "agent_states": await hydradb_memory.list_agent_states(workflow_id),
    }
