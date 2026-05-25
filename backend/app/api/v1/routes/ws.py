from fastapi import APIRouter, WebSocket

from app.core.events import EventChannel
from app.services.websocket_manager import websocket_manager

router = APIRouter()


@router.websocket("/ws/events")
async def stream_events(websocket: WebSocket) -> None:
    await websocket_manager.stream_event_channel(websocket, EventChannel.EVENTS)


@router.websocket("/ws/runtime")
async def stream_runtime(websocket: WebSocket) -> None:
    await websocket_manager.stream_event_channel(websocket, EventChannel.RUNTIME)


@router.websocket("/ws/recovery")
async def stream_recovery(websocket: WebSocket) -> None:
    await websocket_manager.stream_event_channel(websocket, EventChannel.RECOVERY)


@router.websocket("/ws/sandbox")
async def stream_sandbox(websocket: WebSocket) -> None:
    await websocket_manager.stream_broadcast_channel(websocket, EventChannel.SANDBOX)


@router.websocket("/ws/reasoning")
async def stream_reasoning(websocket: WebSocket) -> None:
    await websocket_manager.stream_event_channel(websocket, EventChannel.REASONING)
