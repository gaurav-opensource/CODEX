import { useCallback, useEffect, useRef, useState } from "react";

import { env } from "@/config/env";
import type { CortexEvent } from "@/types/cortex";
import { connectEventSocket } from "@/websocket/client";

export function useEventStream(options?: { maxEvents?: number; path?: string; batchWindowMs?: number }) {
  const maxEvents = options?.maxEvents ?? 12;
  const path = options?.path ?? "events";
  const batchWindowMs = options?.batchWindowMs ?? env.eventBatchWindowMs;
  const [events, setEvents] = useState<CortexEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const seenRef = useRef<Set<string>>(new Set());
  const retryRef = useRef(0);
  const stopRef = useRef(false);
  const queueRef = useRef<CortexEvent[]>([]);
  const flushTimerRef = useRef<number | null>(null);

  const clearEvents = useCallback(() => {
    seenRef.current.clear();
    queueRef.current = [];
    setEvents([]);
  }, []);

  useEffect(() => {
    stopRef.current = false;

    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    const flush = () => {
      flushTimerRef.current = null;
      if (!queueRef.current.length) return;
      setEvents((current) => [...queueRef.current.reverse(), ...current].slice(0, maxEvents));
      queueRef.current = [];
    };

    const connect = () => {
      socket = connectEventSocket(path, {
        onOpen: () => {
          retryRef.current = 0;
          setConnected(true);
        },
        onClose: () => {
          setConnected(false);
          if (stopRef.current) return;
          const delay = Math.min(5000, 250 * 2 ** retryRef.current);
          retryRef.current += 1;
          reconnectTimer = window.setTimeout(connect, delay);
        },
        onError: () => {
          setConnected(false);
        },
        onMessage: (event) => {
          if (seenRef.current.has(event.id)) return;
          seenRef.current.add(event.id);
          queueRef.current.push(event);
          if (flushTimerRef.current == null) {
            flushTimerRef.current = window.setTimeout(flush, batchWindowMs);
          }
        }
      });
    };

    connect();
    return () => {
      stopRef.current = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (flushTimerRef.current) window.clearTimeout(flushTimerRef.current);
      socket?.close();
    };
  }, [batchWindowMs, maxEvents, path]);

  return { events, connected, clearEvents };
}
