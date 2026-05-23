import type { WorkflowStatus } from "../types/cortex";

const labels: Record<WorkflowStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  recovering: "Recovering",
  failed: "Failed"
};

interface StatusPillProps {
  status: WorkflowStatus;
  livePhase?: "recovering" | "rollback" | "restored";
}

export function StatusPill({ status, livePhase }: StatusPillProps) {
  if (livePhase === "rollback") {
    return <span className="status status-rollback">Rollback</span>;
  }
  if (livePhase === "restored") {
    return <span className="status status-restored">Restored</span>;
  }
  return <span className={`status status-${status}${livePhase ? " status-pulse" : ""}`}>{labels[status]}</span>;
}
