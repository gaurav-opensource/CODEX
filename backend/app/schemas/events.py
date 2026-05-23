from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class CortexEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    type: str
    message: str
    payload: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)

