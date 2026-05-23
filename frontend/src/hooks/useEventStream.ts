import { useCallback, useEffect, useState } from "react";

import type { CortexEvent } from "../types/cortex";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/api/v1/ws/events";

function isCortexEvent(value: unknown): value is CortexEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CortexEvent>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.created_at === "string" &&
    Boolean(candidate.payload) &&
    typeof candidate.payload === "object"
  );
}

export function useEventStream(options?: { maxEvents?: number }) {
  const maxEvents = options?.maxEvents ?? 12;
  const [events, setEvents] = useState<CortexEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const clearEvents = useCallback(() => setEvents([]), []);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (message) => {
      if (typeof message.data !== "string") return;
      const event: unknown = JSON.parse(message.data);
      if (isCortexEvent(event)) {
        setEvents((current) => [event, ...current].slice(0, maxEvents));
      }
    };

    return () => socket.close();
  }, [maxEvents]);

  return { events, connected, clearEvents };
}
