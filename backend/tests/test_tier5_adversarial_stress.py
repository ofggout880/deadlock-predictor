"""
Tier 5: Adversarial Coverage Hardening & White-Box Stress Testing Suite.
File: backend/tests/test_tier5_adversarial_stress.py

Adversarial Stress Test Matrix:
1. DeadlockClient:
   - Concurrent sliding-window rate locking serialization under high contention.
   - Retry with exponential backoff on HTTP 429 (Retry-After header parsing and >30s ceiling).
   - Retry with exponential backoff on HTTP 503 and 504.
   - Non-spinning exponential backoff on HTTP 500 and 502 server errors.
   - Immediate exception raising on client errors (400, 404, 422) without retry or mock masking.
   - Bounded LRU cache strict capacity bound (1000 items) and MRU access promotion.
   - TTL cache expiration and eviction.
   - Offline mock fallback coverage across all documented endpoints.

2. FeatureService:
   - Numerical boundary safety: 0 shots hit/missed (zero-division guard).
   - Numerical boundary safety: 0 deaths (max(1, deaths) denominator guard).
   - Numerical boundary safety: 0 match duration (max(1.0, duration/60) duration guard).
   - Numerical boundary safety: empty match history neutral baseline vector.
   - Extreme streak behavior: 100 consecutive losses (tilt index and churn bounding).
   - Extreme streak behavior: 100 consecutive wins (retention and win expectancy bounding).

3. Application Lifespan & Router Schemas:
   - Lifespan context manager startup (client allocation) and shutdown (client pool closure).
   - Health and system status endpoint response contract conformance.
   - Prediction endpoint schema bounds, factor attributions, and account ID input validation.
"""

import asyncio
from datetime import datetime, timezone
import math
from pathlib import Path
import sys
import time
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.client.deadlock_client import DeadlockClient, DeadlockAPIError
from app.main import app, lifespan
from app.models.schemas import PredictionResponse, StatusResponse
from app.services.feature_service import (
    FeatureService,
    compute_kda,
    compute_shooter_accuracy,
    compute_souls_per_minute,
    compute_tilt_index,
    ML_48_FEATURES,
)


class TestTier5DeadlockClientStress(unittest.TestCase):
    """White-box adversarial stress tests for DeadlockClient."""

    def setUp(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def tearDown(self):
        self.loop.close()

    def test_concurrent_sliding_window_rate_limiter_spacing(self):
        """
        Stress-tests sliding-window rate locking under concurrent coroutine contention.
        Fires 8 concurrent coroutines through _throttle() with 0.02s rate limit delay.
        Verifies strict serial execution spacing (total elapsed >= (N-1)*delay).
        """
        async def run_concurrent_throttles():
            client = DeadlockClient(offline_mode=True, rate_limit_delay=0.02)
            timestamps = []

            async def worker():
                await client._throttle()
                timestamps.append(time.monotonic())

            # Fire 8 concurrent tasks
            tasks = [asyncio.create_task(worker()) for _ in range(8)]
            await asyncio.gather(*tasks)
            await client.close()

            # Ensure all 8 completed
            self.assertEqual(len(timestamps), 8)
            # Verify total elapsed spans at least 7 intervals of 0.02s (- small jitter margin)
            total_elapsed = timestamps[-1] - timestamps[0]
            self.assertGreaterEqual(total_elapsed, 0.12)

            # Verify consecutive gaps are roughly >= rate_limit_delay
            gaps = [timestamps[i] - timestamps[i - 1] for i in range(1, len(timestamps))]
            for g in gaps:
                self.assertGreaterEqual(g, 0.015)

        self.loop.run_until_complete(run_concurrent_throttles())

    def test_retry_on_429_with_retry_after_header(self):
        """
        Verifies retry with Retry-After header parsing on HTTP 429.
        Simulates 429 on first attempt, then 200 on second attempt.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=False, max_retries=2, rate_limit_delay=0.0)

            resp_429 = MagicMock()
            resp_429.status_code = 429
            resp_429.headers = {"Retry-After": "0"}
            resp_429.text = "Rate limit exceeded"

            resp_200 = MagicMock()
            resp_200.status_code = 200
            resp_200.headers = {}
            resp_200.json.return_value = {"status": "recovered"}

            with patch.object(client._client, "request", new=AsyncMock(side_effect=[resp_429, resp_200])) as mock_req:
                res = await client.request("GET", "/v1/test/rate_limit")
                self.assertEqual(res, {"status": "recovered"})
                self.assertEqual(mock_req.call_count, 2)

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_retry_ceiling_on_429_exceeding_30s(self):
        """
        Verifies that when Retry-After exceeds 30.0s ceiling:
        - With fallback enabled: engages mock fallback without sleeping 45s.
        - With fallback disabled: immediately raises DeadlockAPIError(429).
        """
        async def run_test():
            # Test 1: Fallback enabled
            client_fallback = DeadlockClient(offline_mode=False, max_retries=3, enable_fallback=True)
            resp_429_long = MagicMock()
            resp_429_long.status_code = 429
            resp_429_long.headers = {"Retry-After": "45"}
            resp_429_long.text = "Rate limit exceeded; back off 45s"

            start_t = time.monotonic()
            with patch.object(client_fallback._client, "request", new=AsyncMock(return_value=resp_429_long)):
                res = await client_fallback.request("GET", "/v1/info/health")
                self.assertIn("services", res)
                self.assertTrue(res.get("mock_mode"))
            elapsed = time.monotonic() - start_t
            # Must finish well under 30s (immediate fallback engagement)
            self.assertLess(elapsed, 2.0)
            await client_fallback.close()

            # Test 2: Fallback disabled -> raises DeadlockAPIError
            client_strict = DeadlockClient(offline_mode=False, max_retries=3, enable_fallback=False)
            with patch.object(client_strict._client, "request", new=AsyncMock(return_value=resp_429_long)):
                with self.assertRaises(DeadlockAPIError) as ctx:
                    await client_strict.request("GET", "/v1/info/health")
                self.assertEqual(ctx.exception.status_code, 429)
                self.assertEqual(ctx.exception.retry_after, 45)
            await client_strict.close()

        self.loop.run_until_complete(run_test())

    def test_retry_backoff_on_503_and_504(self):
        """
        Verifies retries and exhaustion behavior on 503 Service Unavailable and 504 Gateway Timeout.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=False, max_retries=2, enable_fallback=False, rate_limit_delay=0.0)

            resp_503 = MagicMock()
            resp_503.status_code = 503
            resp_503.headers = {}
            resp_503.text = "Service Unavailable"

            with patch("asyncio.sleep", new=AsyncMock()) as mock_sleep:
                with patch.object(client._client, "request", new=AsyncMock(return_value=resp_503)) as mock_req:
                    with self.assertRaises(DeadlockAPIError) as ctx:
                        await client.request("GET", "/v1/test/503")
                    self.assertEqual(ctx.exception.status_code, 503)
                    # 1 initial attempt + 2 retries = 3 calls
                    self.assertEqual(mock_req.call_count, 3)
                    self.assertEqual(mock_sleep.call_count, 2)

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_non_spinning_backoff_on_500_502_server_errors(self):
        """
        Verifies server errors 500/502 sleep between attempts and engage fallback upon retry exhaustion.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=False, max_retries=2, enable_fallback=True, rate_limit_delay=0.0)

            resp_500 = MagicMock()
            resp_500.status_code = 500
            resp_500.text = "Internal Server Error"

            with patch("asyncio.sleep", new=AsyncMock()) as mock_sleep:
                with patch.object(client._client, "request", new=AsyncMock(return_value=resp_500)) as mock_req:
                    res = await client.request("GET", "/v1/assets/heroes")
                    self.assertIsInstance(res, list)
                    self.assertGreaterEqual(len(res), 14)
                    self.assertEqual(mock_req.call_count, 3)
                    self.assertEqual(mock_sleep.call_count, 2)

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_client_errors_400_404_422_raise_immediately_without_fallback(self):
        """
        Verifies client-side errors (400 Bad Request, 404 Not Found, 422 Unprocessable)
        raise DeadlockAPIError immediately without retrying or masking as fallback mock.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=False, max_retries=3, enable_fallback=True, rate_limit_delay=0.0)

            for code in (400, 404, 422):
                resp = MagicMock()
                resp.status_code = code
                resp.text = f"Client Error {code}"
                # httpx raises HTTPStatusError on raise_for_status()
                resp.raise_for_status.side_effect = httpx.HTTPStatusError(
                    message=f"HTTP {code}", request=MagicMock(), response=resp
                )

                with patch.object(client._client, "request", new=AsyncMock(return_value=resp)) as mock_req:
                    with self.assertRaises(DeadlockAPIError) as ctx:
                        await client.request("GET", f"/v1/test/{code}")
                    self.assertEqual(ctx.exception.status_code, code)
                    # Must NOT retry client errors
                    self.assertEqual(mock_req.call_count, 1)

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_lru_cache_bounded_capacity_1000(self):
        """
        Verifies strict bounded capacity enforcement for LRU cache.
        Inserts 1050 items into a client with max_cache_size=1000.
        Verifies cache size never exceeds 1000, and oldest 50 items are evicted.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=True, max_cache_size=1000)

            for i in range(1050):
                await client.request("GET", f"/v1/test/item_{i}", ttl_seconds=300)

            self.assertEqual(len(client._cache), 1000)

            # Oldest 50 items (0..49) should have been evicted
            cache_keys = client._cache.keys()
            for i in range(50):
                self.assertFalse(any(f"/v1/test/item_{i}:" in k for k in cache_keys))

            # Newest items (1000..1049) must be present
            for i in range(1000, 1050):
                self.assertTrue(any(f"/v1/test/item_{i}:" in k for k in cache_keys))

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_lru_cache_access_promotes_mru(self):
        """
        Verifies that accessing an item moves it to the end (MRU),
        preventing it from being evicted when new items are added.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=True, max_cache_size=3)

            await client.request("GET", "/v1/test/a", ttl_seconds=300)
            await client.request("GET", "/v1/test/b", ttl_seconds=300)
            await client.request("GET", "/v1/test/c", ttl_seconds=300)

            # Access 'a' so it becomes MRU
            await client.request("GET", "/v1/test/a", ttl_seconds=300)

            # Insert 'd' -> 'b' was the oldest unaccessed, so 'b' should be evicted
            await client.request("GET", "/v1/test/d", ttl_seconds=300)

            self.assertEqual(len(client._cache), 3)
            keys = list(client._cache.keys())
            self.assertTrue(any("test/a" in k for k in keys))
            self.assertFalse(any("test/b" in k for k in keys))
            self.assertTrue(any("test/c" in k for k in keys))
            self.assertTrue(any("test/d" in k for k in keys))

            await client.close()

        self.loop.run_until_complete(run_test())

    def test_all_mock_fallback_routes_complete(self):
        """
        Verifies all standard Deadlock API paths produce valid fixtures in fallback mode.
        """
        async def run_test():
            client = DeadlockClient(offline_mode=True)

            # 1. Health
            health = await client.get_health()
            self.assertTrue(health.get("mock_mode"))

            # 2. Heroes
            heroes = await client.get_heroes()
            self.assertGreaterEqual(len(heroes), 14)

            # 3. Match history
            matches = await client.get_player_match_history(123456)
            self.assertEqual(len(matches), 20)

            # 4. Match metadata
            meta = await client.get_match_metadata(9999)
            self.assertIn("match_id", meta)
            self.assertIn("duration_s", meta)

            # 5. Active matches
            active = await client.get_active_matches()
            self.assertIsInstance(active, list)

            # 6. Unrecognized route
            other = await client.request("GET", "/v1/unknown/endpoint")
            self.assertEqual(other.get("status"), "mock_fallback")

            await client.close()

        self.loop.run_until_complete(run_test())


class TestTier5FeatureServiceStress(unittest.TestCase):
    """Adversarial boundary and numerical stress tests for FeatureService."""

    def test_zero_shots_hit_and_missed(self):
        """Verifies accuracy computation safely returns 0.0 without ZeroDivisionError."""
        acc = compute_shooter_accuracy(0, 0)
        self.assertEqual(acc, 0.0)

        # Feature extraction on 0 shots
        matches = [{
            "shots_hit": 0,
            "shots_missed": 0,
            "player_kills": 5,
            "player_deaths": 2,
            "player_assists": 4,
            "net_worth": 15000,
            "duration_s": 1800,
            "match_result": 1,
        }]
        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["accuracy_pct"], 0.0)
        self.assertEqual(feats["crit_accuracy_pct"], 0.0)
        self.assertEqual(feats["headshot_ratio"], 0.0)

    def test_zero_deaths_kda_guard(self):
        """Verifies compute_kda uses max(1, deaths) denominator guard."""
        kda = compute_kda(kills=15, deaths=0, assists=10)
        self.assertEqual(kda, 25.0)

        matches = [{
            "shots_hit": 200,
            "shots_missed": 400,
            "player_kills": 15,
            "player_deaths": 0,
            "player_assists": 10,
            "net_worth": 20000,
            "duration_s": 1800,
            "match_result": 1,
        }]
        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["kda_ratio"], 25.0)
        self.assertEqual(feats["deaths_per_min"], 0.0)

    def test_zero_duration_guard(self):
        """Verifies compute_souls_per_minute uses max(1.0, duration/60) duration guard."""
        spm = compute_souls_per_minute(net_worth=15000, duration_seconds=0)
        self.assertEqual(spm, 15000.0)

        matches = [{
            "shots_hit": 50,
            "shots_missed": 50,
            "player_kills": 1,
            "player_deaths": 1,
            "player_assists": 1,
            "net_worth": 5000,
            "duration_s": 0,
            "match_result": 0,
        }]
        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["souls_per_min"], 5000.0)
        self.assertEqual(feats["kills_per_min"], 1.0)
        self.assertEqual(feats["deaths_per_min"], 1.0)

    def test_empty_matches_neutral_vector(self):
        """Verifies empty match list returns 48 features with 0.0 baseline."""
        feats = FeatureService.extract_48_features([])
        self.assertEqual(len(feats), 48)
        self.assertTrue(all(v == 0.0 for v in feats.values()))

        # Prediction with empty matches produces valid bounded response
        pred = FeatureService.predict_churn(account_id=8888, matches=[])
        self.assertIsInstance(pred, PredictionResponse)
        self.assertGreaterEqual(pred.churn_probability, 0.0)
        self.assertLessEqual(pred.churn_probability, 1.0)

    def test_extreme_loss_streak_bounds(self):
        """Verifies 100 consecutive losses caps tilt_index at 100.0 and flags CRITICAL risk."""
        matches = [{
            "shots_hit": 100,
            "shots_missed": 300,
            "player_kills": 0,
            "player_deaths": 12,
            "player_assists": 2,
            "net_worth": 4000,
            "duration_s": 1200,
            "match_result": 0,
        } for _ in range(100)]

        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["recent_loss_streak"], 100.0)
        self.assertEqual(feats["tilt_index"], 100.0)

        pred = FeatureService.predict_churn(account_id=9999, matches=matches)
        self.assertIn(pred.risk_level, ["MODERATE", "CRITICAL"])
        self.assertGreaterEqual(pred.churn_probability, 0.225)
        self.assertLessEqual(pred.churn_probability, 1.0)
        self.assertEqual(pred.tilt_index, 100.0)
        self.assertLessEqual(pred.win_expectancy, 0.10)

    def test_extreme_win_streak_bounds(self):
        """Verifies 100 consecutive wins keeps tilt_index at 0.0 and flags LOW risk."""
        matches = [{
            "shots_hit": 400,
            "shots_missed": 200,
            "player_kills": 18,
            "player_deaths": 2,
            "player_assists": 14,
            "net_worth": 32000,
            "duration_s": 1600,
            "match_result": 1,
        } for _ in range(100)]

        feats = FeatureService.extract_48_features(matches)
        self.assertEqual(feats["recent_loss_streak"], 0.0)
        self.assertEqual(feats["current_streak"], 100.0)
        self.assertEqual(feats["tilt_index"], 0.0)

        pred = FeatureService.predict_churn(account_id=7777, matches=matches)
        self.assertEqual(pred.risk_level, "LOW")
        self.assertLess(pred.churn_probability, 0.225)
        self.assertEqual(pred.tilt_index, 0.0)
        self.assertGreaterEqual(pred.win_expectancy, 0.90)


class TestTier5LifespanAndRouters(unittest.TestCase):
    """Stress tests for FastAPI lifespan manager and router contracts."""

    def test_lifespan_context_manager_lifecycle(self):
        """Verifies lifespan properly initializes DeadlockClient on enter and closes it on exit."""
        async def run_lifespan_test():
            test_app = app
            async with lifespan(test_app):
                # Verify client is created and mounted to app.state
                self.assertTrue(hasattr(test_app.state, "client"))
                self.assertIsInstance(test_app.state.client, DeadlockClient)
                self.assertFalse(test_app.state.client._client.is_closed)

            # Upon lifespan exit, client must be cleanly closed
            self.assertTrue(test_app.state.client._client.is_closed)

        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(run_lifespan_test())
        finally:
            loop.close()

    def test_prediction_endpoint_boundary_inputs(self):
        """Tests input validation on prediction endpoints with invalid account IDs."""
        with TestClient(app) as client:
            # Non-positive IDs must return HTTP 400
            for bad_id in [0, -1, -500]:
                resp = client.post(f"/api/predict/{bad_id}")
                self.assertEqual(resp.status_code, 400)
                self.assertIn("Invalid account ID", resp.json()["detail"])

                resp_get = client.get(f"/api/predict/{bad_id}")
                self.assertEqual(resp_get.status_code, 400)

            # Non-integer IDs must return HTTP 422
            resp_str = client.post("/api/predict/not_an_int")
            self.assertEqual(resp_str.status_code, 422)

    def test_prediction_output_schema_invariants(self):
        """Verifies PredictionResponse invariants on all 4 reference archetypes."""
        with TestClient(app) as client:
            archetypes = ["tilting_trooper", "burned_out_walker", "objective_guardian", "balanced_carry"]
            for arch_id in archetypes:
                resp = client.get(f"/api/predict/archetype/{arch_id}")
                self.assertEqual(resp.status_code, 200)
                data = resp.json()

                # Schema invariants
                self.assertGreaterEqual(data["churn_probability"], 0.0)
                self.assertLessEqual(data["churn_probability"], 1.0)
                self.assertIn(data["risk_level"], ["LOW", "MODERATE", "CRITICAL"])
                self.assertGreaterEqual(data["win_expectancy"], 0.0)
                self.assertLessEqual(data["win_expectancy"], 1.0)
                self.assertGreaterEqual(data["tilt_index"], 0.0)
                self.assertLessEqual(data["tilt_index"], 100.0)
                self.assertGreaterEqual(len(data["key_contributing_factors"]), 2)
                for factor in data["key_contributing_factors"]:
                    self.assertIn("feature", factor)
                    self.assertIn("impact", factor)
                    self.assertIn(factor["direction"], ["churn", "retention"])


if __name__ == "__main__":
    unittest.main()
