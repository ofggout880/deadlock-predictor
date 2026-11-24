"""
Prediction Inference Router for Deadlock Churn & Tilt Analytics.
File: app/api/routers/prediction.py
"""

import asyncio
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Path, Query, Request

from app.models.schemas import ArchetypeProfile, PredictionRequest, PredictionResponse
from app.services.feature_service import FeatureService
from app.services.mock_service import MockService

router = APIRouter(prefix="/predict", tags=["Prediction & ML Inference"])


def validate_account_id(account_id: int) -> int:
    """Validates that account_id is a positive non-zero integer."""
    if account_id <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid account ID: {account_id}. Must be a positive non-zero integer.",
        )
    return account_id


async def run_prediction_pipeline(
    request: Request,
    account_id: int,
    archetype_id: Optional[str] = None,
) -> PredictionResponse:
    """Internal helper running feature extraction and prediction inference."""
    # Check if this corresponds to a preset archetype simulation
    if archetype_id:
        arch = MockService.get_archetype_by_id(archetype_id)
        if arch:
            return FeatureService.predict_churn(
                account_id=account_id,
                matches=[],
                archetype_override=arch,
                is_mock=True,
            )

    client = getattr(request.app.state, "client", None)
    is_mock = False
    matches: List[Dict[str, Any]] = []
    mate_stats: Optional[List[Dict[str, Any]]] = None
    acute_metadata: Optional[List[Dict[str, Any]]] = None

    if client:
        try:
            raw_matches = await client.get_player_match_history(account_id)
            if isinstance(raw_matches, list) and len(raw_matches) > 0:
                matches = raw_matches
                # Parallel live enrichment: /mate-stats + /matches/metadata (Source 2 Hidden Gems)
                acute_ids = [
                    str(int(m["match_id"]))
                    for m in matches[:2]
                    if m.get("match_id")
                ]
                mate_task = client.request(
                    "GET",
                    f"/v1/players/{account_id}/mate-stats",
                    ttl_seconds=600,
                )
                if acute_ids:
                    meta_task = client.request(
                        "GET",
                        "/v1/matches/metadata",
                        params={
                            "match_ids": ",".join(acute_ids),
                            "include_info": "true",
                            "include_player_info": "true",
                            "include_player_final_stats": "true",
                            "extra_player_columns": "death_details.time_to_kill_s,death_details.death_duration_s,items.sold_time_s",
                            "limit": len(acute_ids),
                        },
                        ttl_seconds=3600,
                    )
                    res_mate, res_meta = await asyncio.gather(mate_task, meta_task, return_exceptions=True)
                    if isinstance(res_mate, list):
                        mate_stats = res_mate
                    if isinstance(res_meta, list):
                        acute_metadata = res_meta
                else:
                    res_mate = await asyncio.gather(mate_task, return_exceptions=True)
                    if res_mate and isinstance(res_mate[0], list):
                        mate_stats = res_mate[0]
            else:
                matches = MockService.generate_player_matches(account_id)
                is_mock = True
        except Exception:
            matches = MockService.generate_player_matches(account_id)
            is_mock = True
    else:
        matches = MockService.generate_player_matches(account_id)
        is_mock = True

    return FeatureService.predict_churn(
        account_id=account_id,
        matches=matches,
        is_mock=is_mock,
        mate_stats=mate_stats,
        acute_metadata=acute_metadata,
    )


@router.post("/{account_id}", response_model=PredictionResponse)
async def predict_churn_post(
    request: Request,
    account_id: int = Path(..., description="Target Steam 32-bit account ID"),
    payload: Optional[PredictionRequest] = None,
    archetype: Optional[str] = Query(None, description="Optional archetype preset ID"),
) -> PredictionResponse:
    """
    Executes ML prediction inference for target player account ID (POST method).
    Conforms to BACKEND_ENDPOINTS contract in tests_e2e/spec_oracles.py.
    """
    validate_account_id(account_id)
    return await run_prediction_pipeline(request, account_id, archetype)


@router.get("/{account_id}", response_model=PredictionResponse)
async def predict_churn_get(
    request: Request,
    account_id: int = Path(..., description="Target Steam 32-bit account ID"),
    archetype: Optional[str] = Query(None, description="Optional archetype preset ID"),
) -> PredictionResponse:
    """
    Executes ML prediction inference for target player account ID (GET method).
    Provides query flexibility for browser requests, curl, and frontend simulators.
    """
    validate_account_id(account_id)
    return await run_prediction_pipeline(request, account_id, archetype)


@router.get("/archetypes/list", response_model=List[ArchetypeProfile])
async def list_calibrated_archetypes() -> List[Dict[str, Any]]:
    """Returns the 4 calibrated Deadlock player archetypes."""
    return MockService.get_archetypes()


@router.get("/archetype/{archetype_id}", response_model=PredictionResponse)
async def predict_archetype_preset(
    request: Request,
    archetype_id: str = Path(..., description="Archetype ID (e.g. tilting_trooper)"),
) -> PredictionResponse:
    """Returns instant calibrated inference for one of the 4 reference archetypes."""
    arch = MockService.get_archetype_by_id(archetype_id)
    if not arch:
        raise HTTPException(status_code=404, detail=f"Archetype '{archetype_id}' not found.")
    return FeatureService.predict_churn(
        account_id=99990000,
        matches=[],
        archetype_override=arch,
        is_mock=True,
    )
