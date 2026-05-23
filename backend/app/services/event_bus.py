import asyncio
from collections.abc import AsyncIterator

from app.schemas.events import CortexEvent


class EventBus:
    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[CortexEvent]] = set()
        self._running = False

    async def start(self) -> None:
        self._running = True

    async def stop(self) -> None:
        self._running = False
        for queue in list(self._subscribers):
            await queue.put(CortexEvent(type="system.shutdown", message="CORTEX event stream closed"))

    async def publish(self, event: CortexEvent) -> None:
        if not self._running:
            return
        for queue in list(self._subscribers):
            await queue.put(event)

    async def subscribe(self) -> AsyncIterator[CortexEvent]:
        queue: asyncio.Queue[CortexEvent] = asyncio.Queue(maxsize=100)
        self._subscribers.add(queue)
        try:
            while True:
                yield await queue.get()
        finally:
            self._subscribers.discard(queue)


event_bus = EventBus()

