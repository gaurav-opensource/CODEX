from __future__ import annotations

import hashlib
import json
import random
import time
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from app.agents.base import AgentContext
from app.context.context_builder import context_builder
from app.context.prompt_builder import prompt_builder
from app.core.config import settings
from app.core.logging import get_logger
from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.schemas.reasoning import AgentReasoning, ReasoningEnvelope, ReasoningSnapshot, RiskLevel, StrategyDecision
from app.schemas.workflow import Workflow
from app.services.event_bus import event_bus
from app.services.grok_service import grok_service

logger = get_logger(__name__)


class ReasoningService:
    def __init__(self) -> None:
        self._sequence: dict[str, int] = {}
        self._cache: dict[str, tuple[datetime, AgentReasoning]] = {}
        self._snapshots: dict[str, dict[str, Any]] = {}
        self._strategy_whitelist: dict[str, list[str]] = {
            "sentinel": ["contain_and_observe", "quarantine_workflow", "raise_incident"],
            "governor": ["approve_recovery", "require_rollback", "hold_for_manual_review"],
            "diagnostician": ["restart_service", "rollback_checkpoint", "shift_traffic"],
            "strategist": ["restart_service", "rollback_checkpoint", "shift_traffic"],
            "executor": ["restart_service", "rollback_checkpoint", "shift_traffic"],
            "verifier": ["verify_canary", "rollback_checkpoint", "escalate_incident"],
            "historian": ["persist_memory", "mark_success_pattern", "mark_failure_pattern"],
        }

    async def start(self) -> None:
        await grok_service.start()

    async def stop(self) -> None:
        await grok_service.stop()

    async def build_reasoning(self, *, workflow: Workflow, agent_name: str, context: AgentContext) -> AgentReasoning:
        state, history = await context_builder.build(
            workflow=workflow,
            agent=agent_name,
            signal=context.signal,
            severity=context.severity,
            facts=context.facts,
        )
        allowed_strategies = self._strategy_whitelist.get(agent_name, ["restart_service"])
        system_prompt, user_prompt = prompt_builder.build(
            agent=agent_name,
            state=state,
            history=history,
            allowed_strategies=allowed_strategies,
        )
        cache_key = hashlib.sha256(f"{system_prompt}|{user_prompt}".encode("utf-8")).hexdigest()
        cached = self._get_cached(cache_key)
        if cached is not None:
            return cached.model_copy(update={"prompt_cache_hit": True})

        try:
            reasoning = await grok_service.reason(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                schema_name=f"{agent_name}_reasoning",
            )
            reasoning = self._sanitize_reasoning(
                reasoning.model_copy(
                    update={
                        "incident_id": context.incident_id,
                        "workflow_id": workflow.id,
                        "workflow_name": workflow.name,
                        "agent": agent_name,
                        "historical_memory": history[:3],
                        "metrics_summary": state.metrics,
                        "root_cause": state.root_cause,
                        "prompt_cache_hit": False,
                        "fallback_used": False,
                    }
                ),
                agent_name=agent_name,
                context=context,
                history=history,
            )
        except Exception as exc:
            logger.warning("reasoning_fallback_used agent=%s error=%s", agent_name, exc)
            reasoning = self._fallback_reasoning(workflow=workflow, agent_name=agent_name, context=context, history=history, state=state)

        self._cache[cache_key] = (datetime.now(timezone.utc), reasoning)
        return reasoning

    async def publish(self, *, workflow: Workflow, context: AgentContext, reasoning: AgentReasoning, kind: str = "reasoning.update") -> None:
        incident_id = context.incident_id
        if incident_id is None:
            return
        key = f"{workflow.id}:{incident_id}"
        sequence = self._sequence.get(key, 0) + 1
        self._sequence[key] = sequence
        envelope = ReasoningEnvelope(
            sequence=sequence,
            workflow_id=workflow.id,
            incident_id=incident_id,
            agent=reasoning.agent,
            kind=kind,
            reasoning=reasoning,
        )
        snapshot = self._snapshots.setdefault(
            str(workflow.id),
            {"incident_id": incident_id, "started_at": time.perf_counter(), "latest_reasoning": [], "timeline": []},
        )
        latest_reasoning: list[AgentReasoning] = snapshot["latest_reasoning"]
        latest_reasoning = [item for item in latest_reasoning if item.agent != reasoning.agent]
        latest_reasoning.append(reasoning)
        snapshot["latest_reasoning"] = latest_reasoning
        snapshot["timeline"] = list(context.timeline)

        await event_bus.publish(
            CortexEvent(
                id=envelope.event_id,
                type=kind,
                message=f"{reasoning.agent} emitted reasoning",
                channel=EventChannel.REASONING,
                payload=envelope.model_dump(mode="json"),
            )
        )

    def decide_strategy(self, context: AgentContext) -> StrategyDecision:
        selected = str(context.facts.get("strategy", "restart_service"))
        alternatives = ["rollback_checkpoint", "shift_traffic"]
        approved = bool(context.facts.get("approved"))
        confidence = max(0, min(100, int(context.facts.get("confidence", 58 + random.randint(0, 24)))))
        fallback_strategy = None
        reason = "Governor approved model suggestion"
        if selected not in self._strategy_whitelist["strategist"]:
            fallback_strategy = "restart_service"
            selected = fallback_strategy
            reason = "Strategy not in whitelist; defaulted to restart_service"
        if confidence < settings.reasoning_confidence_threshold:
            fallback_strategy = "rollback_checkpoint" if context.severity in {"high", "critical"} else "restart_service"
            selected = fallback_strategy
            approved = True
            reason = f"Confidence below threshold {settings.reasoning_confidence_threshold}"
        return StrategyDecision(
            selected_strategy=selected,
            alternatives=[item for item in alternatives if item != selected],
            confidence=confidence,
            risk=RiskLevel.HIGH if context.severity in {"high", "critical"} else RiskLevel.MEDIUM,
            approved=approved,
            fallback_strategy=fallback_strategy,
            reason=reason,
        )

    async def finalize(self, *, workflow: Workflow, context: AgentContext, recovered: bool, elapsed_ms: int) -> None:
        for reasoning in context.reasoning:
            await hydradb_memory.store_reasoning_trace(
                workflow_id=workflow.id,
                incident_id=context.incident_id,
                workflow_name=workflow.name,
                agent_name=reasoning.agent,
                signal=context.signal,
                selected_strategy=reasoning.selected_strategy,
                alternatives=reasoning.alternative_strategies,
                confidence=reasoning.confidence,
                risk=reasoning.risk.value,
                reasoning_summary=reasoning.reasoning[:3],
                execution_explanation=reasoning.execution_explanation,
                success=recovered,
                recovery_duration_ms=elapsed_ms,
                metadata={"approved": reasoning.approved, "fallback_used": reasoning.fallback_used},
            )

    async def snapshot(self, workflow_id: UUID) -> ReasoningSnapshot | None:
        state = self._snapshots.get(str(workflow_id))
        if state is None:
            traces = await hydradb_memory.list_reasoning_traces(workflow_id)
            if not traces:
                return None
            return ReasoningSnapshot(
                workflow_id=workflow_id,
                incident_id=UUID(str(traces[0]["incident_id"])),
                duration_ms=int(traces[0].get("recovery_duration_ms") or 0),
                latest_reasoning=[],
                timeline=[],
            )
        duration_ms = int((time.perf_counter() - state["started_at"]) * 1000)
        return ReasoningSnapshot(
            workflow_id=workflow_id,
            incident_id=state["incident_id"],
            duration_ms=duration_ms,
            latest_reasoning=state["latest_reasoning"],
            timeline=state["timeline"],
        )

    def _get_cached(self, cache_key: str) -> AgentReasoning | None:
        cached = self._cache.get(cache_key)
        if cached is None:
            return None
        created_at, reasoning = cached
        if datetime.now(timezone.utc) - created_at > timedelta(seconds=settings.reasoning_prompt_cache_ttl_seconds):
            self._cache.pop(cache_key, None)
            return None
        return reasoning

    def _sanitize_reasoning(
        self,
        reasoning: AgentReasoning,
        *,
        agent_name: str,
        context: AgentContext,
        history: list[Any],
    ) -> AgentReasoning:
        allowed = self._strategy_whitelist.get(agent_name, ["restart_service"])
        selected = reasoning.selected_strategy if reasoning.selected_strategy in allowed else allowed[0]
        alternatives = [item for item in reasoning.alternative_strategies if item in allowed and item != selected][:2]
        confidence = max(0, min(100, reasoning.confidence))
        if agent_name == "strategist":
            context.facts["confidence"] = confidence
        return reasoning.model_copy(
            update={
                "selected_strategy": selected,
                "alternative_strategies": alternatives,
                "reasoning": reasoning.reasoning[:4],
                "historical_memory": history[:3],
                "approved": bool(context.facts.get("approved")) if agent_name in {"governor", "strategist"} else reasoning.approved,
            }
        )

    def _fallback_reasoning(self, *, workflow: Workflow, agent_name: str, context: AgentContext, history: list[Any], state: Any) -> AgentReasoning:
        strategy = self._fallback_strategy(agent_name=agent_name, context=context, history=history)
        confidence = self._fallback_confidence(context=context, strategy=strategy, history=history)
        risk = RiskLevel.HIGH if context.severity in {"high", "critical"} else RiskLevel.MEDIUM
        lines = [
            f"sig:{context.signal} sev:{context.severity}",
            f"root:{state.root_cause}",
            f"lat:{state.metrics.latency_ms} hist:{len(history)}",
        ]
        if history and history[0].selected_strategy:
            lines.append(f"hist_win:{history[0].selected_strategy}")
        return AgentReasoning(
            incident_id=context.incident_id,
            workflow_id=workflow.id,
            workflow_name=workflow.name,
            agent=agent_name,
            reasoning=lines[:4],
            selected_strategy=strategy,
            alternative_strategies=[item for item in self._strategy_whitelist.get(agent_name, []) if item != strategy][:2],
            confidence=confidence,
            risk=risk,
            execution_explanation=f"{agent_name} selected {strategy} from compressed runtime state",
            historical_memory=history[:3],
            metrics_summary=state.metrics,
            root_cause=state.root_cause,
            prompt_cache_hit=False,
            fallback_used=True,
            approved=bool(context.facts.get("approved")) if agent_name in {"governor", "strategist"} else None,
        )

    def _fallback_strategy(self, *, agent_name: str, context: AgentContext, history: list[Any]) -> str:
        allowed = self._strategy_whitelist.get(agent_name, ["restart_service"])
        successful_history = next((item.selected_strategy for item in history if item.success and item.selected_strategy in allowed), None)
        if successful_history:
            return successful_history
        if agent_name == "strategist":
            return "rollback_checkpoint" if context.severity in {"high", "critical"} else "restart_service"
        if agent_name == "governor":
            return "approve_recovery" if context.facts.get("detected") else "hold_for_manual_review"
        if agent_name == "executor":
            return str(context.facts.get("strategy", "restart_service"))
        return allowed[0]

    def _fallback_confidence(self, *, context: AgentContext, strategy: str, history: list[Any]) -> int:
        base = 68
        if context.severity in {"medium"}:
            base += 6
        if context.severity in {"high", "critical"}:
            base += 10
        if history:
            base += min(18, len(history) * 6)
        if strategy == "rollback_checkpoint":
            base += 4
        return min(97, base)


reasoning_service = ReasoningService()
