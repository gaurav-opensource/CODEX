from fastapi import APIRouter

from app.api.v1.routes import health, recovery, workflows, ws

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(recovery.router, prefix="/recovery", tags=["recovery"])
api_router.include_router(ws.router, tags=["websocket"])

