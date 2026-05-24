from fastapi import APIRouter

from app.schemas.workflow import AnalyticsSnapshot
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("", response_model=AnalyticsSnapshot)
async def analytics() -> AnalyticsSnapshot:
    return await analytics_service.snapshot()
