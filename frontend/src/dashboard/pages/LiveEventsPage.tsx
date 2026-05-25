import { motion } from "framer-motion";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "../components/shared/card";
import { useEventStream } from "../hooks/useEventStream";

export function LiveEventsPage() {
  const { events } = useEventStream({ maxEvents: 32 });
  const lines = useMemo(() => events.slice().reverse(), [events]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="page-kicker">Runtime stream</p>
          <h1>Live Events</h1>
          <p className="page-subtitle">Cyberpunk infrastructure terminal for recovery, rollback, and memory events.</p>
        </div>
      </header>

      <Card className="terminal-card">
        <CardHeader>
          <CardTitle className="font-mono text-cyan-200">cortex@recovery-runtime</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="terminal-screen">
            {lines.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`terminal-line terminal-${event.type.startsWith("rollback") ? "rollback" : event.type.startsWith("incident") ? "memory" : "recovery"}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="text-slate-500">[{new Date(event.created_at).toLocaleTimeString()}]</span>{" "}
                <span className="text-cyan-300">{event.type}</span> - {event.message}
              </motion.div>
            ))}
            <span className="terminal-cursor" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
