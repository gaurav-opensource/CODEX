import { useEffect, useRef } from "react";

import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const AGENT_COLORS: Record<string, string> = {
  Sentinel: "text-cyan-400",
  Diagnostician: "text-yellow-400",
  Strategist: "text-blue-400",
  Governor: "text-purple-400",
  Executor: "text-green-400",
  Verifier: "text-pink-400",
  Historian: "text-orange-400"
};

const LiveReasoningFeed = () => {
  const { latestReasoning } = useRecoverySandboxStream();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [latestReasoning]);

  return (
    <div ref={feedRef} className="h-40 w-full overflow-y-auto rounded bg-black p-2 font-mono text-xs">
      {latestReasoning.length === 0 && <span className="text-gray-500">[Waiting for AI Reasoning Events]</span>}
      {latestReasoning.map((event, index) => (
        <div key={`${event.agent}-${index}`} className={AGENT_COLORS[event.agent ?? ""] || "text-gray-300"}>
          <span className="font-bold">[{event.agent}]</span> {event.reasoning}{" "}
          <span className="text-xs text-gray-500">
            {event.confidence != null ? `conf: ${event.confidence}` : ""}
            {event.strategy ? ` | ${event.strategy}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

export default LiveReasoningFeed;
