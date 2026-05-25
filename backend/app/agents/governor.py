from app.agents.base import AgentContext, CortexAgent


class GovernorAgent(CortexAgent):
    name = "governor"
    role = "Policy"
    activity = "APPROVING"

    async def run(self, context: AgentContext) -> AgentContext:
        approved = bool(context.facts.get("detected"))
        context.facts["approved"] = approved
        context.facts["policy"] = "llm_suggests_governor_validates_executor_acts"
        context.timeline.append(
            "Governor validated detection signal and opened controlled recovery lane"
            if approved
            else "Governor blocked autonomous recovery due to missing detection signal"
        )
        return context
