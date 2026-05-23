from app.agents.base import AgentContext, CortexAgent


class StrategistAgent(CortexAgent):
    name = "strategist"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["strategy"] = "Shift traffic to warm standby and reduce retry fan-out"
        context.timeline.append("Strategist selected the lowest-risk recovery plan")
        return context
