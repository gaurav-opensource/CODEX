import { Brain, Database } from "lucide-react";
import { memo } from "react";

import type { AgentNode, LiveRecoverySession } from "../dashboard/lib/recoveryRuntime";

interface AgentRuntimePanelProps {
  agents: AgentNode[];
  session: LiveRecoverySession | null;
}

export const AgentRuntimePanel = memo(function AgentRuntimePanel({ agents, session }: AgentRuntimePanelProps) {
  const rollingBack = session?.phase === "rollback";
  const restored = session?.phase === "restored" || session?.phase === "completed";

  return (
    <section className="panel runtime-panel">
      <div className="panel-heading">
        <h2>Agent Runtime</h2>
        {session ? <span className="runtime-phase">{session.phase.toUpperCase()}</span> : <span className="runtime-phase idle">STANDBY</span>}
      </div>
      <div className="agent-grid">
        {agents.map((agent) => (
          <article
            key={agent.id}
            className={`agent-card agent-${agent.state}${agent.state === "failed" ? " agent-failed" : ""}`}
          >
            <div className="agent-card-head">
              <Brain aria-hidden="true" size={16} />
              <div>
                <strong>{agent.name}</strong>
                <span>{agent.role}</span>
              </div>
            </div>
            <p className="agent-activity">{agent.state === "active" ? agent.activity : agent.state.toUpperCase()}</p>
          </article>
        ))}
        <article
          className={`agent-card memory-card${rollingBack ? " agent-active memory-rollback" : ""}${restored ? " memory-restored" : ""}`}
        >
          <div className="agent-card-head">
            <Database aria-hidden="true" size={16} />
            <div>
              <strong>HydraDB</strong>
              <span>Operational Memory</span>
            </div>
          </div>
          <p className="agent-activity">
            {rollingBack
              ? `LOADING ${session?.checkpointLabel ?? "checkpoint"}…`
              : restored
                ? "MEMORY RESTORED"
                : session
                  ? "TRACKING"
                  : "IDLE"}
          </p>
        </article>
      </div>
    </section>
  );
});
