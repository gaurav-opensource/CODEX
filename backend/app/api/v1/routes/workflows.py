from uuid import UUID

from fastapi import APIRouter

from app.core.exceptions import CortexError
from app.schemas.workflow import MetricSnapshot, Workflow
from app.services.workflow_service import workflow_service

router = APIRouter()


@router.get("", response_model=list[Workflow])
async def list_workflows() -> list[Workflow]:
    return await workflow_service.list_workflows()


@router.get("/metrics", response_model=MetricSnapshot)
async def metrics() -> MetricSnapshot:
    return workflow_service.metrics()


@router.get("/{workflow_id}", response_model=Workflow)
async def get_workflow(workflow_id: UUID) -> Workflow:
    workflow = await workflow_service.get_workflow(workflow_id)
    if workflow is None:
        raise CortexError("Workflow not found", status_code=404)
    return workflow
