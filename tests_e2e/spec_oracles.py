#!/usr/bin/env python3
"""
=============================================================================
Authoritative Specification Oracles & Ground Truth Contracts
deadlock-predictor: Deadlock Telemetry, Tilt Dynamics & Churn Prediction
=============================================================================
Authoritative Sources:
- ORIGINAL_REQUEST.md (§R1 through §R3, Acceptance Criteria)
- PROJECT.md (Architecture, Interface Contracts, Feature Inventory F1-F12)
- Upstream Deadlock API Specs (api.deadlock-api.com)
=============================================================================
"""

import os
import re
import json
import math
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = PROJECT_ROOT.parent
DOCS_DIR = PROJECT_ROOT / "docs"
DEADLOCK_ASSESSMENT_PATH = DOCS_DIR / "DEADLOCK_API_ASSESSMENT.md"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
FRONTEND_SRC_DIR = FRONTEND_DIR / "src"
BACKEND_DIR = PROJECT_ROOT / "backend"
BACKEND_APP_DIR = BACKEND_DIR / "app"

# Reference paths from workspace
DOTA2_FINAL_DIR = WORKSPACE_ROOT / "Dota 2 Final"
DOTA2_FRONTEND_DIR = DOTA2_FINAL_DIR / "frontend_showcase"

# =============================================================================
# 1. DEADLOCK OCCULT DIESELPUNK VISUAL THEME TOKENS
# =============================================================================
DEADLOCK_PALETTE = {
    "midnight_slate": "#0b0f19",
    "chem_green": "#10b981",
    "electric_blue": "#2563eb",
    "steampunk_amber": "#d97706",
    "bg_dark": "#070a10",
    "card_bg": "#111827",
    "border_subtle": "#1f2937",
    "text_primary": "#f9fafb",
    "text_secondary": "#9ca3af",
}

# Required CSS variables matching Deadlock aesthetic
REQUIRED_CSS_TOKENS = [
    "--bg-base",
    "--bg-surface",
    "--accent-chem-green",
    "--accent-electric-blue",
    "--accent-amber",
    "--border-subtle",
    "--text-primary",
    "--text-secondary",
]

# =============================================================================
# 2. DEADLOCK CONCEPTS & TERMINOLOGY CONTRACTS
# =============================================================================
DEADLOCK_CONCEPTS = [
    "souls",
    "guardians",
    "walkers",
    "urns",
    "patron",
    "headshots",
    "tilt",
    "demotion",
]

# 14 Core Deadlock Heroes
DEADLOCK_HEROES = [
    {"id": 1, "name": "Infernus", "role": "DPS / Burn"},
    {"id": 2, "name": "Seven", "role": "Area Denial / Lightning"},
    {"id": 3, "name": "Vindicta", "role": "Long Range / Sniper"},
    {"id": 4, "name": "Lady Geist", "role": "Life Drain / Burst"},
    {"id": 5, "name": "Abrams", "role": "Melee Bruiser"},
    {"id": 6, "name": "Bebop", "role": "Displacement / Hook"},
    {"id": 7, "name": "Dynamo", "role": "Crowd Control / Singularity"},
    {"id": 8, "name": "Grey Talon", "role": "Precision Bow / Scout"},
    {"id": 9, "name": "Haze", "role": "Stealth / Bullet Flurry"},
    {"id": 10, "name": "Ivy", "role": "Support / Tether / Air Drop"},
    {"id": 11, "name": "Kelvin", "role": "Ice Dome / Zone Control"},
    {"id": 12, "name": "McGinnis", "role": "Turrets / Siege"},
    {"id": 13, "name": "Mo & Krill", "role": "Burrow / Disabler"},
    {"id": 14, "name": "Paradox", "role": "Time Swap / Carbine"},
    {"id": 15, "name": "Pocket", "role": "Elusive / Cloak / Affliction"},
    {"id": 16, "name": "Warden", "role": "Lockdown / Enforcer"},
    {"id": 17, "name": "Wraith", "role": "Telekinesis / Card Trick"},
    {"id": 18, "name": "Yamato", "role": "Shadow Transformation / Slash"},
]

# 4 Calibrated Player Archetypes
CALIBRATED_ARCHETYPES = [
    {
        "id": "tilting_trooper",
        "name_fr": "Le Fantassin en Tilt Aigu",
        "name_en": "The Tilting Trooper",
        "churn_probability": 0.88,
        "risk_level": "CRITICAL",
        "tilt_index": 82.5,
        "headshot_ratio": 0.12,
        "loss_streak": 6,
    },
    {
        "id": "burned_out_walker",
        "name_fr": "Le Vétéran Épuisé",
        "name_en": "The Burned-Out Veteran",
        "churn_probability": 0.54,
        "risk_level": "MODERATE",
        "tilt_index": 54.0,
        "headshot_ratio": 0.22,
        "loss_streak": 3,
    },
    {
        "id": "objective_guardian",
        "name_fr": "Le Gardien des Objectifs",
        "name_en": "The Objective Guardian",
        "churn_probability": 0.18,
        "risk_level": "LOW",
        "tilt_index": 18.0,
        "headshot_ratio": 0.31,
        "loss_streak": 1,
    },
    {
        "id": "balanced_carry",
        "name_fr": "Le Joueur Régulier & Serein",
        "name_en": "The Balanced Carry",
        "churn_probability": 0.14,
        "risk_level": "LOW",
        "tilt_index": 8.5,
        "headshot_ratio": 0.38,
        "loss_streak": 0,
    },
]

# =============================================================================
# 3. 48 ML FEATURE SPECIFICATIONS (AIM, ECONOMY, COMBAT, PSYCHOLOGY)
# =============================================================================
ML_48_FEATURES = [
    # 3D Shooter Aim & Mechanics (12 features)
    "shots_hit", "shots_missed", "total_shots", "accuracy_pct",
    "crit_shots_hit", "crit_accuracy_pct", "headshot_ratio",
    "accuracy_trend_last5", "aim_consistency", "watched_death_replays",
    "death_replay_view_ratio", "crosshair_on_target_pct",
    
    # Soul Economy & Progression (12 features)
    "souls_per_min", "net_worth_10m", "net_worth_20m", "net_worth_end",
    "last_hits_per_min", "denies_per_min", "orb_secure_rate",
    "orb_steal_rate", "ability_unlock_pace", "tier3_item_timing",
    "tier4_item_timing", "flex_slot_unlock_time",
    
    # Combat & Objective Dynamics (12 features)
    "kills_per_min", "deaths_per_min", "assists_per_min", "kda_ratio",
    "damage_per_min", "damage_taken_per_min", "lane_win_rate",
    "guardian_kills", "walker_kills", "urn_deliveries",
    "mid_boss_participations", "patron_damage_share",
    
    # Psychology, Tilt & Retention (12 features)
    "tilt_index", "recent_loss_streak", "current_streak", "night_owl_pct",
    "abandon_rate", "early_quit_rate", "pause_tilt_frequency",
    "demotion_risk_pct", "match_frequency_drift", "session_fatigue_index",
    "ping_frustration_marker", "rejoin_latency_s"
]

# =============================================================================
# 4. REQUIRED FRONTEND COMPONENT NAMES (14 Components)
# =============================================================================
REQUIRED_FRONTEND_COMPONENTS = [
    "Navbar.jsx",
    "HeroSection.jsx",
    "KpiBar.jsx",
    "SimulatorSection.jsx",
    "RiskGauge.jsx",
    "MlBenchmarkSection.jsx",
    "PsychologySection.jsx",
    "ArchitectureSection.jsx",
    "DictionaryDrawer.jsx",
    "WelcomeDictionaryToast.jsx",
    "AboutDeadlockModal.jsx",
    "Footer.jsx",
    "FactorAttribution.jsx",
    "GlossaryTerm.jsx",
]

# =============================================================================
# 5. BACKEND REST API ENDPOINTS CONTRACTS
# =============================================================================
BACKEND_ENDPOINTS = {
    "/api/status": {
        "methods": ["GET"],
        "expected_keys": ["status", "version", "upstream_healthy", "mock_mode"],
    },
    "/api/heroes": {
        "methods": ["GET"],
        "type": list,
    },
    "/api/ml/metrics": {
        "methods": ["GET"],
        "expected_keys": ["accuracy", "auc_score", "pr_auc", "feature_importances"],
    },
    "/api/predict/{account_id}": {
        "methods": ["POST"],
        "expected_keys": [
            "account_id",
            "churn_probability",
            "risk_level",
            "win_expectancy",
            "tilt_index",
            "key_contributing_factors",
            "is_mock",
        ],
    },
}

# Upstream Deadlock API Contracts
DEADLOCK_UPSTREAM_ENDPOINTS = [
    "/v1/info/health",
    "/v1/players/{account_id}/match-history",
    "/v1/matches/{match_id}/metadata",
    "/v1/assets/heroes",
]

# =============================================================================
# 6. MATHEMATICAL AND DOMAIN HELPER FUNCTIONS
# =============================================================================

def compute_shooter_accuracy(shots_hit: int, shots_missed: int) -> float:
    """Calculates shooter accuracy percentage with zero-division guard."""
    total = shots_hit + shots_missed
    if total <= 0:
        return 0.0
    return round((shots_hit / total) * 100.0, 2)


def compute_kda(kills: int, deaths: int, assists: int) -> float:
    """Calculates KDA ratio with zero-division guard max(1, deaths)."""
    return round((kills + assists) / max(1, deaths), 2)


def compute_souls_per_minute(net_worth: int, duration_seconds: int) -> float:
    """Calculates souls per minute with zero-division guard."""
    duration_minutes = max(1.0, duration_seconds / 60.0)
    return round(net_worth / duration_minutes, 1)


def compute_tilt_index(
    loss_streak: int,
    abandon_rate: float,
    night_owl_pct: float,
    accuracy_drop: float,
) -> float:
    """
    Computes player tilt index from streak, abandon rate, nocturnal play, and aim decay.
    Result bounded to [0.0, 100.0].
    """
    raw_tilt = (
        (max(0, loss_streak) * 12.0)
        + (abandon_rate * 40.0)
        + (night_owl_pct * 15.0)
        + (max(0.0, accuracy_drop) * 33.0)
    )
    return min(100.0, max(0.0, round(raw_tilt, 1)))


def calculate_exponential_backoff(attempt: int, base_delay: float = 1.0, max_delay: float = 30.0) -> float:
    """Calculates exponential backoff delay capped at max_delay."""
    delay = base_delay * (2 ** max(0, attempt))
    return min(max_delay, delay)


def map_probability_to_risk(prob: float) -> str:
    """Maps churn probability to Risk Tier (unified Option A theta* = 0.225)."""
    prob_clamped = min(1.0, max(0.0, prob))
    if prob_clamped > 0.60:
        return "CRITICAL"
    elif prob_clamped >= 0.225:
        return "MODERATE"
    else:
        return "LOW"


# =============================================================================
# 7. INSPECTION AND AUDITING HELPERS
# =============================================================================

def get_file_content_safe(path: Path) -> Optional[str]:
    """Safely reads text file content if it exists."""
    if path.exists() and path.is_file():
        try:
            return path.read_text(encoding="utf-8")
        except Exception:
            return None
    return None


def check_security_violations(text: str) -> List[str]:
    """
    Audits content for confidential API keys, personal machine usernames,
    and forbidden tokens.
    """
    violations = []
    # Check for hardcoded private API keys / secrets
    patterns = [
        (r'(?i)api[_-]?key\s*[:=]\s*["\'][a-zA-Z0-9_\-]{20,}["\']', "Hardcoded API Key"),
        (r'(?i)bearer\s+[a-zA-Z0-9_\-\.]{30,}', "Hardcoded Bearer Token"),
        (r'/Users/[a-zA-Z0-9_\-]+/(?!Desktop/Master|Desktop/Travail)', "Unsanitized Absolute Path"),
    ]
    for pattern, label in patterns:
        if re.search(pattern, text):
            violations.append(label)
    return violations
