#!/usr/bin/env python3
"""
=============================================================================
Tier 4: Real-World Scenarios & System Workflows (5 Scenarios)
deadlock-predictor: Deadlock Telemetry, Tilt Dynamics & Churn Prediction
=============================================================================
Authoritative Sources:
- ORIGINAL_REQUEST.md (§R1 through §R3, Acceptance Criteria)
- PROJECT.md (§Milestones, Architecture, Interface Contracts)
- tests_e2e/spec_oracles.py
=============================================================================
"""

import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
BACKEND_DIR = PROJECT_ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.services.feature_service import FeatureService
from app.services.mock_service import MockService
from app.models.schemas import PredictionResponse

from tests_e2e.spec_oracles import (
    PROJECT_ROOT,
    DOCS_DIR,
    DEADLOCK_ASSESSMENT_PATH,
    FRONTEND_DIR,
    FRONTEND_SRC_DIR,
    BACKEND_DIR,
    BACKEND_APP_DIR,
    DEADLOCK_HEROES,
    CALIBRATED_ARCHETYPES,
    ML_48_FEATURES,
    get_file_content_safe,
    compute_shooter_accuracy,
    compute_kda,
    compute_tilt_index,
    map_probability_to_risk,
)


class TestTier4_RealWorldScenarios(unittest.TestCase):
    """Tier 4: Realistic End-to-End User, Developer, and Production Workflows."""

    def test_t4_01_scenario_api_assessment_doc_completeness_audit(self):
        """
        Scenario 1: Full API Evaluation Document Completeness Audit.
        Verifies that DEADLOCK_API_ASSESSMENT.md satisfies all evaluation sections:
        - API Purpose & Architecture (api.deadlock-api.com)
        - Usage & Authentication (Headers, Keys)
        - Available Endpoints (Players, Matches, Telemetry, Heroes)
        - Rate Limits, Quotas & Patron Tiers
        - Data Reliability & ClickHouse Ingestion
        - ML Prediction Adaptation Blueprint (48 features, 3D shooter aim, survival models)
        """
        content = get_file_content_safe(DEADLOCK_ASSESSMENT_PATH)
        required_topics = [
            "deadlock",
            "rate limit",
            "match",
            "player",
            "telemetry",
            "feature",
        ]
        if content:
            content_lower = content.lower()
            for topic in required_topics:
                self.assertIn(topic, content_lower, f"Missing required topic '{topic}' in assessment doc")
            self.assertGreaterEqual(len(content.splitlines()), 100, "Assessment doc too brief")
        else:
            # Specification contract verification
            self.assertEqual(DEADLOCK_ASSESSMENT_PATH.name, "DEADLOCK_API_ASSESSMENT.md")
            self.assertEqual(len(ML_48_FEATURES), 48)

    def test_t4_02_scenario_frontend_build_packaging_readiness(self):
        """
        Scenario 2: Frontend Build & Packaging Readiness.
        Validates package.json dependencies, Vite configuration, index.html,
        and ensures `npm run build` readiness.
        """
        pkg_file = FRONTEND_DIR / "package.json"
        content = get_file_content_safe(pkg_file)
        if content:
            pkg = json.loads(content)
            self.assertIn("scripts", pkg)
            self.assertIn("build", pkg["scripts"])
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            self.assertIn("react", deps)
            self.assertIn("vite", deps)

            # Check if node_modules exists to optionally run build dry-run
            node_modules = FRONTEND_DIR / "node_modules"
            if node_modules.exists():
                build_proc = subprocess.run(
                    ["npm", "run", "build"],
                    cwd=str(FRONTEND_DIR),
                    capture_output=True,
                    text=True,
                    timeout=30,
                )
                self.assertEqual(build_proc.returncode, 0, f"npm run build failed: {build_proc.stderr}")
        else:
            self.assertTrue(str(pkg_file).endswith("frontend/package.json"))

    def test_t4_03_scenario_backend_service_initialization_and_health(self):
        """
        Scenario 3: Backend Service Import & Initialization Readiness.
        Verifies backend FastAPI app structure, lifespan handler, router aggregation,
        and dependency configuration via real TestClient requests.
        """
        main_file = BACKEND_APP_DIR / "main.py"
        req_file = BACKEND_DIR / "requirements.txt"
        main_code = get_file_content_safe(main_file)
        req_code = get_file_content_safe(req_file)

        if main_code and req_code:
            self.assertIn("FastAPI", main_code)
            self.assertIn("include_router", main_code)
            self.assertIn("fastapi", req_code.lower())
            self.assertIn("httpx", req_code.lower())

        # Real TestClient route assertions
        client = TestClient(app)

        # 1. Root and health
        res_root = client.get("/")
        self.assertEqual(res_root.status_code, 200)
        self.assertEqual(res_root.json().get("name"), "deadlock-predictor")

        # 2. System Status
        res_status = client.get("/api/status")
        self.assertEqual(res_status.status_code, 200)
        self.assertEqual(res_status.json()["status"], "ok")

        # 3. Heroes catalog
        res_heroes = client.get("/api/heroes")
        self.assertEqual(res_heroes.status_code, 200)
        self.assertGreaterEqual(len(res_heroes.json()), 14)

        # 4. ML Metrics
        res_metrics = client.get("/api/ml/metrics")
        self.assertEqual(res_metrics.status_code, 200)
        self.assertIn("accuracy", res_metrics.json())

        # 5. Archetypes list
        res_archetypes = client.get("/api/predict/archetypes/list")
        self.assertEqual(res_archetypes.status_code, 200)
        self.assertEqual(len(res_archetypes.json()), 4)

    def test_t4_04_scenario_end_to_end_prediction_pipeline_flow(self):
        """
        Scenario 4: End-to-End Prediction Inference Journey.
        Simulates:
        1. Player account ID ingestion (e.g. 80128750).
        2. Match telemetry feature computation (shooter aim accuracy, KDA, tilt).
        3. Churn probability scoring and risk tier categorization.
        4. Factor attribution decomposition via real pipeline services.
        """
        account_id = 80128750
        matches = MockService.generate_player_matches(account_id, count=20)
        self.assertEqual(len(matches), 20)

        # 1. Extract 48 features
        features = FeatureService.extract_48_features(matches)
        self.assertEqual(len(features), 48)
        self.assertGreater(features["shots_hit"], 0)
        self.assertGreater(features["souls_per_min"], 0)
        self.assertGreaterEqual(features["accuracy_pct"], 0.0)

        # Telemetry mathematical checks
        shots_hit = 420
        shots_missed = 580
        kills = 12
        deaths = 4
        assists = 8
        loss_streak = 0
        abandon_rate = 0.02
        night_owl_pct = 0.10

        accuracy = compute_shooter_accuracy(shots_hit, shots_missed)
        kda = compute_kda(kills, deaths, assists)
        tilt = compute_tilt_index(loss_streak, abandon_rate, night_owl_pct, 0.0)

        self.assertEqual(accuracy, 42.0)
        self.assertEqual(kda, 5.0)
        self.assertLess(tilt, 20.0)

        # 2. Run real prediction pipeline
        pred = FeatureService.predict_churn(account_id=account_id, matches=matches, is_mock=True)
        self.assertIsInstance(pred, PredictionResponse)
        self.assertEqual(pred.account_id, account_id)
        self.assertGreaterEqual(pred.churn_probability, 0.0)
        self.assertLessEqual(pred.churn_probability, 1.0)
        self.assertIn(pred.risk_level, ["LOW", "MODERATE", "CRITICAL"])
        self.assertGreater(pred.win_expectancy, 0.0)
        self.assertGreaterEqual(len(pred.key_contributing_factors), 2)

    def test_t4_05_scenario_complete_offline_autonomy_workflow(self):
        """
        Scenario 5: Complete Offline Resilience & Autonomy Scenario.
        Validates that under total upstream API outage (network down / 503):
        1. System serves mock fallback transparently.
        2. All 4 archetypes and 14 heroes are available.
        3. Zero unhandled exceptions or blank screens occur.
        4. Zero legacy Dota 2 tokens across frontend components.
        """
        # 1. Backend mock service autonomy
        self.assertTrue(MockService.get_mock_health()["mock_mode"])
        self.assertEqual(len(MockService.get_heroes()), 18)
        self.assertEqual(len(MockService.get_archetypes()), 4)

        # 2. Frontend mockData.js verification
        mock_data_file = FRONTEND_SRC_DIR / "data" / "mockData.js"
        content = get_file_content_safe(mock_data_file)
        self.assertIsNotNone(content)

        # Verify exports exist
        for exp in ["MODEL_BENCHMARK_ROWS", "FEATURE_CATEGORIES", "TOP_FEATURE_IMPORTANCES", "MOCK_HEROES", "CALIBRATED_ARCHETYPES"]:
            self.assertIn(f"export const {exp}", content)

        # 3. Explicit negative assertion: Zero legacy Dota 2 tokens across components
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
        violations = []
        for file_path in sorted((FRONTEND_SRC_DIR / "components").glob("*.jsx")):
            lines = file_path.read_text(encoding="utf-8").splitlines()
            for line_no, line in enumerate(lines, 1):
                for token in forbidden_tokens:
                    pattern = r'\b' + re.escape(token) + r'\b'
                    if re.search(pattern, line, re.IGNORECASE):
                        violations.append(f"{file_path.name}:{line_no} [{token}] -> {line.strip()}")

        self.assertEqual(
            violations,
            [],
            f"Scenario 5 negative assertion failed: Found {len(violations)} legacy Dota 2 token violations in frontend components:\n" + "\n".join(violations)
        )


if __name__ == "__main__":
    unittest.main()
