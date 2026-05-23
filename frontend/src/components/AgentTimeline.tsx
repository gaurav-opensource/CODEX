import { CheckCircle2, CircleDashed } from "lucide-react";

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

export function AgentTimeline({ recovery }: { recovery: RecoveryResult | null }) {
  const steps = recovery?.timeline ?? defaultSteps;

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Agent Timeline</h2>
        {recovery ? <span>{recovery.incident.elapsed_ms}ms</span> : null}
      </div>
      <ol className="timeline">
        {steps.map((step, index) => {
          const complete = Boolean(recovery);
          const Icon = complete ? CheckCircle2 : CircleDashed;
          return (
            <li key={`${step}-${index}`}>
              <Icon aria-hidden="true" size={18} />
              <span>{step}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

