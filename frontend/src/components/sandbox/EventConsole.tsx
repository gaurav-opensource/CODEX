import { useEffect, useRef } from "react";

import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const EventConsole = () => {
  const { events } = useRecoverySandboxStream();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [events]);

  return (
    <div ref={ref} className="w-full h-32 bg-black rounded p-2 font-mono text-gray-300 overflow-y-auto text-xs">
      {events.length === 0 && <span className="text-gray-500">[Waiting for Events]</span>}
      {events.slice(-30).map((e, i) => (
        <div key={i}>
          <span className="text-gray-500">[{e.type || e.agent || "event"}]</span>{" "}
          {e.message ?? e.reasoning ?? JSON.stringify(e)}
        </div>
      ))}
    </div>
  );
};

export default EventConsole;
