from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.event_bus import event_bus

router = APIRouter()


@router.websocket("/ws/events")
async def stream_events(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        async for event in event_bus.subscribe():
            await websocket.send_json(event.model_dump(mode="json"))
    except WebSocketDisconnect:
        return

