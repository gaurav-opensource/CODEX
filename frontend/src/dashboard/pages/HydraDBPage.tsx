import { motion } from "framer-motion";
import { Database } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "../components/shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { cortexApi } from "../lib/api";
import type { HydraDBMemoryBundle, HydraDBStatus, Workflow } from "../types/cortex";

export function HydraDBPage() {
  const [status, setStatus] = useState<HydraDBStatus | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [memory, setMemory] = useState<HydraDBMemoryBundle | null>(null);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const workflowData = await cortexApi.workflows();
      const statusData = await cortexApi.hydradbStatus();
      const selected = workflowData[0];
      const memoryData = selected ? await cortexApi.hydradbMemory(selected.id) : null;
      if (!mounted) return;
      setWorkflows(workflowData);
      setStatus(statusData);
      setMemory(memoryData);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 6000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const checkpoints = memory?.checkpoints ?? [];
  const rollbackHistory = memory?.rollback_history ?? [];
  const recoveryHistory = memory?.recovery_history ?? [];
  const agentStates = memory?.agent_states ?? [];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Operational memory</p>
          <h1>HydraDB Memory</h1>
          <p className="page-subtitle">Checkpoints, rollback snapshots, incident lineage, and recovery history.</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Connected</CardTitle></CardHeader><CardContent><Badge variant={status?.connected ? "success" : "warn"}>{status?.connected ? "yes" : "local"}</Badge></CardContent></Card>
        <Card><CardHeader><CardTitle>Workflows</CardTitle></CardHeader><CardContent><strong>{workflows.length}</strong></CardContent></Card>
        <Card><CardHeader><CardTitle>Latest checkpoint</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-400">{status?.latest_checkpoint ?? "none"}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Memory mode</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-400">{status?.fallback_reason ? "fallback" : "hydradb"}</p></CardContent></Card>
      </div>

      <div className="memory-network">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="memory-core"
        >
          <Database className="h-10 w-10 text-cyan-200" />
          <span>{workflows[0]?.name ?? "HydraDB Core"}</span>
        </motion.div>
        {checkpoints.slice(0, 4).map((cp, index) => (
          <motion.div
            key={`${String(cp.reason)}-${index}`}
            className="memory-node"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{ left: `${18 + index * 20}%`, top: `${20 + (index % 2) * 40}%` }}
          >
            <strong>{String(cp.reason ?? "checkpoint")}</strong>
            <p>{String(cp.stored_at ?? cp.updated_at ?? cp.created_at ?? "")}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checkpoints.slice(0, 2).map((cp, index) => (
          <Card key={`checkpoint-${index}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {String(cp.reason ?? "checkpoint")}
                <Badge variant="success">stable</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">{workflows[0]?.name ?? ""}</p>
              <p className="mt-3 font-mono text-xs text-cyan-200">{String(cp.stored_at ?? cp.updated_at ?? "")}</p>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader><CardTitle>Rollback history</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {rollbackHistory.slice(0, 3).map((row, index) => (
              <div key={`rb-${index}`} className="signal-row">
                <strong>{String(row.checkpoint_reason ?? "rollback")}</strong>
                <p>{String(row.metadata ? JSON.stringify(row.metadata) : "")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recovery intelligence</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {recoveryHistory.slice(0, 3).map((row, index) => (
              <div key={`rh-${index}`} className="signal-row">
                <strong>{String((row.incident as Record<string, unknown> | undefined)?.title ?? "incident")}</strong>
                <p>{String(row.recovered ? "recovered" : "failed")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Agent memory</CardTitle></CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {agentStates.slice(0, 4).map((row, index) => (
              <div key={`agent-${index}`} className="signal-row">
                <strong>{String((row as Record<string, unknown>).agent_name ?? "agent")}</strong>
                <p>{String((((row as Record<string, unknown>).timeline as string[] | undefined) ?? [])[0] ?? "execution captured")}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
