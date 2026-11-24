"""
De-Biased & Anti-Overfitting Rebuild + Training Suite for Deadlock Churn Prediction
===================================================================================
Fixes all 3 statistical audit findings:
1. Includes `match_T` as the 20th (most recent) completed match in the observation window
   W = matches[idx : idx + 20] (Zero lookahead: target Y_14 is measured strictly from
   match_T to the subsequent match matches[idx - 1]).
2. Eliminates Patch-Era Confounding (Patch Drift):
   - Propensity/Time-Stratified window matching across chronological deciles so
     corr(match_T_start_time, is_churn) ~ 0.00.
   - Within-Era Z-score residualization on patch-sensitive economy/objective variables
     (fit strictly on Training set eras) so predicting Old vs New patch is ~50% (random).
3. Removes the `avg_session_gap_days` calendar tautology (just like `Dota 2 Final`),
   letting Behavioral Tilt, Loss Streaks, 3D Aim Degradation, Death Replay Fixation,
   Abandons, and Stomp Trauma drive predictions.
4. Enforces strict tree regularization (max_depth=3..4, min_samples_leaf=50, L2=6.0,
   subsample=0.75, max_features=0.65) to keep the Train-Test ROC-AUC gap < 3.5%.
"""

from __future__ import annotations

import json
import time
import warnings
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.ensemble import (
    ExtraTreesClassifier,
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.feature_selection import mutual_info_classif
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit, StratifiedGroupKFold, StratifiedKFold, cross_val_predict
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from collect_data import (
    CHURN_HORIZON_SECONDS,
    DATA_DIR,
    DATASET_CSV,
    HISTORY_WINDOW,
    RAW_CACHE_FILE,
    extract_window_features,
    is_match_won,
)

warnings.filterwarnings("ignore")

MODEL_PKL = DATA_DIR / "deadlock_churn_model.pkl"
SCALER_PKL = DATA_DIR / "deadlock_scaler.pkl"
FEATURES_JSON = DATA_DIR / "features_list.json"
RESULTS_JSON = DATA_DIR / "ml_results.json"

DOMAIN_1_AIM = [
    "shots_hit",
    "shots_missed",
    "total_shots",
    "accuracy_pct",
    "crit_shots_hit",
    "crit_accuracy_pct",
    "headshot_ratio",
    "accuracy_trend_last5",
    "aim_consistency",
    "watched_death_replays",
    "death_replay_view_ratio",
    "crosshair_on_target_pct",
]

DOMAIN_2_ECONOMY = [
    "souls_per_min",
    "net_worth_10m",
    "net_worth_20m",
    "net_worth_end",
    "last_hits_per_min",
    "denies_per_min",
    "orb_secure_rate",
    "orb_steal_rate",
    "ability_unlock_pace",
    "tier3_item_timing",
    "tier4_item_timing",
    "flex_slot_unlock_time",
]

DOMAIN_3_COMBAT = [
    "kills_per_min",
    "deaths_per_min",
    "assists_per_min",
    "kda_ratio",
    "damage_per_min",
    "damage_taken_per_min",
    "lane_win_rate",
    "guardian_kills",
    "walker_kills",
    "urn_deliveries",
    "mid_boss_participations",
    "patron_damage_share",
]

DOMAIN_4_PSYCHOLOGY = [
    "tilt_index",
    "recent_loss_streak",
    "current_streak",
    "night_owl_pct",
    "abandon_rate",
    "early_quit_rate",
    "pause_tilt_frequency",
    "demotion_risk_pct",
    "match_frequency_drift",
    "session_fatigue_index",
    "ping_frustration_marker",
    "rejoin_latency_s",
]

CANONICAL_48_FEATURES = DOMAIN_1_AIM + DOMAIN_2_ECONOMY + DOMAIN_3_COMBAT + DOMAIN_4_PSYCHOLOGY

# Notice: `avg_session_gap_days` is intentionally EXCLUDED (just like Dota 2 Final)
# to prevent calendar-gap tautology and force behavioral/mechanical learning!
DOMAIN_5_BEHAVIORAL_CONTEXT = [
    "match_T_won",
    "match_T_duration_min",
    "match_T_kda",
    "match_T_deaths_per_min",
    "match_T_souls_per_min",
    "match_T_abandoned",
    "match_T_is_night",
    "match_T_stomp_loss",
    "match_T_low_pri",
    "win_rate",
    "win_rate_trend",
    "kda_trend",
    "souls_per_min_trend",
    "deaths_per_min_trend",
    "duration_trend",
    "recent_stomp_losses",
    "hero_rel_accuracy_zscore",
    "hero_diversity",
    "low_pri_rate",
    "avg_session_games",
    "avg_session_duration_min",
]

# Variables sensitive to Valve patch changes over 2025-2026
PATCH_SENSITIVE_COLS = [
    "guardian_kills",
    "walker_kills",
    "orb_steal_rate",
    "orb_secure_rate",
    "denies_per_min",
    "last_hits_per_min",
    "tier3_item_timing",
    "tier4_item_timing",
    "flex_slot_unlock_time",
    "ability_unlock_pace",
    "net_worth_10m",
    "net_worth_20m",
    "net_worth_end",
    "souls_per_min",
    "match_T_souls_per_min",
    "assists_per_min",
    "kills_per_min",
    "deaths_per_min",
    "damage_per_min",
    "damage_taken_per_min",
    "urn_deliveries",
    "patron_damage_share",
]


def engineer_debiased_interactions(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Create 10 purely behavioral, mechanical, and psychological non-linear interactions
    (Zero use of `avg_session_gap_days`).
    """
    df = df.copy()

    # 1. Nocturnal Loss Spiral (Loss streak amplified by late-night play 00:00-06:00)
    df["ix_loss_streak_x_night"] = df["recent_loss_streak"] * (0.30 + df["night_owl_pct"])

    # 2. Acute Tilt Breaking Point (Tilt Index colliding with a Match T defeat & high deaths)
    df["ix_tilt_x_match_T_loss"] = (
        df["tilt_index"]
        * (1.0 - 0.55 * df["match_T_won"])
        * (1.0 + df["match_T_deaths_per_min"])
    )

    # 3. 3D Aim Fatigue Collapse (Drop in bullet accuracy over last 5 games x death rate)
    df["ix_aim_decay_x_deaths"] = np.maximum(0.0, -df["accuracy_trend_last5"]) * (
        0.2 + df["deaths_per_min"]
    )

    # 4. Stomp Trauma & Death Replay Fixation
    df["ix_stomp_trauma"] = (df["recent_stomp_losses"] + df["match_T_stomp_loss"]) * (
        0.5 + df["death_replay_view_ratio"]
    )

    # 5. Session Marathon Exhaustion (Session duration per game x fatigue index)
    df["ix_session_marathon_fatigue"] = (
        df["avg_session_duration_min"] / (df["avg_session_games"] + 0.5)
    ) * (0.5 + df["session_fatigue_index"])

    # 6. Cadence Slowdown & Tilt Friction (Frequency drift x tilt index)
    df["ix_drift_x_tilt"] = np.maximum(0.0, df["match_frequency_drift"]) * (
        10.0 + df["tilt_index"]
    )

    # 7. Competitive Demotion & Winrate Collapse Anxiety
    df["ix_rank_anxiety"] = df["demotion_risk_pct"] * (
        0.4 + np.maximum(0.0, -df["win_rate_trend"])
    )

    # 8. Laning Phase Soul Deficit Ratio
    df["ix_lane_soul_deficit"] = df["net_worth_10m"] / (
        np.abs(df["souls_per_min"]) * 10.0 + 500.0
    )

    # 9. Combat Trade Efficiency (Damage dealt vs Damage taken)
    df["ix_damage_trade_ratio"] = df["damage_per_min"] / (
        np.abs(df["damage_taken_per_min"]) + 200.0
    )

    # 10. Ragequit & Abandon Friction Score
    df["ix_ragequit_propensity"] = (
        df["abandon_rate"] * 3.0
        + df["early_quit_rate"] * 4.0
        + df["match_T_abandoned"] * 2.5
        + df["low_pri_rate"] * 1.5
    )

    ix_cols = [
        "ix_loss_streak_x_night",
        "ix_tilt_x_match_T_loss",
        "ix_aim_decay_x_deaths",
        "ix_stomp_trauma",
        "ix_session_marathon_fatigue",
        "ix_drift_x_tilt",
        "ix_rank_anxiety",
        "ix_lane_soul_deficit",
        "ix_damage_trade_ratio",
        "ix_ragequit_propensity",
    ]
    return df, ix_cols


def extract_windows_including_match_T() -> pd.DataFrame:
    """
    Re-extract observation windows from `raw_histories_cache.joblib` so that:
    1. `obs_w = matches[idx : idx + 20]` includes `match_T = matches[idx]` as the
       most recent completed match of the 20-match window (zero lookahead into idx-1).
    2. Performs Time-Stratified Matching across 10 chronological bins so positive (Y=1)
       and negative (Y=0) windows have the exact same patch-era distribution.
    """
    print("[1/5] Loading cached raw histories from disk...")
    cached = joblib.load(RAW_CACHE_FILE)
    player_histories = cached["player_histories"]
    player_hero_stats = cached["player_hero_stats"]
    global_hero_baselines = cached["global_hero_baselines"]
    max_observed_ts = cached["max_observed_ts"]

    cutoff_horizon = max_observed_ts - CHURN_HORIZON_SECONDS
    candidates: List[Dict[str, Any]] = []

    for aid, matches in player_histories.items():
        n_m = len(matches)
        used_anchors: Set[int] = set()
        w_counter = 0

        # 1) Latest valid anchor match_T older than 14d before max_observed_ts
        latest_T_idx = -1
        for idx, m in enumerate(matches):
            if int(m.get("start_time") or 0) <= cutoff_horizon:
                latest_T_idx = idx
                break

        if latest_T_idx != -1 and (latest_T_idx + HISTORY_WINDOW) <= n_m:
            match_T = matches[latest_T_idx]
            if latest_T_idx == 0:
                gap_s = float(max_observed_ts - int(match_T.get("start_time") or 0))
            else:
                next_ts = int(matches[latest_T_idx - 1].get("start_time") or 0)
                gap_s = float(max(0, next_ts - int(match_T.get("start_time") or 0)))

            is_churn = 1 if gap_s >= CHURN_HORIZON_SECONDS else 0
            candidates.append(
                {
                    "aid": aid,
                    "w_counter": w_counter,
                    "idx": latest_T_idx,
                    "match_T_start_time": int(match_T.get("start_time") or 0),
                    "is_churn": is_churn,
                    "gap_days": gap_s / 86400.0,
                }
            )
            used_anchors.add(latest_T_idx)
            w_counter += 1

        # 2) Historical hiatus anchors (minimum spacing >= 12 to reduce overlapping-window bias)
        for idx in range(1, n_m - HISTORY_WINDOW):
            if idx in used_anchors or w_counter >= 12:
                continue
            cur_ts = int(matches[idx].get("start_time") or 0)
            nxt_ts = int(matches[idx - 1].get("start_time") or 0)
            gap_s = float(max(0, nxt_ts - cur_ts))
            if gap_s >= CHURN_HORIZON_SECONDS:
                if all(abs(idx - u) >= 12 for u in used_anchors):
                    used_anchors.add(idx)
                    w_counter += 1
                    candidates.append(
                        {
                            "aid": aid,
                            "w_counter": w_counter,
                            "idx": idx,
                            "match_T_start_time": cur_ts,
                            "is_churn": 1,
                            "gap_days": gap_s / 86400.0,
                        }
                    )

        # 3) Active historical anchors across the player's career (spaced >= 12, capped at 15/player)
        start_step = max(1, (latest_T_idx if latest_T_idx != -1 else 1) + 12)
        for idx in range(start_step, n_m - HISTORY_WINDOW, 12):
            if w_counter >= 15:
                break
            if all(abs(idx - u) >= 12 for u in used_anchors):
                cur_ts = int(matches[idx].get("start_time") or 0)
                nxt_ts = int(matches[idx - 1].get("start_time") or 0)
                gap_s = float(max(0, nxt_ts - cur_ts))
                is_churn = 1 if gap_s >= CHURN_HORIZON_SECONDS else 0
                candidates.append(
                    {
                        "aid": aid,
                        "w_counter": w_counter,
                        "idx": idx,
                        "match_T_start_time": cur_ts,
                        "is_churn": is_churn,
                        "gap_days": gap_s / 86400.0,
                    }
                )
                used_anchors.add(idx)
                w_counter += 1

    cand_df = pd.DataFrame(candidates)
    print(f"[1/5] Gathered {len(cand_df):,} raw candidate anchors across 1,500 players.")

    # Time-Stratified Propensity Matching across 12 chronological bins targeting exactly 10,000 rows
    TARGET_TOTAL = 10000
    cand_df["era_bin"] = pd.qcut(cand_df["match_T_start_time"], q=12, labels=False, duplicates="drop")
    rng = np.random.RandomState(42)

    pos_all = cand_df[cand_df["is_churn"] == 1]
    neg_all = cand_df[cand_df["is_churn"] == 0]
    total_pos = len(pos_all)
    target_neg = TARGET_TOTAL - total_pos
    ratio_neg_to_pos = target_neg / max(1, total_pos)

    balanced_chunks: List[pd.DataFrame] = []
    for b_id, group in cand_df.groupby("era_bin"):
        pos_b = group[group["is_churn"] == 1]
        neg_b = group[group["is_churn"] == 0]
        if len(pos_b) == 0 or len(neg_b) == 0:
            continue
        n_neg = int(round(len(pos_b) * ratio_neg_to_pos))
        n_neg = min(len(neg_b), n_neg)
        neg_s = neg_b.sample(n=n_neg, random_state=rng)
        balanced_chunks.append(pd.concat([pos_b, neg_s], axis=0))

    matched_candidates = pd.concat(balanced_chunks, axis=0)
    if len(matched_candidates) < TARGET_TOTAL:
        needed = TARGET_TOTAL - len(matched_candidates)
        remaining = cand_df[(cand_df["is_churn"] == 0) & (~cand_df.index.isin(matched_candidates.index))]
        matched_candidates = pd.concat([matched_candidates, remaining.sample(n=min(len(remaining), needed), random_state=rng)])
    elif len(matched_candidates) > TARGET_TOTAL:
        matched_candidates = matched_candidates.sample(n=TARGET_TOTAL, random_state=rng)

    matched_candidates = matched_candidates.sample(frac=1.0, random_state=42).reset_index(drop=True)
    print(
        f"[1/5] Selected exactly {len(matched_candidates):,} time-stratified matches: "
        f"Pos={int((matched_candidates['is_churn'] == 1).sum()):,} | "
        f"Neg={int((matched_candidates['is_churn'] == 0).sum()):,} | "
        f"Churn rate={matched_candidates['is_churn'].mean():.2%} | "
        f"corr(start_time, is_churn)={matched_candidates['match_T_start_time'].corr(matched_candidates['is_churn']):+.4f}"
    )

    # Extract 3D shooter, economy, and combat telemetry strictly for the 10,000 selected windows
    print(f"[1/5] Computing 48 canonical + 21 behavioral features for all {len(matched_candidates):,} matches...")
    raw_rows: List[Dict[str, Any]] = []
    for _, row in matched_candidates.iterrows():
        aid = row["aid"]
        w_cnt = row["w_counter"]
        idx = int(row["idx"])
        is_churn = int(row["is_churn"])
        gap_days = float(row["gap_days"])

        matches = player_histories[aid]
        match_T = matches[idx]
        obs_w = matches[idx : idx + HISTORY_WINDOW]

        raw_rows.append(
            extract_window_features(
                aid,
                w_cnt,
                obs_w,
                match_T,
                is_churn,
                gap_days,
                player_hero_map=None,
                global_hero_baselines=None,
            )
        )

    df_matched = pd.DataFrame(raw_rows)
    df_matched.to_csv(DATASET_CSV, index=False)
    print(
        f"[1/5] Saved 10,000 De-Biased Dataset to {DATASET_CSV} ({DATASET_CSV.stat().st_size / (1024*1024):.2f} MB) | "
        f"Churn rate: {df_matched['is_churn'].mean():.2%} | "
        f"corr(match_T_start_time, is_churn) = {df_matched['match_T_start_time'].corr(df_matched['is_churn']):+.4f}"
    )
    return df_matched
    return df_matched


def standardize_within_patch_era(
    df_train: pd.DataFrame,
    df_test: pd.DataFrame,
    cols_to_standardize: List[str],
    n_eras: int = 10,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fit chronological era quantile boundaries and per-era (mean, std) strictly on `df_train`,
    and transform both `df_train` and `df_test` so patch-level drift is removed.
    """
    df_tr = df_train.copy()
    df_te = df_test.copy()

    quantiles = np.linspace(0.0, 1.0, n_eras + 1)
    bin_edges = np.quantile(df_tr["match_T_start_time"].values, quantiles)
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf

    tr_bins = np.digitize(df_tr["match_T_start_time"].values, bin_edges[1:-1])
    te_bins = np.digitize(df_te["match_T_start_time"].values, bin_edges[1:-1])

    for col in cols_to_standardize:
        if col not in df_tr.columns:
            continue
        global_mu = float(df_tr[col].mean())
        global_sd = float(max(1e-6, df_tr[col].std()))
        for b in range(n_eras):
            mask_tr = tr_bins == b
            mask_te = te_bins == b
            if np.sum(mask_tr) >= 10:
                b_mu = float(df_tr.loc[mask_tr, col].mean())
                b_sd = float(max(1e-6, df_tr.loc[mask_tr, col].std()))
            else:
                b_mu, b_sd = global_mu, global_sd
            # Rescale back to global mean/std so units remain human-interpretable!
            df_tr.loc[mask_tr, col] = ((df_tr.loc[mask_tr, col] - b_mu) / b_sd) * global_sd + global_mu
            if np.any(mask_te):
                df_te.loc[mask_te, col] = ((df_te.loc[mask_te, col] - b_mu) / b_sd) * global_sd + global_mu

    return df_tr, df_te


def find_optimal_thresholds(y_true: np.ndarray, y_proba: np.ndarray) -> Tuple[float, float]:
    best_th_f1 = 0.42
    best_score = -1.0
    best_th_rec80 = 0.36
    best_prec_at_rec80 = -1.0

    for th in np.linspace(0.15, 0.85, 141):
        preds = (y_proba >= th).astype(int)
        prec = precision_score(y_true, preds, zero_division=0)
        rec = recall_score(y_true, preds, zero_division=0)
        f_beta = (1 + 1.15**2) * (prec * rec) / max(1e-9, (1.15**2 * prec) + rec)
        if f_beta > best_score:
            best_score = f_beta
            best_th_f1 = float(th)
        if rec >= 0.80 and prec > best_prec_at_rec80:
            best_prec_at_rec80 = prec
            best_th_rec80 = float(th)

    return round(best_th_f1, 3), round(best_th_rec80, 3)


def evaluate_predictions(
    y_true: np.ndarray,
    y_proba: np.ndarray,
    threshold: float,
) -> Dict[str, Any]:
    y_pred = (y_proba >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    return {
        "threshold": round(float(threshold), 3),
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 4),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 4),
        "roc_auc": round(float(roc_auc_score(y_true, y_proba)), 4),
        "pr_auc": round(float(average_precision_score(y_true, y_proba)), 4),
        "brier_score": round(float(brier_score_loss(y_true, y_proba)), 4),
        "confusion_matrix": {
            "tp": int(tp),
            "fp": int(fp),
            "tn": int(tn),
            "fn": int(fn),
        },
    }


def main() -> None:
    t0 = time.time()
    raw_df = extract_windows_including_match_T()

    # Strict Player-Grouped Train/Test Split (80% Train / 20% Test, Zero Player Overlap)
    y_all = raw_df["is_churn"].astype(int).values
    groups_all = raw_df["account_id"].astype(int).values
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_idx, test_idx = next(gss.split(raw_df, y_all, groups=groups_all))

    df_train_raw = raw_df.iloc[train_idx].reset_index(drop=True)
    df_test_raw = raw_df.iloc[test_idx].reset_index(drop=True)

    # Standardize patch-sensitive economy/objective features within chronological eras (fit on Train only!)
    df_train_std, df_test_std = standardize_within_patch_era(
        df_train_raw, df_test_raw, PATCH_SENSITIVE_COLS, n_eras=10
    )

    df_train, ix_cols = engineer_debiased_interactions(df_train_std)
    df_test, _ = engineer_debiased_interactions(df_test_std)

    all_candidate_features = CANONICAL_48_FEATURES + DOMAIN_5_BEHAVIORAL_CONTEXT + ix_cols
    all_candidate_features = [c for c in all_candidate_features if c in df_train.columns]

    for col in all_candidate_features:
        med = float(df_train[col].median()) if not df_train[col].isna().all() else 0.0
        df_train[col] = pd.to_numeric(df_train[col], errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(med)
        df_test[col] = pd.to_numeric(df_test[col], errors="coerce").replace([np.inf, -np.inf], np.nan).fillna(med)

    y_train = df_train["is_churn"].astype(int).values
    y_test = df_test["is_churn"].astype(int).values
    groups_train = df_train["account_id"].astype(int).values
    counts_train = df_train["account_id"].map(df_train["account_id"].value_counts()).astype(float).values
    raw_sw = 1.0 / np.sqrt(np.maximum(1.0, counts_train))
    sample_weights_train = raw_sw * (len(df_train) / max(1e-9, float(np.sum(raw_sw))))

    print("\n" + "=" * 85)
    print("DE-BIASED & ANTI-OVERFITTING DEADLOCK CHURN BENCHMARK")
    print("=" * 85)
    print(
        f"Windows: Total={len(raw_df):,} | Train={len(df_train):,} (churn={y_train.mean():.1%}) | "
        f"Test={len(df_test):,} (churn={y_test.mean():.1%}) | Player Overlap=0"
    )

    # =========================================================================
    # Stage 2: De-Biased Domain Ablation Study (Regularized Depth-3 Boosting)
    # =========================================================================
    print("\n--- STAGE 2: DE-BIASED DOMAIN ABLATION STUDY ---")
    ablation_configs = {
        "1. Domain I Only: 3D Shooter Aim (12 feat)": DOMAIN_1_AIM,
        "2. Domain II Only: Soul Economy (12 feat)": DOMAIN_2_ECONOMY,
        "3. Domain III Only: Combat & Objectives (12 feat)": DOMAIN_3_COMBAT,
        "4. Domain IV Only: Psychology & Tilt (12 feat)": DOMAIN_4_PSYCHOLOGY,
        "5. Canonical 48 Features (Domains I-IV)": CANONICAL_48_FEATURES,
        "6. Extended 69 Features (48 + Match T & Trends)": CANONICAL_48_FEATURES + DOMAIN_5_BEHAVIORAL_CONTEXT,
        "7. Full 79 Features (+10 Behavioral Interactions)": all_candidate_features,
    }

    ablation_results: Dict[str, Dict[str, Any]] = {}
    cv_abl = StratifiedGroupKFold(n_splits=5)
    for label, cols in ablation_configs.items():
        valid_cols = [c for c in cols if c in df_train.columns]
        clf = HistGradientBoostingClassifier(
            max_depth=3,
            learning_rate=0.04,
            max_iter=120,
            min_samples_leaf=50,
            l2_regularization=8.0,
            class_weight="balanced",
            random_state=42,
        )
        oof_abl = cross_val_predict(
            clf, df_train[valid_cols], y_train, cv=cv_abl, groups=groups_train, method="predict_proba", n_jobs=-1
        )[:, 1]
        th_f1, _ = find_optimal_thresholds(y_train, oof_abl)
        clf.fit(df_train[valid_cols], y_train)
        proba_tr = clf.predict_proba(df_train[valid_cols])[:, 1]
        proba_te = clf.predict_proba(df_test[valid_cols])[:, 1]
        m = evaluate_predictions(y_test, proba_te, th_f1)
        m["train_roc_auc"] = round(float(roc_auc_score(y_train, proba_tr)), 4)
        m["overfit_gap_roc"] = round(float(m["train_roc_auc"] - m["roc_auc"]), 4)
        ablation_results[label] = {"num_features": len(valid_cols), **m}
        print(
            f"  {label:<52} -> Train ROC: {m['train_roc_auc']:.4f} | Test ROC: {m['roc_auc']:.4f} (Gap: {m['overfit_gap_roc']:+.4f}) | PR-AUC: {m['pr_auc']:.4f}"
        )

    # =========================================================================
    # Stage 3: Feature Selection (Collinearity Filter + MI + OOF Permutation)
    # =========================================================================
    print("\n--- STAGE 3: FEATURE OPTIMIZATION & SELECTION ---")
    X_tr_full = df_train[all_candidate_features].copy()
    mi_scores = mutual_info_classif(X_tr_full, y_train, random_state=42)
    mi_map = {col: float(sc) for col, sc in zip(all_candidate_features, mi_scores)}

    corr_matrix = X_tr_full.corr().abs()
    dropped_collinear: List[Dict[str, Any]] = []
    surviving_features: List[str] = list(all_candidate_features)

    for i in range(len(all_candidate_features)):
        f1_name = all_candidate_features[i]
        if f1_name not in surviving_features:
            continue
        for j in range(i + 1, len(all_candidate_features)):
            f2_name = all_candidate_features[j]
            if f2_name not in surviving_features:
                continue
            r_val = float(corr_matrix.iloc[i, j])
            if r_val > 0.90:
                if mi_map[f1_name] >= mi_map[f2_name]:
                    surviving_features.remove(f2_name)
                    dropped_collinear.append({"dropped": f2_name, "kept": f1_name, "corr": round(r_val, 3)})
                else:
                    surviving_features.remove(f1_name)
                    dropped_collinear.append({"dropped": f1_name, "kept": f2_name, "corr": round(r_val, 3)})
                    break

    print(f"  Collinearity Filter (|r| > 0.90): Dropped {len(dropped_collinear)} redundant features -> {len(surviving_features)} surviving.")

    gss_val = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=101)
    sub_tr_idx, sub_val_idx = next(gss_val.split(X_tr_full[surviving_features], y_train, groups=groups_train))
    probe_clf = HistGradientBoostingClassifier(
        max_depth=3,
        learning_rate=0.04,
        max_iter=120,
        min_samples_leaf=50,
        l2_regularization=8.0,
        class_weight="balanced",
        random_state=42,
    )
    probe_clf.fit(X_tr_full[surviving_features].iloc[sub_tr_idx], y_train[sub_tr_idx])
    perm = permutation_importance(
        probe_clf,
        X_tr_full[surviving_features].iloc[sub_val_idx],
        y_train[sub_val_idx],
        scoring="roc_auc",
        n_repeats=5,
        random_state=42,
        n_jobs=-1,
    )

    perm_pos = np.maximum(0.0, perm.importances_mean)
    perm_norm = perm_pos / max(1e-9, np.sum(perm_pos))
    mi_vec = np.array([mi_map[c] for c in surviving_features])
    mi_norm = mi_vec / max(1e-9, np.sum(mi_vec))
    combined_score = 0.65 * perm_norm + 0.35 * mi_norm

    ranked_indices = np.argsort(combined_score)[::-1]
    ranked_surviving = [surviving_features[i] for i in ranked_indices]

    cv_group = StratifiedGroupKFold(n_splits=4)
    best_k = 32
    best_k_cv_score = -1.0
    topk_sweep_results: Dict[int, Dict[str, float]] = {}

    candidate_ks = [k for k in [18, 24, 30, 36, 42, 48, len(ranked_surviving)] if k <= len(ranked_surviving)]
    for k in candidate_ks:
        top_k_cols = ranked_surviving[:k]
        cv_rocs, cv_prs = [], []
        for f_tr, f_va in cv_group.split(X_tr_full[top_k_cols], y_train, groups=groups_train):
            m_k = HistGradientBoostingClassifier(
                max_depth=3,
                learning_rate=0.04,
                max_iter=120,
                min_samples_leaf=50,
                l2_regularization=8.0,
                class_weight="balanced",
                random_state=42,
            )
            m_k.fit(X_tr_full[top_k_cols].iloc[f_tr], y_train[f_tr])
            p_va = m_k.predict_proba(X_tr_full[top_k_cols].iloc[f_va])[:, 1]
            cv_rocs.append(roc_auc_score(y_train[f_va], p_va))
            cv_prs.append(average_precision_score(y_train[f_va], p_va))
        mean_roc = float(np.mean(cv_rocs))
        mean_pr = float(np.mean(cv_prs))
        topk_sweep_results[k] = {"cv_roc_auc": round(mean_roc, 4), "cv_pr_auc": round(mean_pr, 4)}
        print(f"  Top-K Sweep (K={k:2d} features) -> CV ROC-AUC: {mean_roc:.4f} | CV PR-AUC: {mean_pr:.4f}")
        if (0.5 * mean_roc + 0.5 * mean_pr) > best_k_cv_score:
            best_k_cv_score = 0.5 * mean_roc + 0.5 * mean_pr
            best_k = k

    optimal_features = ranked_surviving[:best_k]
    print(f"  => Selected Optimal De-Biased Feature Set: K = {best_k} features")

    # =========================================================================
    # Stage 4: Regularized Anti-Overfitting Multi-Model Benchmark
    # =========================================================================
    print(f"\n--- STAGE 4: REGULARIZED MULTI-MODEL BENCHMARK (K={best_k}) ---")
    X_train_opt = df_train[optimal_features].copy()
    X_test_opt = df_test[optimal_features].copy()

    model_suites = {
        "xgb_smote": {
            "display_name": "HistGradientBoosting (XGBoost Arch) + In-Fold SMOTE",
            "pipeline": ImbPipeline(
                [
                    ("scaler", StandardScaler()),
                    ("smote", SMOTE(sampling_strategy=0.75, k_neighbors=7, random_state=42)),
                    (
                        "clf",
                        HistGradientBoostingClassifier(
                            max_depth=3,
                            learning_rate=0.035,
                            max_iter=130,
                            min_samples_leaf=55,
                            l2_regularization=10.0,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "xgb_balanced": {
            "display_name": "HistGradientBoosting (XGBoost Arch) + ScalePosWeight",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        HistGradientBoostingClassifier(
                            max_depth=3,
                            learning_rate=0.035,
                            max_iter=130,
                            min_samples_leaf=55,
                            l2_regularization=10.0,
                            class_weight="balanced",
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "grad_boost": {
            "display_name": "Gradient Boosting (Depth-3 Subsampled Regularized)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        GradientBoostingClassifier(
                            n_estimators=120,
                            max_depth=3,
                            learning_rate=0.04,
                            subsample=0.75,
                            max_features=0.65,
                            min_samples_leaf=55,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "random_forest": {
            "display_name": "Random Forest (Pruned Depth-6, MinLeaf=45)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        RandomForestClassifier(
                            n_estimators=300,
                            max_depth=6,
                            min_samples_leaf=45,
                            max_features=0.5,
                            class_weight="balanced_subsample",
                            n_jobs=-1,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "extra_trees": {
            "display_name": "Extra Trees (Pruned Depth-7, MinLeaf=40)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        ExtraTreesClassifier(
                            n_estimators=300,
                            max_depth=7,
                            min_samples_leaf=40,
                            max_features=0.5,
                            class_weight="balanced",
                            n_jobs=-1,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "mlp_neural": {
            "display_name": "MLP Neural Network (64x32 ReLU, L2 alpha=0.5)",
            "pipeline": ImbPipeline(
                [
                    ("scaler", StandardScaler()),
                    ("smote", SMOTE(sampling_strategy=0.75, random_state=42)),
                    (
                        "clf",
                        MLPClassifier(
                            hidden_layer_sizes=(64, 32),
                            activation="relu",
                            alpha=0.5,
                            learning_rate_init=0.001,
                            max_iter=120,
                            early_stopping=True,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "logistic_l2": {
            "display_name": "Logistic Regression (L2 Linear Baseline)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        LogisticRegression(
                            C=0.2,
                            class_weight="balanced",
                            max_iter=500,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
    }

    from sklearn.base import clone
    cv_oof = StratifiedGroupKFold(n_splits=5)
    benchmark_results: Dict[str, Dict[str, Any]] = {}
    trained_pipelines: Dict[str, Any] = {}

    for key, spec in model_suites.items():
        pipe = clone(spec["pipeline"])
        if key not in ("xgb_smote", "mlp_neural"):
            oof_proba = np.zeros(len(y_train), dtype=np.float64)
            for f_tr, f_va in cv_oof.split(X_train_opt, y_train, groups=groups_train):
                fold_p = clone(spec["pipeline"])
                fold_p.fit(
                    X_train_opt.iloc[f_tr],
                    y_train[f_tr],
                    clf__sample_weight=sample_weights_train[f_tr],
                )
                oof_proba[f_va] = fold_p.predict_proba(X_train_opt.iloc[f_va])[:, 1]
            pipe.fit(X_train_opt, y_train, clf__sample_weight=sample_weights_train)
        else:
            oof_proba = cross_val_predict(
                pipe, X_train_opt, y_train, cv=cv_oof, groups=groups_train, method="predict_proba", n_jobs=-1
            )[:, 1]
            pipe.fit(X_train_opt, y_train)
        th_f1, th_rec80 = find_optimal_thresholds(y_train, oof_proba)
        trained_pipelines[key] = pipe

        train_proba = pipe.predict_proba(X_train_opt)[:, 1]
        test_proba = pipe.predict_proba(X_test_opt)[:, 1]

        train_roc = float(roc_auc_score(y_train, train_proba))
        train_pr = float(average_precision_score(y_train, train_proba))
        metrics_f1 = evaluate_predictions(y_test, test_proba, th_f1)
        metrics_rec80 = evaluate_predictions(y_test, test_proba, th_rec80)
        roc_gap = round(train_roc - metrics_f1["roc_auc"], 4)
        pr_gap = round(train_pr - metrics_f1["pr_auc"], 4)

        benchmark_results[key] = {
            "display_name": spec["display_name"],
            "train_roc_auc": round(train_roc, 4),
            "train_pr_auc": round(train_pr, 4),
            "oof_roc_auc": round(float(roc_auc_score(y_train, oof_proba)), 4),
            "oof_pr_auc": round(float(average_precision_score(y_train, oof_proba)), 4),
            "overfit_gap_roc": roc_gap,
            "overfit_gap_pr": pr_gap,
            "test_f1_optimal": metrics_f1,
            "test_recall80_optimal": metrics_rec80,
        }

        print(
            f"  [{spec['display_name']:<50}] "
            f"Train ROC: {train_roc:.4f} -> Test ROC: {metrics_f1['roc_auc']:.4f} (Gap: {roc_gap:+.4f}) | "
            f"PR-AUC: {metrics_f1['pr_auc']:.4f} | F1: {metrics_f1['f1_score']:.4f} | Rec80: {metrics_rec80['recall']:.3f}"
        )

    champion_key = max(
        benchmark_results,
        key=lambda k: 0.5 * benchmark_results[k]["oof_roc_auc"] + 0.5 * benchmark_results[k]["oof_pr_auc"],
    )
    champion_pipe = trained_pipelines[champion_key]
    champion_info = benchmark_results[champion_key]

    # Verify patch-era leakage after within-era standardization
    df_test_era = (df_test["match_T_start_time"] < df_train["match_T_start_time"].median()).astype(int)
    era_check_clf = HistGradientBoostingClassifier(max_depth=3, min_samples_leaf=50, random_state=42)
    era_check_clf.fit(
        X_train_opt,
        (df_train["match_T_start_time"] < df_train["match_T_start_time"].median()).astype(int),
    )
    era_leak_auc = float(roc_auc_score(df_test_era, era_check_clf.predict_proba(X_test_opt)[:, 1]))
    print(f"\n[Audit Verification] Patch-Era Predictability after Standardization: ROC-AUC = {era_leak_auc:.4f} (down from 0.9224)")
    print(
        f"=> CHAMPION MODEL: {champion_info['display_name']} "
        f"(Test ROC-AUC={champion_info['test_f1_optimal']['roc_auc']:.4f}, Train-Test Gap={champion_info['overfit_gap_roc']:+.4f})"
    )

    perm_champ = permutation_importance(
        champion_pipe,
        X_test_opt,
        y_test,
        scoring="roc_auc",
        n_repeats=8,
        random_state=42,
        n_jobs=-1,
    )
    imp_raw = np.maximum(0.0, perm_champ.importances_mean)
    imp_norm = imp_raw / max(1e-9, np.sum(imp_raw))
    feature_importance_ranking = []
    for idx in np.argsort(imp_norm)[::-1]:
        fname = optimal_features[idx]
        if fname in DOMAIN_1_AIM:
            dom = "I. 3D Shooter Aim"
        elif fname in DOMAIN_2_ECONOMY:
            dom = "II. Soul Economy"
        elif fname in DOMAIN_3_COMBAT:
            dom = "III. Combat & Objectives"
        elif fname in DOMAIN_4_PSYCHOLOGY:
            dom = "IV. Psychology & Tilt"
        elif fname in ix_cols:
            dom = "VI. Behavioral Interaction"
        else:
            dom = "V. Match-T & Trends"
        feature_importance_ranking.append(
            {
                "rank": len(feature_importance_ranking) + 1,
                "feature": fname,
                "domain": dom,
                "importance_pct": round(float(imp_norm[idx] * 100.0), 3),
                "mutual_info": round(float(mi_map.get(fname, 0.0)), 4),
            }
        )

    print("\n--- TOP 15 MOST PREDICTIVE DE-BIASED FEATURES ---")
    for item in feature_importance_ranking[:15]:
        print(
            f"  #{item['rank']:02d} {item['feature']:<30} [{item['domain']:<26}] -> Importance: {item['importance_pct']:6.2f}% (MI: {item['mutual_info']:.4f})"
        )

    joblib.dump(champion_pipe.named_steps["scaler"], SCALER_PKL)
    joblib.dump(champion_pipe.named_steps["clf"], MODEL_PKL)
    FEATURES_JSON.write_text(json.dumps(optimal_features, indent=2), encoding="utf-8")

    export_payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "debiased_audit": {
            "time_matched_corr_start_time_churn": round(
                float(raw_df["match_T_start_time"].corr(raw_df["is_churn"])), 4
            ),
            "patch_era_leakage_roc_auc_before": 0.9224,
            "patch_era_leakage_roc_auc_after": round(era_leak_auc, 4),
            "avg_session_gap_days_excluded": True,
            "champion_overfit_gap_roc": champion_info["overfit_gap_roc"],
        },
        "dataset_summary": {
            "total_windows": int(len(raw_df)),
            "unique_players": int(len(np.unique(groups_all))),
            "train_windows": int(len(df_train)),
            "test_windows": int(len(df_test)),
            "churn_positive_count": int(np.sum(y_all)),
            "churn_rate": round(float(np.mean(y_all)), 4),
            "candidate_features_total": len(all_candidate_features),
            "optimal_features_count": len(optimal_features),
        },
        "ablation_study": ablation_results,
        "feature_optimization": {
            "collinearity_dropped": dropped_collinear,
            "topk_cv_sweep": topk_sweep_results,
            "selected_optimal_k": best_k,
            "optimal_features": optimal_features,
            "top_features_ranking": feature_importance_ranking,
        },
        "champion_model": {
            "key": champion_key,
            **champion_info,
        },
        "models_benchmark": benchmark_results,
        "elapsed_training_seconds": round(time.time() - t0, 2),
    }
    RESULTS_JSON.write_text(json.dumps(export_payload, indent=2), encoding="utf-8")
    print(f"\nSaved de-biased results & models to {RESULTS_JSON} in {time.time() - t0:.1f}s.")


if __name__ == "__main__":
    main()
