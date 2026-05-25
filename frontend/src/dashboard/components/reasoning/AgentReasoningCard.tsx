import { BrainCircuit, History, Shield, TriangleAlert } from "lucide-react";

import type { AgentReasoning } from "../../types/cortex";
import { Badge } from "../shared/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";
import { ConfidenceScore } from "./ConfidenceScore";
import { StrategyComparison } from "./StrategyComparison";

function riskVariant(risk: AgentReasoning["risk"]) {
  if (risk === "critical" || risk === "high") return "danger";
  if (risk === "medium") return "warn";
  return "success";
}

export function AgentReasoningCard({ item }: { item: AgentReasoning }) {
  return (
    <Card className="reasoning-card">
      <CardHeader className="reasoning-card-head">
        <div>
          <p className="reasoning-card-kicker">{item.agent}</p>
          <CardTitle>{item.workflow_name}</CardTitle>
        </div>
        <div className="reasoning-card-badges">
          <Badge variant={riskVariant(item.risk)}>{item.risk}</Badge>
          {item.fallback_used ? <Badge variant="purple">fallback</Badge> : null}
          {item.prompt_cache_hit ? <Badge variant="success">cache</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="reasoning-card-body">
        <div className="reasoning-card-top">
          <div className="reasoning-list">
            <div className="reasoning-section-title">
              <BrainCircuit className="h-4 w-4" />
              <span>Reasoning</span>
            </div>
            <ul>
              {item.reasoning.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <ConfidenceScore value={item.confidence} />
        </div>

        <StrategyComparison selected={item.selected_strategy} alternatives={item.alternative_strategies} risk={item.risk} />

        <div className="reasoning-meta-grid">
          <div className="reasoning-meta-panel">
            <div className="reasoning-section-title">
              <TriangleAlert className="h-4 w-4" />
              <span>Execution</span>
            </div>
            <p>{item.execution_explanation}</p>
            <small>{item.root_cause ?? "Root cause pending"}</small>
          </div>
          <div className="reasoning-meta-panel">
            <div className="reasoning-section-title">
              <History className="h-4 w-4" />
              <span>Memory</span>
            </div>
            <div className="reasoning-memory-list">
              {item.historical_memory.length ? (
                item.historical_memory.map((memory) => (
                  <div key={memory.incident_id} className="memory-line">
                    <strong>{memory.selected_strategy ?? "unknown_strategy"}</strong>
                    <span>{memory.signal}</span>
                    <small>{memory.recovery_duration_ms}ms</small>
                  </div>
                ))
              ) : (
                <p>No closely matching incidents yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="reasoning-metrics-panel">
          <div className="reasoning-section-title">
            <Shield className="h-4 w-4" />
            <span>Runtime summary</span>
          </div>
          <div className="reasoning-metric-chips">
            {item.metrics_summary.summary_lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
