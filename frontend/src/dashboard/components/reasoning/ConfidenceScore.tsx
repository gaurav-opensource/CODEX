import { motion } from "framer-motion";

export function ConfidenceScore({ value }: { value: number }) {
  const tone = value >= 90 ? "high" : value >= 75 ? "mid" : "low";
  return (
    <div className={`confidence-ring ${tone}`}>
      <svg viewBox="0 0 42 42" className="confidence-svg" aria-hidden="true">
        <circle cx="21" cy="21" r="16" className="confidence-track" />
        <motion.circle
          cx="21"
          cy="21"
          r="16"
          className="confidence-progress"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0, Math.min(1, value / 100)) }}
          transition={{ duration: 0.65 }}
        />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}
