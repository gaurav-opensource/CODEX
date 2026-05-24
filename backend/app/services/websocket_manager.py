from collections import defaultdict
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from app.core.events import EventChannel
from app.services.event_bus import event_bus


class WebSocketManager:
    def __init__(self) -> None:
        self._broadcast_connections: dict[EventChannel, list[WebSocket]] = defaultdict(list)
        self._broadcast_history: dict[EventChannel, list[dict[str, Any]]] = defaultdict(list)
        self._history_limit = 80

    async def stream_event_channel(self, websocket: WebSocket, channel: EventChannel) -> None:
        await websocket.accept()
        try:
            for event in reversed(event_bus.history(limit=30, channel=channel)):
                await websocket.send_json(event.model_dump(mode="json"))
            async for event in event_bus.subscribe(channel):
                await websocket.send_json(event.model_dump(mode="json"))
        except WebSocketDisconnect:
            return

    async def connect(self, websocket: WebSocket, channel: EventChannel = EventChannel.SANDBOX) -> None:
        await websocket.accept()
        self._broadcast_connections[channel].append(websocket)
        for event in self._broadcast_history[channel][-30:]:
            try:
                await websocket.send_json(event)
            except Exception:
                break

    def disconnect(self, websocket: WebSocket, channel: EventChannel = EventChannel.SANDBOX) -> None:
        if websocket in self._broadcast_connections[channel]:
            self._broadcast_connections[channel].remove(websocket)

    async def broadcast(self, event: dict[str, Any], channel: EventChannel = EventChannel.SANDBOX) -> None:
        self._broadcast_history[channel] = [event, *self._broadcast_history[channel]][: self._history_limit]
        stale: list[WebSocket] = []
        for connection in list(self._broadcast_connections[channel]):
            try:
                await connection.send_json(event)
            except Exception:
                stale.append(connection)
        for connection in stale:
            self.disconnect(connection, channel=channel)

    async def stream_broadcast_channel(self, websocket: WebSocket, channel: EventChannel = EventChannel.SANDBOX) -> None:
        await self.connect(websocket, channel=channel)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            self.disconnect(websocket, channel=channel)


websocket_manager = WebSocketManager()
