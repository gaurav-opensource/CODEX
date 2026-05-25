import random

from app.agents.base import AgentContext, CortexAgent


class ExecutorAgent(CortexAgent):
    name = "executor"
    role = "Recovery"
    activity = "PATCHING"

    async def run(self, context: AgentContext) -> AgentContext:
        strategy = str(context.facts.get("validated_strategy", context.facts.get("strategy", "restart_service")))
        action = {
            "rollback_checkpoint": "Checkpoint rollback staged from latest stable snapshot",
            "shift_traffic": "Traffic shifted away from degraded slice and pressure reduced",
            "restart_service": "Runtime restart applied and retry budget clamp enforced",
        }.get(strategy, "Runtime restart applied and retry budget clamp enforced")
        context.facts["action"] = action
        base = 180 if strategy == "rollback_checkpoint" else 215 if strategy == "shift_traffic" else 240
        context.facts["latency_after_ms"] = base + random.randint(-25, 120)
        context.timeline.append(f"Executor applied recovery action: {action}")
        return context
