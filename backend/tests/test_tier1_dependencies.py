"""
Tier 1: Dependency, Environment & Configuration Verification.
File: backend/tests/test_tier1_dependencies.py
"""

import sys
import unittest
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


class TestTier1Dependencies(unittest.TestCase):
    """Tier 1: Verifies dependency imports, environment configuration, and project metadata."""

    def test_python_version_compatibility(self):
        """Verifies Python runtime is at least version 3.9."""
        major, minor = sys.version_info.major, sys.version_info.minor
        self.assertGreaterEqual(major, 3)
        self.assertGreaterEqual(minor, 9)

    def test_core_package_imports(self):
        """Verifies that all core framework and ML dependencies import cleanly."""
        import fastapi
        import httpx
        import pydantic
        import sklearn

        self.assertIsNotNone(fastapi.__version__)
        self.assertIsNotNone(httpx.__version__)
        self.assertIsNotNone(pydantic.__version__)
        self.assertIsNotNone(sklearn.__version__)

    def test_config_settings_defaults(self):
        """Verifies Pydantic BaseSettings parses configuration with valid defaults."""
        from app.core.config import settings

        self.assertEqual(settings.PROJECT_NAME, "deadlock-predictor")
        self.assertEqual(settings.VERSION, "1.0.0")
        self.assertEqual(settings.API_V1_STR, "/api")
        self.assertTrue(settings.DEADLOCK_API_BASE_URL.startswith("http"))
        self.assertIsInstance(settings.CORS_ORIGINS, list)
        self.assertEqual(settings.MAX_CACHE_SIZE, 1000)

    def test_pydantic_schemas_instantiation(self):
        """Verifies Pydantic v2 schemas instantiate and validate correctly."""
        from app.models.schemas import (
            StatusResponse,
            HeroDescriptor,
            FactorAttribution,
            PredictionResponse,
        )

        status = StatusResponse(status="ok", version="1.0.0", upstream_healthy=True, mock_mode=False)
        self.assertEqual(status.status, "ok")
        self.assertEqual(status.version, "1.0.0")

        hero = HeroDescriptor(id=1, name="Infernus", role="DPS / Burn")
        self.assertEqual(hero.name, "Infernus")

        factor = FactorAttribution(feature="accuracy_pct", impact=-0.15, direction="retention")
        self.assertEqual(factor.direction, "retention")

        pred = PredictionResponse(
            account_id=80128750,
            churn_probability=0.25,
            risk_level="LOW",
            win_expectancy=0.68,
            tilt_index=15.0,
            key_contributing_factors=[factor],
            is_mock=False,
        )
        self.assertEqual(pred.account_id, 80128750)
        self.assertEqual(pred.risk_level, "LOW")

    def test_dependency_specification_files_exist(self):
        """Verifies requirements.txt, pyproject.toml, and .env.example exist."""
        req_file = BACKEND_DIR / "requirements.txt"
        toml_file = BACKEND_DIR / "pyproject.toml"
        env_file = BACKEND_DIR / ".env.example"

        self.assertTrue(req_file.exists(), "requirements.txt missing")
        self.assertTrue(toml_file.exists(), "pyproject.toml missing")
        self.assertTrue(env_file.exists(), ".env.example missing")

        req_content = req_file.read_text().lower()
        self.assertIn("fastapi", req_content)
        self.assertIn("httpx", req_content)
        self.assertIn("pydantic", req_content)


if __name__ == "__main__":
    unittest.main()
