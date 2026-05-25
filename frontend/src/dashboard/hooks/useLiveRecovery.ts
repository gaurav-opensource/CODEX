import { useCallback, useEffect, useRef, useState } from "react";

import { cortexApi } from "../lib/api";
import {
  applyRecoveryEvent,
  activateFirstAgent,
  createInitialAgents,
  type AgentNode,
  type LiveRecoverySession,
  type TimelineEntry
} from "../lib/recoveryRuntime";
import type { MetricSnapshot, RecoveryResult, Workflow, WorkflowStatus } from "../types/cortex";
import { useEventStream } from "./useEventStream";

export type WorkflowRow = Workflow & { _livePhase?: "recovering" | "rollback" | "restored" };

export function useLiveRecovery() {
  const { events, connected, clearEvents } = useEventStream({ maxEvents: 24 });
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [latestRecovery, setLatestRecovery] = useState<RecoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<LiveRecoverySession | null>(null);
  const [agents, setAgents] = useState<AgentNode[]>(createInitialAgents);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  const processedRef = useRef<Set<string>>(new Set());
  const sessionRef = useRef<LiveRecoverySession | null>(null);
  const agentsRef = useRef(agents);
  const timelineRef = useRef(timeline);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    agentsRef.current = agents;
  }, [agents]);

  useEffect(() => {
    timelineRef.current = timeline;
  }, [timeline]);

  const refresh = useCallback(async () => {
    try {
      const [workflowData, metricData] = await Promise.all([cortexApi.workflows(), cortexApi.metrics()]);
      setWorkflows(workflowData);
      setMetrics(metricData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load CORTEX data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateWorkflowStatus = useCallback((workflowId: string, status: WorkflowStatus) => {
    setWorkflows((current) =>
      current.map((workflow) => (workflow.id === workflowId ? { ...workflow, status } : workflow))
    );
  }, []);

  const beginSession = useCallback(
    (workflowId: string, workflowName: string) => {
      processedRef.current.clear();
      clearEvents();
      setAgents(activateFirstAgent(createInitialAgents()));
      setTimeline([]);
      setRecoveringId(workflowId);
      setSession({
        workflowId,
        workflowName,
        phase: "recovering",
        startedAt: Date.now(),
        checkpointLabel: null,
        recovered: null
      });
      updateWorkflowStatus(workflowId, "recovering");
    },
    [clearEvents, updateWorkflowStatus]
  );

  useEffect(() => {
    const event = events[0];
    const active = sessionRef.current;
    if (!event || !active) return;
    if (processedRef.current.has(event.id)) return;

    const workflowId = event.payload.workflowId as string | undefined;
    if (workflowId && workflowId !== active.workflowId) return;

    processedRef.current.add(event.id);

    const result = applyRecoveryEvent(
      event,
      agentsRef.current,
      timelineRef.current,
      active
    );

    setAgents(result.agents);
    setTimeline(result.timeline);
    setSession(result.session);

    if (event.type === "rollback.restored") {
      const status = (event.payload.status as WorkflowStatus) ?? "degraded";
      updateWorkflowStatus(active.workflowId, status);
    } else if (event.type === "rollback.failed") {
      updateWorkflowStatus(active.workflowId, "failed");
    } else if (event.type === "recovery.completed") {
      const recovered = Boolean(event.payload.recovered);
      const rollback = event.payload.rollback as { restored?: boolean } | null | undefined;
      if (!recovered) {
        updateWorkflowStatus(active.workflowId, "failed");
      } else if (rollback?.restored) {
        const wf = workflows.find((w) => w.id === active.workflowId);
        updateWorkflowStatus(active.workflowId, wf?.status === "healthy" ? "healthy" : "degraded");
      } else {
        updateWorkflowStatus(active.workflowId, "healthy");
      }
    } else if (event.type === "recovery.started") {
      updateWorkflowStatus(active.workflowId, "recovering");
    }
  }, [events, updateWorkflowStatus, workflows]);

  const recover = useCallback(
    async (workflowId: string) => {
      const workflow = workflows.find((item) => item.id === workflowId);
      beginSession(workflowId, workflow?.name ?? "Workflow");

      try {
        const result = await cortexApi.recover(workflowId, workflow?.status);
        setLatestRecovery(result);
        setSession((current) =>
          current
            ? {
                ...current,
                phase: result.rollback?.restored ? "restored" : result.recovered ? "completed" : "failed",
                recovered: result.recovered,
                checkpointLabel: result.rollback?.checkpoint_reason ?? current.checkpointLabel
              }
            : current
        );
        await refresh();
        return result;
      } catch (err) {
        setSession((current) => (current ? { ...current, phase: "failed", recovered: false } : current));
        setError(err instanceof Error ? err.message : "Recovery failed");
        throw err;
      } finally {
        setRecoveringId(null);
      }
    },
    [workflows, beginSession, refresh]
  );

  const displayWorkflows: WorkflowRow[] = workflows.map((workflow) => {
    if (session?.workflowId !== workflow.id) return workflow;
    if (session.phase === "rollback") return { ...workflow, status: "recovering", _livePhase: "rollback" };
    if (session.phase === "restored") return { ...workflow, _livePhase: "restored" };
    if (session.phase === "recovering" || session.phase === "verifying") {
      return { ...workflow, status: "recovering", _livePhase: "recovering" };
    }
    return workflow;
  });

  return {
    workflows: displayWorkflows,
    metrics,
    latestRecovery,
    loading,
    error,
    refresh,
    recover,
    recoveringId,
    events,
    connected,
    session,
    agents,
    timeline
  };
}
