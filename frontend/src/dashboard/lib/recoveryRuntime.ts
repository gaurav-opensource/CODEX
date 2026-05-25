import type { CortexEvent, WorkflowStatus } from "../types/cortex";

export type AgentRuntimeState = "idle" | "active" | "done" | "failed";
export type RecoveryPhase =
  | "idle"
  | "recovering"
  | "verifying"
  | "rollback"
  | "restored"
  | "completed"
  | "failed";

export interface AgentNode {
  id: string;
  name: string;
  role: string;
  state: AgentRuntimeState;
  activity: string;
}

export interface TimelineEntry {
  id: string;
  text: string;
  at: string;
  kind: "agent" | "rollback" | "memory" | "recovery" | "system";
  status: "pending" | "active" | "complete" | "failed";
}

export interface LiveRecoverySession {
  workflowId: string;
  workflowName: string;
  phase: RecoveryPhase;
  startedAt: number;
  checkpointLabel: string | null;
  recovered: boolean | null;
}

export const AGENT_PIPELINE: Array<{ id: string; name: string; role: string; activity: string }> = [
  { id: "sentinel", name: "Sentinel", role: "Vital Monitor", activity: "DETECTING" },
  { id: "diagnostician", name: "Diagnostician", role: "Forensic", activity: "ANALYZING" },
  { id: "strategist", name: "Strategist", role: "Strategist", activity: "PLANNING" },
  { id: "governor", name: "Governor", role: "Overseer", activity: "APPROVING" },
  { id: "executor", name: "Executor", role: "Surgeon", activity: "PATCHING" },
  { id: "verifier", name: "Verifier", role: "Canary", activity: "VERIFYING" },
  { id: "historian", name: "Historian", role: "Archivist", activity: "WRITING MEMORY" }
];

export function createInitialAgents(): AgentNode[] {
  return AGENT_PIPELINE.map((agent) => ({
    ...agent,
    state: "idle",
    activity: "IDLE"
  }));
}

export function activateFirstAgent(agents: AgentNode[]): AgentNode[] {
  if (agents.length === 0) return agents;
  return agents.map((agent, index) =>
    index === 0 ? { ...agent, state: "active", activity: AGENT_PIPELINE[0].activity } : agent
  );
}

export function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return "--:--:--";
  }
}

export function eventCategory(type: string): "agent" | "rollback" | "memory" | "recovery" | "system" {
  if (type.startsWith("agent.")) return "agent";
  if (type.startsWith("rollback.")) return "rollback";
  if (type.startsWith("recovery.")) return "recovery";
  return "system";
}

export function eventLabel(type: string): string {
  if (type === "recovery.started") return "RECOVERY";
  if (type === "recovery.completed") return "COMPLETE";
  if (type === "rollback.started") return "ROLLBACK";
  if (type === "rollback.restored") return "RESTORED";
  if (type === "rollback.failed") return "FAILED";
  if (type.startsWith("agent.")) return "AGENT";
  return "SYSTEM";
}

export function liveStatusForPhase(phase: RecoveryPhase, fallback: WorkflowStatus): WorkflowStatus {
  if (phase === "recovering" || phase === "verifying") return "recovering";
  if (phase === "rollback") return "recovering";
  if (phase === "restored" || phase === "completed") return fallback;
  if (phase === "failed") return "failed";
  return fallback;
}

export function memoryMessageForEvent(event: CortexEvent): string | null {
  if (event.type === "rollback.started") {
    return "[HydraDB] Locating stable checkpoint in operational memory…";
  }
  if (event.type === "rollback.restored") {
    const reason = (event.payload.checkpointReason as string) ?? "stable checkpoint";
    return `[HydraDB] Restored checkpoint: ${reason}`;
  }
  if (event.type === "rollback.failed") {
    return "[HydraDB] Rollback failed — no valid checkpoint";
  }
  if (event.type === "recovery.completed") {
    return "[HydraDB] Incident + recovery history persisted";
  }
  if (event.type.startsWith("agent.historian.completed")) {
    return "[HydraDB] Agent state + timeline snapshot stored";
  }
  return null;
}

export function applyRecoveryEvent(
  event: CortexEvent,
  agents: AgentNode[],
  timeline: TimelineEntry[],
  session: LiveRecoverySession
): { agents: AgentNode[]; timeline: TimelineEntry[]; session: LiveRecoverySession } {
  const at = formatTime(event.created_at);
  const nextTimeline = [...timeline];
  let nextAgents = [...agents];
  let nextSession = { ...session };

  const pushEntry = (entry: Omit<TimelineEntry, "id">) => {
    nextTimeline.push({ ...entry, id: `${event.id}-${nextTimeline.length}` });
  };

  const setAgentState = (agentId: string, state: AgentRuntimeState, activity?: string) => {
    nextAgents = nextAgents.map((agent) => {
      if (agent.id !== agentId) return agent;
      return {
        ...agent,
        state,
        activity: activity ?? (state === "idle" ? "IDLE" : agent.activity)
      };
    });
  };

  const completeAgent = (agentId: string) => {
    setAgentState(agentId, "done", "DONE");
    const index = AGENT_PIPELINE.findIndex((item) => item.id === agentId);
    const next = AGENT_PIPELINE[index + 1];
    if (next) {
      setAgentState(next.id, "active", next.activity);
    }
  };

  if (event.type === "recovery.started") {
    nextAgents = activateFirstAgent(createInitialAgents());
    nextSession = { ...nextSession, phase: "recovering" };
    pushEntry({ text: event.message, at, kind: "recovery", status: "active" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  const agentMatch = event.type.match(/^agent\.([a-z]+)\.completed$/);
  if (agentMatch) {
    const agentId = agentMatch[1];
    completeAgent(agentId);
    const failed = event.message.toLowerCase().includes("verification failed");
    if (agentId === "verifier" && failed) {
      setAgentState("verifier", "failed", "VERIFY FAILED");
      nextSession = { ...nextSession, phase: "verifying" };
    }
    pushEntry({ text: event.message, at, kind: "agent", status: failed ? "failed" : "complete" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  if (event.type === "rollback.started") {
    nextSession = { ...nextSession, phase: "rollback", checkpointLabel: "loading…" };
    nextAgents = nextAgents.map((agent) => ({
      ...agent,
      state: agent.state === "active" ? "idle" : agent.state,
      activity: agent.state === "active" ? "IDLE" : agent.activity
    }));
    pushEntry({ text: "Rollback triggered — loading stable checkpoint", at, kind: "rollback", status: "active" });
    const memory = memoryMessageForEvent(event);
    if (memory) pushEntry({ text: memory, at, kind: "memory", status: "active" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  if (event.type === "rollback.restored") {
    const reason = (event.payload.checkpointReason as string) ?? "pre_recovery:stable";
    nextSession = {
      ...nextSession,
      phase: "restored",
      checkpointLabel: reason,
      recovered: true
    };
    pushEntry({ text: `Loading checkpoint_${reason.replace(/[:/]/g, "_")}…`, at, kind: "rollback", status: "active" });
    pushEntry({ text: event.message, at, kind: "rollback", status: "complete" });
    const memory = memoryMessageForEvent(event);
    if (memory) pushEntry({ text: memory, at, kind: "memory", status: "complete" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  if (event.type === "rollback.failed") {
    nextSession = { ...nextSession, phase: "failed", recovered: false };
    pushEntry({ text: event.message, at, kind: "rollback", status: "failed" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  if (event.type === "recovery.completed") {
    const recovered = Boolean(event.payload.recovered);
    nextSession = {
      ...nextSession,
      phase: recovered ? "completed" : "failed",
      recovered
    };
    pushEntry({ text: event.message, at, kind: "recovery", status: recovered ? "complete" : "failed" });
    const memory = memoryMessageForEvent(event);
    if (memory) pushEntry({ text: memory, at, kind: "memory", status: "complete" });
    return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
  }

  return { agents: nextAgents, timeline: nextTimeline, session: nextSession };
}
