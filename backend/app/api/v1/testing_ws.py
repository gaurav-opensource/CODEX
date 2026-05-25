from fastapi import APIRouter, WebSocket

from app.core.events import EventChannel
from app.services.websocket_manager import websocket_manager

router = APIRouter()


@router.websocket("/api/v1/testing/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.stream_broadcast_channel(websocket, EventChannel.SANDBOX)
