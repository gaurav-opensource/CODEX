import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { useEventStream } from "../hooks/useEventStream";
import { cortexApi } from "../lib/api";
import type { CortexEvent, RecoveryEvent } from "../types/cortex";

const stageOrder = [
  { key: "recovery.started", title: "Failure", detail: "Failure detected and recovery pipeline initiated." },
  { key: "incident.created", title: "Incident", detail: "Incident created and context captured." },
  { key: "agent.diagnostician.completed", title: "Diagnosis", detail: "Root cause analysis completed." },
  { key: "agent.strategist.completed", title: "Strategy", detail: "Recovery strategy selected." },
  { key: "rollback.restored", title: "Rollback", detail: "Stable checkpoint restored." },
  { key: "recovery.completed", title: "Verification", detail: "Recovery verified and archived." }
];

export function RecoveryTimelinePage() {
  const [timeline, setTimeline] = useState<RecoveryEvent[]>([]);
  const { events } = useEventStream({ maxEvents: 24 });

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const data = await cortexApi.recoveryTimeline();
      if (mounted) setTimeline(data);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 5000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const merged = useMemo(() => {
    const byId = new Map<string, RecoveryEvent>();
    [...timeline, ...events.map((event: CortexEvent) => ({ ...event, channel: event.channel ?? "events" }))].forEach((event) =>
      byId.set(event.id, event as RecoveryEvent)
    );
    return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [events, timeline]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Cinematic pipeline</p>
          <h1>Recovery Timeline</h1>
          <p className="page-subtitle">Failure → detection → isolation → rollback → restoration → verification.</p>
        </div>
      </header>

      <Card className="timeline-cinematic overflow-hidden">
        <CardHeader>
          <CardTitle>Live recovery sequence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="cinematic-timeline">
            <div className="cinematic-line" />
            {stageOrder.map((stage, index) => {
              const seenIndex = merged.findIndex((event) => event.type === stage.key);
              const Icon = seenIndex >= 0 ? CheckCircle2 : index === merged.length ? Loader2 : Circle;
              const status = seenIndex >= 0 ? "complete" : index === merged.length ? "active" : "pending";
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.12 }}
                  className={`cinematic-node ${status}`}
                >
                  <div className="cinematic-node-icon">
                    <Icon className={status === "active" ? "spin h-5 w-5" : "h-5 w-5"} />
                  </div>
                  <div>
                    <strong>{stage.title}</strong>
                    <p>{stage.detail}</p>
                  </div>
                  {index < stageOrder.length - 1 ? <div className="cinematic-connector" /> : null}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
