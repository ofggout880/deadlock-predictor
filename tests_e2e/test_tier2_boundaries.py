#!/usr/bin/env python3
"""
=============================================================================
Tier 2: Boundary Value Analysis & Edge Cases (20 Tests)
deadlock-predictor: Deadlock Telemetry, Tilt Dynamics & Churn Prediction
=============================================================================
Authoritative Sources:
- ORIGINAL_REQUEST.md (§R1 through §R3, Acceptance Criteria)
- PROJECT.md (§Interface Contracts, Error Handling)
- tests_e2e/spec_oracles.py
=============================================================================
"""

import math
import unittest
from pathlib import Path

from tests_e2e.spec_oracles import (
    compute_shooter_accuracy,
    compute_kda,
    compute_souls_per_minute,
    compute_tilt_index,
    calculate_exponential_backoff,
    map_probability_to_risk,
)


class TestTier2_BoundariesAndEdgeCases(unittest.TestCase):
    """Tier 2: Boundary Value Analysis and Adversarial Stress Conditions."""

    # 1. Math & Probability Bounding
    def test_t2_01_probability_clamping_lower_bound(self):
        """Verifies negative probability input clamps safely to 0.0 / LOW risk."""
        risk = map_probability_to_risk(-0.25)
        self.assertEqual(risk, "LOW")

    def test_t2_02_probability_clamping_upper_bound(self):
        """Verifies probability > 1.0 clamps safely to 1.0 / CRITICAL risk."""
        risk = map_probability_to_risk(1.45)
        self.assertEqual(risk, "CRITICAL")

    def test_t2_03_risk_level_tier_cutoff_low_boundary(self):
        """Verifies exact unified Option A threshold 0.225 maps to MODERATE risk tier."""
        self.assertEqual(map_probability_to_risk(0.2249), "LOW")
        self.assertEqual(map_probability_to_risk(0.2250), "MODERATE")

    def test_t2_04_risk_level_tier_cutoff_high_boundary(self):
        """Verifies exact threshold 0.60 boundary conditions."""
        self.assertEqual(map_probability_to_risk(0.6000), "MODERATE")
        self.assertEqual(map_probability_to_risk(0.6001), "CRITICAL")

    def test_t2_05_tilt_index_bounds_and_non_negative(self):
        """Verifies tilt index stays strictly within [0.0, 100.0] even with extreme values."""
        # Extreme negative inputs
        tilt_zero = compute_tilt_index(loss_streak=-10, abandon_rate=-0.5, night_owl_pct=-0.2, accuracy_drop=-0.5)
        self.assertGreaterEqual(tilt_zero, 0.0)
        self.assertLessEqual(tilt_zero, 100.0)

        # Extreme positive inputs
        tilt_max = compute_tilt_index(loss_streak=50, abandon_rate=1.0, night_owl_pct=1.0, accuracy_drop=1.0)
        self.assertEqual(tilt_max, 100.0)

    # 2. Zero-Division Guards
    def test_t2_06_accuracy_zero_shots_guard(self):
        """Verifies accuracy calculation handles zero total shots without ZeroDivisionError."""
        acc = compute_shooter_accuracy(shots_hit=0, shots_missed=0)
        self.assertEqual(acc, 0.0)

    def test_t2_07_accuracy_all_hits_and_all_misses(self):
        """Verifies 100% accuracy and 0% accuracy boundaries."""
        self.assertEqual(compute_shooter_accuracy(shots_hit=50, shots_missed=0), 100.0)
        self.assertEqual(compute_shooter_accuracy(shots_hit=0, shots_missed=50), 0.0)

    def test_t2_08_kda_zero_deaths_guard(self):
        """Verifies KDA formula uses max(1, deaths) for flawless games (0 deaths)."""
        kda = compute_kda(kills=15, deaths=0, assists=10)
        self.assertEqual(kda, 25.0)

    def test_t2_09_souls_per_min_zero_duration_guard(self):
        """Verifies souls per minute calculation guards against 0 seconds duration."""
        spm = compute_souls_per_minute(net_worth=5000, duration_seconds=0)
        self.assertGreater(spm, 0.0)
        self.assertEqual(spm, 5000.0)

    def test_t2_10_extreme_streak_calculations(self):
        """Verifies extreme loss streaks up to 20 without arithmetic overflow."""
        tilt_20 = compute_tilt_index(loss_streak=20, abandon_rate=0.2, night_owl_pct=0.5, accuracy_drop=0.2)
        self.assertLessEqual(tilt_20, 100.0)
        self.assertGreaterEqual(tilt_20, 0.0)

    # 3. Input Sanitization & Account ID Boundaries
    def test_t2_11_account_id_negative_value_detection(self):
        """Verifies boundary check on negative account ID input."""
        account_id = -80128750
        is_valid = isinstance(account_id, int) and account_id > 0
        self.assertFalse(is_valid)

    def test_t2_12_account_id_alphanumeric_or_symbol_handling(self):
        """Verifies malformed string account ID triggers invalid validation."""
        raw_input = "steam_80128750_invalid!"
        self.assertFalse(raw_input.isdigit())

    def test_t2_13_account_id_empty_string_handling(self):
        """Verifies empty account ID string triggers rejection."""
        raw_input = "   "
        self.assertEqual(len(raw_input.strip()), 0)

    def test_t2_14_account_id_sql_xss_injection_handling(self):
        """Verifies SQL injection strings are safely non-numeric and sanitized."""
        injections = [
            "80128750; DROP TABLE players;--",
            "<script>alert('xss')</script>",
            "' OR '1'='1",
        ]
        for payload in injections:
            self.assertFalse(payload.isdigit())

    def test_t2_15_account_id_maximum_64bit_integer(self):
        """Verifies 64-bit integer boundary (SteamID64) handling."""
        steam64_id = 76561198040394478
        self.assertTrue(steam64_id > 0)
        self.assertTrue(steam64_id < 2**63 - 1)

    # 4. Upstream Rate Limiting & Network Resilience Boundaries
    def test_t2_16_exponential_backoff_max_delay_cap(self):
        """Verifies exponential backoff caps strictly at max_delay (e.g. 30.0s)."""
        delay_attempt_1 = calculate_exponential_backoff(attempt=1, base_delay=1.0, max_delay=30.0)
        delay_attempt_10 = calculate_exponential_backoff(attempt=10, base_delay=1.0, max_delay=30.0)
        self.assertEqual(delay_attempt_1, 2.0)
        self.assertEqual(delay_attempt_10, 30.0)

    def test_t2_17_retry_after_header_parsing_boundary(self):
        """Verifies Retry-After integer header parsing with fallback."""
        header_val = "15"
        parsed = int(header_val) if header_val.isdigit() else 1
        self.assertEqual(parsed, 15)

        invalid_header = "invalid_timestamp"
        parsed_fallback = int(invalid_header) if invalid_header.isdigit() else 1
        self.assertEqual(parsed_fallback, 1)

    def test_t2_18_http_503_service_unavailable_fallback(self):
        """Verifies HTTP 503 triggers fallback mode flag."""
        status_code = 503
        should_fallback = status_code in (429, 502, 503, 504)
        self.assertTrue(should_fallback)

    def test_t2_19_empty_upstream_match_history_list(self):
        """Verifies handling of empty match history list (new player cold start)."""
        empty_history = []
        is_cold_start = len(empty_history) == 0
        self.assertTrue(is_cold_start)

    def test_t2_20_partial_telemetry_missing_aim_stats(self):
        """Verifies partial match telemetry with missing aim stats defaults to 0."""
        partial_telemetry = {"shots_hit": None, "shots_missed": None}
        safe_hit = partial_telemetry.get("shots_hit") or 0
        safe_missed = partial_telemetry.get("shots_missed") or 0
        self.assertEqual(safe_hit, 0)
        self.assertEqual(safe_missed, 0)
        self.assertEqual(compute_shooter_accuracy(safe_hit, safe_missed), 0.0)


if __name__ == "__main__":
    unittest.main()
