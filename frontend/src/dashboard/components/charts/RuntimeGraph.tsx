import { motion } from "framer-motion";

export function RuntimeGraph({
  title,
  data,
  color = "#22d3ee"
}: {
  title: string;
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data, 1);

  return (
    <div className="runtime-graph">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{title}</span>
        <span className="font-mono text-xs text-cyan-200">live</span>
      </div>
      <div className="graph-bars">
        {data.map((value, index) => (
          <motion.div
            key={`${title}-${index}`}
            className="graph-bar"
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ delay: index * 0.04, duration: 0.6, ease: "easeOut" }}
            style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
          />
        ))}
      </div>
    </div>
  );
}
