from datetime import datetime, timezone
from enum import Enum, StrEnum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class FailureType(str, Enum):
    database_timeout = "database_timeout"
    redis_failure = "redis_failure"
    memory_leak = "memory_leak"
    cpu_spike = "cpu_spike"
    api_crash = "api_crash"
    dependency_failure = "dependency_failure"
    network_latency = "network_latency"


class EventChannel(StrEnum):
    EVENTS = "events"
    RUNTIME = "runtime"
    RECOVERY = "recovery"
    REASONING = "reasoning"
    SANDBOX = "sandbox"


class EventType(StrEnum):
    SYSTEM_SHUTDOWN = "system.shutdown"
    RECOVERY_STARTED = "recovery.started"
    RECOVERY_COMPLETED = "recovery.completed"
    RECOVERY_FAILED = "recovery.failed"
    MEMORY_UPDATED = "memory.updated"


class FailureInjectionRequest(BaseModel):
    workflow_id: str
    failure_type: FailureType
    injected_by: str | None = None
    auto_recover: bool = True


class FailureInjectionEvent(BaseModel):
    type: str = "failure_injected"
    failure_type: FailureType
    workflow_id: str
    injected_by: str | None = None
    incident_id: str | None = None
    signal: str
    message: str | None = None


class CortexEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: str
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)
    channel: EventChannel = EventChannel.EVENTS
    created_at: datetime = Field(default_factory=utcnow)
