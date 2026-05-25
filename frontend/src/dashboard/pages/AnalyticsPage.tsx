import { Activity, Timer, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

import { RuntimeGraph } from "../components/charts/RuntimeGraph";
import { MetricCard } from "../components/shared/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { cortexApi } from "../lib/api";
import type { AnalyticsSnapshot } from "../types/cortex";

export function AnalyticsPage() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [history, setHistory] = useState<AnalyticsSnapshot[]>([]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const data = await cortexApi.analytics();
      if (!mounted) return;
      setSnapshot(data);
      setHistory((current) => [data, ...current].slice(0, 10));
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 4500);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const recoveryMs = history.map((item) => item.mttr_ms);
  const successRate = history.map((item) => Math.round(item.recovery_success_rate));
  const incidentCount = history.map((item) => item.incident_count);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Observability</p>
          <h1>Analytics</h1>
          <p className="page-subtitle">Recovery performance, incident frequency, and infrastructure efficiency.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Avg recovery" value={snapshot ? `${snapshot.mttr_ms}ms` : "--"} delta={snapshot ? `${snapshot.workflow_uptime.toFixed(2)}% uptime` : "--"} icon={Timer} />
        <MetricCard label="Success trend" value={snapshot ? `${snapshot.recovery_success_rate.toFixed(1)}%` : "--"} delta={snapshot ? `${snapshot.incident_count} incidents` : "--"} icon={TrendingUp} delay={0.06} />
        <MetricCard label="AI efficiency" value={snapshot ? `${snapshot.avg_latency_ms}ms` : "--"} delta={snapshot ? `${snapshot.agent_execution_stats.length} agents` : "--"} icon={Activity} delay={0.12} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Recovery duration</CardTitle></CardHeader>
          <CardContent><RuntimeGraph title="ms" data={recoveryMs.length ? recoveryMs : [0]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Success rate</CardTitle></CardHeader>
          <CardContent><RuntimeGraph title="%" data={successRate.length ? successRate : [0]} color="#34d399" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Incident volume</CardTitle></CardHeader>
          <CardContent><RuntimeGraph title="count" data={incidentCount.length ? incidentCount : [0]} color="#f87171" /></CardContent>
        </Card>
      </div>
    </div>
  );
}
