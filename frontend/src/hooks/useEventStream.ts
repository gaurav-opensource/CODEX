import { useEffect, useState } from "react";

import type { CortexEvent } from "../types/cortex";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/api/v1/ws/events";

export function useEventStream() {
  const [events, setEvents] = useState<CortexEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = (message) => {
      const event = JSON.parse(message.data) as CortexEvent;
      setEvents((current) => [event, ...current].slice(0, 12));
    };

    return () => socket.close();
  }, []);

  return { events, connected };
}

