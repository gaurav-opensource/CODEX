import { RotateCw } from "lucide-react";

import type { Workflow } from "../types/cortex";
import { StatusPill } from "./StatusPill";

interface WorkflowTableProps {
  workflows: Workflow[];
  onRecover: (workflowId: string) => Promise<unknown>;
}

export function WorkflowTable({ workflows, onRecover }: WorkflowTableProps) {
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
            {workflows.map((workflow) => (
              <tr key={workflow.id}>
                <td>
                  <strong>{workflow.name}</strong>
                </td>
                <td>
                  <StatusPill status={workflow.status} />
                </td>
                <td>{workflow.owner}</td>
                <td>{workflow.success_rate.toFixed(2)}%</td>
                <td>{workflow.avg_latency_ms}ms</td>
                <td>
                  <button className="icon-button" onClick={() => void onRecover(workflow.id)} title="Run recovery">
                    <RotateCw aria-hidden="true" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
