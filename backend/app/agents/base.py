from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

from app.schemas.reasoning import AgentReasoning


@dataclass(slots=True)
class AgentContext:
    workflow_id: UUID
    signal: str
    severity: str
    workflow_name: str
    incident_id: UUID | None = None
    facts: dict[str, Any] = field(default_factory=dict)
    timeline: list[str] = field(default_factory=list)
    reasoning: list[AgentReasoning] = field(default_factory=list)


class CortexAgent(ABC):
    name: str
    role: str
    activity: str

    @abstractmethod
    async def run(self, context: AgentContext) -> AgentContext:
        raise NotImplementedError
