"""
Tier 2: Application Initialization & Core Services Verification.
File: backend/tests/test_tier2_init.py
"""

import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from app.services.mock_service import MockService
from app.services.feature_service import (
    FeatureService,
    ModelArtifactRegistry,
    ML_48_FEATURES,
    compute_shooter_accuracy,
    compute_kda,
    compute_souls_per_minute,
    compute_tilt_index,
    calculate_exponential_backoff,
    map_probability_to_risk,
)


class TestTier2Init(unittest.TestCase):
    """Tier 2: Verifies app structure, services initialization, and feature engineering math."""

    def test_fastapi_app_initialization(self):
        """Verifies FastAPI app instance configuration and lifespan."""
        self.assertEqual(app.title, "deadlock-predictor")
        self.assertEqual(app.version, "1.0.0")
        self.assertIsNotNone(app.router)

        # Verify mounted routes contain key endpoints
        routes = [route.path for route in app.routes]
        self.assertIn("/api/status", routes)
        self.assertIn("/api/heroes", routes)
        self.assertIn("/api/ml/metrics", routes)
        self.assertIn("/api/players/{account_id}/matches", routes)
        self.assertIn("/api/predict/{account_id}", routes)

    def test_mock_service_heroes_and_archetypes(self):
        """Verifies mock fixtures contain required heroes and archetypes."""
        heroes = MockService.get_heroes()
        self.assertGreaterEqual(len(heroes), 14)
        hero_names = [h["name"] for h in heroes]
        self.assertIn("Infernus", hero_names)
        self.assertIn("Seven", hero_names)
        self.assertIn("Vindicta", hero_names)

        archetypes = MockService.get_archetypes()
        self.assertEqual(len(archetypes), 4)
        arch_ids = [a["id"] for a in archetypes]
        self.assertIn("tilting_trooper", arch_ids)
        self.assertIn("burned_out_walker", arch_ids)
        self.assertIn("objective_guardian", arch_ids)
        self.assertIn("balanced_carry", arch_ids)

    def test_mock_service_player_matches_generation(self):
        """Verifies realistic match history generation for player account."""
        matches = MockService.generate_player_matches(80128750, count=20)
        self.assertEqual(len(matches), 20)
        first_match = matches[0]
        self.assertIn("match_id", first_match)
        self.assertIn("hero_id", first_match)
        self.assertIn("player_kills", first_match)
        self.assertIn("net_worth", first_match)
        self.assertIn("shots_hit", first_match)
        self.assertIn("shots_missed", first_match)

    def test_feature_service_extract_48_features(self):
        """Verifies that FeatureService computes exactly 48 features with correct names."""
        matches = MockService.generate_player_matches(80128750, count=20)
        features = FeatureService.extract_48_features(matches)

        self.assertEqual(len(features), 48)
        self.assertEqual(len(ML_48_FEATURES), 48)
        for feature_name in ML_48_FEATURES:
            self.assertIn(feature_name, features)
            self.assertIsInstance(features[feature_name], float)

    def test_feature_service_zero_division_safety(self):
        """Verifies zero-division guards across mathematical helpers."""
        # Accuracy zero shots
        self.assertEqual(compute_shooter_accuracy(0, 0), 0.0)
        self.assertEqual(compute_shooter_accuracy(50, 0), 100.0)
        self.assertEqual(compute_shooter_accuracy(0, 50), 0.0)

        # KDA zero deaths
        self.assertEqual(compute_kda(10, 0, 5), 15.0)

        # Souls per min zero duration
        spm = compute_souls_per_minute(6000, 0)
        self.assertEqual(spm, 6000.0)

    def test_tilt_index_bounds_and_risk_thresholds(self):
        """Verifies tilt index bounds [0, 100] and risk tier mapping."""
        tilt_low = compute_tilt_index(-5, -0.2, -0.1, -0.5)
        self.assertGreaterEqual(tilt_low, 0.0)

        tilt_high = compute_tilt_index(10, 1.0, 1.0, 1.0)
        self.assertEqual(tilt_high, 100.0)

        # Risk tier cutoffs (unified theta* = 0.225)
        self.assertEqual(map_probability_to_risk(-0.1), "LOW")
        self.assertEqual(map_probability_to_risk(0.2249), "LOW")
        self.assertEqual(map_probability_to_risk(0.2250), "MODERATE")
        self.assertEqual(map_probability_to_risk(0.6000), "MODERATE")
        self.assertEqual(map_probability_to_risk(0.6001), "CRITICAL")
        self.assertEqual(map_probability_to_risk(1.2), "CRITICAL")

    def test_exponential_backoff_ceiling(self):
        """Verifies backoff delay scales exponentially but caps at 30.0s."""
        self.assertEqual(calculate_exponential_backoff(0, 1.0, 30.0), 1.0)
        self.assertEqual(calculate_exponential_backoff(1, 1.0, 30.0), 2.0)
        self.assertEqual(calculate_exponential_backoff(2, 1.0, 30.0), 4.0)
        self.assertEqual(calculate_exponential_backoff(6, 1.0, 30.0), 30.0)

    def test_cold_start_prediction_determinism(self):
        """Verifies first cold-start prediction applies era stats identically to warm calls."""
        ModelArtifactRegistry._model = None
        ModelArtifactRegistry._scaler = None
        ModelArtifactRegistry._features = []
        ModelArtifactRegistry._era_stats = None

        matches = MockService.generate_player_matches(80128750, count=20)
        first = FeatureService.predict_churn(account_id=80128750, matches=matches)
        second = FeatureService.predict_churn(account_id=80128750, matches=matches)

        self.assertEqual(first.churn_probability, second.churn_probability)
        self.assertEqual(first.risk_level, second.risk_level)
        self.assertIsNotNone(ModelArtifactRegistry._era_stats)


if __name__ == "__main__":
    unittest.main()
