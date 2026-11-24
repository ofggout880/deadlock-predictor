"""
Deadlock API Asynchronous Client
File: deadlock-predictor/backend/app/client/deadlock_client.py

Production-grade asynchronous client for https://api.deadlock-api.com.
Architectural Capabilities:
- Connection pooling with keep-alive across async event loops.
- Sliding-window client-side rate throttling (default 20 req/s safe window).
- Exponential backoff with Retry-After header parsing on 429/503/504 up to 30.0s ceiling.
- Non-spinning exponential backoff sleep on 500/502 server errors.
- Bounded in-memory LRU response caching (OrderedDict with maxsize=1000) with TTL support.
- Resilient offline fallback routing to MockService on upstream outage or offline mode.
"""

import asyncio
from collections import OrderedDict
import logging
import random
import time
from typing import Any, Dict, List, Optional, Union

import httpx

from app.core.config import settings
from app.services.mock_service import MockService

logger = logging.getLogger("deadlock_client")


class DeadlockAPIError(Exception):
    """Base exception for upstream Deadlock API interactions."""

    def __init__(self, status_code: int, message: str, retry_after: Optional[int] = None):
        super().__init__(f"HTTP {status_code}: {message}")
        self.status_code = status_code
        self.message = message
        self.retry_after = retry_after


class DeadlockClient:
    """
    Production-grade asynchronous client for https://api.deadlock-api.com.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 15.0,
        max_retries: int = 3,
        rate_limit_delay: float = 0.05,  # 20 req/s
        enable_fallback: bool = True,
        offline_mode: Optional[bool] = None,
        max_cache_size: int = 1000,
    ):
        self.base_url = (base_url or settings.DEADLOCK_API_BASE_URL).rstrip("/")
        self.api_key = api_key if api_key is not None else settings.DEADLOCK_API_KEY
        self.timeout = timeout
        self.max_retries = max_retries
        self.rate_limit_delay = rate_limit_delay
        self.enable_fallback = enable_fallback
        self.offline_mode = offline_mode if offline_mode is not None else settings.OFFLINE_MODE
        self.max_cache_size = max_cache_size

        headers = {
            "Accept": "application/json",
            "User-Agent": "DeadlockPredictor/1.0 (+https://github.com/deadlock-predictor)",
        }
        if self.api_key:
            headers["X-API-KEY"] = self.api_key

        self._client = httpx.AsyncClient(
            base_url=self.base_url,
            headers=headers,
            timeout=httpx.Timeout(timeout, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )
        self._rate_lock = asyncio.Lock()
        self._last_request_time = 0.0
        self._cache: OrderedDict[str, tuple] = OrderedDict()

    async def _throttle(self) -> None:
        """Enforces sliding-window rate spacing between outbound requests."""
        async with self._rate_lock:
            elapsed = time.monotonic() - self._last_request_time
            if elapsed < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - elapsed)
            self._last_request_time = time.monotonic()

    def _serve_mock_fallback(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Serves high-fidelity offline mock fixtures when upstream API is unavailable
        or when offline_mode is active.
        """
        logger.warning("Routing %s %s to offline mock fallback service", method, path)
        norm_path = path.strip("/")

        if "info/health" in norm_path or norm_path == "health":
            return MockService.get_mock_health()

        if "assets/heroes" in norm_path or "heroes" in norm_path:
            return MockService.get_heroes()

        if "match-history" in norm_path:
            # Extract account_id from /v1/players/{account_id}/match-history
            parts = norm_path.split("/")
            account_id = 80128750
            for i, p in enumerate(parts):
                if p == "players" and i + 1 < len(parts):
                    try:
                        account_id = int(parts[i + 1])
                    except ValueError:
                        pass
                    break
            return MockService.generate_player_matches(account_id)

        if "metadata" in norm_path:
            parts = norm_path.split("/")
            match_id = 24912954
            for i, p in enumerate(parts):
                if p == "matches" and i + 1 < len(parts):
                    try:
                        match_id = int(parts[i + 1])
                    except ValueError:
                        pass
                    break
            return {
                "match_id": match_id,
                "duration_s": 1920,
                "winning_team": 0,
                "players": [
                    {
                        "account_id": 80128750,
                        "hero_id": 3,
                        "stats": {
                            "shots_hit": 420,
                            "shots_missed": 610,
                            "hero_bullets_hit_crit": 115,
                            "damage_absorbed": 14500,
                        },
                    }
                ],
                "match_info": {
                    "watched_death_replays": 2,
                    "objectives_mask": 0b1101,
                },
            }

        if "matches/active" in norm_path:
            return MockService.get_mock_active_matches()

        return {"status": "mock_fallback", "path": path, "params": params, "mock_mode": True}

    async def request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
        ttl_seconds: Optional[int] = None,
        use_cache: bool = True,
    ) -> Any:
        """Executes resilient HTTP request with LRU caching, backoff, and offline fallback."""
        norm_path = path if path.startswith("/") else f"/{path}"
        cache_key = f"{method}:{norm_path}:{str(sorted(params.items()) if params else '')}"
        now = time.time()

        # Bounded LRU in-memory TTL Cache lookup
        if use_cache and ttl_seconds and cache_key in self._cache:
            cached_at, cached_data = self._cache[cache_key]
            if now - cached_at < ttl_seconds:
                self._cache.move_to_end(cache_key)
                return cached_data
            else:
                del self._cache[cache_key]

        # Fast path if explicit offline mode enabled
        if self.offline_mode:
            logger.debug("[Offline Mode] Serving mock fallback for %s", norm_path)
            data = self._serve_mock_fallback(method, norm_path, params)
            if ttl_seconds:
                self._cache[cache_key] = (now, data)
                self._cache.move_to_end(cache_key)
                if len(self._cache) > self.max_cache_size:
                    self._cache.popitem(last=False)
            return data

        for attempt in range(self.max_retries + 1):
            await self._throttle()
            try:
                response = await self._client.request(
                    method=method,
                    url=norm_path,
                    params=params,
                    json=json_body,
                )

                # Handle Rate Limiting & Queue-Based Load Shedding (429, 503, 504)
                if response.status_code in (429, 503, 504):
                    retry_after_hdr = response.headers.get("Retry-After")
                    if retry_after_hdr and retry_after_hdr.isdigit():
                        retry_delay = float(retry_after_hdr)
                    else:
                        retry_delay = min(30.0, 1.0 * (2 ** attempt))

                    retry_delay += random.uniform(0.05, 0.2)

                    if attempt < self.max_retries and retry_delay <= 30.0:
                        logger.warning(
                            "Status %d on %s, retrying in %.2fs (attempt %d/%d)",
                            response.status_code, norm_path, retry_delay, attempt + 1, self.max_retries
                        )
                        await asyncio.sleep(retry_delay)
                        continue
                    else:
                        if self.enable_fallback:
                            logger.warning(
                                "Retries exhausted or retry_delay > 30s (%d on %s). Engaging mock fallback.",
                                response.status_code, norm_path
                            )
                            return self._serve_mock_fallback(method, norm_path, params)
                        raise DeadlockAPIError(
                            response.status_code,
                            response.text,
                            retry_after=int(retry_delay),
                        )

                # Handle Server Errors (500, 502) with exponential backoff sleep
                if response.status_code in (500, 502):
                    if attempt < self.max_retries:
                        backoff = min(30.0, (1.0 * (2 ** attempt)) + random.uniform(0.05, 0.2))
                        logger.warning(
                            "Server error %d on %s, backing off %.2fs (attempt %d/%d)",
                            response.status_code, norm_path, backoff, attempt + 1, self.max_retries
                        )
                        await asyncio.sleep(backoff)
                        continue
                    else:
                        if self.enable_fallback:
                            logger.warning(
                                "Server error %d persisted on %s. Engaging mock fallback.",
                                response.status_code, norm_path
                            )
                            return self._serve_mock_fallback(method, norm_path, params)
                        raise DeadlockAPIError(response.status_code, response.text)

                response.raise_for_status()
                data = response.json()

                # Bounded LRU Cache write with maxsize eviction
                if ttl_seconds:
                    self._cache[cache_key] = (now, data)
                    self._cache.move_to_end(cache_key)
                    if len(self._cache) > self.max_cache_size:
                        self._cache.popitem(last=False)  # Evict oldest entry
                return data

            except httpx.HTTPStatusError as exc:
                if exc.response.status_code in (400, 404, 422):
                    raise DeadlockAPIError(exc.response.status_code, exc.response.text)
                if attempt == self.max_retries:
                    if self.enable_fallback:
                        return self._serve_mock_fallback(method, norm_path, params)
                    raise DeadlockAPIError(exc.response.status_code, str(exc))
                backoff = min(30.0, (1.0 * (2 ** attempt)) + random.uniform(0.05, 0.2))
                await asyncio.sleep(backoff)

            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                if attempt == self.max_retries:
                    if self.enable_fallback:
                        logger.warning("Network/Timeout error on %s. Engaging mock fallback.", norm_path)
                        return self._serve_mock_fallback(method, norm_path, params)
                    raise DeadlockAPIError(504, f"Network/Timeout error: {str(exc)}")
                backoff = min(30.0, (1.0 * (2 ** attempt)) + random.uniform(0.05, 0.2))
                await asyncio.sleep(backoff)

    async def get(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        ttl_seconds: Optional[int] = None,
        use_cache: bool = True,
    ) -> Any:
        """Convenience GET method wrapper."""
        return await self.request(
            method="GET",
            path=endpoint,
            params=params,
            ttl_seconds=ttl_seconds,
            use_cache=use_cache,
        )

    async def get_health(self) -> Dict[str, Any]:
        """Probes healthcheck status of upstream ClickHouse, Postgres, and Redis."""
        return await self.request("GET", "/v1/info/health", ttl_seconds=30)

    async def get_player_match_history(self, account_id: int) -> List[Dict[str, Any]]:
        """Fetches up to last 100 stored ClickHouse matches for account_id (cached 300s)."""
        return await self.request(
            "GET",
            f"/v1/players/{account_id}/match-history",
            params={"only_stored_history": "true"},
            ttl_seconds=300,
        )

    async def get_match_metadata(self, match_id: int) -> Dict[str, Any]:
        """Fetches detailed match telemetry report including 180s interval snapshots."""
        return await self.request("GET", f"/v1/matches/{match_id}/metadata", ttl_seconds=3600)

    async def get_active_matches(self) -> List[Dict[str, Any]]:
        """Fetches active in-flight matches on Valve servers (cached 120s)."""
        return await self.request("GET", "/v1/matches/active", ttl_seconds=120)

    async def get_heroes(self) -> List[Dict[str, Any]]:
        """Fetches full hero asset catalog (cached 3600s)."""
        return await self.request("GET", "/v1/assets/heroes", ttl_seconds=3600)

    async def close(self) -> None:
        """Closes the underlying HTTPX connection pool cleanly."""
        await self._client.aclose()
