from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

from app.memory import hydradb_memory
from app.schemas.reasoning import HistoricalStrategy


class MemoryRetriever:
    def __init__(self) -> None:
        self._cache: dict[str, tuple[datetime, list[HistoricalStrategy]]] = {}
        self._ttl = timedelta(seconds=45)

    async def top_incidents(
        self,
        *,
        workflow_id: UUID,
        workflow_name: str,
        signal: str,
        root_cause: str | None,
    ) -> list[HistoricalStrategy]:
        cache_key = f"{workflow_id}:{signal}:{root_cause or 'na'}"
        cached = self._cache.get(cache_key)
        now = datetime.now(timezone.utc)
        if cached and now - cached[0] <= self._ttl:
            return cached[1]

        incidents = await hydradb_memory.list_incidents()
        reasoning_traces = await hydradb_memory.list_reasoning_traces(workflow_id=None)
        by_incident = {str(item["incident_id"]): item for item in reasoning_traces}
        matches: list[HistoricalStrategy] = []

        for incident in incidents:
            incident_signal = by_incident.get(str(incident.id), {}).get("signal", "unknown")
            trace = by_incident.get(str(incident.id), {})
            score = 0.0
            if str(incident.workflow_id) == str(workflow_id):
                score += 3.0
            if incident_signal == signal:
                score += 2.5
            if root_cause and incident.root_cause and root_cause.lower()[:32] in incident.root_cause.lower():
                score += 2.0
            if incident.status.value == "resolved":
                score += 1.0
            if score <= 0:
                continue
            matches.append(
                HistoricalStrategy(
                    incident_id=incident.id,
                    workflow_id=incident.workflow_id,
                    workflow_name=trace.get("workflow_name", workflow_name),
                    signal=incident_signal,
                    root_cause=incident.root_cause,
                    selected_strategy=trace.get("selected_strategy"),
                    confidence=trace.get("confidence"),
                    success=bool(trace.get("success", incident.status.value == "resolved")),
                    recovery_duration_ms=int(trace.get("recovery_duration_ms", incident.elapsed_ms or 0)),
                    score=round(score, 2),
                    reasoning_summary=list(trace.get("reasoning_summary", []))[:3],
                    created_at=incident.created_at,
                )
            )

        ranked = sorted(matches, key=lambda item: (item.score, item.confidence or 0, item.created_at), reverse=True)[:3]
        self._cache[cache_key] = (now, ranked)
        return ranked


memory_retriever = MemoryRetriever()
