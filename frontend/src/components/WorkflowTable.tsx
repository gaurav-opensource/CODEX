import { Loader2, RotateCw } from "lucide-react";
import { memo } from "react";

import type { WorkflowRow } from "../dashboard/hooks/useLiveRecovery";
import { StatusPill } from "./StatusPill";

interface WorkflowTableProps {
  workflows: WorkflowRow[];
  recoveringId: string | null;
  onRecover: (workflowId: string) => Promise<unknown>;
}

export const WorkflowTable = memo(function WorkflowTable({ workflows, recoveringId, onRecover }: WorkflowTableProps) {
  return (
    <section className="panel workflow-panel">
      <div className="panel-heading">
        <h2>Workflow Operations</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Success</th>
              <th>Latency</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow) => {
              const isActive = recoveringId === workflow.id || workflow._livePhase;
              const rowClass = [
                isActive ? "row-live" : "",
                workflow._livePhase === "rollback" ? "row-rollback" : "",
                workflow._livePhase === "restored" ? "row-restored" : "",
                workflow._livePhase === "recovering" ? "row-recovering" : ""
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr key={workflow.id} className={rowClass || undefined}>
                  <td>
                    <strong>{workflow.name}</strong>
                  </td>
                  <td>
                    <StatusPill status={workflow.status} livePhase={workflow._livePhase} />
                  </td>
                  <td>{workflow.owner}</td>
                  <td>{workflow.success_rate.toFixed(2)}%</td>
                  <td>{workflow.avg_latency_ms}ms</td>
                  <td>
                    <button
                      className="icon-button"
                      disabled={Boolean(recoveringId)}
                      onClick={() => void onRecover(workflow.id)}
                      title={
                        workflow.status === "degraded" || workflow.status === "failed"
                          ? "Run recovery (live rollback demo)"
                          : "Run recovery"
                      }
                    >
                      {recoveringId === workflow.id ? (
                        <Loader2 aria-hidden="true" size={18} className="spin" />
                      ) : (
                        <RotateCw aria-hidden="true" size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
});
