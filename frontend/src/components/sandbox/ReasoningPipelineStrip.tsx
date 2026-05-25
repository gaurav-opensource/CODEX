import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const STAGES = [
  "metrics",
  "context",
  "memory",
  "compress",
  "grok",
  "score",
  "policy",
  "execute",
  "verify",
  "persist"
];

function stageIndex(events: { type?: string; agent?: string }[]): number {
  const last = events[events.length - 1];
  if (!last) return -1;
  if (last.type === "metrics_update") return 0;
  if (last.type === "failure_injected" || last.type === "workflow.failed") return 1;
  if (last.type?.includes("memory") || last.type === "timeline_update") return 9;
  if (last.agent === "Verifier" || last.type?.includes("verif")) return 8;
  if (last.agent === "Executor") return 7;
  if (last.agent === "Governor") return 6;
  if (last.agent === "Strategist") return 5;
  if (last.agent === "Diagnostician") return 2;
  if (last.type === "reasoning.update") return 4;
  return 3;
}

const ReasoningPipelineStrip = () => {
  const { events, latestReasoning } = useRecoverySandboxStream();
  const active = stageIndex([...events, ...latestReasoning]);

  return (
    <div className="reasoning-pipeline-strip mb-3">
      {STAGES.map((stage, idx) => (
        <span key={stage} className={idx <= active ? "active" : ""}>
          {stage}
        </span>
      ))}
    </div>
  );
};

export default ReasoningPipelineStrip;
