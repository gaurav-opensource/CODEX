from fastapi import APIRouter

from app.schemas.workflow import AgentRuntime
from app.services.analytics_service import analytics_service
from app.services.operational_service import operational_service

router = APIRouter()


@router.get("/agents", response_model=list[AgentRuntime])
async def runtime_agents() -> list[AgentRuntime]:
    return list(analytics_service.agent_stats.values())


@router.get("/operational")
async def operational_status() -> dict:
    return await operational_service.status()
