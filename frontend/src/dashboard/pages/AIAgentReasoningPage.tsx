import { Activity, BrainCircuit, Clock3, ShieldCheck, Waves } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "../components/shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { AgentReasoningCard } from "../components/reasoning/AgentReasoningCard";
import { LiveReasoningFeed } from "../components/reasoning/LiveReasoningFeed";
import { ReasoningTimeline } from "../components/reasoning/ReasoningTimeline";
import { cortexApi } from "../lib/api";
import type { Workflow } from "../types/cortex";
import { useReasoningStream } from "../hooks/useReasoningStream";

export function AIAgentReasoningPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const { connected, loading, snapshot, history, liveEnvelopes, latestReasoning } = useReasoningStream(selectedWorkflowId);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await cortexApi.workflows();
      if (!mounted) return;
      setWorkflows(data);
      setSelectedWorkflowId((current) => current ?? data.find((item) => item.status === "recovering")?.id ?? data[0]?.id ?? null);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedWorkflow = useMemo(
    () => workflows.find((item) => item.id === selectedWorkflowId) ?? null,
    [selectedWorkflowId, workflows]
  );

  const summaryCards = [
    { label: "Workflow", value: selectedWorkflow?.name ?? "Unselected", icon: Activity },
    { label: "Duration", value: snapshot ? `${snapshot.duration_ms}ms` : "--", icon: Clock3 },
    { label: "Reasoning agents", value: `${latestReasoning.length}`, icon: BrainCircuit },
    { label: "Historical recalls", value: `${history.length}`, icon: Waves }
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">AI reasoning fabric</p>
          <h1>Agent Reasoning</h1>
          <p className="page-subtitle">
            Live recovery reasoning, compact Grok decisions, and HydraDB-backed historical recall in one stream.
          </p>
        </div>
        <div className="reasoning-toolbar">
          <label className="reasoning-select">
            <span>Workflow</span>
            <select value={selectedWorkflowId ?? ""} onChange={(event) => setSelectedWorkflowId(event.target.value || null)}>
              {workflows.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
          </label>
          <Badge variant={connected ? "success" : "danger"}>{connected ? "Stream online" : "Stream reconnecting"}</Badge>
        </div>
      </header>

      <div className="metric-grid">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="reasoning-summary-card">
              <div>
                <p className="metric-label">{label}</p>
                <strong className="reasoning-summary-value">{value}</strong>
              </div>
              <Icon className="h-5 w-5 text-cyan-300" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4">
          {latestReasoning.map((item) => (
            <AgentReasoningCard key={item.id} item={item} />
          ))}
          {!loading && !latestReasoning.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Awaiting reasoning</CardTitle>
              </CardHeader>
              <CardContent className="page-subtitle">
                Trigger a recovery on this workflow to watch the agents stream structured reasoning in real time.
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="grid gap-4">
          <LiveReasoningFeed items={[...liveEnvelopes].reverse()} />
          <ReasoningTimeline items={liveEnvelopes} />
          <Card>
            <CardHeader>
              <CardTitle>Historical strategy memory</CardTitle>
            </CardHeader>
            <CardContent className="reasoning-history-list">
              {history.slice(0, 6).map((item) => (
                <div key={`${item.incident_id}-${item.agent_name}`} className="reasoning-history-row">
                  <div>
                    <strong>{item.agent_name}</strong>
                    <p>{item.selected_strategy}</p>
                  </div>
                  <div className="reasoning-history-stats">
                    <span>{item.confidence}%</span>
                    <small>{item.recovery_duration_ms ?? 0}ms</small>
                  </div>
                </div>
              ))}
              {!history.length ? <p className="page-subtitle">No persisted reasoning history for this workflow yet.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recovery timeline summary</CardTitle>
            </CardHeader>
            <CardContent className="reasoning-text-list">
              {(snapshot?.timeline ?? []).slice(-8).map((line) => (
                <div key={line} className="reasoning-text-row">
                  <ShieldCheck className="h-4 w-4 text-cyan-300" />
                  <p>{line}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
