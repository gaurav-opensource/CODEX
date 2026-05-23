from app.agents.base import AgentContext, CortexAgent


class DiagnosticianAgent(CortexAgent):
    name = "diagnostician"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["root_cause"] = "Downstream API timeout with retry amplification"
        context.timeline.append("Diagnostician isolated the probable root cause")
        return context
