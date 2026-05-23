from fastapi import APIRouter

from app.schemas.workflow import RecoveryRequest, RecoveryResult
from app.services.recovery_service import recovery_service

router = APIRouter()


@router.post("", response_model=RecoveryResult)
async def recover(request: RecoveryRequest) -> RecoveryResult:
    return await recovery_service.recover(request)

