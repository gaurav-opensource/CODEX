from app.agents.base import AgentContext, CortexAgent


class DiagnosticianAgent(CortexAgent):
    name = "diagnostician"
    role = "RCA"
    activity = "ANALYZING"

    async def run(self, context: AgentContext) -> AgentContext:
        cause = {
            "latency_spike": "Downstream dependency saturation with retry amplification",
            "error_burst": "Provider error burst crossing circuit breaker threshold",
            "health_probe_failed": "Runtime health probe failed after canary drift",
        }.get(context.signal, "Unknown workflow instability pattern")
        context.facts["root_cause"] = cause
        context.facts["impact"] = "single_workflow" if context.severity != "critical" else "cross_workflow"
        context.timeline.append(f"Diagnostician isolated root cause: {cause}")
        return context
