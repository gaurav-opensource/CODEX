from datetime import datetime, timezone
from enum import StrEnum
from typing import Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, conint


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class RiskLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AgentReasoningEvent(BaseModel):
    type: str = "reasoning.update"
    agent: str
    reasoning: str
    confidence: float
    strategy: Optional[str] = None
    risk: Optional[str] = None
    status: Optional[str] = None
    incident_id: str
    workflow_id: Optional[str] = None


class HistoricalStrategy(BaseModel):
    incident_id: UUID
    workflow_id: UUID
    workflow_name: str
    signal: str
    root_cause: str | None = None
    selected_strategy: str | None = None
    confidence: int | None = None
    success: bool
    recovery_duration_ms: int
    score: float
    reasoning_summary: list[str] = Field(default_factory=list)
    created_at: datetime


class RuntimeMetricsSummary(BaseModel):
    latency_ms: int
    baseline_latency_ms: int
    error_rate_pct: float
    retry_budget_used_pct: float
    saturation_pct: float
    traffic_shift_pct: float
    summary_lines: list[str] = Field(default_factory=list)


class CompactRuntimeState(BaseModel):
    workflow_id: UUID
    workflow_name: str
    signal: str
    severity: str
    agent: str
    root_cause: str | None = None
    impact: str | None = None
    active_strategy: str | None = None
    metrics: RuntimeMetricsSummary
    facts: dict[str, Any] = Field(default_factory=dict)


class AgentReasoning(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    incident_id: UUID
    workflow_id: UUID
    workflow_name: str
    agent: str
    reasoning: list[str] = Field(default_factory=list, max_length=6)
    selected_strategy: str
    alternative_strategies: list[str] = Field(default_factory=list, max_length=4)
    confidence: conint(ge=0, le=100)
    risk: RiskLevel
    execution_explanation: str
    historical_memory: list[HistoricalStrategy] = Field(default_factory=list, max_length=3)
    metrics_summary: RuntimeMetricsSummary
    root_cause: str | None = None
    prompt_cache_hit: bool = False
    fallback_used: bool = False
    approved: bool | None = None
    created_at: datetime = Field(default_factory=utcnow)


class ReasoningEnvelope(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid4()))
    sequence: int
    workflow_id: UUID
    incident_id: UUID
    agent: str
    kind: str
    reasoning: AgentReasoning
    created_at: datetime = Field(default_factory=utcnow)


class StrategyDecision(BaseModel):
    selected_strategy: str
    alternatives: list[str] = Field(default_factory=list)
    confidence: int = Field(ge=0, le=100)
    risk: RiskLevel
    approved: bool
    fallback_strategy: str | None = None
    reason: str


class ReasoningSnapshot(BaseModel):
    workflow_id: UUID
    incident_id: UUID
    duration_ms: int
    latest_reasoning: list[AgentReasoning]
    timeline: list[str]
