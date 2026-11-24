"""
Phase 2 Regression Tests: Temporal Lookahead Hardening, Overlapping-Window Weighting,
and Reproducible Source 2 Item/Hero Replay Analytics.
File: backend/tests/test_phase2_hardening.py
"""

import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from analyze_items_and_heroes import (
    CANONICAL_PAGE2_HERO_IDS,
    PROVENANCE_COUNTS,
    extract_item_and_hero_replay_telemetry,
    summarize_gems_cache,
    verify_items_router_consistency,
)
from app.services.feature_service import FeatureService
from collect_data import extract_window_features
from enrich_hidden_gems import (
    build_enriched_dataset,
    compute_historical_party_matches,
    compute_player_window_weights,
)


def _make_sample_matches(start_mid: int = 200, count: int = 20):
    return [
        {
            "match_id": start_mid - i,
            "hero_id": 2,
            "hero_level": 22,
            "start_time": 1790000000 - i * 3600,
            "match_duration_s": 2100,
            "player_team": 0,
            "match_result": 0 if i % 2 == 0 else 1,
            "player_kills": 7,
            "player_deaths": 5,
            "player_assists": 9,
            "net_worth": 32000,
            "last_hits": 150,
            "denies": 10,
            "abandoned_time_s": 0,
            "objectives_mask_team0": 0x00FF,
            "objectives_mask_team1": 0x0FFF,
            "low_pri_pool": False,
        }
        for i in range(count)
    ]


class TestPhase2Hardening(unittest.TestCase):
    """Verifies elimination of career lookahead, overlapping-window weighting, and Source 2 replay analytics."""

    def test_collect_data_ignores_career_hero_stats_lookahead(self):
        """extract_window_features must produce identical outputs regardless of poisoned career /hero-stats."""
        obs_w = _make_sample_matches(start_mid=200, count=20)
        match_T = obs_w[0]

        clean_feats = extract_window_features(
            account_id=4242,
            window_idx=0,
            obs_matches_newest_first=obs_w,
            match_T=match_T,
            is_churn=0,
            time_gap_days=1.5,
            player_hero_map=None,
            global_hero_baselines=None,
        )

        poisoned_hero_map = {
            2: {
                "accuracy": 0.89,
                "crit_shot_rate": 0.62,
                "damage_per_soul": 4.5,
                "damage_taken_per_soul": 0.12,
                "obj_damage_per_soul": 0.88,
            },
            -1: {
                "accuracy": 0.89,
                "crit_shot_rate": 0.62,
                "damage_per_soul": 4.5,
                "damage_taken_per_soul": 0.12,
                "obj_damage_per_soul": 0.88,
            },
        }
        poisoned_baselines = {2: (75.0, 2.0)}

        feats_with_poison = extract_window_features(
            account_id=4242,
            window_idx=0,
            obs_matches_newest_first=obs_w,
            match_T=match_T,
            is_churn=0,
            time_gap_days=1.5,
            player_hero_map=poisoned_hero_map,
            global_hero_baselines=poisoned_baselines,
        )

        self.assertEqual(clean_feats, feats_with_poison)

    def test_collect_data_respects_match_T_boundary_for_metadata(self):
        """match_metadata_map entries with match_id <= match_T_id are used; post-T entries are ignored."""
        obs_w = _make_sample_matches(start_mid=200, count=20)
        match_T = obs_w[0]  # match_id == 200

        # Future metadata (> 200) must not affect window features
        future_only_meta = {
            (999, 4242): {"shots_hit": 999, "shots_missed": 1, "out_hs_rate": 80.0, "damage_mitigated": 50000.0}
        }
        base_feats = extract_window_features(4242, 0, obs_w, match_T, 0, 1.5)
        future_feats = extract_window_features(4242, 0, obs_w, match_T, 0, 1.5, match_metadata_map=future_only_meta)
        self.assertEqual(base_feats, future_feats)

        # Historical metadata (<= 200) must be reflected
        hist_meta = {
            (200, 4242): {"shots_hit": 600, "shots_missed": 400, "out_hs_rate": 25.0, "damage_mitigated": 12000.0}
        }
        hist_feats = extract_window_features(4242, 0, obs_w, match_T, 0, 1.5, match_metadata_map=hist_meta)
        self.assertNotEqual(base_feats["accuracy_pct"], hist_feats["accuracy_pct"])

    def test_mate_stats_no_post_T_lookahead(self):
        """Teammate co-occurrences after match_T_id must not leak party status into <= match_T_id windows."""
        # Teammate A: played together at match 100 and future match 500 (only 1 match <= 100)
        # Teammate B: played together at matches 80, 95, and 400 (2 matches <= 100)
        mate_lists = [
            [100, 500],
            [80, 95, 400],
        ]

        party_at_100 = compute_historical_party_matches(mate_lists, max_match_id=100, min_shared=2)
        self.assertEqual(party_at_100, {80, 95})
        self.assertNotIn(100, party_at_100)
        self.assertNotIn(500, party_at_100)

        # At T = 500, both Teammate A and Teammate B now have >= 2 historical matches <= 500
        party_at_500 = compute_historical_party_matches(mate_lists, max_match_id=500, min_shared=2)
        self.assertEqual(party_at_500, {80, 95, 100, 400, 500})

    def test_build_enriched_dataset_blocks_future_teammate_leakage(self):
        """End-to-end build_enriched_dataset keeps T=100 solo when second shared match is at T=500."""
        matches = _make_sample_matches(start_mid=500, count=20)
        # Ensure match_id 100 is at index 5 in history and matches[5:25] exist
        matches_early = _make_sample_matches(start_mid=100, count=20)
        full_hist = matches + matches_early  # sorted newest-first: 500..481, 100..81

        base_rows = [
            extract_window_features(777, 0, matches_early, matches_early[0], 0, 2.0),
            extract_window_features(777, 1, matches, matches[0], 0, 2.0),
        ]
        base_df = pd.DataFrame(base_rows)

        gems_map = {}
        for mid in (100, 500):
            gems_map[(mid, 777)] = {
                "duration_s": 2100.0,
                "gold_death_loss": 200.0,
                "gold_treasure": 1000.0,
                "gold_denied": 50.0,
                "out_hs_rate": 20.0,
                "inc_hs_rate": 15.0,
                "out_hit_rate": 40.0,
                "inc_hit_rate": 38.0,
                "immobile_hs": 1.0,
                "stun_hs_rate": 0.5,
                "shots_hit": 450.0,
                "shots_missed": 550.0,
                "parry_miss": 1.0,
                "melee_kills": 1.0,
                "headshot_kills": 2.0,
                "total_death_s": 120.0,
                "grey_screen_ratio": 0.057,
                "avg_ttk_s": 7.5,
                "burst_death_rate": 0.1,
                "items_sold_cnt": 2,
                "late_sold_cnt": 0,
                "is_rage_sell": 0,
                "comeback_gold": 100.0,
                "teammate_support": 1200.0,
                "self_healing": 800.0,
                "damage_mitigated": 6000.0,
                "heal_prevented": 300.0,
            }

        # Teammate played match 100 and future match 500
        party_by_player = {777: [[100, 500]]}
        enriched = build_enriched_dataset(base_df, {777: full_hist}, party_by_player, gems_map)

        self.assertEqual(len(enriched), 2)
        row_100 = enriched[enriched["match_T_id"] == 100].iloc[0]
        row_500 = enriched[enriched["match_T_id"] == 500].iloc[0]

        self.assertEqual(row_100["match_T_is_solo"], 1.0)
        self.assertEqual(row_100["party_play_pct"], 0.0)
        self.assertEqual(row_500["match_T_is_solo"], 0.0)
        self.assertGreater(row_500["party_play_pct"], 0.0)

    def test_live_feature_service_blocks_future_mate_stats(self):
        """FeatureService.predict_churn filters mate-stats co-occurrences beyond max window match_id."""
        matches = _make_sample_matches(start_mid=200, count=6)
        # Teammate only shared match 200 inside window + future match 999 outside window
        future_only_mate = [{"matches_played": 2, "matches": [200, 999]}]
        # Ensure fallback is triggered (not falsely credited as party)
        pred_future = FeatureService.predict_churn(account_id=8888, matches=matches, mate_stats=future_only_mate)

        valid_mate = [{"matches_played": 2, "matches": [200, 199]}]
        pred_valid = FeatureService.predict_churn(account_id=8888, matches=matches, mate_stats=valid_mate)

        self.assertAlmostEqual(pred_valid.hidden_gems["party_play_pct"], 2.0 / 6.0, places=3)
        self.assertNotAlmostEqual(pred_future.hidden_gems["party_play_pct"], 1.0 / 6.0, places=3)

    def test_overlapping_window_player_sample_weights(self):
        """compute_player_window_weights equalizes or dampens over-represented multi-window veterans."""
        df = pd.DataFrame({"account_id": [101] * 16 + [202]})
        w_inv = compute_player_window_weights(df, mode="inv_n")
        self.assertAlmostEqual(float(np.mean(w_inv)), 1.0, places=6)
        # Total mass for player 101 (16 windows) equals total mass for player 202 (1 window)
        self.assertAlmostEqual(float(np.sum(w_inv[:16])), float(w_inv[16]), places=6)

        w_sqrt = compute_player_window_weights(df, mode="inv_sqrt")
        self.assertAlmostEqual(float(np.mean(w_sqrt)), 1.0, places=6)
        self.assertAlmostEqual(float(w_sqrt[16] / w_sqrt[0]), 4.0, places=6)

        w_cap = compute_player_window_weights(df, mode="capped", cap_windows=4)
        self.assertAlmostEqual(float(np.mean(w_cap)), 1.0, places=6)
        self.assertAlmostEqual(float(w_cap[16] / w_cap[0]), 4.0, places=6)

    def test_analyze_items_and_heroes_integrity_and_replay_parser(self):
        """Verifies items.py provenance/hero_ids and Source 2 item/death replay telemetry extraction."""
        check = verify_items_router_consistency()
        self.assertTrue(check["valid"], msg=f"items.py integrity errors: {check['errors']}")
        self.assertEqual(check["item_churn_analytics_count"], PROVENANCE_COUNTS["total_items_analyzed"])
        self.assertEqual(check["hero_churn_analytics_count"], PROVENANCE_COUNTS["total_heroes_analyzed"])
        self.assertEqual(CANONICAL_PAGE2_HERO_IDS["Ivy"], 10)
        self.assertEqual(CANONICAL_PAGE2_HERO_IDS["Pocket"], 15)
        self.assertEqual(CANONICAL_PAGE2_HERO_IDS["Lash"], 22)

        sample_match = {
            "match_id": 123456789,
            "duration_s": 1800,
            "players": [
                {
                    "account_id": 5555,
                    "hero_id": 3,
                    "items": [
                        {"item_id": 101, "game_time_s": 90, "sold_time_s": 0},
                        {"item_id": 102, "game_time_s": 300, "sold_time_s": 1720},
                        {"item_id": 201, "game_time_s": 900, "sold_time_s": 0},
                        {"item_id": 103, "game_time_s": 1200, "sold_time_s": 1740},
                        {"item_id": 104, "game_time_s": 1400, "sold_time_s": 1750},
                    ],
                    "death_details": [
                        {"death_duration_s": 45.0, "time_to_kill_s": 2.0},
                        {"death_duration_s": 45.0, "time_to_kill_s": 6.0},
                    ],
                    "final_stats": {
                        "custom_user_stats": {
                            "Bullet Stats - Incoming##HeadshotRate": 21.7,
                            "Bullet Stats##StunHeadshotHitRate": 4.82,
                        }
                    },
                }
            ],
        }
        slot_map = {101: "weapon", 102: "weapon", 103: "spirit", 104: "weapon", 201: "vitality"}
        parsed = extract_item_and_hero_replay_telemetry(sample_match, item_slot_map=slot_map)
        self.assertEqual(len(parsed), 1)
        rec = parsed[0]
        self.assertEqual(rec["hero_id"], 3)
        self.assertEqual(rec["total_items_bought"], 5)
        self.assertEqual(rec["zero_vitality_prefix_len"], 2)
        self.assertEqual(rec["first_vitality_min"], 15.0)
        self.assertAlmostEqual(rec["vitality_share"], 0.2, places=4)
        self.assertEqual(rec["late_sold_cnt"], 3)
        self.assertEqual(rec["is_rage_sell"], 1)
        self.assertAlmostEqual(rec["grey_screen_ratio"], 90.0 / 1800.0, places=4)
        self.assertAlmostEqual(rec["burst_death_rate"], 0.5, places=4)

        summary = summarize_gems_cache(
            {
                "fetched_match_ids": {123456789},
                "gems_map": {
                    (123456789, 5555): {
                        "grey_screen_ratio": 0.12,
                        "avg_ttk_s": 6.0,
                        "burst_death_rate": 0.2,
                        "inc_hs_rate": 21.7,
                        "out_hs_rate": 18.0,
                        "stun_hs_rate": 0.8,
                        "parry_miss": 2.0,
                        "items_sold_cnt": 4,
                        "late_sold_cnt": 1,
                        "is_rage_sell": 0,
                        "total_death_s": 90.0,
                    }
                },
            },
            dataset_df=pd.DataFrame([{"account_id": 5555, "match_T_id": 123456789, "is_churn": 1}]),
            player_histories={5555: [{"match_id": 123456789, "hero_id": 3}]},
        )
        self.assertEqual(summary["player_match_records_count"], 1)
        self.assertIn(3, summary["hero_telemetry"])
        self.assertEqual(summary["hero_telemetry"][3]["cohort_churn_rate"], 1.0)


if __name__ == "__main__":
    unittest.main()
