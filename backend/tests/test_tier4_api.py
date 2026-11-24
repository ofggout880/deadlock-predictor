"""
Tier 4: FastAPI Router Contracts, Schemas & Status Code Tests.
File: backend/tests/test_tier4_api.py
"""

import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app


class TestTier4Api(unittest.TestCase):
    """Tier 4: Validates endpoint contracts, schemas, risk categorization, and HTTP status codes."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_and_health_probes(self):
        """Verifies root information and lightweight health probe."""
        resp_root = self.client.get("/")
        self.assertEqual(resp_root.status_code, 200)
        self.assertIn("name", resp_root.json())
        self.assertIn("api_prefix", resp_root.json())

        resp_health = self.client.get("/health")
        self.assertEqual(resp_health.status_code, 200)
        self.assertEqual(resp_health.json()["status"], "healthy")

    def test_status_endpoint_contract(self):
        """Verifies /api/status endpoint response schema."""
        resp = self.client.get("/api/status")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("status", data)
        self.assertIn("version", data)
        self.assertIn("upstream_healthy", data)
        self.assertIn("mock_mode", data)
        self.assertEqual(data["status"], "ok")

    def test_heroes_catalog_endpoint(self):
        """Verifies /api/heroes endpoint returns hero catalog."""
        resp = self.client.get("/api/heroes")
        self.assertEqual(resp.status_code, 200)
        heroes = resp.json()
        self.assertIsInstance(heroes, list)
        self.assertGreaterEqual(len(heroes), 14)
        for h in heroes:
            self.assertIn("id", h)
            self.assertIn("name", h)
            self.assertIn("role", h)

    def test_ml_metrics_endpoint(self):
        """Verifies /api/ml/metrics returns model performance metrics."""
        resp = self.client.get("/api/ml/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("accuracy", data)
        self.assertIn("auc_score", data)
        self.assertIn("pr_auc", data)
        self.assertIn("feature_importances", data)
        # Genuine Option A test PR-AUC (0.5079), no artificial >= 0.70 inflation
        self.assertGreater(data["pr_auc"], 0.45)
        self.assertLess(data["pr_auc"], 0.70)
        self.assertEqual(data.get("best_threshold"), 0.225)

    def test_player_matches_endpoint_valid_and_invalid(self):
        """Verifies /api/players/{account_id}/matches handling."""
        # Valid player ID
        resp = self.client.get("/api/players/80128750/matches")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["account_id"], 80128750)
        self.assertEqual(data["total_matches"], len(data["matches"]))
        self.assertGreater(data["total_matches"], 0)

        # Invalid negative player ID -> 400 Bad Request
        resp_bad = self.client.get("/api/players/-99/matches")
        self.assertEqual(resp_bad.status_code, 400)

    def test_prediction_endpoint_post_and_get(self):
        """Verifies /api/predict/{account_id} POST and GET responses."""
        # POST prediction
        resp_post = self.client.post("/api/predict/80128750")
        self.assertEqual(resp_post.status_code, 200)
        data_post = resp_post.json()
        self.assertEqual(data_post["account_id"], 80128750)
        self.assertIn("churn_probability", data_post)
        self.assertIn("risk_level", data_post)
        self.assertIn("win_expectancy", data_post)
        self.assertIn("tilt_index", data_post)
        self.assertIn("key_contributing_factors", data_post)
        self.assertIn(data_post["risk_level"], ["LOW", "MODERATE", "CRITICAL"])
        self.assertGreaterEqual(len(data_post["key_contributing_factors"]), 2)

        # GET prediction
        resp_get = self.client.get("/api/predict/80128750")
        self.assertEqual(resp_get.status_code, 200)
        data_get = resp_get.json()
        self.assertEqual(data_get["account_id"], 80128750)

        # Invalid ID -> 400
        resp_inv = self.client.post("/api/predict/-1")
        self.assertEqual(resp_inv.status_code, 400)

    def test_archetypes_preset_predictions(self):
        """Verifies archetype list and calibrated archetype predictions."""
        resp_list = self.client.get("/api/predict/archetypes/list")
        self.assertEqual(resp_list.status_code, 200)
        archetypes = resp_list.json()
        self.assertEqual(len(archetypes), 4)

        # Tilting Trooper -> CRITICAL risk
        resp_tilt = self.client.get("/api/predict/archetype/tilting_trooper")
        self.assertEqual(resp_tilt.status_code, 200)
        tilt_data = resp_tilt.json()
        self.assertEqual(tilt_data["risk_level"], "CRITICAL")
        self.assertEqual(tilt_data["churn_probability"], 0.88)

        # Balanced Carry -> LOW risk
        resp_bal = self.client.get("/api/predict/archetype/balanced_carry")
        self.assertEqual(resp_bal.status_code, 200)
        bal_data = resp_bal.json()
        self.assertEqual(bal_data["risk_level"], "LOW")
        self.assertEqual(bal_data["churn_probability"], 0.14)

        # Non-existent archetype -> 404 Not Found
        resp_404 = self.client.get("/api/predict/archetype/non_existent_hero")
        self.assertEqual(resp_404.status_code, 404)

    def test_items_churn_analytics_endpoint(self):
        """Verifies /api/items/churn-analytics returns enriched item & hero telemetry."""
        resp = self.client.get("/api/items/churn-analytics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["cohort_windows_n"], 2696)
        self.assertEqual(data["deep_replay_windows_n"], 397)
        self.assertGreaterEqual(len(data["item_churn_rates"]), 14)
        self.assertGreaterEqual(len(data["hero_churn_rates"]), 10)
        for hero in data["hero_churn_rates"]:
            self.assertIn("incoming_headshot_rate", hero)
            self.assertIn("vitality_share", hero)
            self.assertIn("stun_headshot_hit_rate", hero)
        for item in data["item_churn_rates"]:
            self.assertIn("avg_buy_time", item)
            self.assertIn("avg_order_rank", item)

        # Verify hero_id alignment with MockService / spec_oracles (Ivy=10, Pocket=15, Lash=22)
        hero_id_map = {h["hero_name"]: h["hero_id"] for h in data["hero_churn_rates"]}
        self.assertEqual(hero_id_map.get("Ivy"), 10)
        self.assertEqual(hero_id_map.get("Pocket"), 15)
        self.assertEqual(hero_id_map.get("Lash"), 22)
        self.assertIn("items", data)
        self.assertIn("heroes", data)
        self.assertIn("summary", data)

    def test_live_win_inversion_duration_and_model_registry(self):
        """Verifies Amber Hand (team 0) win parsing, match_duration_s, seconds units, and real ML artifacts."""
        from app.services.feature_service import FeatureService, ModelArtifactRegistry, is_live_match_won

        # Team 0 win (player_team=0, match_result=0) and Team 1 loss (player_team=1, match_result=0)
        self.assertTrue(is_live_match_won({"player_team": 0, "match_result": 0}))
        self.assertFalse(is_live_match_won({"player_team": 0, "match_result": 1}))
        self.assertTrue(is_live_match_won({"player_team": 1, "match_result": 1}))
        self.assertFalse(is_live_match_won({"player_team": 1, "match_result": 0}))

        # Verify match_duration_s is respected and timings are in seconds (>= 420s)
        matches = [
            {
                "match_id": 10000001 + i,
                "player_team": 0,
                "match_result": 0,
                "match_duration_s": 2400,
                "net_worth": 36000,
                "player_kills": 8,
                "player_deaths": 3,
                "player_assists": 10,
                "last_hits": 160,
                "denies": 12,
                "start_time": 1794000000 - i * 3600,
            }
            for i in range(6)
        ]
        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["lane_win_rate"], 1.0)
        self.assertEqual(feats["recent_loss_streak"], 0.0)
        self.assertEqual(feats["souls_per_min"], 900.0)
        self.assertGreaterEqual(feats["tier3_item_timing"], 420.0)
        self.assertGreaterEqual(feats["flex_slot_unlock_time"], 600.0)

        # Verify real ML artifacts load and contain zero banned calendar features
        self.assertTrue(ModelArtifactRegistry.load())
        self.assertNotIn("avg_session_gap_days", ModelArtifactRegistry._features)
        self.assertNotIn("match_frequency_drift", ModelArtifactRegistry._features)

        # Verify live metadata & mate_stats enrichment flows into FeatureService.predict_churn
        mate_stats = [{"matches_played": 5, "matches": [10000001, 10000002, 10000003]}]
        acute_meta = [{
            "match_id": 10000001,
            "duration_s": 2400,
            "players": [{
                "account_id": 123456,
                "final_stats": {
                    "shots_hit": 500,
                    "shots_missed": 500,
                    "gold_death_loss": 300,
                    "gold_treasure": 1500,
                    "teammate_healing": 1200,
                    "teammate_barriering": 800,
                    "custom_user_stats": {
                        "Bullet Stats##HeadshotRate": 24.0,
                        "Bullet Stats - Incoming##HeadshotRate": 14.0,
                        "Parry Miss": 1.0,
                    },
                },
                "death_details_death_duration_s": [25.0, 35.0],
                "death_details_time_to_kill_s": [8.0, 10.0],
                "items_sold_time_s": [2350, 2360, 2370],
            }],
        }]
        pred = FeatureService.predict_churn(
            account_id=123456,
            matches=matches,
            mate_stats=mate_stats,
            acute_metadata=acute_meta,
        )
        self.assertEqual(pred.hidden_gems["solo_isolation_streak"], 0.0)
        self.assertEqual(pred.hidden_gems["party_play_pct"], 0.5)
        self.assertEqual(pred.hidden_gems["late_panic_sells"], 3.0)
        self.assertEqual(pred.hidden_gems["parry_miss_per_match"], 1.0)
        self.assertGreater(len(pred.key_contributing_factors), 0)

    def test_deadlock_client_passes_only_stored_history_param(self):
        """Verifies DeadlockClient.get_player_match_history sends only_stored_history=true."""
        import asyncio
        from unittest.mock import AsyncMock, patch
        from app.client.deadlock_client import DeadlockClient

        async def _run():
            client = DeadlockClient(offline_mode=True)
            with patch.object(client, "request", new=AsyncMock(return_value=[])) as mock_req:
                await client.get_player_match_history(80128750)
                mock_req.assert_awaited_once_with(
                    "GET",
                    "/v1/players/80128750/match-history",
                    params={"only_stored_history": "true"},
                    ttl_seconds=300,
                )
            await client.close()

        asyncio.run(_run())


if __name__ == "__main__":
    unittest.main()

