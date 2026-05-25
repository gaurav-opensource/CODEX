import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

const variants: Record<string, string> = {
  default: "bg-cyan-500/15 text-cyan-200 border-cyan-400/30",
  success: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  warn: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  danger: "bg-rose-500/15 text-rose-200 border-rose-400/30",
  purple: "bg-violet-500/15 text-violet-200 border-violet-400/30"
};

export function Badge({
  children,
  variant = "default",
  className
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span className={cn("dash-badge", variants[variant], className)}>
      {children}
    </span>
  );
}
