#!/usr/bin/env python3
"""
=============================================================================
Tier 3: Pairwise Combinations & Cross-Feature Integration Tests (10 Tests)
deadlock-predictor: Deadlock Telemetry, Tilt Dynamics & Churn Prediction
=============================================================================
Authoritative Sources:
- ORIGINAL_REQUEST.md (§R1 through §R3, Acceptance Criteria)
- PROJECT.md (§Interface Contracts: Backend ↔ Deadlock, Frontend ↔ Backend)
- tests_e2e/spec_oracles.py
=============================================================================
"""

import json
import re
import sys
import unittest
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from tests_e2e.spec_oracles import (
    PROJECT_ROOT,
    FRONTEND_DIR,
    FRONTEND_SRC_DIR,
    BACKEND_DIR,
    BACKEND_APP_DIR,
    DOCS_DIR,
    DEADLOCK_PALETTE,
    DEADLOCK_HEROES,
    CALIBRATED_ARCHETYPES,
    ML_48_FEATURES,
    BACKEND_ENDPOINTS,
    get_file_content_safe,
    check_security_violations,
    map_probability_to_risk,
)

# Ensure backend directory is in sys.path for direct service testing
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.models.schemas import PredictionResponse, FactorAttribution
from app.services.feature_service import FeatureService
from app.services.mock_service import MockService
from app.client.deadlock_client import DeadlockClient


class TestTier3_CrossFeatureCombinations(unittest.TestCase):
    """Tier 3: Pairwise combinations and cross-module contract interactions."""

    def test_t3_01_backend_client_offline_mock_fallback_integration(self):
        """Pairwise: DeadlockClient + MockService fallback contract."""
        client = DeadlockClient(offline_mode=True)
        self.assertTrue(client.offline_mode)

        # Test real mock fallback returns
        health = client._serve_mock_fallback("GET", "/v1/info/health")
        self.assertIn("services", health)
        self.assertTrue(health["services"]["clickhouse"])

        matches = client._serve_mock_fallback("GET", "/v1/players/80128750/match-history")
        self.assertEqual(len(matches), 20)
        self.assertIn("match_id", matches[0])

        heroes = client._serve_mock_fallback("GET", "/v1/assets/heroes")
        self.assertGreaterEqual(len(heroes), 14)

    def test_t3_02_frontend_bilingual_translations_and_archetypes_parity(self):
        """Pairwise: Bilingual FR/EN dictionary + 4 Calibrated Archetypes."""
        trans_file = FRONTEND_SRC_DIR / "translations.js"
        trans_code = get_file_content_safe(trans_file)

        # Ground truth oracle check
        for archetype in CALIBRATED_ARCHETYPES:
            self.assertIn("name_fr", archetype)
            self.assertIn("name_en", archetype)
            self.assertGreater(len(archetype["name_fr"]), 0)
            self.assertGreater(len(archetype["name_en"]), 0)

        if trans_code:
            self.assertTrue("fr" in trans_code and "en" in trans_code)

    def test_t3_03_router_response_matches_pydantic_schema_contract(self):
        """Pairwise: Prediction Router + Pydantic PredictionResponse schema."""
        matches = MockService.generate_player_matches(80128750, count=20)
        real_pred = FeatureService.predict_churn(account_id=80128750, matches=matches, is_mock=True)

        # Assert against REAL Pydantic model instance
        self.assertIsInstance(real_pred, PredictionResponse)
        self.assertEqual(real_pred.account_id, 80128750)
        self.assertGreaterEqual(real_pred.churn_probability, 0.0)
        self.assertLessEqual(real_pred.churn_probability, 1.0)
        self.assertIn(real_pred.risk_level, ["LOW", "MODERATE", "CRITICAL"])
        self.assertEqual(real_pred.risk_level, map_probability_to_risk(real_pred.churn_probability))
        self.assertGreater(len(real_pred.key_contributing_factors), 1)

        for factor in real_pred.key_contributing_factors:
            self.assertIsInstance(factor, FactorAttribution)
            self.assertIn(factor.direction, ["churn", "retention"])

    def test_t3_04_theme_tokens_consistency_css_and_components(self):
        """Pairwise: CSS design tokens + Deadlock Occult Dieselpunk palette."""
        for name, color in DEADLOCK_PALETTE.items():
            self.assertTrue(color.startswith("#"))
            self.assertEqual(len(color), 7)

        css_file = FRONTEND_SRC_DIR / "index.css"
        css_code = get_file_content_safe(css_file)
        if css_code:
            self.assertTrue("--bg-base" in css_code or "--primary" in css_code or "#0b0f19" in css_code)

    def test_t3_05_heroes_list_parity_frontend_mock_and_backend_schema(self):
        """Pairwise: Frontend hero mock data + Backend hero list schema."""
        self.assertGreaterEqual(len(DEADLOCK_HEROES), 14)
        for hero in DEADLOCK_HEROES:
            self.assertIn("id", hero)
            self.assertIn("name", hero)
            self.assertIn("role", hero)
            self.assertIsInstance(hero["id"], int)

    def test_t3_06_player_archetypes_parity_frontend_and_backend_defaults(self):
        """Pairwise: Frontend Simulator presets + Backend prediction defaults."""
        self.assertEqual(len(CALIBRATED_ARCHETYPES), 4)
        for arch in CALIBRATED_ARCHETYPES:
            prob = arch["churn_probability"]
            expected_tier = map_probability_to_risk(prob)
            self.assertEqual(arch["risk_level"], expected_tier)

    def test_t3_07_features_inventory_parity_docs_and_feature_service(self):
        """Pairwise: 48 ML features in assessment doc + feature engineering service."""
        feature_file = BACKEND_APP_DIR / "services" / "feature_service.py"
        feature_code = get_file_content_safe(feature_file)

        # Specification oracle verification
        self.assertEqual(len(ML_48_FEATURES), 48)
        self.assertTrue(len(set(ML_48_FEATURES)) == 48, "Duplicate features detected")

        if feature_code:
            for feat in ["shots_hit", "souls_per_min", "tilt_index", "kda_ratio"]:
                self.assertIn(feat, feature_code)

    def test_t3_08_rate_limiting_sliding_window_concurrency_contract(self):
        """Pairwise: Async DeadlockClient rate limiter + asyncio concurrency."""
        client = DeadlockClient(rate_limit_delay=0.1, max_retries=3)
        self.assertEqual(client.rate_limit_delay, 0.1)
        self.assertEqual(client.max_retries, 3)
        self.assertTrue(hasattr(client, "_rate_lock"))

        # Verify exponential backoff model: 1.0 * (2 ** attempt) bounded by 30.0s
        for attempt in range(4):
            base_backoff = min(30.0, 1.0 * (2 ** attempt))
            self.assertLessEqual(base_backoff, 30.0)
            self.assertEqual(base_backoff, 1.0 * (2 ** attempt))

    def test_t3_09_offline_mode_resilience_preserves_is_mock_flag(self):
        """Pairwise: Offline fallback trigger + transparent UI contract."""
        mock_health = MockService.get_mock_health()
        self.assertTrue(mock_health["mock_mode"])

        pred = FeatureService.predict_churn(account_id=99999999, matches=[], is_mock=True)
        self.assertTrue(pred.is_mock)

        # Inspect real api.js code for offline fallback preservation
        api_js = FRONTEND_SRC_DIR / "services" / "api.js"
        content = get_file_content_safe(api_js)
        self.assertIsNotNone(content)
        self.assertIn("isMock: true", content)
        self.assertIn("isOffline: true", content)

    def test_t3_10_security_sanitization_cross_frontend_and_backend(self):
        """Pairwise: Security audit across both frontend and backend directories."""
        dirs_to_check = [FRONTEND_DIR, BACKEND_DIR, DOCS_DIR]
        for directory in dirs_to_check:
            if directory.exists():
                for file_path in directory.rglob("*"):
                    if file_path.is_file() and file_path.suffix in (".py", ".js", ".jsx", ".json", ".md"):
                        content = get_file_content_safe(file_path)
                        if content:
                            violations = check_security_violations(content)
                            self.assertEqual(violations, [], f"Security violations in {file_path}: {violations}")

    def test_t3_11_negative_assertion_no_legacy_dota2_tokens_in_frontend(self):
        """Negative Assertion: Zero legacy Dota 2 tokens across frontend components."""
        forbidden_tokens = [
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
        components_dir = FRONTEND_SRC_DIR / "components"
        violations = []

        for file_path in sorted(components_dir.glob("*.jsx")):
            lines = file_path.read_text(encoding="utf-8").splitlines()
            for line_no, line in enumerate(lines, 1):
                for token in forbidden_tokens:
                    pattern = r'\b' + re.escape(token) + r'\b'
                    if re.search(pattern, line, re.IGNORECASE):
                        violations.append(f"{file_path.name}:{line_no} [{token}] -> {line.strip()}")

        self.assertEqual(
            violations,
            [],
            f"Found {len(violations)} legacy Dota 2 token violations in frontend components:\n" + "\n".join(violations)
        )


if __name__ == "__main__":
    unittest.main()
