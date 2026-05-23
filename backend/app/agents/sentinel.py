from app.agents.base import AgentContext, CortexAgent


class SentinelAgent(CortexAgent):
    name = "sentinel"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["detected"] = True
        context.timeline.append("Sentinel detected anomalous workflow telemetry")
        return context
