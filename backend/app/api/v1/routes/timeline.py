from fastapi import APIRouter

from app.core.events import CortexEvent
from app.services.event_bus import event_bus

router = APIRouter()


@router.get("/timeline", response_model=list[CortexEvent])
async def recovery_timeline() -> list[CortexEvent]:
    return [event for event in event_bus.history(100) if event.type.startswith(("recovery.", "rollback.", "agent.", "incident."))]
