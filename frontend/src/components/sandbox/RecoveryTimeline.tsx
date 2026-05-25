import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";
import { TIMELINE_STEPS } from "@/lib/timeline";

const STATUS_STYLES = {
  pending: {
    dot: "border-gray-600 bg-gray-800",
    text: "text-gray-500",
    bar: "bg-gray-700",
  },
  active: {
    dot: "border-blue-400 bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.6)]",
    text: "text-blue-300 font-medium",
    bar: "bg-blue-400",
  },
  completed: {
    dot: "border-emerald-500 bg-emerald-600",
    text: "text-emerald-400",
    bar: "bg-emerald-500",
  },
} as const;

const RecoveryTimeline = () => {
  const { timelineStages } = useRecoverySandboxStream();

  return (
    <div className="flex flex-row items-center gap-2 w-full overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((label, idx) => {
        const status = timelineStages[idx];
        const styles = STATUS_STYLES[status];
        return (
          <div key={label} className="contents">
            <div className={`flex flex-col items-center min-w-[5.5rem] ${styles.text}`}>
              <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${styles.dot}`} />
              <span className="text-xs mt-1 text-center leading-tight">{label}</span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 min-w-[1rem] transition-colors duration-500 ${
                  timelineStages[idx] === "completed" && timelineStages[idx + 1] !== "pending"
                    ? STATUS_STYLES.completed.bar
                    : timelineStages[idx] === "completed"
                      ? STATUS_STYLES.completed.bar
                      : styles.bar
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecoveryTimeline;
