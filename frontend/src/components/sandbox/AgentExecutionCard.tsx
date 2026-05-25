import { useRecoverySandboxStream } from "@/hooks/useRecoverySandboxStream";

const AgentExecutionCard = () => {
  const { latestAgent, latestReasoning } = useRecoverySandboxStream();
  const active = latestAgent ?? latestReasoning[latestReasoning.length - 1];

  return (
    <div className="w-full h-32 bg-gray-950 rounded p-2 text-gray-200 overflow-y-auto text-xs">
      {!active && <span className="text-gray-500">[Waiting for agent execution]</span>}
      {active && (
        <div className="space-y-1">
          <div>
            <span className="text-gray-500">Agent:</span> {active.agent}
          </div>
          <div>
            <span className="text-gray-500">Status:</span> {active.status ?? "running"}
          </div>
          {active.strategy && (
            <div>
              <span className="text-gray-500">Strategy:</span> {active.strategy}
            </div>
          )}
          {active.risk && (
            <div>
              <span className="text-gray-500">Risk:</span> {active.risk}
            </div>
          )}
          {active.confidence != null && (
            <div>
              <span className="text-gray-500">Confidence:</span> {active.confidence}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentExecutionCard;
