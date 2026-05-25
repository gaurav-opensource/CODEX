import { useEffect, useState } from "react";

import { cortexApi } from "@/services/api";
import type { Workflow } from "@/types/cortex";

const FAILURE_TYPES = [
  { value: "database_timeout", label: "Database Timeout" },
  { value: "redis_failure", label: "Redis Failure" },
  { value: "memory_leak", label: "Memory Leak" },
  { value: "cpu_spike", label: "CPU Spike" },
  { value: "api_crash", label: "API Crash" },
  { value: "dependency_failure", label: "Dependency Failure" },
  { value: "network_latency", label: "Network Latency" },
];

const FailureControlPanel = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowId, setWorkflowId] = useState("");
  const [failureType, setFailureType] = useState(FAILURE_TYPES[0].value);
  const [autoRecover, setAutoRecover] = useState(true);
  const [injecting, setInjecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cortexApi
      .workflows()
      .then((items) => {
        setWorkflows(items);
        if (items[0]) setWorkflowId(items[0].id);
      })
      .catch(() => setError("Could not load workflows"));
  }, []);

  const handleInject = async () => {
    if (!workflowId) {
      setError("Select a workflow");
      return;
    }
    setInjecting(true);
    setError(null);
    try {
      const payload = {
        workflow_id: workflowId,
        failure_type: failureType,
        injected_by: "sandbox_user",
        auto_recover: autoRecover
      };
      await cortexApi.injectFailure(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failure injection failed");
    } finally {
      setInjecting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-sm mb-1">Workflow</label>
        <select
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-1"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
        >
          {workflows.map((wf) => (
            <option key={wf.id} value={wf.id}>
              {wf.name} ({wf.status})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Failure Type</label>
        <select
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-1"
          value={failureType}
          onChange={(e) => setFailureType(e.target.value)}
        >
          {FAILURE_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Recovery</label>
        <select
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-1"
          value={autoRecover ? "auto" : "manual"}
          onChange={(e) => setAutoRecover(e.target.value === "auto")}
        >
          <option value="auto">Autonomous recovery</option>
          <option value="manual">Inject only (no auto recovery)</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        onClick={handleInject}
        disabled={injecting || !workflowId}
      >
        {injecting ? "Injecting..." : "Inject Failure"}
      </button>
    </div>
  );
};

export default FailureControlPanel;
