import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "../components/shared/badge";
import { Card, CardContent } from "../components/shared/card";
import { useEventStream } from "../hooks/useEventStream";
import { cortexApi } from "../lib/api";
import type { Incident } from "../types/cortex";

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const { events } = useEventStream({ maxEvents: 12 });

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const data = await cortexApi.incidents();
      if (!mounted) return;
      setIncidents(data);
      setOpen((current) => current ?? data[0]?.id ?? null);
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 4000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (events.some((event) => event.type.startsWith("incident."))) {
      void cortexApi.incidents().then(setIncidents);
    }
  }, [events]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Failure intelligence</p>
          <h1>Incidents</h1>
          <p className="page-subtitle">Critical failures, quarantined workflows, and AI recovery recommendations.</p>
        </div>
      </header>

      <div className="grid gap-4">
        {incidents.map((incident) => {
          const expanded = open === incident.id;
          return (
            <Card key={incident.id} className={incident.severity === "critical" ? "incident-critical" : ""}>
              <button type="button" className="w-full text-left" onClick={() => setOpen(expanded ? null : incident.id)}>
                <CardContent className="incident-card-head">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={incident.severity === "critical" ? "danger" : incident.severity === "high" ? "warn" : "default"}>{incident.severity}</Badge>
                      <Badge variant={incident.status === "resolved" ? "success" : "default"}>{incident.status}</Badge>
                    </div>
                    <strong className="text-lg">{incident.title}</strong>
                    <p className="text-sm text-slate-400 mt-1">{incident.workflow_id}</p>
                  </div>
                  <ChevronDown className={expanded ? "rotate-180" : ""} />
                </CardContent>
              </button>
              {expanded ? (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-5">
                  <p className="text-sm text-cyan-100/90 border border-cyan-400/20 rounded-lg p-4 bg-cyan-400/5">
                    <span className="font-bold uppercase text-[10px] tracking-widest text-cyan-300">AI recommendation</span>
                    <br />
                    {incident.recovery_action ?? incident.root_cause ?? "Awaiting recovery analysis"}
                  </p>
                </motion.div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
