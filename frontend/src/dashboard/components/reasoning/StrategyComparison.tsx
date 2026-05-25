import { ArrowRightLeft, ShieldCheck } from "lucide-react";

import { Badge } from "../shared/badge";

export function StrategyComparison({
  selected,
  alternatives,
  risk
}: {
  selected: string;
  alternatives: string[];
  risk: "low" | "medium" | "high" | "critical";
}) {
  return (
    <div className="strategy-grid">
      <div className="strategy-primary">
        <div className="strategy-head">
          <ShieldCheck className="h-4 w-4" />
          <span>Selected</span>
        </div>
        <strong>{selected}</strong>
        <Badge variant={risk === "critical" || risk === "high" ? "danger" : risk === "medium" ? "warn" : "success"}>
          {risk} risk
        </Badge>
      </div>
      <div className="strategy-alt">
        <div className="strategy-head">
          <ArrowRightLeft className="h-4 w-4" />
          <span>Alternatives</span>
        </div>
        <div className="strategy-tags">
          {alternatives.length ? alternatives.map((item) => <span key={item}>{item}</span>) : <span>none</span>}
        </div>
      </div>
    </div>
  );
}
