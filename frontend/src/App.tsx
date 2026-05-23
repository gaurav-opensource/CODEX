import { AgentTimeline } from "./components/AgentTimeline";
import { EventFeed } from "./components/EventFeed";
import { Header } from "./components/Header";
import { MetricsGrid } from "./components/MetricsGrid";
import { WorkflowTable } from "./components/WorkflowTable";
import { useCortexData } from "./hooks/useCortexData";
import { useEventStream } from "./hooks/useEventStream";

export function App() {
  const { workflows, metrics, latestRecovery, loading, error, recover } = useCortexData();
  const { events, connected } = useEventStream();

  return (
    <main className="app-shell">
      <Header connected={connected} />
      {error ? <div className="alert">{error}</div> : null}
      <MetricsGrid metrics={metrics} />
      <div className="content-grid">
        {loading ? (
          <section className="panel loading-panel">Loading CORTEX telemetry...</section>
        ) : (
          <WorkflowTable workflows={workflows} onRecover={recover} />
        )}
        <AgentTimeline recovery={latestRecovery} />
        <EventFeed events={events} />
      </div>
    </main>
  );
}

