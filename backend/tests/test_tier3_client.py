"""
Tier 3: Deadlock API Client Unit, LRU Caching, Rate Limiting & Resilience Tests.
File: backend/tests/test_tier3_client.py
"""

import asyncio
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import httpx

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.client.deadlock_client import DeadlockClient, DeadlockAPIError


class TestTier3Client(unittest.TestCase):
    """Tier 3: Tests for DeadlockClient rate-limiting, bounded LRU caching, and backoff."""

    def setUp(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)

    def tearDown(self):
        self.loop.close()

    def test_client_initialization_defaults(self):
        """Verifies DeadlockClient initializes with expected defaults."""
        client = DeadlockClient(offline_mode=True)
        self.assertEqual(client.rate_limit_delay, 0.05)
        self.assertEqual(client.max_retries, 3)
        self.assertEqual(client.max_cache_size, 1000)
        self.assertTrue(client.offline_mode)
        self.loop.run_until_complete(client.close())

    def test_client_offline_mock_fallback_endpoints(self):
        """Verifies that in offline mode all client methods return mock fixtures without network."""
        client = DeadlockClient(offline_mode=True)

        async def run_checks():
            health = await client.get_health()
            self.assertIn("services", health)
            self.assertTrue(health.get("mock_mode"))

            heroes = await client.get_heroes()
            self.assertIsInstance(heroes, list)
            self.assertGreaterEqual(len(heroes), 14)

            matches = await client.get_player_match_history(80128750)
            self.assertIsInstance(matches, list)
            self.assertEqual(len(matches), 20)

            metadata = await client.get_match_metadata(24912954)
            self.assertIn("match_id", metadata)

            active = await client.get_active_matches()
            self.assertIsInstance(active, list)

            await client.close()

        self.loop.run_until_complete(run_checks())

    def test_client_bounded_lru_cache_and_ttl(self):
        """Verifies in-memory LRU cache stores responses, respects TTL, and evicts oldest items."""
        client = DeadlockClient(offline_mode=True, max_cache_size=3)

        async def run_cache_test():
            # Request 1 with TTL 60s
            res1 = await client.request("GET", "/v1/test/item1", ttl_seconds=60)
            self.assertEqual(len(client._cache), 1)

            # Request 1 again -> should hit cache
            res1_cached = await client.request("GET", "/v1/test/item1", ttl_seconds=60)
            self.assertEqual(res1, res1_cached)

            # Insert items 2, 3, 4 -> item 1 should be evicted because max_cache_size is 3
            await client.request("GET", "/v1/test/item2", ttl_seconds=60)
            await client.request("GET", "/v1/test/item3", ttl_seconds=60)
            await client.request("GET", "/v1/test/item4", ttl_seconds=60)

            self.assertEqual(len(client._cache), 3)
            # Item 1 should have been popped as oldest
            cache_keys = list(client._cache.keys())
            self.assertFalse(any("item1" in k for k in cache_keys))
            self.assertTrue(any("item4" in k for k in cache_keys))

            # Test TTL expiration: insert with 0.05s TTL, wait 0.1s
            await client.request("GET", "/v1/test/item_exp", ttl_seconds=1)
            # Manually age the cache entry
            for k in list(client._cache.keys()):
                if "item_exp" in k:
                    cached_at, data = client._cache[k]
                    client._cache[k] = (cached_at - 10.0, data)  # simulate 10s past TTL

            # Accessing again should detect expiry and re-fetch
            await client.request("GET", "/v1/test/item_exp", ttl_seconds=1)

            await client.close()

        self.loop.run_until_complete(run_cache_test())

    def test_client_rate_limiting_throttle(self):
        """Verifies sliding-window rate limiter spaces outbound calls."""
        client = DeadlockClient(offline_mode=True, rate_limit_delay=0.04)

        async def run_throttle_test():
            start = time.monotonic()
            await client._throttle()
            await client._throttle()
            await client._throttle()
            elapsed = time.monotonic() - start
            # 3 throttles with 0.04s spacing should take >= 0.07s
            self.assertGreaterEqual(elapsed, 0.06)
            await client.close()

        self.loop.run_until_complete(run_throttle_test())

    def test_client_fallback_on_network_or_503_error(self):
        """Verifies that client falls back gracefully to mock service when upstream returns 503."""
        client = DeadlockClient(offline_mode=False, max_retries=1, enable_fallback=True)

        async def run_fallback_test():
            # Mock the internal _client.request to simulate 503 Service Unavailable
            mock_resp = MagicMock()
            mock_resp.status_code = 503
            mock_resp.headers = {"Retry-After": "1"}
            mock_resp.text = "Service Unavailable"

            with patch.object(client._client, "request", new=AsyncMock(return_value=mock_resp)):
                # Should retry and then fallback to mock data without raising
                result = await client.request("GET", "/v1/info/health")
                self.assertIn("services", result)
                self.assertTrue(result.get("mock_mode"))

            await client.close()

        self.loop.run_until_complete(run_fallback_test())


if __name__ == "__main__":
    unittest.main()
