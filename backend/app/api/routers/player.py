"""
Player Telemetry and Match History Router.
File: app/api/routers/player.py
"""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Path, Request

from app.models.schemas import MatchSummary, PlayerMatchesResponse, PlayerProfile
from app.services.mock_service import MockService

router = APIRouter(prefix="/players", tags=["Players & Telemetry"])


def validate_account_id(account_id: int) -> int:
    """Validates that account_id is a positive non-zero integer."""
    if account_id <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid account ID: {account_id}. Must be a positive non-zero integer.",
        )
    return account_id


@router.get("/search")
async def search_players_endpoint(
    q: str = "",
) -> List[Dict[str, Any]]:
    """
    Searches player cohort by persona name or account ID.
    Supports real dataset players, archetypes, and numeric query match.
    """
    return MockService.search_players(q)


@router.get("/{account_id}/matches", response_model=PlayerMatchesResponse)
async def get_player_matches(
    request: Request,
    account_id: int = Path(..., description="Steam 32-bit account ID"),
) -> PlayerMatchesResponse:
    """
    Retrieves up to last 20 matches for a player account ID.
    Fetches upstream via DeadlockClient; falls back to mock generator if offline.
    """
    validate_account_id(account_id)
    client = getattr(request.app.state, "client", None)
    is_mock = False
    matches: List[Dict[str, Any]] = []

    if client:
        try:
            raw_matches = await client.get_player_match_history(account_id)
            if isinstance(raw_matches, list) and len(raw_matches) > 0:
                matches = raw_matches
            else:
                matches = MockService.generate_player_matches(account_id)
                is_mock = True
        except Exception:
            matches = MockService.generate_player_matches(account_id)
            is_mock = True
    else:
        matches = MockService.generate_player_matches(account_id)
        is_mock = True

    # Normalize to MatchSummary schema
    summaries: List[MatchSummary] = []
    for m in matches[:20]:
        p_team = m.get("player_team")
        m_res = m.get("match_result")
        if p_team is not None and m_res is not None:
            won_val = 1 if int(p_team) == int(m_res) else 0
        elif m.get("player_match_outcome") is not None and int(m.get("player_match_outcome")) in (1, 2):
            won_val = 1 if int(m.get("player_match_outcome")) == 1 else 0
        else:
            won_val = int(m_res or 0)

        summaries.append(
            MatchSummary(
                match_id=m.get("match_id", 0),
                hero_id=m.get("hero_id", 1),
                match_result=won_val,
                player_kills=m.get("player_kills", m.get("kills", 0)),
                player_deaths=m.get("player_deaths", m.get("deaths", 0)),
                player_assists=m.get("player_assists", m.get("assists", 0)),
                net_worth=m.get("net_worth", 0),
                last_hits=m.get("last_hits", 0),
                denies=m.get("denies", 0),
                start_time=m.get("start_time", 0),
                duration_s=int(m.get("match_duration_s") or m.get("duration_s") or 1800),
                shots_hit=m.get("shots_hit"),
                shots_missed=m.get("shots_missed"),
                hero_bullets_hit_crit=m.get("hero_bullets_hit_crit"),
            )
        )

    return PlayerMatchesResponse(
        account_id=account_id,
        total_matches=len(summaries),
        matches=summaries,
        is_mock=is_mock,
    )


@router.get("/{account_id}", response_model=PlayerProfile)
async def get_player_profile(
    request: Request,
    account_id: int = Path(..., description="Steam 32-bit account ID"),
) -> PlayerProfile:
    """Returns general profile metadata for player."""
    validate_account_id(account_id)
    return PlayerProfile(
        account_id=account_id,
        persona_name=f"Trooper_{account_id % 10000}",
        ranked_rank="Ascendant",
        matches_analyzed=20,
        is_mock=True,
    )
