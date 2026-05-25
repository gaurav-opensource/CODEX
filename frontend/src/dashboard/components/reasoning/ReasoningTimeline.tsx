import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

import type { ReasoningEnvelope } from "../../types/cortex";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/card";

export function ReasoningTimeline({ items }: { items: ReasoningEnvelope[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent reasoning timeline</CardTitle>
      </CardHeader>
      <CardContent className="reasoning-timeline">
        {items.length ? (
          items.map((item, index) => (
            <motion.div
              key={item.event_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="reasoning-timeline-row"
            >
              <div className="reasoning-timeline-icon">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div>
                <strong>{item.agent}</strong>
                <p>{item.reasoning.selected_strategy}</p>
              </div>
              <span>#{item.sequence}</span>
            </motion.div>
          ))
        ) : (
          <p className="page-subtitle">No reasoning events have streamed for this workflow yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
