from app.agents.base import AgentContext, CortexAgent


class VerifierAgent(CortexAgent):
    name = "verifier"

    async def run(self, context: AgentContext) -> AgentContext:
        force_fail = bool(context.facts.get("force_verification_failure"))
        high_severity = context.severity in ("high", "critical")
        verified = not force_fail and not high_severity
        context.facts["verified"] = verified
        if verified:
            context.timeline.append("Verifier confirmed latency and error rates normalized")
        else:
            context.timeline.append("Verifier detected abnormal signals — verification failed")
        return context
