from app.context.memory_retriever import memory_retriever
from app.context.metrics_summarizer import metrics_summarizer
from app.context.root_cause_extractor import root_cause_extractor
from app.schemas.reasoning import CompactRuntimeState, HistoricalStrategy
from app.schemas.workflow import Workflow


class ContextBuilder:
    async def build(
        self,
        *,
        workflow: Workflow,
        agent: str,
        signal: str,
        severity: str,
        facts: dict[str, object],
    ) -> tuple[CompactRuntimeState, list[HistoricalStrategy]]:
        latency_ms = int(facts.get("latency_ms", workflow.avg_latency_ms))
        retries = int(facts.get("retries", workflow.retries))
        metrics = metrics_summarizer.summarize(
            latency_ms=latency_ms,
            baseline_latency_ms=workflow.avg_latency_ms,
            retries=retries,
            severity=severity,
        )
        root_cause = root_cause_extractor.extract(signal, facts)
        history = await memory_retriever.top_incidents(
            workflow_id=workflow.id,
            workflow_name=workflow.name,
            signal=signal,
            root_cause=root_cause,
        )
        compact_facts = {
            "approved": facts.get("approved"),
            "verified": facts.get("verified"),
            "strategy": facts.get("strategy"),
            "rollback_required": facts.get("rollback_required"),
            "latency_after_ms": facts.get("latency_after_ms"),
            "policy": facts.get("policy"),
        }
        state = CompactRuntimeState(
            workflow_id=workflow.id,
            workflow_name=workflow.name,
            signal=signal,
            severity=severity,
            agent=agent,
            root_cause=root_cause,
            impact=str(facts.get("impact")) if facts.get("impact") else None,
            active_strategy=str(facts.get("strategy")) if facts.get("strategy") else None,
            metrics=metrics,
            facts={key: value for key, value in compact_facts.items() if value is not None},
        )
        return state, history


context_builder = ContextBuilder()
