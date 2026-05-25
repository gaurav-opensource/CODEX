import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Badge } from "../components/shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { cortexApi } from "../lib/api";
import type { AgentRuntime } from "../types/cortex";

export function AgentRuntimePage() {
  const [agents, setAgents] = useState<AgentRuntime[]>([]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const data = await cortexApi.runtimeAgents();
      if (mounted) setAgents(data);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 4000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">AI operating system</p>
          <h1>Agent Runtime</h1>
          <p className="page-subtitle">Live orchestration graph with per-agent telemetry and operation streams.</p>
        </div>
      </header>

      <div className="orchestration-canvas">
        <div className="orchestration-grid" />
        {agents.map((agent, index) => (
          <motion.article
            key={agent.id}
            className={`agent-runtime-card ${agent.state}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            style={{
              left: `${12 + (index % 3) * 30}%`,
              top: `${14 + Math.floor(index / 3) * 38}%`
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <strong>{agent.name}</strong>
              <Badge variant={agent.state === "active" ? "default" : agent.state === "failed" ? "danger" : "success"}>{agent.activity}</Badge>
            </div>
            <p className="text-xs text-slate-400">{agent.role}</p>
            <div className="agent-meters">
              <span>RUN {agent.executions}</span>
              <span>AVG {agent.avg_duration_ms}ms</span>
            </div>
            <p className="agent-log">{agent.state.toUpperCase()}</p>
          </motion.article>
        ))}
        <svg className="orchestration-links" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M15,25 L45,25 L75,55 L45,75"
            fill="none"
            stroke="url(#cyanGrad)"
            strokeWidth="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <defs>
            <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={`detail-${agent.id}`}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3">{agent.role}</p>
              <p className="font-mono text-xs text-cyan-100">{agent.activity}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
