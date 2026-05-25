import { Activity, Gauge, RefreshCcw, Timer, Wifi } from "lucide-react";
import { memo, useMemo } from "react";

import type { MetricSnapshot } from "../dashboard/types/cortex";

export const MetricsGrid = memo(function MetricsGrid({ metrics }: { metrics: MetricSnapshot | null }) {
  const items = useMemo(
    () => [
      { label: "Detection", value: `${metrics?.detection_latency_ms ?? "--"}ms`, icon: Timer },
      { label: "Recovery", value: `${metrics?.recovery_time_ms ?? "--"}ms`, icon: RefreshCcw },
      { label: "Success", value: `${metrics?.recovery_success_rate ?? "--"}%`, icon: Activity },
      { label: "WebSocket", value: `${metrics?.websocket_latency_ms ?? "--"}ms`, icon: Wifi },
      { label: "API", value: `${metrics?.api_response_ms ?? "--"}ms`, icon: Gauge }
    ],
    [metrics]
  );

  return (
    <section className="metrics-grid" aria-label="CORTEX metrics">
      {items.map((item) => (
        <div className="metric-tile" key={item.label}>
          <item.icon aria-hidden="true" size={20} />
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
});
