from __future__ import annotations

import asyncio
import json
import os
from typing import Any

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.reasoning import AgentReasoning, RiskLevel

logger = get_logger(__name__)


class GrokService:
    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    @property
    def enabled(self) -> bool:
        return bool(settings.grok_api_key or os.getenv("XAI_API_KEY"))

    async def start(self) -> None:
        if not self.enabled:
            return
        if self._client is not None:
            return
        self._client = httpx.AsyncClient(
            base_url=settings.grok_base_url.rstrip("/"),
            timeout=httpx.Timeout(settings.grok_timeout_seconds),
            headers={
                "Authorization": f"Bearer {settings.grok_api_key or os.getenv('XAI_API_KEY', '')}",
                "Content-Type": "application/json",
            },
        )

    async def stop(self) -> None:
        if self._client is None:
            return
        await self._client.aclose()
        self._client = None

    async def reason(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        schema_name: str,
    ) -> AgentReasoning:
        if not self.enabled:
            raise RuntimeError("Grok API key is not configured")
        if self._client is None:
            await self.start()
        assert self._client is not None

        payload = {
            "model": settings.grok_model,
            "messages": [
                {"role": "system", "content": self._structured_system_prompt(system_prompt, schema_name)},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0,
            "max_tokens": 220,
            "response_format": {"type": "json_object"},
        }

        last_error: Exception | None = None
        for attempt in range(settings.grok_max_retries + 1):
            try:
                response = await self._client.post("/chat/completions", json=payload)
                response.raise_for_status()
                body = response.json()
                content = body["choices"][0]["message"]["content"]
                return AgentReasoning.model_validate(json.loads(content))
            except (httpx.HTTPError, KeyError, json.JSONDecodeError, ValidationError) as exc:
                last_error = exc
                logger.warning("grok_reasoning_failed attempt=%s error=%s", attempt + 1, exc)
                if attempt >= settings.grok_max_retries:
                    break
                await asyncio.sleep(0.35 * (attempt + 1))
        raise RuntimeError(f"Grok reasoning request failed: {last_error}")

    def _response_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "incident_id",
                "workflow_id",
                "workflow_name",
                "agent",
                "reasoning",
                "selected_strategy",
                "alternative_strategies",
                "confidence",
                "risk",
                "execution_explanation",
                "historical_memory",
                "metrics_summary",
                "root_cause",
                "prompt_cache_hit",
                "fallback_used",
                "approved",
            ],
            "properties": {
                "incident_id": {"type": "string", "format": "uuid"},
                "workflow_id": {"type": "string", "format": "uuid"},
                "workflow_name": {"type": "string", "maxLength": 80},
                "agent": {"type": "string", "maxLength": 40},
                "reasoning": {"type": "array", "items": {"type": "string", "maxLength": 120}, "maxItems": 4},
                "selected_strategy": {"type": "string", "maxLength": 64},
                "alternative_strategies": {"type": "array", "items": {"type": "string", "maxLength": 64}, "maxItems": 3},
                "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
                "risk": {"type": "string", "enum": [risk.value for risk in RiskLevel]},
                "execution_explanation": {"type": "string", "maxLength": 160},
                "historical_memory": {
                    "type": "array",
                    "maxItems": 3,
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": [
                            "incident_id",
                            "workflow_id",
                            "workflow_name",
                            "signal",
                            "root_cause",
                            "selected_strategy",
                            "confidence",
                            "success",
                            "recovery_duration_ms",
                            "score",
                            "reasoning_summary",
                            "created_at",
                        ],
                        "properties": {
                            "incident_id": {"type": "string", "format": "uuid"},
                            "workflow_id": {"type": "string", "format": "uuid"},
                            "workflow_name": {"type": "string"},
                            "signal": {"type": "string"},
                            "root_cause": {"type": ["string", "null"]},
                            "selected_strategy": {"type": ["string", "null"]},
                            "confidence": {"type": ["integer", "null"]},
                            "success": {"type": "boolean"},
                            "recovery_duration_ms": {"type": "integer"},
                            "score": {"type": "number"},
                            "reasoning_summary": {"type": "array", "items": {"type": "string"}},
                            "created_at": {"type": "string", "format": "date-time"},
                        },
                    },
                },
                "metrics_summary": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": [
                        "latency_ms",
                        "baseline_latency_ms",
                        "error_rate_pct",
                        "retry_budget_used_pct",
                        "saturation_pct",
                        "traffic_shift_pct",
                        "summary_lines",
                    ],
                    "properties": {
                        "latency_ms": {"type": "integer"},
                        "baseline_latency_ms": {"type": "integer"},
                        "error_rate_pct": {"type": "number"},
                        "retry_budget_used_pct": {"type": "number"},
                        "saturation_pct": {"type": "number"},
                        "traffic_shift_pct": {"type": "number"},
                        "summary_lines": {"type": "array", "items": {"type": "string"}, "maxItems": 4},
                    },
                },
                "root_cause": {"type": ["string", "null"]},
                "prompt_cache_hit": {"type": "boolean"},
                "fallback_used": {"type": "boolean"},
                "approved": {"type": ["boolean", "null"]},
            },
        }

    def _structured_system_prompt(self, system_prompt: str, schema_name: str) -> str:
        return (
            f"{system_prompt} "
            f"Schema:{schema_name}. "
            "Return one JSON object with keys "
            "incident_id,workflow_id,workflow_name,agent,reasoning,selected_strategy,"
            "alternative_strategies,confidence,risk,execution_explanation,historical_memory,"
            "metrics_summary,root_cause,prompt_cache_hit,fallback_used,approved. "
            "Use ISO timestamps and UUID strings. historical_memory is an array. metrics_summary is an object."
        )


grok_service = GrokService()
