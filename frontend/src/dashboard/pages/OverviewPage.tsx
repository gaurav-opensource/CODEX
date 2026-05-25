import { Activity, AlertTriangle, Database, RotateCcw, Workflow as WorkflowIcon, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { RuntimeGraph } from "../components/charts/RuntimeGraph";
import { Badge } from "../components/shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { MetricCard } from "../components/shared/MetricCard";
import { useEventStream } from "../hooks/useEventStream";
import { useOperationalStatus } from "../hooks/useOperationalStatus";
import { cortexApi } from "../lib/api";
import type { Incident, MetricSnapshot, RecoveryEvent, Workflow as WorkflowData } from "../types/cortex";

const icons = { heart: Activity, zap: Zap, workflow: WorkflowIcon, alert: AlertTriangle, rotate: RotateCcw, database: Database };

export function OverviewPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [signals, setSignals] = useState<RecoveryEvent[]>([]);
  const { events } = useEventStream({ maxEvents: 16 });
  const ops = useOperationalStatus();

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const [workflowData, incidentData, metricData, timelineData] = await Promise.all([
        cortexApi.workflows(),
        cortexApi.incidents(),
        cortexApi.metrics(),
        cortexApi.recoveryTimeline()
      ]);
      if (!mounted) return;
      setWorkflows(workflowData);
      setIncidents(incidentData);
      setMetrics(metricData);
      setSignals(timelineData);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 3500);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const healthyCount = workflows.filter((workflow) => workflow.status === "healthy").length;
  const degradedCount = workflows.filter((workflow) => workflow.status === "degraded").length;
  const recoveringCount = workflows.filter((workflow) => workflow.status === "recovering").length;
  const distribution = useMemo(
    () => [
      { label: "Healthy", value: workflows.length ? Math.round((healthyCount / workflows.length) * 100) : 0, color: "#34d399" },
      { label: "Degraded", value: workflows.length ? Math.round((degradedCount / workflows.length) * 100) : 0, color: "#fbbf24" },
      { label: "Recovering", value: workflows.length ? Math.round((recoveringCount / workflows.length) * 100) : 0, color: "#22d3ee" },
      { label: "Failed", value: workflows.length ? Math.max(0, 100 - Math.round(((healthyCount + degradedCount + recoveringCount) / workflows.length) * 100)) : 0, color: "#f87171" }
    ],
    [degradedCount, healthyCount, recoveringCount, workflows.length]
  );

  const overviewMetrics = [
    { label: "System Health", value: `${workflows.length ? Math.round((healthyCount / workflows.length) * 100) : 0}%`, delta: `${healthyCount}/${workflows.length || 1}`, icon: "heart" },
    { label: "Recovery Success", value: metrics ? `${metrics.recovery_success_rate.toFixed(1)}%` : "0%", delta: metrics ? `${metrics.recovery_time_ms}ms` : "--", icon: "zap" },
    { label: "Active Workflows", value: `${workflows.length}`, delta: `+${recoveringCount}`, icon: "workflow" },
    { label: "Open Incidents", value: `${incidents.filter((incident) => incident.status !== "resolved").length}`, delta: `recent ${incidents.length}`, icon: "alert" },
    { label: "Rollback Rate", value: `${signals.filter((event) => event.type.startsWith("rollback")).length}`, delta: `${metrics?.detection_latency_ms ?? 0}ms detect`, icon: "rotate" },
    { label: "HydraDB Sync", value: metrics ? `${metrics.websocket_latency_ms}ms` : "--", delta: metrics ? `${metrics.api_response_ms}ms api` : "--", icon: "database" }
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Command center</p>
          <h1>Overview</h1>
          <p className="page-subtitle">Autonomous recovery observability across workflows, agents, and HydraDB memory.</p>
        </div>
        <Badge variant={ops.runtime_health === "healthy" ? "success" : ops.runtime_health === "degraded" ? "danger" : "warn"}>
          {workflows.length ? `Runtime ${ops.runtime_health}` : "Loading"}
        </Badge>
      </header>

      {(ops.degraded_workflows > 0 || ops.open_incidents > 0 || ops.policy_arbitration_pending) && (
        <div className="operational-banner">
          <strong>Operational tension</strong>
          {ops.degraded_workflows > 0 && <span>{ops.degraded_workflows} workflow(s) degraded</span>}
          {ops.open_incidents > 0 && <span>{ops.open_incidents} open incident(s)</span>}
          {ops.hydradb_sync !== "synced" && <span>HydraDB {ops.hydradb_sync}</span>}
          {ops.policy_arbitration_pending && <span>Governor awaiting policy consensus</span>}
        </div>
      )}

      <div className="metric-grid">
        {overviewMetrics.map((metric, index) => {
          const Icon = icons[metric.icon as keyof typeof icons] ?? Activity;
          return (
            <MetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              delta={metric.delta}
              icon={Icon}
              delay={index * 0.06}
            />
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recovery activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RuntimeGraph title="Success rate %" data={(metrics ? [metrics.recovery_success_rate - 3, metrics.recovery_success_rate - 2, metrics.recovery_success_rate - 1, metrics.recovery_success_rate] : [0, 0, 0, 0]).map((value) => Math.max(0, Math.round(value)))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <RuntimeGraph title="Open incidents" data={[Math.max(0, incidents.length - 3), Math.max(0, incidents.length - 2), Math.max(0, incidents.length - 1), incidents.length]} color="#a78bfa" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workflow states</CardTitle>
          </CardHeader>
          <CardContent className="distribution-list">
            {distribution.map((item) => (
              <div key={item.label} className="distribution-row">
                <span>{item.label}</span>
                <div className="distribution-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ background: item.color }}
                  />
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active incidents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {incidents.slice(0, 5).map((incident) => (
              <motion.div key={incident.id} whileHover={{ scale: 1.01 }} className="incident-row-mini">
                <div>
                  <strong>{incident.title}</strong>
                  <p>{incident.workflow_id}</p>
                </div>
                <Badge variant={incident.severity === "critical" ? "danger" : incident.severity === "high" ? "warn" : "default"}>
                  {incident.status}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest runtime signals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="signal-row">
              <span className="font-mono text-[10px] text-cyan-300">{event.type}</span>
              <p>{event.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
