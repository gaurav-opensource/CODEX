from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class AgentContext:
    signal: str
    severity: str
    workflow_name: str
    facts: dict[str, Any] = field(default_factory=dict)
    timeline: list[str] = field(default_factory=list)


class CortexAgent(ABC):
    name: str

    @abstractmethod
    async def run(self, context: AgentContext) -> AgentContext:
        """Execute one recovery step."""

