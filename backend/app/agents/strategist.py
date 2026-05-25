from app.agents.base import AgentContext, CortexAgent


class StrategistAgent(CortexAgent):
    name = "strategist"
    role = "Planning"
    activity = "PLANNING"

    async def run(self, context: AgentContext) -> AgentContext:
        similar = int(context.facts.get("similar_incidents", 0))
        strategy = "rollback_checkpoint" if context.severity in {"high", "critical"} or similar else "restart_service"
        context.facts["strategy"] = strategy
        context.facts["rollback_required"] = strategy == "rollback_checkpoint"
        context.facts["candidate_alternatives"] = ["shift_traffic", "rollback_checkpoint", "restart_service"]
        context.timeline.append(f"Strategist selected {strategy} using {similar} memory matches")
        return context
