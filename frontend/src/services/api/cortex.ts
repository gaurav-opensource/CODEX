import { requestJson } from "@/services/http/client";
import type {
  AgentRuntime,
  AnalyticsSnapshot,
  HydraDBMemoryBundle,
  HydraDBStatus,
  Incident,
  MetricSnapshot,
  OperationalStatus,
  ReasoningHistoryItem,
  ReasoningSnapshot,
  RecoveryEvent,
  RecoveryResult,
  Workflow,
  WorkflowStatus
} from "@/types/cortex";

export const cortexApi = {
  workflows: () => requestJson<Workflow[]>("/workflows"),
  workflow: (workflowId: string) => requestJson<Workflow>(`/workflows/${workflowId}`),
  metrics: () => requestJson<MetricSnapshot>("/workflows/metrics"),
  failWorkflow: (workflowId: string, autoRecover = true) =>
    requestJson<Workflow>(`/workflows/${workflowId}/fail?auto_recover=${autoRecover}`, { method: "POST" }),
  recoverWorkflow: (workflowId: string) => requestJson<RecoveryResult>(`/workflows/${workflowId}/recover`, { method: "POST" }),
  recover: (workflowId: string, workflowStatus?: WorkflowStatus) =>
    requestJson<RecoveryResult>("/recovery", {
      method: "POST",
      body: JSON.stringify({
        workflow_id: workflowId,
        signal: "latency_spike",
        severity: workflowStatus === "degraded" || workflowStatus === "failed" ? "high" : "medium"
      })
    }),
  injectFailure: (payload: {
    workflow_id: string;
    failure_type: string;
    injected_by?: string;
    auto_recover: boolean;
  }) =>
    requestJson<{ status: string; workflow_id: string; signal: string; auto_recover: boolean }>("/testing/inject-failure", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  incidents: () => requestJson<Incident[]>("/incidents"),
  incident: (incidentId: string) => requestJson<Incident>(`/incidents/${incidentId}`),
  analytics: () => requestJson<AnalyticsSnapshot>("/analytics"),
  runtimeAgents: () => requestJson<AgentRuntime[]>("/runtime/agents"),
  operationalStatus: () => requestJson<OperationalStatus>("/runtime/operational"),
  hydradbStatus: () => requestJson<HydraDBStatus>("/hydradb/status"),
  hydradbMemory: (workflowId: string) => requestJson<HydraDBMemoryBundle>(`/hydradb/workflows/${workflowId}/memory`),
  recoveryTimeline: () => requestJson<RecoveryEvent[]>("/recovery/timeline"),
  reasoningSnapshot: (workflowId: string) => requestJson<ReasoningSnapshot | null>(`/reasoning/workflows/${workflowId}`),
  reasoningHistory: (workflowId: string) => requestJson<ReasoningHistoryItem[]>(`/reasoning/workflows/${workflowId}/history`)
};
