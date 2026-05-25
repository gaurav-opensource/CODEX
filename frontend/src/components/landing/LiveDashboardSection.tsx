import { memo } from "react";
import { TerminalSquare } from "lucide-react";

import { AgentRuntimePanel } from "../AgentRuntimePanel";
import { AgentTimeline } from "../AgentTimeline";
import { EventFeed } from "../EventFeed";
import { MetricsGrid } from "../MetricsGrid";
import { WorkflowTable } from "../WorkflowTable";
import { useLiveRecovery } from "../../dashboard/hooks/useLiveRecovery";

const MemoMetricsGrid = memo(MetricsGrid);
const MemoWorkflowTable = memo(WorkflowTable);
const MemoAgentRuntimePanel = memo(AgentRuntimePanel);
const MemoAgentTimeline = memo(AgentTimeline);
const MemoEventFeed = memo(EventFeed);

function SectionReveal({
  children,
  className = "",
  id
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`landing-reveal ${className}`.trim()}>
      {children}
    </section>
  );
}

export const LiveDashboardSection = memo(function LiveDashboardSection() {
  const {
    workflows,
    metrics,
    latestRecovery,
    loading,
    recover,
    recoveringId,
    events,
    connected,
    session,
    agents: runtimeAgents,
    timeline
  } = useLiveRecovery();
  const live = Boolean(session && session.phase !== "idle");

  return (
    <SectionReveal id="live-os" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 landing-section-deferred">
      <div className="section-kicker">Real-time dashboard preview</div>
      <div className="section-heading">
        <h2>A futuristic observability OS, wired to live recovery events.</h2>
        <p>Runtime, rollback events, WebSocket activity, agent state, and workflow health share one operating surface.</p>
      </div>
      <div className="landing-dashboard mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TerminalSquare className="h-5 w-5 text-cyan-200" />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-300">cortex live system</span>
          </div>
          <span className={`stream-status ${connected ? "online" : "offline"}`}>
            <span className="live-dot" />
            {connected ? "WebSocket online" : "WebSocket offline"}
          </span>
        </div>
        <MemoMetricsGrid metrics={metrics} />
        <div className="content-grid">
          {loading ? (
            <section className="panel loading-panel">Loading CORTEX telemetry...</section>
          ) : (
            <MemoWorkflowTable workflows={workflows} recoveringId={recoveringId} onRecover={recover} />
          )}
          <div className="side-stack">
            <MemoAgentRuntimePanel agents={runtimeAgents} session={session} />
            <MemoAgentTimeline recovery={latestRecovery} timeline={timeline} session={session} live={live} />
            <MemoEventFeed events={events} connected={connected} />
          </div>
        </div>
      </div>
    </SectionReveal>
  );
});
