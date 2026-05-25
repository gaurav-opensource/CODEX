from app.agents.base import AgentContext, CortexAgent


class VerifierAgent(CortexAgent):
    name = "verifier"
    role = "Canary"
    activity = "VERIFYING"

    async def run(self, context: AgentContext) -> AgentContext:
        force_fail = bool(context.facts.get("force_verification_failure"))
        latency_after = int(context.facts.get("latency_after_ms", 999))
        verified = not force_fail and latency_after < 350 and bool(context.facts.get("approved"))
        context.facts["verified"] = verified
        if verified:
            context.timeline.append(f"Verifier confirmed latency normalized at {latency_after}ms")
        else:
            context.timeline.append("Recovery partially successful. Observed residual instability.")
        return context
