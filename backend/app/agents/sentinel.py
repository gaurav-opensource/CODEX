from app.agents.base import AgentContext, CortexAgent


class SentinelAgent(CortexAgent):
    name = "sentinel"
    role = "Monitoring"
    activity = "DETECTING"

    async def run(self, context: AgentContext) -> AgentContext:
        latency = int(context.facts.get("latency_ms", 0))
        detected = context.signal in {"latency_spike", "error_burst", "health_probe_failed"} or latency > 600
        context.facts["detected"] = detected
        context.facts["failure_signature"] = f"{context.workflow_name}:{context.signal}:{context.severity}"
        context.timeline.append(f"Sentinel detected {context.signal} with latency={latency}ms")
        return context
