import { useEffect, useState } from "react";

import { cortexApi } from "../lib/api";
import { useEventStream } from "./useEventStream";

export type OperationalStatus = {
  runtime_health: string;
  websocket_connected: boolean;
  hydradb_sync: string;
  active_recoveries: number;
  degraded_workflows: number;
  recovering_workflows: number;
  open_incidents: number;
  agents_active: number;
  policy_arbitration_pending: boolean;
};

const DEFAULT_STATUS: OperationalStatus = {
  runtime_health: "strained",
  websocket_connected: false,
  hydradb_sync: "reconciling",
  active_recoveries: 0,
  degraded_workflows: 0,
  recovering_workflows: 0,
  open_incidents: 0,
  agents_active: 0,
  policy_arbitration_pending: false
};

export function useOperationalStatus() {
  const { connected } = useEventStream({ maxEvents: 4, batchWindowMs: 200 });
  const [status, setStatus] = useState<OperationalStatus>(DEFAULT_STATUS);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await cortexApi.operationalStatus();
        if (mounted) setStatus(data);
      } catch {
        if (mounted) setStatus((prev) => ({ ...prev, websocket_connected: connected }));
      }
    };
    void load();
    const interval = window.setInterval(load, 4000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [connected]);

  return { ...status, websocket_connected: connected };
}
