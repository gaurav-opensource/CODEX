import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { cortexApi } from "../lib/api";
import type { AnalyticsSnapshot, HydraDBStatus, Workflow } from "../types/cortex";

const nodes = [
  { id: "ui", label: "React Dashboard", x: 8, y: 12 },
  { id: "api", label: "FastAPI Control Plane", x: 38, y: 12 },
  { id: "bus", label: "WebSocket Event Bus", x: 68, y: 12 },
  { id: "agents", label: "Recovery Agents", x: 20, y: 48 },
  { id: "orch", label: "Orchestrator", x: 50, y: 48 },
  { id: "memory", label: "HydraDB Memory", x: 80, y: 48 },
  { id: "wf", label: "Workflow Runtime", x: 35, y: 78 }
];

export function ArchitecturePage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [hydra, setHydra] = useState<HydraDBStatus | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const [workflowData, analyticsData, hydraData] = await Promise.all([cortexApi.workflows(), cortexApi.analytics(), cortexApi.hydradbStatus()]);
      if (!mounted) return;
      setWorkflows(workflowData);
      setAnalytics(analyticsData);
      setHydra(hydraData);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 6000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">System map</p>
          <h1>Architecture</h1>
          <p className="page-subtitle">Interactive recovery pipeline and AI orchestration topology.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Workflows</CardTitle></CardHeader><CardContent><strong>{workflows.length}</strong></CardContent></Card>
        <Card><CardHeader><CardTitle>MTTR</CardTitle></CardHeader><CardContent><strong>{analytics ? `${analytics.mttr_ms}ms` : "--"}</strong></CardContent></Card>
        <Card><CardHeader><CardTitle>HydraDB</CardTitle></CardHeader><CardContent><strong>{hydra?.connected ? "connected" : "local"}</strong></CardContent></Card>
      </div>

      <Card className="arch-canvas-wrap">
        <CardHeader>
          <CardTitle>Recovery pipeline topology</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="arch-canvas">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.line x1="14" y1="18" x2="42" y2="18" stroke="#22d3ee" strokeOpacity="0.5" animate={{ strokeOpacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.line x1="48" y1="18" x2="72" y2="18" stroke="#22d3ee" strokeOpacity="0.5" animate={{ strokeOpacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
              <motion.line x1="50" y1="22" x2="50" y2="44" stroke="#8b5cf6" strokeOpacity="0.5" animate={{ strokeOpacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />
              <motion.line x1="28" y1="54" x2="48" y2="54" stroke="#22d3ee" strokeOpacity="0.5" animate={{ strokeOpacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }} />
              <motion.line x1="58" y1="54" x2="78" y2="54" stroke="#22d3ee" strokeOpacity="0.5" animate={{ strokeOpacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2, repeat: Infinity, delay: 1.1 }} />
            </svg>
            {nodes.map((node, index) => (
              <motion.div
                key={node.id}
                className="arch-node"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {node.label}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
