from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class WorkflowStatus(StrEnum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    RECOVERING = "recovering"
    FAILED = "failed"


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
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Incident(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    workflow_id: UUID
    title: str
    severity: str = "medium"
    status: WorkflowStatus = WorkflowStatus.RECOVERING
    root_cause: str | None = None
    recovery_action: str | None = None
    elapsed_ms: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RecoveryRequest(BaseModel):
    workflow_id: UUID
    signal: str = "latency_spike"
    severity: str = "medium"


class RecoveryResult(BaseModel):
    incident: Incident
    timeline: list[str]
    recovered: bool


class MetricSnapshot(BaseModel):
    detection_latency_ms: int
    recovery_time_ms: int
    recovery_success_rate: float
    websocket_latency_ms: int
    api_response_ms: int

