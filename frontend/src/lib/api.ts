import type { MetricSnapshot, RecoveryResult, Workflow } from "../types/cortex";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const cortexApi = {
  workflows: () => request<Workflow[]>("/workflows"),
  metrics: () => request<MetricSnapshot>("/workflows/metrics"),
  recover: (workflowId: string) =>
    request<RecoveryResult>("/recovery", {
      method: "POST",
      body: JSON.stringify({ workflow_id: workflowId, signal: "latency_spike", severity: "medium" })
    })
};

