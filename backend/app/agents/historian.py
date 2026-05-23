from app.agents.base import AgentContext, CortexAgent


class HistorianAgent(CortexAgent):
    name = "historian"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["memory_written"] = True
        context.timeline.append("Historian recorded the incident fingerprint")
        return context
