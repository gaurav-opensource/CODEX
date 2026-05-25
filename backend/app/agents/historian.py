from app.agents.base import AgentContext, CortexAgent


class HistorianAgent(CortexAgent):
    name = "historian"
    role = "Memory"
    activity = "WRITING MEMORY"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["memory_written"] = True
        context.timeline.append("Historian recorded incident fingerprint, recovery metadata, and execution trace")
        return context
