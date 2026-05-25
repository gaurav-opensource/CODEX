import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "../components/shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { useEventStream } from "../hooks/useEventStream";
import { cortexApi } from "../lib/api";
import { cn } from "../../lib/utils";
import type { Workflow } from "../types/cortex";

const statusVariant: Record<string, "success" | "warn" | "danger" | "default" | "purple"> = {
  healthy: "success",
  degraded: "warn",
  recovering: "default",
  failed: "danger",
  quarantined: "purple"
};

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const { events } = useEventStream({ maxEvents: 16 });

  const refresh = async () => {
    setWorkflows(await cortexApi.workflows());
  };

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (events.some((event) => event.type.startsWith("workflow.") || event.type.startsWith("recovery."))) {
      void refresh();
    }
  }, [events]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Orchestration</p>
          <h1>Workflows</h1>
          <p className="page-subtitle">Live workflow states, recovery progress, and rollback posture.</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Workflow operations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Workflow</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Success</th>
                <th>Latency</th>
                <th>Retries</th>
                <th>Uptime</th>
                <th>Pipeline</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {workflows.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(row.status === "recovering" && "row-recovering")}
                >
                  <td><strong>{row.name}</strong></td>
                  <td><Badge variant={statusVariant[row.status]}>{row.status}</Badge></td>
                  <td>{row.owner}</td>
                  <td>{row.success_rate.toFixed(2)}%</td>
                  <td>{row.avg_latency_ms}ms</td>
                  <td>{row.retries}</td>
                  <td>{row.uptime_pct.toFixed(2)}%</td>
                  <td>
                    <span className="pipeline-pill">{row.status === "recovering" ? "running" : "verified"}</span>
                  </td>
                  <td>
                    <button type="button" className="dash-icon-btn" aria-label="Actions" onClick={() => void cortexApi.recoverWorkflow(row.id).then(refresh)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
