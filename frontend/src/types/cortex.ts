export type WorkflowStatus = "healthy" | "degraded" | "recovering" | "failed" | "quarantined";
export type IncidentStatus = "open" | "investigating" | "recovering" | "verifying" | "resolved" | "failed";
export type Severity = "low" | "medium" | "high" | "critical";

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  owner: string;
  success_rate: number;
  avg_latency_ms: number;
  retries: number;
  uptime_pct: number;
  updated_at: string;
}

export interface Incident {
  id: string;
  workflow_id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  root_cause: string | null;
  recovery_action: string | null;
  elapsed_ms: number;
  created_at: string;
  resolved_at: string | null;
}

export interface MetricSnapshot {
  detection_latency_ms: number;
  recovery_time_ms: number;
  recovery_success_rate: number;
  websocket_latency_ms: number;
  api_response_ms: number;
}

export interface CortexEvent {
  id: string;
  type: string;
  message: string;
  payload: Record<string, unknown>;
  created_at: string;
  channel?: string;
}

export interface RollbackInfo {
  attempted: boolean;
  restored: boolean;
  checkpoint_reason: string | null;
  message: string | null;
}

export interface RecoveryResult {
  incident: Incident;
  timeline: string[];
  recovered: boolean;
  rollback: RollbackInfo | null;
}

export interface AgentRuntime {
  id: string;
  name: string;
  role: string;
  state: string;
  activity: string;
  executions: number;
  avg_duration_ms: number;
}

export interface AnalyticsSnapshot {
  workflow_uptime: number;
  mttr_ms: number;
  incident_count: number;
  recovery_success_rate: number;
  avg_latency_ms: number;
  recovery_timings: number[];
  agent_execution_stats: AgentRuntime[];
}

export interface HydraDBStatus {
  connected: boolean;
  project_id: string;
  fallback_reason: string | null;
  memory_counts: Record<string, number>;
  latest_checkpoint: string | null;
}

export interface HydraDBMemoryBundle {
  checkpoints: Array<Record<string, unknown>>;
  snapshots: Array<Record<string, unknown>>;
  rollback_history: Array<Record<string, unknown>>;
  recovery_history: Array<Record<string, unknown>>;
  agent_states: Array<Record<string, unknown>>;
}

export interface RecoveryEvent {
  id: string;
  type: string;
  message: string;
  channel: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RuntimeMetricsSummary {
  latency_ms: number;
  baseline_latency_ms: number;
  error_rate_pct: number;
  retry_budget_used_pct: number;
  saturation_pct: number;
  traffic_shift_pct: number;
  summary_lines: string[];
}

export interface HistoricalStrategy {
  incident_id: string;
  workflow_id: string;
  workflow_name: string;
  signal: string;
  root_cause: string | null;
  selected_strategy: string | null;
  confidence: number | null;
  success: boolean;
  recovery_duration_ms: number;
  score: number;
  reasoning_summary: string[];
  created_at: string;
}

export interface AgentReasoning {
  id: string;
  incident_id: string;
  workflow_id: string;
  workflow_name: string;
  agent: string;
  reasoning: string[];
  selected_strategy: string;
  alternative_strategies: string[];
  confidence: number;
  risk: RiskLevel;
  execution_explanation: string;
  historical_memory: HistoricalStrategy[];
  metrics_summary: RuntimeMetricsSummary;
  root_cause: string | null;
  prompt_cache_hit: boolean;
  fallback_used: boolean;
  approved: boolean | null;
  created_at: string;
}

export interface ReasoningEnvelope {
  event_id: string;
  sequence: number;
  workflow_id: string;
  incident_id: string;
  agent: string;
  kind: string;
  reasoning: AgentReasoning;
  created_at: string;
}

export interface ReasoningSnapshot {
  workflow_id: string;
  incident_id: string;
  duration_ms: number;
  latest_reasoning: AgentReasoning[];
  timeline: string[];
}

export interface ReasoningHistoryItem {
  workflow_id: string;
  incident_id: string;
  workflow_name: string;
  agent_name: string;
  signal: string;
  selected_strategy: string;
  alternatives: string[];
  confidence: number;
  risk: RiskLevel;
  reasoning_summary: string[];
  execution_explanation: string;
  success: boolean | null;
  recovery_duration_ms: number | null;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface OperationalStatus {
  runtime_health: string;
  websocket_connected: boolean;
  hydradb_sync: string;
  active_recoveries: number;
  degraded_workflows: number;
  recovering_workflows: number;
  open_incidents: number;
  agents_active: number;
  policy_arbitration_pending: boolean;
}
