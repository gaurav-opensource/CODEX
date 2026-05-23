import { CheckCircle2, CircleDashed, History, Loader2, RotateCcw, XCircle } from "lucide-react";
import { memo } from "react";

import type { LiveRecoverySession, TimelineEntry } from "../lib/recoveryRuntime";
import type { RecoveryResult } from "../types/cortex";

const defaultSteps = [
  "Sentinel waits for anomalous telemetry",
  "Diagnostician prepares causal graph",
  "Strategist evaluates recovery options",
  "Governor checks policy constraints",
  "Executor stands by for action",
  "Verifier monitors outcome",
  "Historian records durable memory"
];

interface AgentTimelineProps {
  recovery: RecoveryResult | null;
  timeline: TimelineEntry[];
  session: LiveRecoverySession | null;
  live: boolean;
}

export const AgentTimeline = memo(function AgentTimeline({ recovery, timeline, session, live }: AgentTimelineProps) {
  const rollback = recovery?.rollback;
  const showLive = live && timeline.length > 0;

  return (
    <section className={`panel timeline-panel${session?.phase === "rollback" ? " timeline-rollback-glow" : ""}`}>
      <div className="panel-heading">
        <h2>Recovery Timeline</h2>
        <div className="panel-heading-meta">
          {live && session ? (
            <span className="live-badge">
              <span className="live-dot" />
              LIVE
            </span>
          ) : null}
          {rollback?.attempted ? (
            <span className={`rollback-badge ${rollback.restored ? "success" : "failed"}`}>
              <RotateCcw aria-hidden="true" size={14} />
              {rollback.restored ? "Checkpoint restored" : "Rollback failed"}
            </span>
          ) : null}
          {recovery ? <span>{recovery.incident.elapsed_ms}ms</span> : null}
        </div>
      </div>

      {session?.phase === "rollback" ? (
        <p className="rollback-banner rollback-banner-animated">
          <History aria-hidden="true" size={16} />
          Loading checkpoint from HydraDB operational memory…
        </p>
      ) : rollback?.attempted ? (
        <p className="rollback-banner">
          <History aria-hidden="true" size={16} />
          {rollback.restored
            ? `Workflow state restored from ${rollback.checkpoint_reason ?? "stable checkpoint"}`
            : rollback.message ?? "Rollback could not restore workflow state"}
        </p>
      ) : null}

      <ol className="timeline">
        {showLive
          ? timeline.map((entry) => {
              const failed = entry.status === "failed";
              const active = entry.status === "active";
              const Icon = failed ? XCircle : active ? Loader2 : CheckCircle2;
              return (
                <li
                  key={entry.id}
                  className={`timeline-entry timeline-${entry.kind} timeline-${entry.status}${active ? " timeline-entry-active" : ""}`}
                >
                  <Icon aria-hidden="true" size={18} className={active ? "spin" : undefined} />
                  <div>
                    <time>{entry.at}</time>
                    <span>{entry.text}</span>
                  </div>
                </li>
              );
            })
          : (recovery?.timeline ?? defaultSteps).map((step, index) => {
              const rollbackStep = step.toLowerCase().includes("rollback");
              const failed = rollbackStep && step.toLowerCase().includes("failed");
              const complete = Boolean(recovery) && !failed;
              const Icon = failed ? XCircle : complete ? CheckCircle2 : CircleDashed;
              return (
                <li key={`${step}-${index}`} className={rollbackStep ? "timeline-rollback" : undefined}>
                  <Icon aria-hidden="true" size={18} />
                  <span>{step}</span>
                </li>
              );
            })}
      </ol>
    </section>
  );
});
