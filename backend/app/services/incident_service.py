from uuid import UUID

from app.core.exceptions import CortexError
from app.memory import hydradb_memory
from app.core.events import CortexEvent, EventChannel
from app.schemas.workflow import Incident, IncidentStatus, Severity, utcnow
from app.services.event_bus import event_bus
from app.services.operational_text import incident_title


class IncidentService:
    async def create(self, incident: Incident) -> Incident:
        await hydradb_memory.store_incident(incident)
        await event_bus.publish(
            CortexEvent(
                type="incident.created",
                message=incident.title,
                channel=EventChannel.RECOVERY,
                payload={
                    "incidentId": str(incident.id),
                    "workflowId": str(incident.workflow_id),
                    "severity": incident.severity.value,
                    "status": incident.status.value,
                },
            )
        )
        return incident

    async def list(self) -> list[Incident]:
        return await hydradb_memory.list_incidents()

    async def get(self, incident_id: UUID) -> Incident:
        incident = await hydradb_memory.get_incident(incident_id)
        if incident is None:
            raise CortexError("Incident not found", status_code=404)
        return incident

    async def update_status(self, incident: Incident, status: IncidentStatus) -> Incident:
        updated = incident.model_copy(update={"status": status, "resolved_at": utcnow() if status == IncidentStatus.RESOLVED else incident.resolved_at})
        await hydradb_memory.store_incident(updated)
        await event_bus.publish(
            CortexEvent(
                type="incident.updated",
                message=f"{updated.title} is {status.value}",
                channel=EventChannel.RECOVERY,
                payload={"incidentId": str(updated.id), "status": status.value},
            )
        )
        return updated

    async def update(self, incident: Incident, **changes) -> Incident:
        if "resolved_at" not in changes and changes.get("status") == IncidentStatus.RESOLVED:
            changes["resolved_at"] = utcnow()
        updated = incident.model_copy(update=changes)
        await hydradb_memory.store_incident(updated)
        await event_bus.publish(
            CortexEvent(
                type="incident.updated",
                message=updated.title,
                channel=EventChannel.RECOVERY,
                payload={"incidentId": str(updated.id), "workflowId": str(updated.workflow_id), "status": updated.status.value},
            )
        )
        return updated

    async def open_for_workflow(self, workflow_id: UUID, workflow_name: str, signal: str, severity: Severity) -> Incident:
        title = incident_title(workflow_name=workflow_name, signal=signal, severity=severity.value)
        return await self.create(
            Incident(
                workflow_id=workflow_id,
                title=title,
                severity=severity,
                status=IncidentStatus.OPEN,
            )
        )


incident_service = IncidentService()
