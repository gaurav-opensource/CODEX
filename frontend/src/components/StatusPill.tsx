import type { WorkflowStatus } from "../types/cortex";

const labels: Record<WorkflowStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  recovering: "Recovering",
  failed: "Failed"
};

export function StatusPill({ status }: { status: WorkflowStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>;
}

