"""
Health, System Status, Assets & ML Metrics Router.
File: app/api/routers/health.py
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Request

from app.core.config import settings
from app.models.schemas import StatusResponse, HeroDescriptor, ModelMetricsResponse
from app.services.mock_service import MockService

router = APIRouter(tags=["Health & Status"])


@router.get("/status", response_model=StatusResponse)
async def get_system_status(request: Request) -> StatusResponse:
    """
    Returns platform health, version, upstream connectivity, and mock mode status.
    Conforms to BACKEND_ENDPOINTS contract in PROJECT.md.
    """
    client = getattr(request.app.state, "client", None)
    upstream_healthy = True
    is_mock = settings.OFFLINE_MODE

    if client:
        try:
            health_data = await client.get_health()
            if isinstance(health_data, dict):
                upstream_healthy = bool(health_data.get("services", {}).get("clickhouse", True))
                if health_data.get("mock_mode"):
                    is_mock = True
        except Exception:
            upstream_healthy = False
            is_mock = True

    return StatusResponse(
        status="ok",
        version=settings.VERSION,
        upstream_healthy=upstream_healthy,
        mock_mode=is_mock,
    )


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Lightweight Kubernetes / load-balancer liveness probe."""
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@router.get("/heroes", response_model=List[HeroDescriptor])
async def get_heroes_catalog(request: Request) -> List[Dict[str, Any]]:
    """
    Returns full Deadlock heroes asset catalog.
    Uses DeadlockClient with caching; falls back to MockService offline.
    """
    client = getattr(request.app.state, "client", None)
    if client:
        try:
            heroes = await client.get_heroes()
            if isinstance(heroes, list) and len(heroes) > 0:
                return heroes
        except Exception:
            pass
    return MockService.get_heroes()


@router.get("/ml/metrics", response_model=ModelMetricsResponse)
async def get_ml_metrics() -> ModelMetricsResponse:
    """
    Returns machine learning model evaluation metrics and feature importances.
    Conforms to BACKEND_ENDPOINTS contract and ML_CONTRACT.md.
    """
    metrics = MockService.get_mock_ml_metrics()
    return ModelMetricsResponse(
        accuracy=metrics["accuracy"],
        auc_score=metrics["auc_score"],
        pr_auc=metrics["pr_auc"],
        recall=metrics.get("recall"),
        precision=metrics.get("precision"),
        f1_score=metrics.get("f1_score"),
        brier_score=metrics.get("brier_score"),
        best_threshold=metrics.get("best_threshold", 0.225),
        dataset_size=metrics.get("dataset_size"),
        test_size=metrics.get("test_size"),
        champion_model=metrics.get("champion_model"),
        feature_importances=metrics["feature_importances"],
    )


@router.get("/ml/visualizations")
async def get_ml_visualizations_endpoint() -> Dict[str, Any]:
    """Returns complete machine learning visualization payload."""
    return MockService.get_ml_visualizations()


@router.get("/ml/hidden-gems")
async def get_hidden_gems_endpoint() -> List[Dict[str, Any]]:
    """Returns the 7 Source 2 Hidden Gems statistical audit."""
    vis = MockService.get_ml_visualizations()
    return vis.get("hidden_gems_audit", [])
