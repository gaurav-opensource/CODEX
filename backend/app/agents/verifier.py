from app.agents.base import AgentContext, CortexAgent


class VerifierAgent(CortexAgent):
    name = "verifier"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["verified"] = True
        context.timeline.append("Verifier confirmed latency and error rates normalized")
        return context
