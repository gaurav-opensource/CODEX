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
  const [loading, setLoading] = useState(true);
  const [injecting, setInjecting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cortexApi
      .workflows()
      .then((items) => {
        setWorkflows(items);
        if (items[0]) setWorkflowId(items[0].id);
      })
      .catch(() => setError("Could not load workflows"))
      .finally(() => setLoading(false));
  }, []);

  const handleInject = async () => {
    if (!workflowId) {
      setError("Select a workflow");
      return;
    }
    setInjecting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        workflow_id: workflowId,
        failure_type: failureType,
        injected_by: "sandbox_user",
        auto_recover: autoRecover
      };
      const response = await cortexApi.injectFailure(payload);
      setSuccess(response.auto_recover ? "Failure injected and recovery queued." : "Failure injected.");
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
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-2"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
          disabled={loading || workflows.length === 0}
        >
          {!workflows.length && <option value="">{loading ? "Loading workflows..." : "No workflows available"}</option>}
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
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-2"
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
          className="w-full rounded bg-gray-800 border border-gray-700 px-2 py-2"
          value={autoRecover ? "auto" : "manual"}
          onChange={(e) => setAutoRecover(e.target.value === "auto")}
        >
          <option value="auto">Autonomous recovery</option>
          <option value="manual">Inject only (no auto recovery)</option>
        </select>
      </div>
      {success && <p className="text-sm text-emerald-400">{success}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        onClick={handleInject}
        disabled={injecting || loading || !workflowId}
      >
        {injecting ? "Injecting..." : "Inject Failure"}
      </button>
    </div>
  );
};

export default FailureControlPanel;
