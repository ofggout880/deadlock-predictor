"""
Feature Engineering & Machine Learning Inference Service for Deadlock Predictor.
Extracts 48 canonical domain features + behavioral context + 7 Source 2 Hidden Gems,
and executes real ML inference using serialized Option A artifacts via ModelArtifactRegistry.
Conforms strictly to formulas in tests_e2e/spec_oracles.py and ML_CONTRACT.md.
"""

from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import joblib
import numpy as np
import pandas as pd

from app.models.schemas import FactorAttribution, PredictionResponse

logger = logging.getLogger("feature_service")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
UNIFIED_THRESHOLD = 0.225

# 48 Exact Feature Names matching spec_oracles.py
ML_48_FEATURES: List[str] = [
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
    "ping_frustration_marker", "rejoin_latency_s",
]


def is_live_match_won(m: Dict[str, Any]) -> bool:
    """
    Determines whether the player won match `m`.
    Fixes Amber Hand (0) / Sapphire Flame (1) team inversion:
    in Deadlock API `/match-history`, `match_result` is the winning team (0 or 1),
    while `player_team` is the player's team (0 or 1).
    Falls back to `player_match_outcome == 1` or `match_result == 1` for mock fixtures.
    """
    p_team = m.get("player_team")
    m_res = m.get("match_result")
    if p_team is not None and m_res is not None:
        return int(p_team) == int(m_res)
    pmo = m.get("player_match_outcome")
    if pmo is not None and int(pmo) in (1, 2):
        return int(pmo) == 1
    return bool(m_res == 1)


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
    Result strictly bounded to [0.0, 100.0].
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
    """Maps churn probability to Risk Tier using unified Option A cutoff theta* = 0.225."""
    prob_clamped = min(1.0, max(0.0, prob))
    if prob_clamped > 0.60:
        return "CRITICAL"
    elif prob_clamped >= UNIFIED_THRESHOLD:
        return "MODERATE"
    else:
        return "LOW"


class ModelArtifactRegistry:
    """Loads and caches serialized Option A ML artifacts for real-time inference."""

    _model: Any = None
    _scaler: Any = None
    _features: List[str] = []
    _era_stats: Optional[Dict[str, Any]] = None

    @classmethod
    def load(cls) -> bool:
        if cls._model is not None and cls._scaler is not None and cls._features:
            return True
        model_path = DATA_DIR / "deadlock_churn_model.pkl"
        scaler_path = DATA_DIR / "deadlock_scaler.pkl"
        feat_path = DATA_DIR / "features_list.json"
        era_path = DATA_DIR / "patch_era_stats.joblib"

        if model_path.exists() and scaler_path.exists() and feat_path.exists():
            cls._model = joblib.load(model_path)
            cls._scaler = joblib.load(scaler_path)
            cls._features = json.loads(feat_path.read_text(encoding="utf-8"))
            if era_path.exists():
                cls._era_stats = joblib.load(era_path)
            logger.info("Loaded ML artifacts: %s (%d features)", type(cls._model).__name__, len(cls._features))
            return True
        return False

    @classmethod
    def standardize_live_base_features(cls, feature_dict: Dict[str, float]) -> Dict[str, float]:
        """Applies latest-patch-era standardization fitted on training data if available."""
        cls.load()
        if not cls._era_stats:
            return feature_dict
        out = dict(feature_dict)
        col_stats = cls._era_stats.get("col_stats", {})
        for col, st in col_stats.items():
            if col in out:
                l_mu = float(st.get("latest_mu", st["global_mu"]))
                l_sd = float(max(1e-6, st.get("latest_sd", st["global_sd"])))
                g_mu = float(st["global_mu"])
                g_sd = float(st["global_sd"])
                out[col] = ((float(out[col]) - l_mu) / l_sd) * g_sd + g_mu
        return out

    @classmethod
    def _compute_local_tree_attributions(cls, x_scaled: np.ndarray) -> np.ndarray:
        """
        Computes genuine local per-sample feature attributions.
        For GradientBoostingClassifier, uses exact Saabas tree-path value deltas across all
        boosting trees (sum equals F(x) - E[F(X)] in log-odds space).
        """
        n_feat = len(cls._features)
        contribs = np.zeros(n_feat, dtype=np.float64)
        estimators = getattr(cls._model, "estimators_", None)
        lr = float(getattr(cls._model, "learning_rate", 1.0))

        if estimators is not None and len(estimators) > 0:
            for est_row in estimators:
                tree_est = est_row[0] if hasattr(est_row, "__len__") else est_row
                tree = getattr(tree_est, "tree_", None)
                if tree is None:
                    continue
                visited = tree_est.decision_path(x_scaled).indices
                for k in range(len(visited) - 1):
                    parent = int(visited[k])
                    child = int(visited[k + 1])
                    feat_idx = int(tree.feature[parent])
                    if 0 <= feat_idx < n_feat:
                        delta = (float(tree.value[child][0, 0]) - float(tree.value[parent][0, 0])) * lr
                        contribs[feat_idx] += delta
            return contribs

        importances = getattr(cls._model, "feature_importances_", np.ones(n_feat) / max(1, n_feat))
        return x_scaled[0] * importances

    @classmethod
    def predict_proba_and_attributions(
        cls, feature_dict: Dict[str, float]
    ) -> Tuple[float, List[FactorAttribution]]:
        if not cls.load():
            raise RuntimeError("Serialized ML artifacts not found in backend/data/")

        x_df = pd.DataFrame(
            [[float(feature_dict.get(f, 0.0)) for f in cls._features]],
            columns=cls._features,
        )
        x_scaled = cls._scaler.transform(x_df)
        prob = float(cls._model.predict_proba(x_scaled)[0, 1])

        raw_contribs = cls._compute_local_tree_attributions(x_scaled)
        norm_scale = max(1.0, float(np.sum(np.abs(raw_contribs))))
        norm_contribs = raw_contribs / norm_scale

        top_indices = np.argsort(np.abs(norm_contribs))[::-1][:4]
        factors: List[FactorAttribution] = []
        for idx in top_indices:
            val = float(norm_contribs[idx])
            if abs(val) < 1e-4:
                val = 0.01 if x_scaled[0, idx] > 0 else -0.01
            factors.append(
                FactorAttribution(
                    feature=cls._features[idx],
                    impact=round(float(np.clip(val, -1.0, 1.0)), 3),
                    direction="churn" if val > 0 else "retention",
                )
            )
        return round(min(1.0, max(0.0, prob)), 4), factors


class FeatureService:
    """Service for computing telemetry features and executing real ML prediction inferences."""

    @classmethod
    def extract_48_features(cls, matches: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Computes all 48 canonical features from a chronological list of match records.
        Assumes matches are sorted newest-first (matches[0] is latest match).
        """
        if not matches:
            return {f: 0.0 for f in ML_48_FEATURES}

        n = len(matches)
        recent_matches = matches[:5]
        older_matches = matches[5:20] if n > 5 else matches

        # 1. 3D Shooter Aim & Mechanics
        total_shots_hit = sum(m["shots_hit"] if m.get("shots_hit") is not None else 350 for m in matches)
        total_shots_missed = sum(m["shots_missed"] if m.get("shots_missed") is not None else 650 for m in matches)
        total_shots = total_shots_hit + total_shots_missed
        avg_shots_hit = round(total_shots_hit / n, 1)
        avg_shots_missed = round(total_shots_missed / n, 1)
        accuracy_pct = compute_shooter_accuracy(total_shots_hit, total_shots_missed)

        crit_shots = sum(
            m["hero_bullets_hit_crit"] if m.get("hero_bullets_hit_crit") is not None
            else int((m["shots_hit"] if m.get("shots_hit") is not None else 350) * 0.25)
            for m in matches
        )
        avg_crit_shots = round(crit_shots / n, 1)
        crit_accuracy_pct = round((crit_shots / max(1, total_shots)) * 100.0, 2)
        headshot_ratio = round(crit_shots / max(1, total_shots_hit), 2)

        rec_hit = sum(m["shots_hit"] if m.get("shots_hit") is not None else 350 for m in recent_matches)
        rec_miss = sum(m["shots_missed"] if m.get("shots_missed") is not None else 650 for m in recent_matches)
        rec_acc = compute_shooter_accuracy(rec_hit, rec_miss)

        old_hit = sum(m["shots_hit"] if m.get("shots_hit") is not None else 350 for m in older_matches)
        old_miss = sum(m["shots_missed"] if m.get("shots_missed") is not None else 650 for m in older_matches)
        old_acc = compute_shooter_accuracy(old_hit, old_miss)
        accuracy_trend_last5 = round(rec_acc - old_acc, 2)

        aim_consistency = round(max(0.0, 1.0 - (abs(accuracy_trend_last5) / 100.0)), 2)
        total_death_replays = sum(m["watched_death_replays"] if m.get("watched_death_replays") is not None else 1 for m in matches)
        avg_death_replays = round(total_death_replays / n, 1)
        total_deaths = sum(m["player_deaths"] if m.get("player_deaths") is not None else 0 for m in matches)
        death_replay_view_ratio = round(total_death_replays / max(1, total_deaths), 2)
        crosshair_on_target_pct = round(min(100.0, accuracy_pct * 1.4), 1)

        # 2. Soul Economy & Progression (use match_duration_s first, fallback duration_s)
        total_networth = sum(m["net_worth"] if m.get("net_worth") is not None else 18000 for m in matches)
        durations_s = [
            int(
                m["match_duration_s"]
                if m.get("match_duration_s") is not None
                else (m["duration_s"] if m.get("duration_s") is not None else 1800)
            )
            for m in matches
        ]
        total_duration = sum(durations_s)
        souls_per_min = compute_souls_per_minute(total_networth, total_duration)

        avg_nw = total_networth / n
        net_worth_10m = round(avg_nw * 0.38, 1)
        net_worth_20m = round(avg_nw * 0.72, 1)
        net_worth_end = round(avg_nw, 1)

        total_lh = sum(m.get("last_hits") or 0 for m in matches)
        total_denies = sum(m.get("denies") or 0 for m in matches)
        duration_mins = max(1.0, total_duration / 60.0)
        last_hits_per_min = round(total_lh / duration_mins, 2)
        denies_per_min = round(total_denies / duration_mins, 2)

        orb_secure_rate = round(min(1.0, 0.65 + (last_hits_per_min / 50.0)), 2)
        orb_steal_rate = round(min(1.0, 0.15 + (denies_per_min / 30.0)), 2)
        avg_hero_level = sum(m.get("hero_level") or 18 for m in matches) / n
        ability_unlock_pace = round(avg_hero_level / max(1.0, (total_duration / n) / 60.0), 3)

        # Units strictly in seconds matching collect_data.py & deadlock_scaler.pkl
        avg_dur_s = max(600.0, total_duration / n)
        spm_safe = max(350.0, souls_per_min)
        tier3_item_timing = round(max(420.0, min(avg_dur_s * 0.68, (9500.0 / spm_safe) * 60.0)), 1)
        tier4_item_timing = round(max(840.0, min(avg_dur_s * 0.92, (22000.0 / spm_safe) * 60.0)), 1)

        # 3. Combat & Objective Dynamics
        total_kills = sum(m.get("player_kills") or 0 for m in matches)
        total_assists = sum(m.get("player_assists") or 0 for m in matches)
        kills_per_min = round(total_kills / duration_mins, 2)
        deaths_per_min = round(total_deaths / duration_mins, 2)
        assists_per_min = round(total_assists / duration_mins, 2)
        kda_ratio = compute_kda(total_kills, total_deaths, total_assists)

        damage_per_min = round(kills_per_min * 1800.0 + souls_per_min * 1.5, 1)
        damage_taken_per_min = round(deaths_per_min * 1400.0 + 300.0, 1)

        wins_list = [1 if is_live_match_won(m) else 0 for m in matches]
        wins = sum(wins_list)
        lane_win_rate = round(wins / n, 2)
        flex_slot_unlock_time = round(max(600.0, 1650.0 - 280.0 * lane_win_rate - 95.0 * kda_ratio), 1)

        guardian_kills = round(sum(m.get("guardian_kills", 2) for m in matches) / n, 1)
        walker_kills = round(sum(m.get("walker_kills", 1) for m in matches) / n, 1)
        urn_deliveries = round(sum(m.get("urn_deliveries", 1) for m in matches) / n, 1)
        mid_boss_participations = round(sum(m.get("mid_boss_participations", 1) for m in matches) / n, 1)
        patron_damage_share = round(min(0.45, max(0.02, 0.08 + 0.06 * lane_win_rate + 0.03 * kda_ratio)), 2)

        # 4. Psychology, Tilt & Retention
        recent_loss_streak = 0
        for won in wins_list:
            if won == 0:
                recent_loss_streak += 1
            else:
                break

        if wins_list and wins_list[0] == 1:
            current_streak = 0
            for won in wins_list:
                if won == 1:
                    current_streak += 1
                else:
                    break
        else:
            current_streak = -recent_loss_streak

        night_matches = 0
        start_times: List[int] = []
        for m in matches:
            st = int(m.get("start_time") or 0)
            if st > 0:
                start_times.append(st)
                hour = datetime.fromtimestamp(st, tz=timezone.utc).hour
                if 0 <= hour < 6:
                    night_matches += 1
        night_owl_pct = round(night_matches / n, 2)

        abandons = sum(1 for m in matches if (m.get("abandoned_time_s") or 0) > 0)
        abandon_rate = round(abandons / n, 2)
        early_quit_rate = abandon_rate

        acc_drop = max(0.0, (old_acc - rec_acc) / 100.0)
        tilt_index = compute_tilt_index(recent_loss_streak, abandon_rate, night_owl_pct, acc_drop)

        pause_tilt_frequency = round(min(1.0, (tilt_index / 100.0) * 0.4), 2)
        demotion_risk_pct = round(min(100.0, max(0.0, (0.5 - lane_win_rate) * 150.0 + recent_loss_streak * 9.5)), 1)

        # Chronological timestamp gap drift (matching collect_data.py)
        chron_ts = sorted([t for t in start_times if t > 0])
        gaps_s = [float(chron_ts[i] - chron_ts[i - 1]) for i in range(1, len(chron_ts)) if chron_ts[i] > chron_ts[i - 1]]
        if len(gaps_s) >= 4:
            g_old = sum(gaps_s[:-3]) / max(1, len(gaps_s) - 3)
            g_rec = sum(gaps_s[-3:]) / 3.0
            match_frequency_drift = round(max(-1.0, min(3.0, (g_rec - g_old) / max(3600.0, g_old))), 3)
        else:
            match_frequency_drift = 0.0

        # Session burst fatigue (matching collect_data.py)
        burst_count = 1
        for i in range(len(chron_ts) - 1, 0, -1):
            if (chron_ts[i] - chron_ts[i - 1]) <= 5400:
                burst_count += 1
            else:
                break
        session_fatigue_index = round(min(1.0, burst_count / 8.0), 3)
        ping_frustration_marker = round(min(1.0, (deaths_per_min / 0.5) * 0.5 + (tilt_index / 100.0) * 0.5), 3)
        rejoin_latency_s = round(abandon_rate * 160.0 + early_quit_rate * 220.0, 1)

        return {
            "shots_hit": float(avg_shots_hit),
            "shots_missed": float(avg_shots_missed),
            "total_shots": float(total_shots / n),
            "accuracy_pct": float(accuracy_pct),
            "crit_shots_hit": float(avg_crit_shots),
            "crit_accuracy_pct": float(crit_accuracy_pct),
            "headshot_ratio": float(headshot_ratio),
            "accuracy_trend_last5": float(accuracy_trend_last5),
            "aim_consistency": float(aim_consistency),
            "watched_death_replays": float(avg_death_replays),
            "death_replay_view_ratio": float(death_replay_view_ratio),
            "crosshair_on_target_pct": float(crosshair_on_target_pct),

            "souls_per_min": float(souls_per_min),
            "net_worth_10m": float(net_worth_10m),
            "net_worth_20m": float(net_worth_20m),
            "net_worth_end": float(net_worth_end),
            "last_hits_per_min": float(last_hits_per_min),
            "denies_per_min": float(denies_per_min),
            "orb_secure_rate": float(orb_secure_rate),
            "orb_steal_rate": float(orb_steal_rate),
            "ability_unlock_pace": float(ability_unlock_pace),
            "tier3_item_timing": float(tier3_item_timing),
            "tier4_item_timing": float(tier4_item_timing),
            "flex_slot_unlock_time": float(flex_slot_unlock_time),

            "kills_per_min": float(kills_per_min),
            "deaths_per_min": float(deaths_per_min),
            "assists_per_min": float(assists_per_min),
            "kda_ratio": float(kda_ratio),
            "damage_per_min": float(damage_per_min),
            "damage_taken_per_min": float(damage_taken_per_min),
            "lane_win_rate": float(lane_win_rate),
            "guardian_kills": float(guardian_kills),
            "walker_kills": float(walker_kills),
            "urn_deliveries": float(urn_deliveries),
            "mid_boss_participations": float(mid_boss_participations),
            "patron_damage_share": float(patron_damage_share),

            "tilt_index": float(tilt_index),
            "recent_loss_streak": float(recent_loss_streak),
            "current_streak": float(current_streak),
            "night_owl_pct": float(night_owl_pct),
            "abandon_rate": float(abandon_rate),
            "early_quit_rate": float(early_quit_rate),
            "pause_tilt_frequency": float(pause_tilt_frequency),
            "demotion_risk_pct": float(demotion_risk_pct),
            "match_frequency_drift": float(match_frequency_drift),
            "session_fatigue_index": float(session_fatigue_index),
            "ping_frustration_marker": float(ping_frustration_marker),
            "rejoin_latency_s": float(rejoin_latency_s),
        }

    @classmethod
    def _extract_context_and_hidden_gems(
        cls,
        account_id: int,
        matches: List[Dict[str, Any]],
        base_features: Dict[str, float],
        mate_stats: Optional[List[Dict[str, Any]]] = None,
        acute_metadata: Optional[List[Dict[str, Any]]] = None,
    ) -> Tuple[Dict[str, float], Dict[str, Any]]:
        """
        Computes behavioral context, real Source 2 Hidden Gems (from /mate-stats & /matches/metadata),
        and pure in-game interactions matching `enrich_hidden_gems.py`.
        """
        full = dict(base_features)
        n = max(1, len(matches))

        # Window context features
        wins_list = [1 if is_live_match_won(m) else 0 for m in matches]
        durations_min = [max(5.0, float(m.get("match_duration_s") or m.get("duration_s") or 1800) / 60.0) for m in matches]
        souls_list = [float(m.get("net_worth") or 0.0) for m in matches]
        win_rate = float(sum(wins_list) / n) if matches else 0.5
        full["win_rate"] = win_rate

        older_idx = max(1, min(n - 1, 5))
        if n >= 2:
            rec_w = wins_list[:older_idx]
            old_w = wins_list[older_idx:]
            win_rate_trend = (sum(rec_w) / len(rec_w)) - (sum(old_w) / len(old_w))
            rec_spm = sum(souls_list[:older_idx]) / max(1.0, sum(durations_min[:older_idx]))
            old_spm = sum(souls_list[older_idx:]) / max(1.0, sum(durations_min[older_idx:]))
            souls_per_min_trend = rec_spm - old_spm
        else:
            win_rate_trend = 0.0
            souls_per_min_trend = 0.0
        full["win_rate_trend"] = round(win_rate_trend, 4)
        full["souls_per_min_trend"] = round(souls_per_min_trend, 2)

        recent_stomp_losses = sum(
            1 for i in range(min(5, len(matches)))
            if wins_list[i] == 0 and durations_min[i] < 24.0
        )
        full["recent_stomp_losses"] = float(recent_stomp_losses)
        full["match_T_stomp_loss"] = 1.0 if (matches and wins_list[0] == 0 and durations_min[0] < 24.0) else 0.0
        full["match_T_abandoned"] = 1.0 if (matches and (matches[0].get("abandoned_time_s") or 0) > 0) else 0.0
        full["low_pri_rate"] = float(sum(1 for m in matches if m.get("low_pri_pool")) / n) if matches else 0.0

        # Session grouping (5400s idle gap)
        chron = sorted([m for m in matches if int(m.get("start_time") or 0) > 0], key=lambda x: int(x["start_time"]))
        if chron:
            sessions: List[List[Dict[str, Any]]] = [[chron[0]]]
            for m in chron[1:]:
                if int(m["start_time"]) - int(sessions[-1][-1]["start_time"]) <= 5400:
                    sessions[-1].append(m)
                else:
                    sessions.append([m])
            avg_session_games = float(np.mean([len(s) for s in sessions]))
            avg_session_duration_min = float(
                np.mean([sum(max(5.0, float(x.get("match_duration_s") or x.get("duration_s") or 1800) / 60.0) for x in s) for s in sessions])
            )
        else:
            avg_session_games = 2.0
            avg_session_duration_min = 60.0
        full["avg_session_games"] = round(avg_session_games, 3)
        full["avg_session_duration_min"] = round(avg_session_duration_min, 2)

        # Gem #6: Social Party Shield from /mate-stats (filtered strictly <= latest_match_id in window)
        latest_match_id = max((int(m.get("match_id") or 0) for m in matches), default=0) if matches else 0
        party_set: Set[int] = set()
        if isinstance(mate_stats, list):
            for entry in mate_stats:
                mids = [
                    int(mid)
                    for mid in (entry.get("matches") or [])
                    if latest_match_id <= 0 or int(mid) <= latest_match_id
                ]
                if len(mids) >= 2:
                    party_set.update(mids)

        if matches and party_set:
            is_party_flags = [1 if int(m.get("match_id") or 0) in party_set else 0 for m in matches]
            party_play_pct = float(np.mean(is_party_flags))
            match_T_is_solo = 1.0 if is_party_flags[0] == 0 else 0.0
            solo_isolation_streak = 0
            for fl in is_party_flags:
                if fl == 0:
                    solo_isolation_streak += 1
                else:
                    break
            rec_p = float(np.mean(is_party_flags[:5])) if len(is_party_flags) >= 5 else party_play_pct
            old_p = float(np.mean(is_party_flags[5:])) if len(is_party_flags) > 5 else party_play_pct
            party_abandonment_drift = float(old_p - rec_p)
        else:
            # Conservative fallback when /mate-stats is unavailable (no all-20 bug)
            party_play_pct = round(max(0.05, min(0.85, 0.55 - (full["tilt_index"] / 200.0))), 2)
            match_T_is_solo = 1.0 if full["recent_loss_streak"] >= 2 else 0.0
            solo_isolation_streak = min(len(matches), int(full["recent_loss_streak"])) if matches else 0
            party_abandonment_drift = 0.0

        # Parse real Source 2 acute metadata from /v1/matches/metadata
        acute_gems: List[Dict[str, Any]] = []
        if isinstance(acute_metadata, list):
            for m_obj in acute_metadata:
                if not isinstance(m_obj, dict) or not m_obj.get("players"):
                    continue
                dur_s = float(max(60, int(m_obj.get("duration_s") or 1800)))
                for p in m_obj.get("players") or []:
                    if int(p.get("account_id") or 0) != int(account_id):
                        continue
                    fstats = p.get("final_stats") or {}
                    cstats = fstats.get("custom_user_stats") or {}
                    ddur_arr = p.get("death_details_death_duration_s") or []
                    ttk_arr = p.get("death_details_time_to_kill_s") or []
                    sold_arr = p.get("items_sold_time_s") or []

                    sh_hit = float(fstats.get("shots_hit") or 0.0)
                    sh_miss = float(fstats.get("shots_missed") or 0.0)
                    out_hs = float(cstats.get("Bullet Stats##HeadshotRate") or 0.0)
                    inc_hs = float(cstats.get("Bullet Stats - Incoming##HeadshotRate") or 0.0)
                    immobile_hs = float(cstats.get("Enemy Hero Accuracy##Immobile Headshots") or 0.0)
                    stun_hs = float(cstats.get("Bullet Stats##StunHeadshotHitRate") or 0.0)
                    parry_miss = float(cstats.get("Parry Miss") or 0.0)
                    melee_kills = float(fstats.get("melee_kills") or 0.0)
                    gold_loss = float(fstats.get("gold_death_loss") or 0.0)
                    gold_treas = float(fstats.get("gold_treasure") or 0.0)
                    teammate_supp = float(fstats.get("teammate_healing") or 0.0) + float(fstats.get("teammate_barriering") or 0.0)

                    valid_ddur = [float(x) for x in ddur_arr if x is not None and float(x) > 0]
                    gs_ratio = float(min(0.65, sum(valid_ddur) / dur_s))
                    valid_ttk = [float(x) for x in ttk_arr if x is not None and 0.05 < float(x) < 60.0]
                    avg_ttk = float(np.mean(valid_ttk)) if valid_ttk else 6.5
                    sold_times = [int(x) for x in sold_arr if x is not None and int(x) > 0]
                    late_sold = sum(1 for t in sold_times if t >= (dur_s - 120.0))
                    is_rage_sell = 1 if (late_sold >= 3 or len(sold_times) >= 6) else 0

                    acute_gems.append({
                        "duration_s": dur_s,
                        "shots_hit": sh_hit,
                        "shots_missed": sh_miss,
                        "out_hs_rate": out_hs,
                        "inc_hs_rate": inc_hs,
                        "stun_hs_rate": stun_hs + (immobile_hs / max(1.0, dur_s / 60.0)) * 5.0,
                        "parry_miss": parry_miss,
                        "melee_kills": melee_kills,
                        "gold_death_loss": gold_loss,
                        "gold_treasure": gold_treas,
                        "teammate_support": teammate_supp,
                        "grey_screen_ratio": gs_ratio,
                        "avg_ttk_s": avg_ttk,
                        "items_sold_cnt": len(sold_times),
                        "late_sold_cnt": late_sold,
                        "is_rage_sell": is_rage_sell,
                    })

        if acute_gems:
            real_sh_hit = float(np.mean([g["shots_hit"] for g in acute_gems]))
            real_sh_miss = float(np.mean([g["shots_missed"] for g in acute_gems]))
            if (real_sh_hit + real_sh_miss) > 0:
                real_acc_pct = (real_sh_hit / (real_sh_hit + real_sh_miss)) * 100.0
                full["shots_hit"] = real_sh_hit
                full["shots_missed"] = real_sh_miss
                full["accuracy_pct"] = round(real_acc_pct, 2)
                full["crosshair_on_target_pct"] = round(min(100.0, real_acc_pct * 1.4), 1)
            real_hs_pct = float(np.mean([g["out_hs_rate"] for g in acute_gems]))
            if real_hs_pct > 0:
                full["headshot_ratio"] = round(real_hs_pct / 100.0, 3)

            unsecured_souls_lost_per_min = float(np.mean([g["gold_death_loss"] / max(1.0, g["duration_s"] / 60.0) for g in acute_gems]))
            match_T_unsecured_souls_lost = float(acute_gems[0]["gold_death_loss"])
            unsecured_treasure_ratio = float(np.mean([
                g["gold_death_loss"] / max(100.0, g["gold_treasure"] + g["gold_death_loss"] + 250.0)
                for g in acute_gems
            ]))
            headshot_diff_rate = float(np.mean([g["out_hs_rate"] - g["inc_hs_rate"] for g in acute_gems]))
            incoming_headshot_rate = float(np.mean([g["inc_hs_rate"] for g in acute_gems]))
            stun_headshots_taken_rate = float(np.mean([g["stun_hs_rate"] for g in acute_gems]))
            parry_miss_per_match = float(np.mean([g["parry_miss"] for g in acute_gems]))
            melee_kill_rate = float(np.mean([g["melee_kills"] for g in acute_gems]))
            grey_screen_ratio = float(np.mean([g["grey_screen_ratio"] for g in acute_gems]))
            avg_time_to_kill_s = float(np.mean([g["avg_ttk_s"] for g in acute_gems]))
            items_sold_per_match = float(np.mean([g["items_sold_cnt"] for g in acute_gems]))
            rage_sell_rate = float(np.mean([g["is_rage_sell"] for g in acute_gems]))
            late_panic_sells = float(np.mean([g["late_sold_cnt"] for g in acute_gems]))
            teammate_support_per_min = float(np.mean([g["teammate_support"] / max(1.0, g["duration_s"] / 60.0) for g in acute_gems]))
        else:
            unsecured_souls_lost_per_min = round(full["deaths_per_min"] * 45.0, 2)
            match_T_unsecured_souls_lost = round(unsecured_souls_lost_per_min * (durations_min[0] if durations_min else 30.0), 1)
            unsecured_treasure_ratio = round(min(0.65, full["deaths_per_min"] * 0.45), 3)
            headshot_diff_rate = round((full["headshot_ratio"] - 0.22) * 100.0, 2)
            incoming_headshot_rate = round(16.0 + full["deaths_per_min"] * 10.0, 2)
            stun_headshots_taken_rate = round(max(0.1, full["deaths_per_min"] * 2.4 * (1.5 if full["tilt_index"] >= 50 else 1.0)), 3)
            parry_miss_per_match = round(max(0.2, full["deaths_per_min"] * 6.5), 2)
            melee_kill_rate = round(full["kills_per_min"] * 2.0, 2)
            grey_screen_ratio = round(min(0.45, max(0.03, full["deaths_per_min"] * 0.45)), 4)
            avg_time_to_kill_s = round(max(4.0, 16.0 - (full["tilt_index"] * 0.08)), 1)
            items_sold_per_match = round(2.0 + (full["tilt_index"] / 25.0), 2)
            rage_sell_rate = 1.0 if full["tilt_index"] >= 60.0 else (0.5 if full["tilt_index"] >= 35.0 else 0.1)
            late_panic_sells = 2.0 if full["tilt_index"] >= 60.0 else (1.0 if full["tilt_index"] >= 35.0 else 0.0)
            teammate_support_per_min = round(max(5.0, full["assists_per_min"] * 110.0 * (1.2 if full["tilt_index"] < 30 else 0.7)), 1)

        heartbreak_cnt = 0
        for i, m in enumerate(matches[:8]):
            k = float(m.get("player_kills") or 0)
            d = float(m.get("player_deaths") or 0)
            a = float(m.get("player_assists") or 0)
            kda_m = (k + 0.5 * a) / max(1.0, d)
            if wins_list[i] == 0 and durations_min[i] >= 33.0 and kda_m >= 1.45:
                heartbreak_cnt += 1
        match_T_heartbreak_loss = 0.0
        if matches:
            k0 = float(matches[0].get("player_kills") or 0)
            d0 = float(matches[0].get("player_deaths") or 0)
            a0 = float(matches[0].get("player_assists") or 0)
            kda0 = (k0 + 0.5 * a0) / max(1.0, d0)
            if wins_list[0] == 0 and durations_min[0] >= 33.0 and kda0 >= 1.45:
                match_T_heartbreak_loss = 1.0

        gems = {
            "unsecured_souls_lost_per_min": round(unsecured_souls_lost_per_min, 3),
            "match_T_unsecured_souls_lost": round(match_T_unsecured_souls_lost, 1),
            "unsecured_treasure_ratio": round(unsecured_treasure_ratio, 4),
            "headshot_diff_rate": round(headshot_diff_rate, 3),
            "incoming_headshot_rate": round(incoming_headshot_rate, 3),
            "stun_headshots_taken_rate": round(stun_headshots_taken_rate, 3),
            "parry_miss_per_match": round(parry_miss_per_match, 3),
            "melee_kill_rate": round(melee_kill_rate, 3),
            "grey_screen_ratio": round(grey_screen_ratio, 4),
            "avg_time_to_kill_s": round(avg_time_to_kill_s, 3),
            "items_sold_per_match": round(items_sold_per_match, 3),
            "rage_sell_rate": round(rage_sell_rate, 4),
            "late_panic_sells": round(late_panic_sells, 3),
            "party_play_pct": round(party_play_pct, 4),
            "solo_isolation_streak": float(solo_isolation_streak),
            "match_T_is_solo": float(match_T_is_solo),
            "party_abandonment_drift": round(party_abandonment_drift, 4),
            "throw_heartbreak_loss_rate": round(heartbreak_cnt / max(1, min(8, len(matches))), 4),
            "match_T_heartbreak_loss": float(match_T_heartbreak_loss),
            "teammate_support_per_min": round(teammate_support_per_min, 3),
        }
        full.update(gems)

        # Apply latest patch-era standardization before computing pure interactions
        full = ModelArtifactRegistry.standardize_live_base_features(full)

        full["ix_session_marathon_fatigue"] = (
            full["avg_session_duration_min"] / (full["avg_session_games"] + 0.5)
        ) * (0.5 + full["session_fatigue_index"])
        full["ix_ragequit_propensity"] = (
            full["abandon_rate"] * 3.0
            + full["early_quit_rate"] * 4.0
            + full["match_T_abandoned"] * 2.5
            + full["low_pri_rate"] * 1.5
        )
        full["ix_rank_anxiety"] = full["demotion_risk_pct"] * (
            0.4 + max(0.0, -full["win_rate_trend"])
        )
        full["ix_solo_x_loss_streak"] = full["solo_isolation_streak"] * (0.5 + full["recent_loss_streak"]) * (
            1.2 - full["party_play_pct"]
        )

        return full, gems

    @classmethod
    def predict_churn(
        cls,
        account_id: int,
        matches: List[Dict[str, Any]],
        archetype_override: Optional[Dict[str, Any]] = None,
        is_mock: bool = False,
        mate_stats: Optional[List[Dict[str, Any]]] = None,
        acute_metadata: Optional[List[Dict[str, Any]]] = None,
    ) -> PredictionResponse:
        """
        Executes calibrated ML inference on player telemetry using serialized Option A model.
        Returns PredictionResponse conforming strictly to ML_CONTRACT.md and spec_oracles.py.
        """
        if archetype_override:
            churn_prob = float(archetype_override.get("churn_probability", 0.50))
            risk_level = map_probability_to_risk(churn_prob)
            win_exp = float(archetype_override.get("win_expectancy", round(max(0.1, 1.0 - churn_prob), 2)))
            tilt = float(archetype_override.get("tilt_index", 50.0))

            factors = [
                FactorAttribution(
                    feature="recent_loss_streak",
                    impact=round(archetype_override.get("loss_streak", 3) * 0.08, 2),
                    direction="churn" if archetype_override.get("loss_streak", 0) > 1 else "retention",
                ),
                FactorAttribution(
                    feature="solo_isolation_streak",
                    impact=round((archetype_override.get("solo_isolation_streak", 0) - 1.5) * 0.06, 2) or -0.09,
                    direction="churn" if archetype_override.get("solo_isolation_streak", 0) >= 2 else "retention",
                ),
                FactorAttribution(
                    feature="headshot_ratio",
                    impact=-0.18 if archetype_override.get("headshot_ratio", 0.25) > 0.25 else 0.15,
                    direction="retention" if archetype_override.get("headshot_ratio", 0.25) > 0.25 else "churn",
                ),
                FactorAttribution(
                    feature="tilt_index",
                    impact=round((tilt - 30.0) / 100.0, 2),
                    direction="churn" if tilt > 30.0 else "retention",
                ),
            ]

            hidden_gems = {
                "solo_isolation_streak": archetype_override.get("solo_isolation_streak", 0),
                "party_play_pct": archetype_override.get("party_play_pct", 0.50),
                "headshot_diff_rate": archetype_override.get("headshot_diff_rate", 0.0),
                "stun_headshots_taken_rate": archetype_override.get("stun_headshots_taken_rate", 0.5),
                "parry_miss_per_match": archetype_override.get("parry_miss_per_match", 1.5),
                "grey_screen_ratio": archetype_override.get("grey_screen_ratio", 0.10),
                "avg_time_to_kill_s": archetype_override.get("avg_time_to_kill_s", 12.0),
                "rage_sell_rate": archetype_override.get("rage_sell_rate", 0.0),
                "late_panic_sells": archetype_override.get("late_panic_sells", 0),
                "teammate_support_per_min": archetype_override.get("teammate_support_per_min", 35.0),
                "unsecured_souls_lost_per_min": archetype_override.get("unsecured_souls_lost_per_min", 18.0),
            }

            return PredictionResponse(
                account_id=account_id,
                churn_probability=round(churn_prob, 2),
                risk_level=risk_level,
                win_expectancy=round(win_exp, 2),
                tilt_index=round(tilt, 1),
                key_contributing_factors=factors,
                is_mock=True,
                personaname=archetype_override.get("name_fr", f"Trooper_{account_id % 10000}"),
                features=archetype_override,
                hidden_gems=hidden_gems,
            )

        base_features = cls.extract_48_features(matches)
        full_features, hidden_gems = cls._extract_context_and_hidden_gems(
            account_id=account_id,
            matches=matches,
            base_features=base_features,
            mate_stats=mate_stats,
            acute_metadata=acute_metadata,
        )

        # Execute real ML inference from serialized Option A Gradient Boosting + StandardScaler
        churn_prob, factors = ModelArtifactRegistry.predict_proba_and_attributions(full_features)
        risk_level = map_probability_to_risk(churn_prob)

        tilt = base_features["tilt_index"]
        kda = base_features["kda_ratio"]
        loss_streak = base_features["recent_loss_streak"]
        accuracy = base_features["accuracy_pct"]
        win_exp_raw = 0.50 + ((kda - 2.5) * 0.08) - (loss_streak * 0.06) + ((accuracy - 40.0) * 0.005)
        win_expectancy = min(0.95, max(0.05, round(win_exp_raw, 2)))

        return PredictionResponse(
            account_id=account_id,
            churn_probability=churn_prob,
            risk_level=risk_level,
            win_expectancy=win_expectancy,
            tilt_index=tilt,
            key_contributing_factors=factors[:4],
            is_mock=is_mock,
            personaname=f"Trooper_{account_id % 10000}",
            features=base_features,
            hidden_gems=hidden_gems,
        )
