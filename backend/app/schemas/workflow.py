from datetime import datetime, timezone
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WorkflowStatus(StrEnum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    RECOVERING = "recovering"
    FAILED = "failed"
    QUARANTINED = "quarantined"


class IncidentStatus(StrEnum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RECOVERING = "recovering"
    VERIFYING = "verifying"
    RESOLVED = "resolved"
    FAILED = "failed"


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AgentName(StrEnum):
    SENTINEL = "sentinel"
    DIAGNOSTICIAN = "diagnostician"
    STRATEGIST = "strategist"
    EXECUTOR = "executor"
    VERIFIER = "verifier"
    HISTORIAN = "historian"
    GOVERNOR = "governor"


class Workflow(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    status: WorkflowStatus
    owner: str
    success_rate: float
    avg_latency_ms: int
    retries: int = 0
    uptime_pct: float = 99.9
    updated_at: datetime = Field(default_factory=utcnow)


class Incident(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    workflow_id: UUID
    title: str
    severity: Severity = Severity.MEDIUM
    status: IncidentStatus = IncidentStatus.OPEN
    root_cause: str | None = None
    recovery_action: str | None = None
    elapsed_ms: int = 0
    created_at: datetime = Field(default_factory=utcnow)
    resolved_at: datetime | None = None


class RecoveryRequest(BaseModel):
    workflow_id: UUID
    signal: str = "latency_spike"
    severity: Severity = Severity.MEDIUM
    force_verification_failure: bool = False


class RollbackInfo(BaseModel):
    attempted: bool = False
    restored: bool = False
    checkpoint_reason: str | None = None
    message: str | None = None


class RecoveryResult(BaseModel):
    incident: Incident
    timeline: list[str]
    recovered: bool
    rollback: RollbackInfo | None = None


class MetricSnapshot(BaseModel):
    detection_latency_ms: int
    recovery_time_ms: int
    recovery_success_rate: float
    websocket_latency_ms: int
    api_response_ms: int


class AgentRuntime(BaseModel):
    id: str
    name: str
    role: str
    state: str
    activity: str
    executions: int = 0
    avg_duration_ms: int = 0


class AnalyticsSnapshot(BaseModel):
    workflow_uptime: float
    mttr_ms: int
    incident_count: int
    recovery_success_rate: float
    avg_latency_ms: int
    recovery_timings: list[int]
    agent_execution_stats: list[AgentRuntime]


class HydraDBStatus(BaseModel):
    connected: bool
    project_id: str
    fallback_reason: str | None = None
    memory_counts: dict[str, int]
    latest_checkpoint: str | None = None
