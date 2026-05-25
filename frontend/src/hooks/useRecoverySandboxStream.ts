import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Dispatch, SetStateAction } from "react";

import { env } from "@/config/env";
import {
  applyTimelineReached,
  createInitialTimelineReached,
  isTimelineResetEvent,
  resolveTimelineStep,
  stagesFromReached,
  type TimelineStageStatus,
} from "@/lib/timeline";
import type { SandboxEvent } from "@/types/events";
import { connectSandboxSocket } from "@/websocket/client";

type SandboxStreamContextValue = {
  events: SandboxEvent[];
  latestReasoning: SandboxEvent[];
  latestAgent: SandboxEvent | null;
  metrics: SandboxEvent["metrics"];
  topology: SandboxEvent["topology"] | null;
  timelineStep: number;
  timelineStages: TimelineStageStatus[];
  connected: boolean;
  clearStream: () => void;
};

const SandboxStreamContext = createContext<SandboxStreamContextValue | null>(null);

function eventKey(event: SandboxEvent): string {
  if (event.id) return event.id;
  return `${event.type ?? "event"}-${event.agent ?? ""}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function applyEvent(
  event: SandboxEvent,
  setters: {
    setEvents: Dispatch<SetStateAction<SandboxEvent[]>>;
    setMetrics: Dispatch<SetStateAction<SandboxEvent["metrics"]>>;
    setTopology: Dispatch<SetStateAction<SandboxEvent["topology"] | null>>;
    setTimelineStep: Dispatch<SetStateAction<number>>;
    setTimelineReached: Dispatch<SetStateAction<boolean[]>>;
    setLatestAgent: Dispatch<SetStateAction<SandboxEvent | null>>;
  }
) {
  setters.setEvents((prev) => [...prev, event].slice(-200));

  if (event.type === "metrics_update" && event.metrics) {
    setters.setMetrics(event.metrics);
  }
  if (event.type === "topology_update" && event.topology) {
    setters.setTopology(event.topology);
  }
  const step = resolveTimelineStep(event);
  if (step !== null) {
    const reset = isTimelineResetEvent(event);
    setters.setTimelineReached((prev) => applyTimelineReached(prev, step, reset));
    setters.setTimelineStep((prev) => (reset ? step : Math.max(prev, step)));
  }
  if (
    event.type === "agent_execution" ||
    event.type === "reasoning.update" ||
    (event.agent && event.reasoning)
  ) {
    setters.setLatestAgent(event);
  }
}

export function RecoverySandboxStreamProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<SandboxEvent[]>([]);
  const [metrics, setMetrics] = useState<SandboxEvent["metrics"]>({});
  const [topology, setTopology] = useState<SandboxEvent["topology"] | null>(null);
  const [timelineStep, setTimelineStep] = useState(-1);
  const [timelineReached, setTimelineReached] = useState<boolean[]>(createInitialTimelineReached);
  const [latestAgent, setLatestAgent] = useState<SandboxEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const seenRef = useRef(new Set<string>());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const setters = useMemo(
    () => ({ setEvents, setMetrics, setTopology, setTimelineStep, setTimelineReached, setLatestAgent }),
    []
  );

  const clearStream = useCallback(() => {
    seenRef.current.clear();
    setEvents([]);
    setMetrics({});
    setTopology(null);
    setTimelineStep(-1);
    setTimelineReached(createInitialTimelineReached());
    setLatestAgent(null);
  }, []);

  const connect = useCallback(() => {
    if (stoppedRef.current) return;
    
    // Skip connection if sandbox is disabled in production
    if (!env.isSandboxEnabled) {
      console.debug("Sandbox mode is disabled in production");
      return;
    }

    wsRef.current?.close();
    wsRef.current = connectSandboxSocket({
      onOpen: () => setConnected(true),
      onClose: () => {
        setConnected(false);
        if (stoppedRef.current) return;
        reconnectRef.current = setTimeout(connect, 1500);
      },
      onMessage: (event) => {
        const key = eventKey(event);
        if (seenRef.current.has(key)) return;
        seenRef.current.add(key);
        if (seenRef.current.size > 500) seenRef.current.clear();
        applyEvent(event, setters);
      },
    });
  }, [setters]);

  useEffect(() => {
    stoppedRef.current = false;
    connect();
    return () => {
      stoppedRef.current = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  const timelineStages = useMemo(() => stagesFromReached(timelineReached), [timelineReached]);

  const latestReasoning = useMemo(
    () =>
      events.filter(
        (e) =>
          e.type === "reasoning.update" || (Boolean(e.agent) && Boolean(e.reasoning))
      ).slice(-24),
    [events]
  );

  const value = useMemo(
    () => ({
      events,
      latestReasoning,
      latestAgent,
      metrics,
      topology,
      timelineStep,
      timelineStages,
      connected,
      clearStream,
    }),
    [
      events,
      latestReasoning,
      latestAgent,
      metrics,
      topology,
      timelineStep,
      timelineStages,
      connected,
      clearStream,
    ]
  );

  return createElement(SandboxStreamContext.Provider, { value }, children);
}

export function useRecoverySandboxStream(): SandboxStreamContextValue {
  const ctx = useContext(SandboxStreamContext);
  if (!ctx) {
    throw new Error("useRecoverySandboxStream must be used within RecoverySandboxStreamProvider");
  }
  return ctx;
}
