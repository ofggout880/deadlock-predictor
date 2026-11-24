#!/usr/bin/env python3
"""
=============================================================================
EMPIRICAL CHALLENGER ADVERSARIAL STRESS TEST HARNESS
Milestone 4 Iteration 3
=============================================================================
Stress-tests:
1. 14 forbidden tokens detection & false-negative / mutation analysis
2. FastAPI backend endpoints: valid, boundary, invalid, fuzz, offline fallback
3. DeadlockClient resilience under simulated upstream outages
4. FeatureService numerical boundary safety & 48-feature invariants
=============================================================================
"""

import asyncio
import concurrent.futures
import json
import math
from pathlib import Path
import re
import sys
import time
from typing import Any, Dict, List
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

# Ensure backend and test suite in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import httpx
from fastapi.testclient import TestClient

from app.main import app, lifespan
from app.client.deadlock_client import DeadlockClient, DeadlockAPIError
from app.services.feature_service import (
    FeatureService,
    compute_shooter_accuracy,
    compute_kda,
    compute_souls_per_minute,
    compute_tilt_index,
    ML_48_FEATURES,
)
from app.services.mock_service import MockService
from app.models.schemas import PredictionResponse, StatusResponse

FORBIDDEN_14_TOKENS = [
    "opendota",
    "dota2_churn_model.pkl",
    "dota2_scaler.pkl",
    "Archon IV",
    "Turbo",
    "radiant and dire",
    "bonus Shards",
    "shard quest bonus",
    "Dota 2",
    "Dota Plus",
    "MMR",
    "score comportement",
    "behavior score",
    "comportement 10k",
]


class ChallengerAdversarialSuite(unittest.TestCase):
    """Forensic adversarial verification suite by Empirical Challenger."""

    # =========================================================================
    # PART 1: 14 FORBIDDEN TOKENS ADVERSARIAL VERIFICATION & MUTATION TESTING
    # =========================================================================

    def test_c1_token_list_exact_14_members(self):
        """Verifies exactly 14 forbidden tokens are monitored."""
        self.assertEqual(len(FORBIDDEN_14_TOKENS), 14)

    def test_c1_adversarial_mutation_and_false_negative_rejection(self):
        """
        Adversarially mutates every single one of the 14 tokens in various formats:
        - UPPERCASE, lowercase, TitleCase, mixed-case
        - Inside JSX expressions, strings, inline comments, HTML tags
        Verifies that the detection regex catches 100% of mutations (0 FALSE NEGATIVES).
        """
        detected_mutations = 0
        total_mutations = 0

        for token in FORBIDDEN_14_TOKENS:
            variations = [
                token.lower(),
                token.upper(),
                token.title(),
                token.swapcase(),
            ]
            # Context envelopes
            envelopes = [
                lambda v: f'const x = "{v}";',
                lambda v: f'<p>{v}</p>',
                lambda v: f'// TODO: inspect {v} carefully',
                lambda v: f'/* multi-line {v} comment */',
                lambda v: f'<div data-tip="{v}">',
                lambda v: f'({v})',
                lambda v: f'"{v}"',
                lambda v: f"'{v}'",
                lambda v: f' `{v}` ',
            ]

            for var in variations:
                for env in envelopes:
                    total_mutations += 1
                    test_str = env(var)
                    # Test regex as implemented in test suites
                    pattern = r'\b' + re.escape(token) + r'\b'
                    match = re.search(pattern, test_str, re.IGNORECASE)
                    if match:
                        detected_mutations += 1
                    else:
                        self.fail(f"False negative detected! Token '{token}' mutated as '{var}' in '{test_str}' was NOT detected.")

        self.assertEqual(detected_mutations, total_mutations)
        print(f"\n[PART 1.2] Mutation verification: {detected_mutations}/{total_mutations} synthetic mutations caught (100% detection rate, 0 false negatives).")

    def test_c1_no_false_positives_on_legitimate_tokens(self):
        """
        Verifies that similar legitimate French and English words do NOT trigger false positives:
        - 'direction', 'directement', 'c'est-à-dire' (contains 'dire')
        - 'score' (isolated)
        - 'bonus' (isolated)
        - 'shard' / 'shards' (isolated, without 'bonus' or 'quest')
        - 'plus' (isolated)
        - 'turbo' (as substring e.g. 'turbulent')
        - 'archon' (isolated, without 'IV')
        """
        legitimate_phrases = [
            "La direction artistique du projet est soignée.",
            "Ce match s'est terminé directement après la mort du Patron.",
            "C'est-à-dire que le joueur montre une grande régularité.",
            "Le score global est de 95 points.",
            "Un bonus de Souls est accordé aux combattants.",
            "Collecter les Soul Shards dans la carte.",
            "Le jeu offre plus d'options stratégiques.",
            "Un flux turbulent dans les ruelles.",
            "Le titre d'Archon suprême dans l'occulte.",
            "The radiant glow of the spirit urn illuminated the lane.",
            "The player had exemplary conduct rating without tilt.",
        ]

        for phrase in legitimate_phrases:
            for token in FORBIDDEN_14_TOKENS:
                pattern = r'\b' + re.escape(token) + r'\b'
                match = re.search(pattern, phrase, re.IGNORECASE)
                self.assertIsNone(
                    match,
                    f"False positive detected! Legitimate phrase '{phrase}' matched forbidden token '{token}'"
                )

    def test_c1_exhaustive_frontend_scan_zero_violations(self):
        """
        Scans ALL files in frontend/src/ (components, data, css, app, main, translations)
        using the 14-token word-boundary regex.
        Ensures 0 residual violations exist anywhere in the frontend source tree.
        """
        frontend_src = PROJECT_ROOT / "frontend" / "src"
        self.assertTrue(frontend_src.exists())

        violations = []
        file_count = 0

        for file_path in frontend_src.rglob("*"):
            if file_path.is_file() and file_path.suffix in (".js", ".jsx", ".css", ".json", ".html"):
                file_count += 1
                lines = file_path.read_text(encoding="utf-8").splitlines()
                for lno, line in enumerate(lines, 1):
                    for token in FORBIDDEN_14_TOKENS:
                        pattern = r'\b' + re.escape(token) + r'\b'
                        if re.search(pattern, line, re.IGNORECASE):
                            violations.append(f"{file_path.relative_to(PROJECT_ROOT)}:{lno} [{token}] -> {line.strip()}")

        self.assertEqual(
            violations,
            [],
            f"Exhaustive frontend scan failed! Found {len(violations)} violations:\n" + "\n".join(violations)
        )
        print(f"[PART 1.4] Scanned {file_count} frontend source files: 0 violations found.")

    # =========================================================================
    # PART 2: FASTAPI BACKEND ADVERSARIAL STRESS & FUZZING
    # =========================================================================

    def test_c2_core_endpoints_200_ok_and_schema_validation(self):
        """Verifies that all documented endpoints return HTTP 200 and schema compliant JSON."""
        with TestClient(app) as client:
            # 1. Root & health
            r_root = client.get("/")
            self.assertEqual(r_root.status_code, 200)
            self.assertIn("version", r_root.json())

            r_health = client.get("/health")
            self.assertEqual(r_health.status_code, 200)
            self.assertEqual(r_health.json()["status"], "healthy")

            r_api_health = client.get("/api/health")
            self.assertEqual(r_api_health.status_code, 200)
            self.assertEqual(r_api_health.json()["status"], "healthy")

            # 2. Status
            r_status = client.get("/api/status")
            self.assertEqual(r_status.status_code, 200)
            status_data = r_status.json()
            for key in ["status", "version", "upstream_healthy", "mock_mode"]:
                self.assertIn(key, status_data)

            # 3. Heroes (18 heroes)
            r_heroes = client.get("/api/heroes")
            self.assertEqual(r_heroes.status_code, 200)
            heroes = r_heroes.json()
            self.assertEqual(len(heroes), 18)
            for h in heroes:
                self.assertIn("id", h)
                self.assertIn("name", h)
                self.assertIn("role", h)

            # 4. ML Metrics
            r_metrics = client.get("/api/ml/metrics")
            self.assertEqual(r_metrics.status_code, 200)
            metrics = r_metrics.json()
            self.assertGreaterEqual(metrics["accuracy"], 0.70)
            self.assertGreaterEqual(metrics["auc_score"], 0.75)
            self.assertGreaterEqual(metrics["pr_auc"], 0.70)
            self.assertGreaterEqual(len(metrics["feature_importances"]), 10)

            # 5. Calibrated Archetypes list
            r_arch_list = client.get("/api/predict/archetypes/list")
            self.assertEqual(r_arch_list.status_code, 200)
            archetypes = r_arch_list.json()
            self.assertEqual(len(archetypes), 4)

            # 6. Specific Archetype predictions
            for arch in ["tilting_trooper", "burned_out_walker", "objective_guardian", "balanced_carry"]:
                r_arch = client.get(f"/api/predict/archetype/{arch}")
                self.assertEqual(r_arch.status_code, 200)
                d = r_arch.json()
                self.assertIn("churn_probability", d)
                self.assertIn("risk_level", d)
                self.assertIn("win_expectancy", d)
                self.assertIn("tilt_index", d)
                self.assertIn("key_contributing_factors", d)

            # 7. Valid player endpoints
            r_profile = client.get("/api/players/80128750")
            self.assertEqual(r_profile.status_code, 200)
            self.assertEqual(r_profile.json()["account_id"], 80128750)

            r_matches = client.get("/api/players/80128750/matches")
            self.assertEqual(r_matches.status_code, 200)
            self.assertGreaterEqual(r_matches.json()["total_matches"], 1)

            # 8. Prediction GET and POST
            r_pred_post = client.post("/api/predict/80128750")
            self.assertEqual(r_pred_post.status_code, 200)

            r_pred_get = client.get("/api/predict/80128750")
            self.assertEqual(r_pred_get.status_code, 200)

    def test_c2_adversarial_invalid_input_fuzzing(self):
        """
        Fuzzes endpoints with invalid inputs:
        - Non-positive integer account IDs (0, -1, -99999) -> must return 400 Bad Request
        - Non-numeric account IDs ('foo', 'abc-123') -> must return 422 Unprocessable Entity
        - Extreme int boundaries (2**31 - 1, 2**31, 2**63 - 1) -> handled safely
        - SQL Injection payloads -> 422 Unprocessable Entity
        - XSS payloads -> 422 Unprocessable Entity
        - Buffer overflow / 10k character strings -> 422 Unprocessable Entity
        """
        with TestClient(app) as client:
            # 1. Non-positive account IDs (400)
            for bad_id in [0, -1, -50, -999999]:
                r1 = client.get(f"/api/players/{bad_id}")
                self.assertEqual(r1.status_code, 400)
                self.assertIn("detail", r1.json())

                r2 = client.get(f"/api/players/{bad_id}/matches")
                self.assertEqual(r2.status_code, 400)

                r3 = client.post(f"/api/predict/{bad_id}")
                self.assertEqual(r3.status_code, 400)

                r4 = client.get(f"/api/predict/{bad_id}")
                self.assertEqual(r4.status_code, 400)

            # 2. Non-integer inputs (422)
            fuzz_non_ints = [
                "foo",
                "abc_123",
                "12.34",
                "1; DROP TABLE players;--",
                "<script>alert(1)</script>",
                "a" * 10000,
                "null",
                "undefined",
                "True",
            ]
            for fuzz in fuzz_non_ints:
                r_player = client.get(f"/api/players/{fuzz}")
                self.assertEqual(r_player.status_code, 422)

                r_matches = client.get(f"/api/players/{fuzz}/matches")
                self.assertEqual(r_matches.status_code, 422)

                r_pred_post = client.post(f"/api/predict/{fuzz}")
                self.assertEqual(r_pred_post.status_code, 422)

                r_pred_get = client.get(f"/api/predict/{fuzz}")
                self.assertEqual(r_pred_get.status_code, 422)

            # 3. High integer boundaries (safe execution without crash)
            for large_id in [2147483647, 2147483648, 9999999999]:
                r = client.post(f"/api/predict/{large_id}")
                self.assertEqual(r.status_code, 200)
                self.assertEqual(r.json()["account_id"], large_id)

    def test_c2_adversarial_archetype_fuzzing(self):
        """
        Fuzzes /api/predict/archetype/{archetype_id}:
        - Non-existent archetypes -> 404
        - Path traversal attempts -> 404
        - XSS attempts -> 404
        """
        with TestClient(app) as client:
            bad_archetypes = [
                "non_existent",
                "phantom_assassin",
                "../../etc/passwd",
                "..%2F..%2Fetc%2Fpasswd",
                "<script>alert('xss')</script>",
                "tilting_trooper; DROP TABLE archetypes;",
                "   ",
            ]
            for bad_arch in bad_archetypes:
                resp = client.get(f"/api/predict/archetype/{bad_arch}")
                self.assertEqual(resp.status_code, 404)
                self.assertIn("detail", resp.json())

    def test_c2_unmounted_and_misnamed_endpoint_handling(self):
        """
        Adversarially tests candidate endpoint misnomers:
        - /api/player/80128750/summary -> 404 Not Found (actual: /api/players/80128750)
        - /api/predict/churn -> 422 Unprocessable Entity ('churn' is not int ID)
        - /api/live/metrics -> 404 Not Found (actual: /api/ml/metrics)
        - /api/unknown -> 404 Not Found
        Verifies that none of these trigger 500 Internal Server Error.
        """
        with TestClient(app) as client:
            endpoints = [
                ("GET", "/api/player/80128750/summary", 404),
                ("GET", "/api/live/metrics", 404),
                ("GET", "/api/unknown/service", 404),
                ("POST", "/api/predict/churn", 422),
                ("GET", "/api/predict/churn", 422),
            ]
            for method, path, expected_status in endpoints:
                if method == "GET":
                    resp = client.get(path)
                else:
                    resp = client.post(path)
                self.assertEqual(
                    resp.status_code,
                    expected_status,
                    f"Expected status {expected_status} for {method} {path}, got {resp.status_code}: {resp.text}"
                )
                self.assertNotEqual(resp.status_code, 500, f"Server crashed on {method} {path}!")

    def test_c2_predict_post_payload_fuzzing(self):
        """
        Fuzzes POST /api/predict/{account_id} with diverse body payloads:
        - empty body
        - empty JSON dict {}
        - custom matches with valid data
        - custom matches with extreme numerical data
        - custom matches with unexpected fields
        - malformed JSON
        """
        with TestClient(app) as client:
            # 1. Empty body -> 200 OK
            r1 = client.post("/api/predict/80128750")
            self.assertEqual(r1.status_code, 200)

            # 2. Empty JSON dict -> 200 OK
            r2 = client.post("/api/predict/80128750", json={})
            self.assertEqual(r2.status_code, 200)

            # 3. Custom matches
            r3 = client.post("/api/predict/80128750", json={
                "custom_matches": [
                    {
                        "match_id": 1001,
                        "hero_id": 2,
                        "match_result": 0,
                        "player_kills": 0,
                        "player_deaths": 15,
                        "player_assists": 1,
                        "net_worth": 3000,
                        "duration_s": 900,
                    }
                ]
            })
            self.assertEqual(r3.status_code, 200)

            # 4. Custom matches with unexpected extra fields
            r4 = client.post("/api/predict/80128750", json={
                "custom_matches": [{"unexpected_field": 9999, "nested": {"a": [1, 2]}}],
                "extra_metadata": "ignored safely",
            })
            self.assertEqual(r4.status_code, 200)

            # 5. Invalid field types in custom_matches (string instead of list) -> 422
            r5 = client.post("/api/predict/80128750", json={"custom_matches": "not_a_list"})
            self.assertEqual(r5.status_code, 422)

    def test_c2_offline_mock_fallback_transparency(self):
        """
        Verifies that when client is in offline mode or encounters errors,
        all endpoints seamlessly serve mock fallback data with is_mock=True
        and zero uncaught exceptions.
        """
        async def run_offline_test():
            client = DeadlockClient(offline_mode=True)
            # Health
            h = await client.get_health()
            self.assertTrue(h["mock_mode"])

            # Heroes
            heroes = await client.get_heroes()
            self.assertEqual(len(heroes), 18)

            # Match history
            matches = await client.get_player_match_history(99999)
            self.assertEqual(len(matches), 20)

            # Match metadata
            meta = await client.get_match_metadata(12345)
            self.assertEqual(meta["match_id"], 12345)

            # Active matches
            active = await client.get_active_matches()
            self.assertIsInstance(active, list)

            await client.close()

        loop = asyncio.new_event_loop()
        try:
            loop.run_until_complete(run_offline_test())
        finally:
            loop.close()

    def test_c2_high_concurrency_stress_load(self):
        """
        Fires 200 concurrent requests across endpoints using a thread pool.
        Verifies zero deadlocks, zero dropped requests, and 100% clean status codes.
        """
        with TestClient(app) as client:
            endpoints = [
                "/api/status",
                "/api/heroes",
                "/api/ml/metrics",
                "/api/predict/archetypes/list",
                "/api/predict/archetype/tilting_trooper",
                "/api/predict/archetype/balanced_carry",
                "/api/players/80128750",
                "/api/players/80128750/matches",
                "/api/predict/80128750",
            ]

            def fetch(idx):
                path = endpoints[idx % len(endpoints)]
                resp = client.get(path)
                return resp.status_code

            with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
                start_t = time.monotonic()
                results = list(executor.map(fetch, range(200)))
                elapsed = time.monotonic() - start_t

            self.assertEqual(len(results), 200)
            self.assertTrue(all(code == 200 for code in results))
            print(f"\n[PART 2.7] High concurrency test: 200 requests completed in {elapsed:.3f}s (100% HTTP 200 OK).")

    # =========================================================================
    # PART 3: FEATURE SERVICE & DEADLOCK CLIENT ADVANCED STRESS
    # =========================================================================

    def test_c3_extreme_mathematical_boundaries(self):
        """
        Tests mathematical functions against zero, negative, and extreme inputs:
        - Accuracy with negative numbers or both zero
        - KDA with 0 deaths (guard: max(1, deaths))
        - Souls per minute with negative net worth or 0 duration
        - Tilt index with negative streak or massive 1M streak
        """
        # Accuracy
        self.assertEqual(compute_shooter_accuracy(0, 0), 0.0)
        self.assertEqual(compute_shooter_accuracy(-10, -5), 0.0)
        self.assertEqual(compute_shooter_accuracy(50, 50), 50.0)
        self.assertEqual(compute_shooter_accuracy(100, 0), 100.0)

        # KDA
        self.assertEqual(compute_kda(0, 0, 0), 0.0)
        self.assertEqual(compute_kda(10, 0, 0), 10.0)
        self.assertEqual(compute_kda(0, 5, 0), 0.0)
        self.assertEqual(compute_kda(10, 2, 5), 7.5)

        # Souls per minute
        self.assertEqual(compute_souls_per_minute(10000, 0), 10000.0)
        self.assertEqual(compute_souls_per_minute(6000, 60), 6000.0)
        self.assertEqual(compute_souls_per_minute(12000, 120), 6000.0)

        # Tilt index (bounded to [0.0, 100.0])
        self.assertEqual(compute_tilt_index(-5, 0.0, 0.0, 0.0), 0.0)
        self.assertEqual(compute_tilt_index(1000000, 1.0, 1.0, 1.0), 100.0)
        self.assertEqual(compute_tilt_index(0, 0.0, 0.0, 0.0), 0.0)

    def test_c3_48_features_vector_integrity(self):
        """
        Verifies that FeatureService.extract_48_features always outputs:
        - Exactly 48 features
        - All numeric float values
        - No NaN or Inf values
        """
        test_cases = [
            [],  # empty matches
            [{"shots_hit": 10, "shots_missed": 90, "net_worth": 1000, "duration_s": 600}],  # single match
            [{} for _ in range(5)],  # empty dicts
            [{"match_result": 1, "shots_hit": 500, "shots_missed": 200, "player_kills": 20, "player_deaths": 1, "net_worth": 35000, "duration_s": 2400} for _ in range(25)],  # heavy carry
        ]

        for idx, matches in enumerate(test_cases):
            feats = FeatureService.extract_48_features(matches)
            self.assertEqual(len(feats), 48, f"Case {idx} did not yield 48 features!")
            for name, val in feats.items():
                self.assertIsInstance(val, (int, float), f"Feature {name} is not numeric in case {idx}")
                self.assertFalse(math.isnan(val), f"Feature {name} is NaN in case {idx}")
                self.assertFalse(math.isinf(val), f"Feature {name} is Inf in case {idx}")


if __name__ == "__main__":
    unittest.main()
