"""
FastAPI Application Entry Point & Lifespan Orchestrator.
File: deadlock-predictor/backend/app/main.py
"""

from contextlib import asynccontextmanager
import logging
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.api_router import api_router
from app.client.deadlock_client import DeadlockClient, DeadlockAPIError
from app.core.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("deadlock_backend")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Modern lifespan context manager managing application startup & shutdown.
    Initializes shared DeadlockClient connection pool and ensures graceful cleanup.
    """
    logger.info("Initializing DeadlockClient connection pool (offline_mode=%s)...", settings.OFFLINE_MODE)
    client = DeadlockClient(
        base_url=settings.DEADLOCK_API_BASE_URL,
        api_key=settings.DEADLOCK_API_KEY,
        offline_mode=settings.OFFLINE_MODE,
        timeout=settings.REQUEST_TIMEOUT,
        max_retries=settings.MAX_RETRIES,
        rate_limit_delay=settings.RATE_LIMIT_DELAY,
        max_cache_size=settings.MAX_CACHE_SIZE,
    )
    app.state.client = client

    yield

    logger.info("Closing DeadlockClient connection pool...")
    await client.close()
    logger.info("Shutdown complete.")


def create_application() -> FastAPI:
    """Factory function creating the configured FastAPI application instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Deadlock Telemetry, Tilt Dynamics & Churn Prediction Backend API",
        lifespan=lifespan,
    )

    # Configure CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handler for DeadlockAPIError
    @app.exception_handler(DeadlockAPIError)
    async def deadlock_api_error_handler(request: Request, exc: DeadlockAPIError) -> JSONResponse:
        logger.error("DeadlockAPIError on %s: status=%d, msg=%s", request.url.path, exc.status_code, exc.message)
        headers = {}
        if exc.retry_after:
            headers["Retry-After"] = str(exc.retry_after)
        return JSONResponse(
            status_code=exc.status_code if exc.status_code in (400, 404, 422, 429, 503, 504) else 500,
            content={"detail": exc.message, "status_code": exc.status_code},
            headers=headers,
        )

    # Root probe endpoints
    @app.get("/")
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs_url": "/docs",
            "api_prefix": settings.API_V1_STR,
        }

    @app.get("/health")
    async def root_health():
        return {"status": "healthy", "service": settings.PROJECT_NAME}

    # Mount unified API router under /api
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
