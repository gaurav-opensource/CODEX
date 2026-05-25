import { useEffect, useMemo, useState } from "react";

import { cortexApi } from "../lib/api";
import type { AgentReasoning, ReasoningEnvelope, ReasoningHistoryItem, ReasoningSnapshot } from "../types/cortex";
import { useEventStream } from "./useEventStream";

function isReasoningEnvelope(value: unknown): value is ReasoningEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ReasoningEnvelope>;
  return (
    typeof candidate.event_id === "string" &&
    typeof candidate.sequence === "number" &&
    typeof candidate.workflow_id === "string" &&
    Boolean(candidate.reasoning)
  );
}

function toReasoningEnvelope(value: unknown): ReasoningEnvelope | null {
  return isReasoningEnvelope(value) ? value : null;
}

export function useReasoningStream(workflowId: string | null) {
  const { events, connected } = useEventStream({ maxEvents: 64, path: "reasoning", batchWindowMs: 180 });
  const [snapshot, setSnapshot] = useState<ReasoningSnapshot | null>(null);
  const [history, setHistory] = useState<ReasoningHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workflowId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [snapshotData, historyData] = await Promise.all([
          cortexApi.reasoningSnapshot(workflowId),
          cortexApi.reasoningHistory(workflowId)
        ]);
        if (!mounted) return;
        setSnapshot(snapshotData);
        setHistory(historyData);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 5000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [workflowId]);

  const liveEnvelopes = useMemo(() => {
    return events
      .map((event) => toReasoningEnvelope(event.payload))
      .filter((event): event is ReasoningEnvelope => event !== null)
      .filter((event) => !workflowId || event.workflow_id === workflowId)
      .sort((a, b) => a.sequence - b.sequence);
  }, [events, workflowId]);

  const latestReasoning = useMemo<AgentReasoning[]>(() => {
    const fromSnapshot = snapshot?.latest_reasoning ?? [];
    const byAgent = new Map<string, AgentReasoning>();
    fromSnapshot.forEach((item) => byAgent.set(item.agent, item));
    liveEnvelopes.forEach((envelope) => byAgent.set(envelope.agent, envelope.reasoning));
    return Array.from(byAgent.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [liveEnvelopes, snapshot?.latest_reasoning]);

  return {
    connected,
    loading,
    snapshot,
    history,
    liveEnvelopes,
    latestReasoning
  };
}
