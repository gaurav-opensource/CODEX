import { useCallback, useEffect, useState } from "react";

import { cortexApi } from "../lib/api";
import type { MetricSnapshot, RecoveryResult, Workflow } from "../types/cortex";

export function useCortexData() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [latestRecovery, setLatestRecovery] = useState<RecoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [workflowData, metricData] = await Promise.all([cortexApi.workflows(), cortexApi.metrics()]);
      setWorkflows(workflowData);
      setMetrics(metricData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load CORTEX data");
    } finally {
      setLoading(false);
    }
  }, []);

  const recover = useCallback(
    async (workflowId: string) => {
      const result = await cortexApi.recover(workflowId);
      setLatestRecovery(result);
      await refresh();
      return result;
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { workflows, metrics, latestRecovery, loading, error, refresh, recover };
}

