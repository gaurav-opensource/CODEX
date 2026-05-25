import type { ReasoningEnvelope } from "../../types/cortex";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";

function ts(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function LiveReasoningFeed({ items }: { items: ReasoningEnvelope[] }) {
  return (
    <Card className="terminal-card">
      <CardHeader>
        <CardTitle>Live reasoning feed</CardTitle>
      </CardHeader>
      <CardContent className="terminal-screen reasoning-terminal">
        {items.length ? (
          items.map((item) => (
            <div key={item.event_id} className="terminal-line">
              <span className="terminal-prefix">{ts(item.created_at)}</span>{" "}
              <span className="terminal-agent">{item.agent}</span>{" "}
              <span className="terminal-strategy">{item.reasoning.selected_strategy}</span>{" "}
              <span className="terminal-detail">{item.reasoning.execution_explanation}</span>
            </div>
          ))
        ) : (
          <div className="terminal-line">
            <span className="terminal-prefix">idle</span> Waiting for recovery reasoning stream
          </div>
        )}
        <span className="terminal-cursor" />
      </CardContent>
    </Card>
  );
}
