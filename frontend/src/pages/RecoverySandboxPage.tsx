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
  const { connected } = useRecoverySandboxStream();
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${connected ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"}`}
    >
      WS {connected ? "live" : "disconnected"}
    </span>
  );
}

const RecoverySandboxPage = () => {
  return (
    <RecoverySandboxStreamProvider>
      <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
        <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900">
          <h1 className="font-semibold text-lg">Recovery Sandbox</h1>
          <SandboxConnectionBadge />
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 min-w-72 max-w-xs bg-gray-900 border-r border-gray-800 p-4 flex flex-col gap-4">
            <div className="font-bold text-lg mb-2">Failure Injection</div>
            <FailureControlPanel />
          </aside>
          <main className="flex-1 flex flex-col bg-gray-950 p-4 gap-4 overflow-hidden">
            <div className="flex-1 flex flex-row gap-4 overflow-hidden">
              <section className="flex-1 bg-gray-900 rounded-lg shadow p-4 overflow-hidden">
                <div className="font-bold text-lg mb-2">Infrastructure Topology</div>
                <InfrastructureGraph />
              </section>
              <section className="w-96 min-w-80 max-w-md bg-gray-900 rounded-lg shadow p-4 flex flex-col gap-4 overflow-hidden">
                <div className="font-bold text-lg mb-2">Live AI Reasoning</div>
                <ReasoningPipelineStrip />
                <LiveReasoningFeed />
                <div className="font-bold text-lg mt-2 mb-2">Agent Execution</div>
                <AgentExecutionCard />
                <div className="font-bold text-lg mt-2 mb-2">Recovery Metrics</div>
                <RecoveryMetricsPanel />
              </section>
            </div>
          </main>
        </div>
        <footer className="w-full bg-gray-900 border-t border-gray-800 p-4 flex flex-row gap-4 items-start">
          <div className="flex-1">
            <div className="font-bold text-lg mb-2">Recovery Timeline</div>
            <RecoveryTimeline />
          </div>
          <div className="w-2/5 min-w-80 max-w-2xl">
            <div className="font-bold text-lg mb-2">Event Console</div>
            <EventConsole />
          </div>
        </footer>
      </div>
    </RecoverySandboxStreamProvider>
  );
};

export default RecoverySandboxPage;
