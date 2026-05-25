import { RadioTower } from "lucide-react";
import { memo } from "react";

import { eventCategory, eventLabel, formatTime, memoryMessageForEvent } from "../dashboard/lib/recoveryRuntime";
import type { CortexEvent } from "../dashboard/types/cortex";

interface EventFeedProps {
  events: CortexEvent[];
  connected: boolean;
}

export const EventFeed = memo(function EventFeed({ events, connected }: EventFeedProps) {
  return (
    <section className="panel event-panel">
      <div className="panel-heading">
        <h2>Live Event Stream</h2>
        <div className="panel-heading-meta">
          <span className={`stream-status ${connected ? "online" : "offline"}`}>
            <RadioTower aria-hidden="true" size={16} />
            {connected ? "WS connected" : "WS offline"}
          </span>
        </div>
      </div>
      <div className="event-feed">
        {events.length === 0 ? (
          <p className="empty-state">Waiting for recovery events…</p>
        ) : (
          events.map((event, index) => {
            const category = eventCategory(event.type);
            const memory = memoryMessageForEvent(event);
            const rollbackEvent = event.type.startsWith("rollback.");
            const recoveryEvent = event.type.startsWith("recovery.");
            const agentEvent = event.type.startsWith("agent.");

            return (
              <article
                key={event.id}
                className={`event-row event-incoming event-${category}${rollbackEvent ? " event-rollback" : ""}${recoveryEvent ? " event-recovery" : ""}${agentEvent ? " event-agent" : ""}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="event-row-top">
                  <span className="event-chip">{eventLabel(event.type)}</span>
                  <time>{formatTime(event.created_at)}</time>
                </div>
                <span className="event-type">{event.type}</span>
                <p>{event.message}</p>
                {memory ? <p className="event-memory">{memory}</p> : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
});
