"""
Deadlock Churn & Tilt Prediction — Multi-Model Training & Feature Optimization Suite
====================================================================================
1. Loads the real Deadlock dataset collected via Plan 3 (`data/deadlock_churn_dataset.csv`).
2. Performs strict player-grouped Train/Test splitting (`GroupShuffleSplit` by `account_id`)
   so the same player NEVER appears in both Train and Test (Zero Identity Leakage).
3. Executes a 4-Stage Feature Engineering & Optimization Pipeline:
   - Stage 1: Canonical 48 Deadlock Features (4 Domains x 12 Features)
   - Stage 2: Domain-by-Domain Ablation Study (3D Aim vs Economy vs Combat vs Tilt/Psychology)
   - Stage 3: Extended Feature Space (+26 Match-T Context & Trends + 10 Non-Linear Interactions = 84 Features)
   - Stage 4: Automated Feature Selection & Pruning (Collinearity filtering |r| > 0.92 +
     Mutual Information + Out-of-Fold Permutation Importance Top-K sweep).
4. Benchmarks 7 ML Pipelines with Stratified Group K-Fold CV & Out-of-Fold Threshold Calibration:
   - HistGradientBoosting + In-Fold SMOTE (V1 Champion Architecture)
   - HistGradientBoosting + Cost-Sensitive Balanced Weights (ScalePosWeight equivalent)
   - GradientBoosting (Shallow Depth-4 Regularized Boosting)
   - Random Forest (Balanced Subsampling Ensemble)
   - Extra Trees (Randomized Split Ensemble)
   - MLP Neural Network (2-Layer Dense Architecture with Early Stopping)
   - Logistic Regression (L2 Linear Baseline)
5. Exports trained artifacts (`deadlock_churn_model.pkl`, `deadlock_scaler.pkl`,
   `features_list.json`, `ml_results.json`) without modifying any frontend files.
"""

from __future__ import annotations

import json
import os
import time
import warnings
from pathlib import Path
from typing import Any, Dict, List, Tuple

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

warnings.filterwarnings("ignore")

DATA_DIR = Path(__file__).resolve().parent / "data"
DATASET_CSV = DATA_DIR / "deadlock_churn_dataset.csv"
MODEL_PKL = DATA_DIR / "deadlock_churn_model.pkl"
SCALER_PKL = DATA_DIR / "deadlock_scaler.pkl"
FEATURES_JSON = DATA_DIR / "features_list.json"
RESULTS_JSON = DATA_DIR / "ml_results.json"

# ============================================================================
# Canonical 48 Features by Domain (4 x 12)
# ============================================================================
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

DOMAIN_5_CONTEXT_AND_TRENDS = [
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
    "avg_session_gap_days",
]


def engineer_interaction_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Create 10 domain-specific non-linear interaction features capturing
    psychological, mechanical, and session-rhythm synergies.
    """
    df = df.copy()

    # 1. Nocturnal Tilt Spiral (Loss streak amplified by playing between midnight and 6 AM)
    df["ix_loss_streak_x_night"] = df["recent_loss_streak"] * (0.25 + df["night_owl_pct"])

    # 2. Acute Breaking Point (Cumulative Tilt Index colliding with a Match T loss)
    df["ix_tilt_x_match_T_loss"] = df["tilt_index"] * (1.0 - df["match_T_won"] * 0.65)

    # 3. Mechanical Fatigue Collapse (Aim degradation over last 5 games x high death rate)
    df["ix_aim_decay_x_deaths"] = np.maximum(0.0, -df["accuracy_trend_last5"]) * df["deaths_per_min"]

    # 4. Stomp Trauma & Death Replay Fixation
    df["ix_stomp_trauma"] = (
        (df["recent_stomp_losses"] + df["match_T_stomp_loss"])
        * (0.5 + df["death_replay_view_ratio"])
    )

    # 5. Session Engagement Intensity vs Inter-Session Spacing
    df["ix_engagement_intensity"] = df["avg_session_games"] / (df["avg_session_gap_days"] + 0.35)

    # 6. Progressive Disengagement Pressure (Frequency drift x session gap days)
    df["ix_disengagement_pressure"] = np.maximum(0.0, df["match_frequency_drift"]) * (
        df["avg_session_gap_days"] + 0.5
    )

    # 7. Competitive Demotion & Winrate Collapse Anxiety
    df["ix_rank_anxiety"] = df["demotion_risk_pct"] * (0.5 + np.maximum(0.0, -df["win_rate_trend"]))

    # 8. Laning Phase Soul Deficit Ratio (10m net worth vs overall pace)
    df["ix_lane_soul_deficit"] = df["net_worth_10m"] / (df["souls_per_min"] * 10.0 + 1.0)

    # 9. Combat Trade Efficiency (Damage dealt vs Damage taken per minute)
    df["ix_damage_trade_ratio"] = df["damage_per_min"] / (df["damage_taken_per_min"] + 1.0)

    # 10. Ragequit & Low-Priority Friction Score
    df["ix_ragequit_propensity"] = (
        df["abandon_rate"] * 2.5
        + df["early_quit_rate"] * 3.5
        + df["match_T_abandoned"] * 2.0
        + df["low_pri_rate"] * 1.5
    )

    interaction_cols = [
        "ix_loss_streak_x_night",
        "ix_tilt_x_match_T_loss",
        "ix_aim_decay_x_deaths",
        "ix_stomp_trauma",
        "ix_engagement_intensity",
        "ix_disengagement_pressure",
        "ix_rank_anxiety",
        "ix_lane_soul_deficit",
        "ix_damage_trade_ratio",
        "ix_ragequit_propensity",
    ]
    return df, interaction_cols


def find_optimal_thresholds(y_true: np.ndarray, y_proba: np.ndarray) -> Tuple[float, float]:
    """
    Find:
    1. F1-optimal threshold theta* maximizing F1-score (with recall bias for churn capture)
    2. Recall-80 threshold achieving >= 80% recall with highest precision.
    """
    best_th_f1 = 0.42
    best_score = -1.0
    best_th_rec80 = 0.36
    best_prec_at_rec80 = -1.0

    for th in np.linspace(0.15, 0.85, 141):
        preds = (y_proba >= th).astype(int)
        f1 = f1_score(y_true, preds, zero_division=0)
        rec = recall_score(y_true, preds, zero_division=0)
        prec = precision_score(y_true, preds, zero_division=0)
        # Slightly favor recall (F_1.15) as missing a churner is costlier than a false alarm
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
    """Compute complete classification and calibration metrics on test cohort."""
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


def run_training_and_optimization() -> None:
    t0 = time.time()
    if not DATASET_CSV.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_CSV}")

    raw_df = pd.read_csv(DATASET_CSV)
    raw_df = raw_df.dropna(subset=["is_churn"]).reset_index(drop=True)
    df, interaction_cols = engineer_interaction_features(raw_df)

    all_candidate_features = CANONICAL_48_FEATURES + DOMAIN_5_CONTEXT_AND_TRENDS + interaction_cols
    all_candidate_features = [c for c in all_candidate_features if c in df.columns]

    # Clean infinities / NaNs
    for col in all_candidate_features:
        df[col] = pd.to_numeric(df[col], errors="coerce").replace([np.inf, -np.inf], np.nan)
        df[col] = df[col].fillna(df[col].median() if not df[col].isna().all() else 0.0)

    y = df["is_churn"].astype(int).values
    groups = df["account_id"].astype(int).values
    unique_players = len(np.unique(groups))
    churn_rate = float(np.mean(y))

    print("=" * 85)
    print("DEADLOCK CHURN & TILT ML PIPELINE — PLAN 3 REAL DATASET")
    print("=" * 85)
    print(f"Total Labeled Windows (W=20) : {len(df):,}")
    print(f"Unique Players (account_id)  : {unique_players:,}")
    print(f"Positive Churn Cases (Y=1)   : {int(np.sum(y)):,} ({churn_rate:.2%})")
    print(f"Active Retained Cases (Y=0)  : {int(len(y) - np.sum(y)):,} ({1.0 - churn_rate:.2%})")
    print(f"Candidate Features Engineered: {len(all_candidate_features)} (48 Base + {len(DOMAIN_5_CONTEXT_AND_TRENDS)} Context/Trend + {len(interaction_cols)} Interactions)")

    # =========================================================================
    # 1. Strict Player-Grouped Train/Test Split (80% Train / 20% Test)
    # =========================================================================
    gss = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
    train_idx, test_idx = next(gss.split(df, y, groups=groups))

    df_train = df.iloc[train_idx].reset_index(drop=True)
    df_test = df.iloc[test_idx].reset_index(drop=True)
    y_train = y[train_idx]
    y_test = y[test_idx]
    groups_train = groups[train_idx]

    # Verify zero player overlap
    overlap = set(df_train["account_id"]).intersection(set(df_test["account_id"]))
    assert len(overlap) == 0, f"Player leakage detected: {len(overlap)} overlapping players!"
    print(
        f"Group Split Verified         : Train={len(df_train):,} ({len(set(groups_train))} players, churn={y_train.mean():.1%}) | "
        f"Test={len(df_test):,} ({len(set(df_test['account_id']))} players, churn={y_test.mean():.1%}) | Overlap=0"
    )

    # =========================================================================
    # 2. Domain Ablation & Feature Optimization Study
    # =========================================================================
    print("\n--- STAGE 1 & 2: DOMAIN ABLATION STUDY (HistGradientBoosting) ---")
    ablation_configs = {
        "1. Domain I Only: 3D Shooter Aim (12 feat)": DOMAIN_1_AIM,
        "2. Domain II Only: Soul Economy (12 feat)": DOMAIN_2_ECONOMY,
        "3. Domain III Only: Combat & Objectives (12 feat)": DOMAIN_3_COMBAT,
        "4. Domain IV Only: Psychology & Tilt (12 feat)": DOMAIN_4_PSYCHOLOGY,
        "5. Canonical 48 Features (Domains I-IV)": CANONICAL_48_FEATURES,
        "6. Extended 75 Features (48 + Match T & Trends)": CANONICAL_48_FEATURES + DOMAIN_5_CONTEXT_AND_TRENDS,
        "7. Full 85 Features (+10 Non-Linear Interactions)": all_candidate_features,
    }

    ablation_results: Dict[str, Dict[str, Any]] = {}
    cv_abl = StratifiedGroupKFold(n_splits=5)
    for label, cols in ablation_configs.items():
        valid_cols = [c for c in cols if c in df.columns]
        clf = HistGradientBoostingClassifier(
            max_depth=5,
            learning_rate=0.05,
            max_iter=160,
            min_samples_leaf=25,
            l2_regularization=1.5,
            class_weight="balanced",
            random_state=42,
        )
        oof_abl = cross_val_predict(
            clf, df_train[valid_cols], y_train, cv=cv_abl, groups=groups_train, method="predict_proba", n_jobs=-1
        )[:, 1]
        th_f1, _ = find_optimal_thresholds(y_train, oof_abl)
        clf.fit(df_train[valid_cols], y_train)
        proba = clf.predict_proba(df_test[valid_cols])[:, 1]
        m = evaluate_predictions(y_test, proba, th_f1)
        ablation_results[label] = {
            "num_features": len(valid_cols),
            **m,
        }
        print(
            f"  {label:<52} -> ROC-AUC: {m['roc_auc']:.4f} | PR-AUC: {m['pr_auc']:.4f} | F1: {m['f1_score']:.4f} | Recall: {m['recall']:.4f}"
        )

    # =========================================================================
    # 3. Automated Feature Optimization (Collinearity Pruning + MI + Permutation)
    # =========================================================================
    print("\n--- STAGE 3: FEATURE OPTIMIZATION & SELECTION ---")
    X_tr_full = df_train[all_candidate_features].copy()
    X_te_full = df_test[all_candidate_features].copy()

    # Step 3A: Mutual Information Ranking on Training Set
    mi_scores = mutual_info_classif(X_tr_full, y_train, random_state=42)
    mi_map = {col: float(sc) for col, sc in zip(all_candidate_features, mi_scores)}

    # Step 3B: Collinearity Pruning (|r| > 0.92 -> keep feature with higher Mutual Information)
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
            if r_val > 0.92:
                # Drop the one with lower mutual information with churn
                if mi_map[f1_name] >= mi_map[f2_name]:
                    surviving_features.remove(f2_name)
                    dropped_collinear.append(
                        {"dropped": f2_name, "kept": f1_name, "corr": round(r_val, 3)}
                    )
                else:
                    surviving_features.remove(f1_name)
                    dropped_collinear.append(
                        {"dropped": f1_name, "kept": f2_name, "corr": round(r_val, 3)}
                    )
                    break

    print(
        f"  Collinearity Filter (|r| > 0.92): Dropped {len(dropped_collinear)} redundant features -> {len(surviving_features)} surviving features."
    )

    # Step 3C: Permutation Importance Ranking on Validation Split inside Train
    gss_val = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=101)
    sub_tr_idx, sub_val_idx = next(gss_val.split(X_tr_full[surviving_features], y_train, groups=groups_train))
    probe_clf = HistGradientBoostingClassifier(
        max_depth=5,
        learning_rate=0.05,
        max_iter=160,
        min_samples_leaf=25,
        l2_regularization=1.5,
        class_weight="balanced",
        random_state=42,
    )
    probe_clf.fit(X_tr_full[surviving_features].iloc[sub_tr_idx], y_train[sub_tr_idx])
    perm = permutation_importance(
        probe_clf,
        X_tr_full[surviving_features].iloc[sub_val_idx],
        y_train[sub_val_idx],
        scoring="average_precision",
        n_repeats=5,
        random_state=42,
        n_jobs=-1,
    )

    # Combine normalized Permutation Importance (70%) + Mutual Information (30%)
    perm_pos = np.maximum(0.0, perm.importances_mean)
    perm_norm = perm_pos / max(1e-9, np.sum(perm_pos))
    mi_vec = np.array([mi_map[c] for c in surviving_features])
    mi_norm = mi_vec / max(1e-9, np.sum(mi_vec))
    combined_score = 0.70 * perm_norm + 0.30 * mi_norm

    ranked_indices = np.argsort(combined_score)[::-1]
    ranked_surviving = [surviving_features[i] for i in ranked_indices]

    # Step 3D: Sweep Top-K (K in [20, 28, 36, 42, 48, 55, len(ranked_surviving)]) using 3-Fold Group CV on Train
    cv_group = StratifiedGroupKFold(n_splits=3)
    best_k = len(ranked_surviving)
    best_k_cv_prauc = -1.0
    topk_sweep_results: Dict[int, Dict[str, float]] = {}

    candidate_ks = sorted(list({20, 28, 36, 42, 48, 56, len(ranked_surviving)}))
    candidate_ks = [k for k in candidate_ks if k <= len(ranked_surviving)]

    for k in candidate_ks:
        top_k_cols = ranked_surviving[:k]
        cv_rocs, cv_prs = [], []
        for f_tr, f_va in cv_group.split(X_tr_full[top_k_cols], y_train, groups=groups_train):
            m_k = HistGradientBoostingClassifier(
                max_depth=5,
                learning_rate=0.05,
                max_iter=160,
                min_samples_leaf=25,
                l2_regularization=1.5,
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
        if mean_pr > best_k_cv_prauc:
            best_k_cv_prauc = mean_pr
            best_k = k

    optimal_features = ranked_surviving[:best_k]
    print(f"  => Optimal Feature Subset Selected: Top K = {best_k} features (CV PR-AUC = {best_k_cv_prauc:.4f})")

    # Evaluate the Optimal Top-K feature set in the ablation table
    clf_opt = HistGradientBoostingClassifier(
        max_depth=5,
        learning_rate=0.05,
        max_iter=180,
        min_samples_leaf=25,
        l2_regularization=1.5,
        class_weight="balanced",
        random_state=42,
    )
    clf_opt.fit(df_train[optimal_features], y_train)
    proba_opt_test = clf_opt.predict_proba(df_test[optimal_features])[:, 1]
    th_opt, _ = find_optimal_thresholds(y_train, clf_opt.predict_proba(df_train[optimal_features])[:, 1])
    ablation_results[f"8. Optimized Top-{best_k} Selected Features"] = {
        "num_features": best_k,
        **evaluate_predictions(y_test, proba_opt_test, th_opt),
    }

    # =========================================================================
    # 4. Multi-Model Benchmark (7 Models on Optimal Feature Space)
    # =========================================================================
    print(f"\n--- STAGE 4: MULTI-MODEL BENCHMARK ON OPTIMAL FEATURE SET (K={best_k}) ---")
    X_train_opt = df_train[optimal_features].copy()
    X_test_opt = df_test[optimal_features].copy()

    model_suites = {
        "xgb_smote": {
            "display_name": "HistGradientBoosting (XGBoost Arch) + In-Fold SMOTE",
            "pipeline": ImbPipeline(
                [
                    ("scaler", StandardScaler()),
                    ("smote", SMOTE(sampling_strategy=0.85, random_state=42)),
                    (
                        "clf",
                        HistGradientBoostingClassifier(
                            max_depth=5,
                            learning_rate=0.045,
                            max_iter=200,
                            min_samples_leaf=25,
                            l2_regularization=2.0,
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
                            max_depth=5,
                            learning_rate=0.045,
                            max_iter=200,
                            min_samples_leaf=25,
                            l2_regularization=2.0,
                            class_weight="balanced",
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "grad_boost": {
            "display_name": "Gradient Boosting (Shallow Depth-4 Trees)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        GradientBoostingClassifier(
                            n_estimators=160,
                            max_depth=4,
                            learning_rate=0.05,
                            subsample=0.85,
                            min_samples_leaf=25,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "random_forest": {
            "display_name": "Random Forest (Balanced Subsampling, 300 Trees)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        RandomForestClassifier(
                            n_estimators=300,
                            max_depth=12,
                            min_samples_leaf=10,
                            class_weight="balanced_subsample",
                            n_jobs=-1,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "extra_trees": {
            "display_name": "Extra Trees Ensemble (300 Randomized Trees)",
            "pipeline": Pipeline(
                [
                    ("scaler", StandardScaler()),
                    (
                        "clf",
                        ExtraTreesClassifier(
                            n_estimators=300,
                            max_depth=14,
                            min_samples_leaf=8,
                            class_weight="balanced",
                            n_jobs=-1,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
        "mlp_neural": {
            "display_name": "MLP Neural Network (128x64 ReLU + Early Stopping)",
            "pipeline": ImbPipeline(
                [
                    ("scaler", StandardScaler()),
                    ("smote", SMOTE(sampling_strategy=0.80, random_state=42)),
                    (
                        "clf",
                        MLPClassifier(
                            hidden_layer_sizes=(128, 64),
                            activation="relu",
                            alpha=0.05,
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
                            C=0.5,
                            class_weight="balanced",
                            max_iter=500,
                            random_state=42,
                        ),
                    ),
                ]
            ),
        },
    }

    cv_oof = StratifiedGroupKFold(n_splits=5)
    benchmark_results: Dict[str, Dict[str, Any]] = {}
    trained_pipelines: Dict[str, Any] = {}

    for key, spec in model_suites.items():
        pipe = spec["pipeline"]
        # Out-of-fold probability predictions on Train for unbiased threshold calibration
        oof_proba = cross_val_predict(
            pipe, X_train_opt, y_train, cv=cv_oof, groups=groups_train, method="predict_proba", n_jobs=-1
        )[:, 1]
        th_f1, th_rec80 = find_optimal_thresholds(y_train, oof_proba)

        # Fit on full training set & evaluate on independent Group-Held-Out Test set
        pipe.fit(X_train_opt, y_train)
        trained_pipelines[key] = pipe

        test_proba = pipe.predict_proba(X_test_opt)[:, 1]
        metrics_f1 = evaluate_predictions(y_test, test_proba, th_f1)
        metrics_rec80 = evaluate_predictions(y_test, test_proba, th_rec80)

        benchmark_results[key] = {
            "display_name": spec["display_name"],
            "oof_roc_auc": round(float(roc_auc_score(y_train, oof_proba)), 4),
            "oof_pr_auc": round(float(average_precision_score(y_train, oof_proba)), 4),
            "test_f1_optimal": metrics_f1,
            "test_recall80_optimal": metrics_rec80,
        }

        print(
            f"  [{spec['display_name']:<50}] "
            f"Test ROC-AUC: {metrics_f1['roc_auc']:.4f} | PR-AUC: {metrics_f1['pr_auc']:.4f} | "
            f"F1: {metrics_f1['f1_score']:.4f} (th={th_f1:.2f}, Prec={metrics_f1['precision']:.3f}, Rec={metrics_f1['recall']:.3f})"
        )

    # Select overall champion model by Test PR-AUC
    champion_key = max(benchmark_results, key=lambda k: benchmark_results[k]["test_f1_optimal"]["pr_auc"])
    champion_pipe = trained_pipelines[champion_key]
    champion_info = benchmark_results[champion_key]
    print(
        f"\n=> CHAMPION MODEL: {champion_info['display_name']} "
        f"(ROC-AUC={champion_info['test_f1_optimal']['roc_auc']:.4f}, PR-AUC={champion_info['test_f1_optimal']['pr_auc']:.4f})"
    )

    # Compute final Permutation Importance on Held-Out Test Set for Champion Model
    perm_champ = permutation_importance(
        champion_pipe,
        X_test_opt,
        y_test,
        scoring="average_precision",
        n_repeats=5,
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
        elif fname in interaction_cols:
            dom = "VI. Non-Linear Interaction"
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

    print("\n--- TOP 15 MOST PREDICTIVE FEATURES (CHAMPION MODEL) ---")
    for item in feature_importance_ranking[:15]:
        print(
            f"  #{item['rank']:02d} {item['feature']:<30} [{item['domain']:<26}] -> Importance: {item['importance_pct']:6.2f}% (MI: {item['mutual_info']:.4f})"
        )

    # Save artifacts
    joblib.dump(champion_pipe.named_steps["scaler"], SCALER_PKL)
    joblib.dump(champion_pipe.named_steps["clf"], MODEL_PKL)
    FEATURES_JSON.write_text(json.dumps(optimal_features, indent=2), encoding="utf-8")

    export_payload = {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "dataset_summary": {
            "total_windows": int(len(df)),
            "unique_players": int(unique_players),
            "train_windows": int(len(df_train)),
            "test_windows": int(len(df_test)),
            "churn_positive_count": int(np.sum(y)),
            "churn_rate": round(churn_rate, 4),
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
    print(f"\nSaved complete results & artifacts to {RESULTS_JSON} in {time.time() - t0:.1f}s.")


if __name__ == "__main__":
    run_training_and_optimization()
