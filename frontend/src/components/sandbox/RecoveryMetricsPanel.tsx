import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const RecoveryMetricsPanel = () => {
  const { metrics } = useRecoverySandboxStream();
  return (
    <div className="w-full h-24 bg-gray-950 rounded p-2 text-gray-300 text-xs">
      <div>Latency: {metrics?.latency ?? "-"} ms</div>
      <div>
        Error Rate: {metrics?.error_rate != null ? `${(metrics.error_rate * 100).toFixed(1)}%` : "-"}
      </div>
      <div>Saturation: {metrics?.saturation ?? "-"}</div>
    </div>
  );
};

export default RecoveryMetricsPanel;
