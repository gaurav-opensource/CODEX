import { RadioTower } from "lucide-react";

import type { CortexEvent } from "../types/cortex";

export function EventFeed({ events }: { events: CortexEvent[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Live Event Stream</h2>
        <RadioTower aria-hidden="true" size={18} />
      </div>
      <div className="event-feed">
        {events.length === 0 ? (
          <p className="empty-state">Waiting for recovery events.</p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="event-row">
              <span>{event.type}</span>
              <p>{event.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

