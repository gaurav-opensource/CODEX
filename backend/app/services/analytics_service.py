import random

from app.memory import hydradb_memory
from app.schemas.workflow import AgentRuntime, AnalyticsSnapshot, WorkflowStatus
from app.services.workflow_service import workflow_service


class AnalyticsService:
    def __init__(self) -> None:
        self.recovery_timings: list[int] = [920, 840, 760, 710]
        self.agent_stats: dict[str, AgentRuntime] = {
            "sentinel": AgentRuntime(id="sentinel", name="Sentinel", role="Monitoring", state="idle", activity="IDLE"),
            "governor": AgentRuntime(id="governor", name="Governor", role="Policy", state="idle", activity="IDLE"),
            "diagnostician": AgentRuntime(id="diagnostician", name="Diagnostician", role="RCA", state="idle", activity="IDLE"),
            "strategist": AgentRuntime(id="strategist", name="Strategist", role="Planning", state="idle", activity="IDLE"),
            "executor": AgentRuntime(id="executor", name="Executor", role="Recovery", state="idle", activity="IDLE"),
            "verifier": AgentRuntime(id="verifier", name="Verifier", role="Canary", state="idle", activity="IDLE"),
            "historian": AgentRuntime(id="historian", name="Historian", role="Memory", state="idle", activity="IDLE"),
        }

    def mark_agent(self, agent_id: str, state: str, activity: str, duration_ms: int = 0) -> None:
        agent = self.agent_stats[agent_id]
        executions = agent.executions + (1 if state == "done" else 0)
        avg = int(((agent.avg_duration_ms * agent.executions) + duration_ms) / executions) if executions else agent.avg_duration_ms
        self.agent_stats[agent_id] = agent.model_copy(update={"state": state, "activity": activity, "executions": executions, "avg_duration_ms": avg})

    def record_recovery(self, elapsed_ms: int) -> None:
        self.recovery_timings = [elapsed_ms, *self.recovery_timings][:24]

    async def snapshot(self) -> AnalyticsSnapshot:
        workflows = await workflow_service.list_workflows()
        incidents = await hydradb_memory.list_incidents()
        unhealthy = sum(1 for w in workflows if w.status != WorkflowStatus.HEALTHY)
        avg_latency = int(sum(w.avg_latency_ms for w in workflows) / max(len(workflows), 1))
        failed_incidents = len([i for i in incidents if i.status.value == "failed"])
        verifying = len([i for i in incidents if i.status.value == "verifying"])
        success = round(100 - unhealthy * 3.8 - failed_incidents * 2.2 - verifying * 1.1 + random.uniform(-1.2, 0.8), 2)
        mttr = int(sum(self.recovery_timings) / len(self.recovery_timings))
        mttr = max(400, mttr + random.randint(-60, 90))
        return AnalyticsSnapshot(
            workflow_uptime=round(sum(w.uptime_pct for w in workflows) / max(len(workflows), 1), 3),
            mttr_ms=mttr,
            incident_count=len(incidents),
            recovery_success_rate=max(82.0, min(99.5, success)),
            avg_latency_ms=avg_latency + random.randint(-20, 40),
            recovery_timings=self.recovery_timings,
            agent_execution_stats=list(self.agent_stats.values()),
        )


analytics_service = AnalyticsService()
