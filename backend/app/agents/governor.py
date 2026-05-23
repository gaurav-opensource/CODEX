from app.agents.base import AgentContext, CortexAgent


class GovernorAgent(CortexAgent):
    name = "governor"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["approved"] = context.severity != "critical" or context.facts.get("verified") is True
        context.timeline.append("Governor checked policy and approval constraints")
        return context
