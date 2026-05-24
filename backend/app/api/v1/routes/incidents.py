from uuid import UUID

from fastapi import APIRouter

from app.schemas.workflow import Incident
from app.services.incident_service import incident_service

router = APIRouter()


@router.get("", response_model=list[Incident])
async def list_incidents() -> list[Incident]:
    return await incident_service.list()


@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: UUID) -> Incident:
    return await incident_service.get(incident_id)
