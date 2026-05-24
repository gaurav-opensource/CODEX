from fastapi import APIRouter

from app.api.v1.routes import analytics, health, hydradb, incidents, reasoning, recovery, runtime, timeline, workflows, ws

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(recovery.router, prefix="/recovery", tags=["recovery"])
api_router.include_router(timeline.router, prefix="/recovery", tags=["recovery"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(runtime.router, prefix="/runtime", tags=["runtime"])
api_router.include_router(hydradb.router, prefix="/hydradb", tags=["hydradb"])
api_router.include_router(reasoning.router, prefix="/reasoning", tags=["reasoning"])
api_router.include_router(ws.router, tags=["websocket"])
