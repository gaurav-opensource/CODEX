import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Card, CardContent } from "./card";

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  delay?: number;
}

export function MetricCard({ label, value, delta, icon: Icon, delay = 0 }: MetricCardProps) {
  const positive = delta.startsWith("+") || delta === "Live" || delta.endsWith("ms");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
    >
      <Card className="metric-card group">
        <CardContent className="metric-card-inner">
          <div className="metric-card-top">
            <span className="metric-label">{label}</span>
            <Icon className="h-4 w-4 text-cyan-300/80" />
          </div>
          <strong className="metric-value">{value}</strong>
          <span className={cn("metric-delta", positive ? "text-emerald-300" : "text-rose-300")}>{delta}</span>
          <div className="metric-glow" />
        </CardContent>
      </Card>
    </motion.div>
  );
}
