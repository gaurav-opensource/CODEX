PROMPT_CACHE = {}
import json

from app.schemas.reasoning import CompactRuntimeState, HistoricalStrategy


class PromptBuilder:
    def build(self, *, agent: str, state: CompactRuntimeState, history: list[HistoricalStrategy], allowed_strategies: list[str]) -> tuple[str, str]:
        # Prompt caching by workflow and agent
        cache_key = f"{state.workflow_id}-{agent}"
        if cache_key in PROMPT_CACHE:
            return PROMPT_CACHE[cache_key]

        system_prompt = (
            "Return compact JSON only. No prose. "
            "Reason as an enterprise recovery agent. "
            "Keep reasoning <=4 short strings. "
            "Prefer historically successful strategies when fit. "
            "Use only allowed strategies. "
            "Summarize metrics. Top-3 history only."
        )
        history_payload = [
            {
                "signal": item.signal,
                "root_cause": item.root_cause,
                "strategy": item.selected_strategy,
                "success": item.success,
                "confidence": item.confidence,
                "ms": item.recovery_duration_ms,
            }
            for item in history[:3]
        ]
        user_prompt = json.dumps(
            {
                "agent": agent,
                "workflow": state.workflow_name,
                "signal": state.signal,
                "severity": state.severity,
                "root_cause": state.root_cause,
                "active_strategy": state.active_strategy,
                "facts": state.facts,
                "metrics": state.metrics.model_dump(mode="json"),
                "history": history_payload,
                "allowed_strategies": allowed_strategies,
            },
            separators=(',', ':'),
        )
        PROMPT_CACHE[cache_key] = (system_prompt, user_prompt)
        return system_prompt, user_prompt


prompt_builder = PromptBuilder()
