import {
  AgentExecutionCard,
  EventConsole,
  FailureControlPanel,
  InfrastructureGraph,
  LiveReasoningFeed,
  ReasoningPipelineStrip,
  RecoveryMetricsPanel,
  RecoveryTimeline
} from "@/components/sandbox";
import { RecoverySandboxStreamProvider, useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

function SandboxConnectionBadge() {
  const { connected, connectionState } = useRecoverySandboxStream();
  const tone = connected
    ? "bg-emerald-900/70 text-emerald-200 border border-emerald-500/30"
    : connectionState === "reconnecting"
      ? "bg-amber-900/70 text-amber-200 border border-amber-500/30"
      : "bg-rose-900/70 text-rose-200 border border-rose-500/30";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${tone}`}>
      {connected ? "WS Live" : connectionState === "reconnecting" ? "WS Reconnecting" : "WS Offline"}
    </span>
  );
}

function RecoverySandboxWorkspace() {
  const { clearStream, connected, error } = useRecoverySandboxStream();

  return (
    <div className="page-stack max-w-none">
      <header className="page-header">
        <div>
          <p className="page-kicker">Recovery Operations</p>
          <h1>Recovery Sandbox</h1>
          <p className="page-subtitle">
            Inject incidents, watch live recovery streams, and validate runtime behavior without leaving the production dashboard shell.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SandboxConnectionBadge />
          <button
            type="button"
            onClick={clearStream}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-100"
          >
            Clear Stream
          </button>
        </div>
      </header>

      {!connected && error ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        <aside className="dash-card overflow-hidden">
          <div className="dash-card-header">
            <div className="dash-card-title">Failure Injection</div>
            <p className="dash-card-desc">Choose a workflow, inject a signal, and optionally trigger autonomous recovery.</p>
          </div>
          <div className="dash-card-content">
            <FailureControlPanel />
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,420px)]">
            <section className="dash-card overflow-hidden">
              <div className="dash-card-header">
                <div className="dash-card-title">Infrastructure Topology</div>
                <p className="dash-card-desc">Live runtime visualization across gateway, worker, metrics, and HydraDB nodes.</p>
              </div>
              <div className="dash-card-content">
                <InfrastructureGraph />
              </div>
            </section>

            <section className="grid gap-4">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">Live AI Reasoning</div>
                </div>
                <div className="dash-card-content">
                  <ReasoningPipelineStrip />
                  <div className="mt-3">
                    <LiveReasoningFeed />
                  </div>
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">Agent Execution</div>
                </div>
                <div className="dash-card-content">
                  <AgentExecutionCard />
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">Recovery Metrics</div>
                </div>
                <div className="dash-card-content">
                  <RecoveryMetricsPanel />
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">Recovery Timeline</div>
                <p className="dash-card-desc">Recovery stage progression stays in sync with failure, reasoning, verification, and memory events.</p>
              </div>
              <div className="dash-card-content">
                <RecoveryTimeline />
              </div>
            </section>

            <section className="dash-card terminal-card">
              <div className="dash-card-header">
                <div className="dash-card-title">Event Console</div>
                <p className="dash-card-desc">Recent sandbox, runtime, and recovery stream frames.</p>
              </div>
              <div className="dash-card-content">
                <EventConsole />
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}

const RecoverySandboxPage = () => {
  return (
    <RecoverySandboxStreamProvider>
      <RecoverySandboxWorkspace />
    </RecoverySandboxStreamProvider>
  );
};

export default RecoverySandboxPage;
