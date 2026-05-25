from uuid import UUID

from fastapi import APIRouter

from app.memory import hydradb_memory
from app.schemas.reasoning import ReasoningSnapshot
from app.services.reasoning_service import reasoning_service

router = APIRouter()


@router.get("/workflows/{workflow_id}", response_model=ReasoningSnapshot | None)
async def get_reasoning_snapshot(workflow_id: UUID) -> ReasoningSnapshot | None:
    return await reasoning_service.snapshot(workflow_id)


@router.get("/workflows/{workflow_id}/history")
async def get_reasoning_history(workflow_id: UUID) -> list[dict]:
    return await hydradb_memory.list_reasoning_traces(workflow_id)
