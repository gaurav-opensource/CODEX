from app.agents.base import AgentContext, CortexAgent


class ExecutorAgent(CortexAgent):
    name = "executor"

    async def run(self, context: AgentContext) -> AgentContext:
        context.facts["action"] = "Failover complete; retry budget clamped"
        context.timeline.append("Executor applied failover and traffic controls")
        return context
