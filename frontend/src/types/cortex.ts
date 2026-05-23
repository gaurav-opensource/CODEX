export type WorkflowStatus = "healthy" | "degraded" | "recovering" | "failed";

export interface Workflow {
  id: string;
  name: string;
  status: WorkflowStatus;
  owner: string;
  success_rate: number;
  avg_latency_ms: number;
  updated_at: string;
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
}

export interface RollbackInfo {
  attempted: boolean;
  restored: boolean;
  checkpoint_reason: string | null;
  message: string | null;
}

export interface RecoveryResult {
  incident: {
    id: string;
    workflow_id: string;
    title: string;
    severity: string;
    status: WorkflowStatus;
    root_cause: string | null;
    recovery_action: string | null;
    elapsed_ms: number;
    created_at: string;
  };
  timeline: string[];
  recovered: boolean;
  rollback: RollbackInfo | null;
}

