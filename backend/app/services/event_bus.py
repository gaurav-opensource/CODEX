import asyncio
from collections.abc import AsyncIterator

from app.core.events import CortexEvent, EventChannel, EventType


class EventBus:
    def __init__(self) -> None:
        self._subscribers: dict[EventChannel, set[asyncio.Queue[CortexEvent]]] = {
            channel: set() for channel in EventChannel
        }
        self._running = False
        self._history: list[CortexEvent] = []

    async def start(self) -> None:
        self._running = True

    async def stop(self) -> None:
        self._running = False
        for queues in self._subscribers.values():
            for queue in list(queues):
                await queue.put(CortexEvent(type=EventType.SYSTEM_SHUTDOWN, message="CORTEX event stream closed"))

    async def publish(self, event: CortexEvent) -> None:
        if not self._running:
            return
        self._history = [event, *self._history][:256]
        targets = set(self._subscribers[event.channel])
        if event.channel != EventChannel.EVENTS:
            targets |= self._subscribers[EventChannel.EVENTS]
        for queue in list(targets):
            if queue.full():
                _ = queue.get_nowait()
            await queue.put(event)

    async def subscribe(self, channel: EventChannel = EventChannel.EVENTS) -> AsyncIterator[CortexEvent]:
        queue: asyncio.Queue[CortexEvent] = asyncio.Queue(maxsize=100)
        self._subscribers[channel].add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self._subscribers[channel].discard(queue)

    def history(self, limit: int = 50, channel: EventChannel | None = None) -> list[CortexEvent]:
        if channel is None or channel == EventChannel.EVENTS:
            return self._history[:limit]
        return [event for event in self._history if event.channel in {channel, EventChannel.EVENTS}][:limit]


event_bus = EventBus()
