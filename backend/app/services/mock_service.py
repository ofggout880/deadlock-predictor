"""
Mock Service & Telemetry Fixtures for Deadlock Predictor.
Provides realistic, domain-accurate fixtures for offline fallback and automated testing.
Conforms strictly to DEADLOCK_HEROES, CALIBRATED_ARCHETYPES, and ML_48_FEATURES.
"""

import time
from typing import Any, Dict, List, Optional
from app.models.schemas import (
    HeroDescriptor,
    ArchetypeProfile,
    MatchSummary,
    ModelMetricsResponse,
)

# 18 Core Deadlock Heroes matching spec_oracles.py
DEADLOCK_HEROES_DATA: List[Dict[str, Any]] = [
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

# 4 Calibrated Archetypes matching spec_oracles.py enriched with the 7 Source 2 Hidden Gems
CALIBRATED_ARCHETYPES_DATA: List[Dict[str, Any]] = [
    {
        "id": "tilting_trooper",
        "name_fr": "Le Fantassin en Tilt Aigu",
        "name_en": "The Tilting Trooper",
        "churn_probability": 0.88,
        "risk_level": "CRITICAL",
        "win_expectancy": 0.22,
        "tilt_index": 82.5,
        "headshot_ratio": 0.12,
        "loss_streak": 6,
        "shots_hit": 280,
        "shots_missed": 720,
        "kills": 3,
        "deaths": 11,
        "assists": 4,
        "net_worth": 12400,
        "abandon_rate": 0.15,
        "night_owl_pct": 0.65,
        # The 7 Source 2 Hidden Gems
        "solo_isolation_streak": 6,
        "party_play_pct": 0.05,
        "headshot_diff_rate": -14.5,
        "stun_headshots_taken_rate": 1.45,
        "parry_miss_per_match": 4.2,
        "grey_screen_ratio": 0.185,
        "avg_time_to_kill_s": 5.2,
        "rage_sell_rate": 0.75,
        "late_panic_sells": 3,
        "teammate_support_per_min": 8.5,
        "unsecured_souls_lost_per_min": 28.5,
    },
    {
        "id": "burned_out_walker",
        "name_fr": "Le Vétéran Épuisé",
        "name_en": "The Burned-Out Veteran",
        "churn_probability": 0.54,
        "risk_level": "MODERATE",
        "win_expectancy": 0.44,
        "tilt_index": 54.0,
        "headshot_ratio": 0.22,
        "loss_streak": 3,
        "shots_hit": 390,
        "shots_missed": 610,
        "kills": 6,
        "deaths": 7,
        "assists": 8,
        "net_worth": 16200,
        "abandon_rate": 0.05,
        "night_owl_pct": 0.40,
        # The 7 Source 2 Hidden Gems
        "solo_isolation_streak": 3,
        "party_play_pct": 0.35,
        "headshot_diff_rate": -3.2,
        "stun_headshots_taken_rate": 0.82,
        "parry_miss_per_match": 2.6,
        "grey_screen_ratio": 0.128,
        "avg_time_to_kill_s": 10.4,
        "rage_sell_rate": 0.35,
        "late_panic_sells": 1,
        "teammate_support_per_min": 22.0,
        "unsecured_souls_lost_per_min": 19.2,
    },
    {
        "id": "objective_guardian",
        "name_fr": "Le Gardien des Objectifs",
        "name_en": "The Objective Guardian",
        "churn_probability": 0.18,
        "risk_level": "LOW",
        "win_expectancy": 0.65,
        "tilt_index": 18.0,
        "headshot_ratio": 0.31,
        "loss_streak": 1,
        "shots_hit": 440,
        "shots_missed": 560,
        "kills": 8,
        "deaths": 5,
        "assists": 14,
        "net_worth": 19500,
        "abandon_rate": 0.00,
        "night_owl_pct": 0.15,
        # The 7 Source 2 Hidden Gems
        "solo_isolation_streak": 0,
        "party_play_pct": 0.75,
        "headshot_diff_rate": +2.1,
        "stun_headshots_taken_rate": 0.38,
        "parry_miss_per_match": 1.2,
        "grey_screen_ratio": 0.095,
        "avg_time_to_kill_s": 14.8,
        "rage_sell_rate": 0.05,
        "late_panic_sells": 0,
        "teammate_support_per_min": 44.5,
        "unsecured_souls_lost_per_min": 14.1,
    },
    {
        "id": "balanced_carry",
        "name_fr": "Le Joueur Régulier & Serein",
        "name_en": "The Balanced Carry",
        "churn_probability": 0.14,
        "risk_level": "LOW",
        "win_expectancy": 0.78,
        "tilt_index": 8.5,
        "headshot_ratio": 0.38,
        "loss_streak": 0,
        "shots_hit": 520,
        "shots_missed": 480,
        "kills": 12,
        "deaths": 3,
        "assists": 11,
        "net_worth": 24500,
        "abandon_rate": 0.00,
        "night_owl_pct": 0.05,
        # The 7 Source 2 Hidden Gems
        "solo_isolation_streak": 0,
        "party_play_pct": 0.90,
        "headshot_diff_rate": +5.4,
        "stun_headshots_taken_rate": 0.15,
        "parry_miss_per_match": 0.5,
        "grey_screen_ratio": 0.068,
        "avg_time_to_kill_s": 18.2,
        "rage_sell_rate": 0.00,
        "late_panic_sells": 0,
        "teammate_support_per_min": 52.0,
        "unsecured_souls_lost_per_min": 9.4,
    },
]

# Baseline 48 Feature Importances for Deadlock Churn Model
BASE_FEATURE_IMPORTANCES: Dict[str, float] = {
    "tilt_index": 0.142,
    "recent_loss_streak": 0.125,
    "accuracy_pct": 0.088,
    "headshot_ratio": 0.076,
    "souls_per_min": 0.069,
    "watched_death_replays": 0.064,
    "net_worth_10m": 0.058,
    "kda_ratio": 0.052,
    "abandon_rate": 0.048,
    "demotion_risk_pct": 0.041,
    "crit_accuracy_pct": 0.038,
    "accuracy_trend_last5": 0.035,
    "night_owl_pct": 0.031,
    "guardian_kills": 0.029,
    "walker_kills": 0.027,
    "orb_secure_rate": 0.025,
    "shots_hit": 0.023,
    "shots_missed": 0.022,
    "total_shots": 0.020,
    "crit_shots_hit": 0.019,
    "aim_consistency": 0.018,
    "death_replay_view_ratio": 0.017,
    "crosshair_on_target_pct": 0.016,
    "net_worth_20m": 0.015,
    "net_worth_end": 0.014,
    "last_hits_per_min": 0.013,
    "denies_per_min": 0.012,
    "orb_steal_rate": 0.011,
    "ability_unlock_pace": 0.010,
    "tier3_item_timing": 0.009,
    "tier4_item_timing": 0.008,
    "flex_slot_unlock_time": 0.008,
    "kills_per_min": 0.008,
    "deaths_per_min": 0.007,
    "assists_per_min": 0.007,
    "damage_per_min": 0.006,
    "damage_taken_per_min": 0.006,
    "lane_win_rate": 0.006,
    "urn_deliveries": 0.005,
    "mid_boss_participations": 0.005,
    "patron_damage_share": 0.005,
    "current_streak": 0.004,
    "early_quit_rate": 0.004,
    "pause_tilt_frequency": 0.003,
    "match_frequency_drift": 0.003,
    "session_fatigue_index": 0.003,
    "ping_frustration_marker": 0.002,
    "rejoin_latency_s": 0.002,
}


class MockService:
    """Service providing domain mock data and fallback fixtures."""

    @staticmethod
    def get_heroes() -> List[Dict[str, Any]]:
        """Returns list of Deadlock heroes."""
        return DEADLOCK_HEROES_DATA

    @staticmethod
    def get_archetypes() -> List[Dict[str, Any]]:
        """Returns list of calibrated player archetypes."""
        return CALIBRATED_ARCHETYPES_DATA

    @staticmethod
    def get_archetype_by_id(archetype_id: str) -> Optional[Dict[str, Any]]:
        """Finds archetype fixture by ID or name substring."""
        clean_id = archetype_id.lower().replace("-", "_")
        for arch in CALIBRATED_ARCHETYPES_DATA:
            if arch["id"] == clean_id:
                return arch
        # Also check substring match
        for arch in CALIBRATED_ARCHETYPES_DATA:
            if clean_id in arch["id"] or arch["id"] in clean_id:
                return arch
        return None

    @staticmethod
    def get_mock_health() -> Dict[str, Any]:
        """Returns simulated upstream cluster health."""
        return {
            "services": {
                "clickhouse": True,
                "postgres": True,
                "redis": True,
            },
            "cluster_records": 451796164,
            "mock_mode": True,
        }

    @staticmethod
    def get_mock_active_matches() -> List[Dict[str, Any]]:
        """Returns simulated active live matches."""
        now = int(time.time())
        return [
            {
                "match_id": 900101,
                "start_time": now - 720,
                "duration_s": 720,
                "spectators": 24,
                "net_worth_team0": 34500,
                "net_worth_team1": 31200,
                "guardians_remaining_team0": 4,
                "guardians_remaining_team1": 3,
                "winning_team": 0,
            },
            {
                "match_id": 900102,
                "start_time": now - 1440,
                "duration_s": 1440,
                "spectators": 42,
                "net_worth_team0": 58900,
                "net_worth_team1": 63400,
                "guardians_remaining_team0": 1,
                "guardians_remaining_team1": 2,
                "winning_team": 1,
            },
        ]

    @staticmethod
    def generate_player_matches(account_id: int, count: int = 20) -> List[Dict[str, Any]]:
        """
        Generates 20 realistic match records for an account ID.
        If account_id matches an archetype pattern, customizes telemetry to reflect that profile.
        """
        # Determine base parameters from account_id hash or known archetypes
        seed = abs(hash(account_id)) % 100
        is_high_churn = seed > 70
        is_moderate = 40 <= seed <= 70

        matches: List[Dict[str, Any]] = []
        now = int(time.time())

        for i in range(count):
            match_id = 24900000 + i + (abs(account_id) % 10000)
            hero_id = ((i + seed) % len(DEADLOCK_HEROES_DATA)) + 1
            duration_s = 1500 + ((i * 37) % 600)

            # Win/Loss pattern
            if is_high_churn and i < 6:
                outcome = 0  # Recent loss streak
            elif is_moderate and i < 3:
                outcome = 0
            else:
                outcome = 1 if ((i + seed) % 2 == 0) else 0

            kills = max(1, 10 - (i % 6) if not is_high_churn else 3 + (i % 3))
            deaths = max(1, 3 + (i % 4) if not is_high_churn else 7 + (i % 5))
            assists = max(2, 8 + (i % 6))
            net_worth = max(8000, 22000 - (i * 350) if not is_high_churn else 13500 - (i * 200))
            shots_hit = 420 - (i * 8) if not is_high_churn else 260 + (i * 5)
            shots_missed = 580 + (i * 8) if not is_high_churn else 740 - (i * 5)
            crits = int(shots_hit * (0.30 if not is_high_churn else 0.12))

            matches.append({
                "match_id": match_id,
                "hero_id": hero_id,
                "match_result": outcome,
                "player_kills": kills,
                "player_deaths": deaths,
                "player_assists": assists,
                "net_worth": net_worth,
                "last_hits": 120 + (i % 40),
                "denies": 14 - (i % 8) if not is_high_churn else 4,
                "abandoned_time_s": 0 if not is_high_churn else (180 if i == 0 else 0),
                "start_time": now - (i * 7200),
                "duration_s": duration_s,
                "shots_hit": shots_hit,
                "shots_missed": shots_missed,
                "hero_bullets_hit_crit": crits,
                "watched_death_replays": 1 if not is_high_churn else 4,
            })

        return matches

    @staticmethod
    def get_mock_ml_metrics() -> Dict[str, Any]:
        """Returns the 100% In-Game Pure ML performance metrics and feature importances."""
        import json
        from pathlib import Path
        results_file = Path(__file__).resolve().parent.parent.parent / "data" / "ml_results.json"
        if results_file.exists():
            try:
                data = json.loads(results_file.read_text(encoding="utf-8"))
                champ = data.get("champion_model", {})
                f1_res = champ.get("test_f1_optimal", {})
                ds = data.get("dataset_summary", {})
                top_feats = data.get("feature_optimization", {}).get("top_features_ranking", [])
                feat_map = {f["feature"]: round(f["importance_pct"] / 100.0, 4) for f in top_feats}
                return {
                    "accuracy": f1_res.get("accuracy", 0.6667),
                    "auc_score": f1_res.get("roc_auc", 0.7474),
                    "pr_auc": f1_res.get("pr_auc", 0.5079),
                    "recall": f1_res.get("recall", 0.7318),
                    "precision": f1_res.get("precision", 0.4081),
                    "f1_score": f1_res.get("f1_score", 0.5240),
                    "brier_score": f1_res.get("brier_score", 0.1604),
                    "best_threshold": f1_res.get("threshold", 0.225),
                    "dataset_size": ds.get("total_windows", 8625),
                    "test_size": ds.get("test_windows", 1695),
                    "champion_model": champ.get("display_name", "Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)"),
                    "feature_importances": feat_map,
                }
            except Exception:
                pass
        return {
            "accuracy": 0.6667,
            "auc_score": 0.7474,
            "pr_auc": 0.5079,
            "recall": 0.7318,
            "precision": 0.4081,
            "f1_score": 0.5240,
            "brier_score": 0.1604,
            "best_threshold": 0.225,
            "dataset_size": 8625,
            "test_size": 1695,
            "champion_model": "Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)",
            "feature_importances": BASE_FEATURE_IMPORTANCES,
        }

    @staticmethod
    def get_ml_visualizations() -> Dict[str, Any]:
        """Returns complete ML visualizations data (ROC, PR, confusion matrix, ablation, hidden gems)."""
        import json
        from pathlib import Path
        results_file = Path(__file__).resolve().parent.parent.parent / "data" / "ml_results.json"
        if results_file.exists():
            try:
                data = json.loads(results_file.read_text(encoding="utf-8"))
                champ = data.get("champion_model", {})
                f1_res = champ.get("test_f1_optimal", {})
                return {
                    "champion_model": champ.get("display_name", "Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)"),
                    "best_threshold": f1_res.get("threshold", 0.225),
                    "roc_auc": f1_res.get("roc_auc", 0.7474),
                    "pr_auc": f1_res.get("pr_auc", 0.5079),
                    "recall": f1_res.get("recall", 0.7318),
                    "precision": f1_res.get("precision", 0.4081),
                    "f1_score": f1_res.get("f1_score", 0.5240),
                    "accuracy": f1_res.get("accuracy", 0.6667),
                    "brier_score": f1_res.get("brier_score", 0.1604),
                    "confusion_matrix": f1_res.get("confusion_matrix", {}),
                    "calibrated_curve_points": data.get("calibrated_curve_points", []),
                    "ablation_study": data.get("ablation_study", {}),
                    "hidden_gems_audit": data.get("hidden_gems_audit", []),
                    "feature_importances": data.get("feature_optimization", {}).get("top_features_ranking", []),
                    "models_benchmark": data.get("models_benchmark", {}),
                    "dataset_summary": data.get("dataset_summary", {}),
                }
            except Exception:
                pass
        return {
            "champion_model": "Gradient Boosting (Depth-3, Colsample=0.50, Subsample=0.75)",
            "best_threshold": 0.225,
            "roc_auc": 0.7474,
            "pr_auc": 0.5079,
            "recall": 0.7318,
            "confusion_matrix": {"tp": 311, "fp": 451, "tn": 819, "fn": 114},
        }

    @staticmethod
    def search_players(query: str) -> List[Dict[str, Any]]:
        """Searches players by persona name, role, or Steam Account ID."""
        q = str(query).strip().lower()
        results: List[Dict[str, Any]] = []

        # 1. Search calibrated archetypes
        for arch in CALIBRATED_ARCHETYPES_DATA:
            if (
                q in arch["id"].lower()
                or q in arch["name_fr"].lower()
                or q in arch["name_en"].lower()
                or q in str(arch.get("account_id", ""))
            ):
                results.append({
                    "account_id": arch.get("account_id", 80128751),
                    "persona_name": arch["name_fr"],
                    "churn_probability": arch["churn_probability"],
                    "risk_level": arch["risk_level"],
                    "tilt_index": arch["tilt_index"],
                    "archetype_id": arch["id"],
                    "is_archetype": True,
                })

        # 2. Curated sample cohort players
        cohort_samples = [
            {
                "account_id": 878840461,
                "persona_name": "TiltedVindicta_AimTilt",
                "churn_probability": 0.89,
                "risk_level": "CRITICAL",
                "tilt_index": 100.0,
                "solo_isolation_streak": 7,
                "headshot_diff_rate": -14.0,
                "is_archetype": False,
            },
            {
                "account_id": 81755642,
                "persona_name": "LossStreak_Seven",
                "churn_probability": 0.92,
                "risk_level": "CRITICAL",
                "tilt_index": 100.0,
                "solo_isolation_streak": 11,
                "headshot_diff_rate": -27.0,
                "is_archetype": False,
            },
            {
                "account_id": 233125617,
                "persona_name": "Guardian_Ivy_PartyShield",
                "churn_probability": 0.12,
                "risk_level": "LOW",
                "tilt_index": 1.8,
                "solo_isolation_streak": 0,
                "party_play_pct": 1.0,
                "is_archetype": False,
            },
            {
                "account_id": 395397309,
                "persona_name": "Serein_Abrams_Duo",
                "churn_probability": 0.16,
                "risk_level": "LOW",
                "tilt_index": 12.5,
                "solo_isolation_streak": 0,
                "party_play_pct": 1.0,
                "is_archetype": False,
            },
        ]
        for p in cohort_samples:
            if (
                q in str(p["account_id"])
                or q in p["persona_name"].lower()
            ):
                results.append(p)

        return results[:8]
