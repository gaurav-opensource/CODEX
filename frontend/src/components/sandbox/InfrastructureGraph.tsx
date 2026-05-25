import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const STATUS_COLOR: Record<string, string> = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  failed: "bg-red-500",
};

const InfrastructureGraph = () => {
  const { topology } = useRecoverySandboxStream();
  const nodes = topology?.nodes ?? [
    { id: "gateway", label: "API Gateway", status: "healthy" },
    { id: "orchestrator", label: "Workflow Orchestrator", status: "healthy" },
    { id: "worker", label: "Agent Worker Pool", status: "healthy" },
    { id: "memory", label: "HydraDB Memory", status: "healthy" },
    { id: "metrics", label: "Metrics Pipeline", status: "healthy" },
  ];

  return (
    <div className="w-full h-72 bg-gray-950 rounded border border-gray-800 p-4">
      <div className="grid grid-cols-2 gap-3 h-full">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`flex items-center gap-2 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm transition-colors duration-300 ${
              node.status === "failed" ? "topology-node-critical" : node.status === "degraded" ? "topology-node-degraded" : ""
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[node.status] ?? "bg-gray-500"} ${node.status === "failed" ? "animate-pulse" : ""}`} />
            <span className="text-gray-200">{node.label}</span>
            <span className="ml-auto text-xs uppercase text-gray-500">{node.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfrastructureGraph;
