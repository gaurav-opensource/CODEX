from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.memory import hydradb_memory
from app.services.event_bus import event_bus
from app.services.reasoning_service import reasoning_service
from app.services.runtime_service import runtime_service
from app.services.operational_service import operational_service
from app.services.sandbox_bridge import sandbox_bridge
from app.services.workflow_service import workflow_service

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    logger.info("cortex_starting version=%s", settings.app_version)
    await hydradb_memory.start()
    await workflow_service.bootstrap()
    await event_bus.start()
    await reasoning_service.start()
    await runtime_service.start()
    await sandbox_bridge.start()
    await operational_service.start()
    yield
    await operational_service.stop()
    await sandbox_bridge.stop()
    await runtime_service.stop()
    await reasoning_service.stop()
    await event_bus.stop()
    await hydradb_memory.stop()
    logger.info("cortex_stopped")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Self-Healing AI Workflow Brain",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_prefix)

    if settings.enable_testing_routes:
        from app.api.v1 import testing_ws
        from app.testing import inject_service

        app.include_router(inject_service.router)
        app.include_router(testing_ws.router)

    return app


app = create_app()
