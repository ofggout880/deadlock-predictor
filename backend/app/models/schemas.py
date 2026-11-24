"""
Pydantic Data Schemas and API Models for Deadlock Predictor.
Conforms strictly to specification contracts in PROJECT.md and tests_e2e/spec_oracles.py.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class StatusResponse(BaseModel):
    """System health & upstream status response model."""
    status: str = Field(default="ok", description="Overall backend health status")
    version: str = Field(default="1.0.0", description="Backend semantic version")
    upstream_healthy: bool = Field(default=True, description="Whether Deadlock API upstream is healthy")
    mock_mode: bool = Field(default=False, description="Whether backend is serving offline mock fixtures")


class HeroDescriptor(BaseModel):
    """Deadlock hero catalog item."""
    id: int = Field(..., description="Unique hero ID")
    name: str = Field(..., description="Hero identifier/name")
    role: str = Field(..., description="Hero gameplay archetype/role")


class FactorAttribution(BaseModel):
    """SHAP-like factor contribution explaining prediction score."""
    feature: str = Field(..., description="Name of the contributing feature")
    impact: float = Field(..., description="Relative contribution magnitude (-1.0 to 1.0)")
    direction: str = Field(..., description="'churn' or 'retention'")


class PredictionRequest(BaseModel):
    """Optional request body when triggering prediction inference."""
    account_id: Optional[int] = Field(None, description="Player Steam 32-bit account ID")
    telemetry_override: Optional[Dict[str, Any]] = Field(None, description="Optional custom telemetry features")


class PredictionResponse(BaseModel):
    """Prediction inference response payload matching frontend interface contract."""
    account_id: int = Field(..., description="Target player Steam account ID")
    churn_probability: float = Field(..., ge=0.0, le=1.0, description="Predicted 14-day churn probability")
    risk_level: str = Field(..., description="Categorical risk tier: LOW, MODERATE, or CRITICAL")
    win_expectancy: float = Field(..., ge=0.0, le=1.0, description="Next-match win probability expectancy")
    tilt_index: float = Field(..., ge=0.0, le=100.0, description="Composite frustration and tilt score")
    key_contributing_factors: List[FactorAttribution] = Field(
        default_factory=list,
        description="Top contributing features driving the prediction"
    )
    is_mock: bool = Field(default=False, description="Whether prediction used offline fallback mock data")
    personaname: Optional[str] = Field(None, description="Optional player persona name")
    features: Optional[Dict[str, Any]] = Field(None, description="Detailed in-game telemetry features")
    hidden_gems: Optional[Dict[str, Any]] = Field(None, description="The 7 Source 2 Hidden Gems telemetry")


class ModelMetricsResponse(BaseModel):
    """ML performance metrics and feature importances."""
    accuracy: float = Field(..., description="Overall classification accuracy")
    auc_score: float = Field(..., description="ROC-AUC score")
    pr_auc: float = Field(..., description="PR-AUC (Precision-Recall AUC) score")
    recall: Optional[float] = Field(None, description="Test recall at optimal threshold")
    precision: Optional[float] = Field(None, description="Test precision at optimal threshold")
    f1_score: Optional[float] = Field(None, description="Test F1-score at optimal threshold")
    brier_score: Optional[float] = Field(None, description="Test Brier calibration score")
    best_threshold: float = Field(0.225, description="Unified optimal decision threshold theta*")
    dataset_size: Optional[int] = Field(None, description="Total enriched dataset windows")
    test_size: Optional[int] = Field(None, description="Holdout test windows count")
    champion_model: Optional[str] = Field(None, description="Champion model display name")
    feature_importances: Dict[str, float] = Field(
        default_factory=dict,
        description="Ranked feature importances for selected telemetry dimensions"
    )


class MatchSummary(BaseModel):
    """Individual Deadlock match performance summary."""
    match_id: int
    hero_id: int
    match_result: int = Field(..., description="1 = Victory, 0 = Defeat")
    player_kills: int = 0
    player_deaths: int = 0
    player_assists: int = 0
    net_worth: int = 0
    last_hits: int = 0
    denies: int = 0
    start_time: int = 0
    duration_s: int = 1800
    shots_hit: Optional[int] = None
    shots_missed: Optional[int] = None
    hero_bullets_hit_crit: Optional[int] = None


class PlayerProfile(BaseModel):
    """Player summary profile."""
    account_id: int
    persona_name: Optional[str] = "DeadlockTrooper"
    avatar_url: Optional[str] = None
    ranked_rank: Optional[str] = "Ascendant"
    matches_analyzed: int = 20
    is_mock: bool = False


class PlayerMatchesResponse(BaseModel):
    """Player match history endpoint response."""
    account_id: int
    total_matches: int
    matches: List[MatchSummary]
    is_mock: bool = False


class ArchetypeProfile(BaseModel):
    """Calibrated Deadlock player archetype."""
    id: str
    name_fr: str
    name_en: str
    churn_probability: float
    risk_level: str
    tilt_index: float
    headshot_ratio: float
    loss_streak: int
