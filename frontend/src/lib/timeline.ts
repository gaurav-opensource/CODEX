import type { SandboxEvent } from "./ws";

export const TIMELINE_STEPS = [
  "Failure Detected",
  "Root Cause Identified",
  "Strategy Selected",
  "Recovery Started",
  "Verification Passed",
  "Memory Updated",
] as const;

export type TimelineStageStatus = "pending" | "active" | "completed";

/** Maps backend / sandbox event types to timeline step index (0–5). */
const EVENT_STEP_MAP: Record<string, number> = {
  failure_injected: 0,
  "workflow.failed": 0,
  "incident.created": 0,
  "failure.detected": 0,
  "root_cause.identified": 1,
  "agent.diagnostician.completed": 1,
  "strategy.selected": 2,
  "agent.strategist.completed": 2,
  "recovery.started": 3,
  "verification.passed": 4,
  "agent.verifier.completed": 4,
  "memory.updated": 5,
  "agent.historian.completed": 5,
  "recovery.completed": 5,
};

const AGENT_STEP_MAP: Record<string, number> = {
  Diagnostician: 1,
  Strategist: 2,
  Verifier: 4,
  Historian: 5,
};

export function resolveTimelineStep(event: SandboxEvent): number | null {
  if (event.stage && event.stage in EVENT_STEP_MAP) {
    return EVENT_STEP_MAP[event.stage];
  }

  if (event.type === "timeline_update" && typeof event.step === "number") {
    return event.step;
  }

  if (event.type === "failure_injected" && typeof event.step === "number") {
    return event.step;
  }

  const stage = event.payload?.stage ?? event.payload?.stageId;
  if (typeof stage === "string" && stage in EVENT_STEP_MAP) {
    return EVENT_STEP_MAP[stage];
  }

  if (event.type && event.type in EVENT_STEP_MAP) {
    return EVENT_STEP_MAP[event.type];
  }

  if (event.agent && event.status === "completed" && event.agent in AGENT_STEP_MAP) {
    return AGENT_STEP_MAP[event.agent];
  }

  return null;
}

export function isTimelineResetEvent(event: SandboxEvent): boolean {
  return (
    event.type === "failure_injected" ||
    event.type === "workflow.failed" ||
    event.stage === "failure.detected" ||
    (event.type === "timeline_update" && event.step === 0 && event.stage === "failure.detected")
  );
}

export function stagesFromActiveStep(activeStep: number): TimelineStageStatus[] {
  return TIMELINE_STEPS.map((_, idx) => {
    if (activeStep < 0) return "pending";
    if (idx < activeStep) return "completed";
    if (idx === activeStep) return "active";
    return "pending";
  });
}

export const INITIAL_TIMELINE_STAGES: TimelineStageStatus[] = TIMELINE_STEPS.map(() => "pending");

export function createInitialTimelineReached(): boolean[] {
  return TIMELINE_STEPS.map(() => false);
}

/** Mark milestones independently so out-of-order WS events still fill the timeline correctly. */
export function applyTimelineReached(reached: boolean[], step: number, reset: boolean): boolean[] {
  const next = reset ? createInitialTimelineReached() : [...reached];
  if (step >= 0 && step < next.length) {
    next[step] = true;
  }
  return next;
}

export function stagesFromReached(reached: boolean[]): TimelineStageStatus[] {
  const highest = reached.lastIndexOf(true);
  if (highest === -1) {
    return INITIAL_TIMELINE_STAGES;
  }
  return reached.map((hit, idx) => {
    if (!hit) return "pending";
    if (idx === highest) return "active";
    return "completed";
  });
}
