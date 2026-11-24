#!/usr/bin/env python3
"""
=============================================================================
E2E Test Runner & Report Generator
deadlock-predictor: Deadlock Telemetry, Tilt Dynamics & Churn Prediction
=============================================================================
4-Tier Opaque-Box, Requirement-Driven Verification Framework
Usage:
    python3 test_e2e_runner.py [--tier {1,2,3,4}] [--verbose]
=============================================================================
"""

import os
import sys
import time
import argparse
import unittest
from pathlib import Path

# Ensure package root is in sys.path
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Import test modules
from tests_e2e import test_tier1_features
from tests_e2e import test_tier2_boundaries
from tests_e2e import test_tier3_combinations
from tests_e2e import test_tier4_scenarios

# Terminal color codes
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


class CustomTestResult(unittest.TestResult):
    """Custom test result collector tracking per-tier metrics."""

    def __init__(self, stream=None, descriptions=None, verbosity=None):
        super().__init__(stream, descriptions, verbosity)
        self.successes = []

    def addSuccess(self, test):
        super().addSuccess(test)
        self.successes.append(test)


def load_tier_suite(tier: int) -> unittest.TestSuite:
    """Loads tests corresponding to a specific tier."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    if tier == 1:
        suite.addTests(loader.loadTestsFromModule(test_tier1_features))
    elif tier == 2:
        suite.addTests(loader.loadTestsFromModule(test_tier2_boundaries))
    elif tier == 3:
        suite.addTests(loader.loadTestsFromModule(test_tier3_combinations))
    elif tier == 4:
        suite.addTests(loader.loadTestsFromModule(test_tier4_scenarios))
    else:
        raise ValueError(f"Invalid tier {tier}. Expected 1, 2, 3, or 4.")

    return suite


def run_e2e_suite(tier_filter: int = None, verbose: bool = False) -> int:
    """Runs the 4-tier E2E test suite and outputs a formatted execution report."""
    print(f"{BOLD}{CYAN}==============================================================================={RESET}")
    print(f"{BOLD}{CYAN}    DEADLOCK PREDICTOR — AUTOMATED E2E TEST SUITE RUNNER                      {RESET}")
    print(f"{DIM}    4-Tier Opaque-Box, Requirement-Driven Verification Framework               {RESET}")
    print(f"{BOLD}{CYAN}==============================================================================={RESET}\n")

    tiers_to_run = [tier_filter] if tier_filter else [1, 2, 3, 4]
    tier_descriptions = {
        1: "Tier 1: Feature Coverage (Category-Partition, F1-F10)",
        2: "Tier 2: Boundary Value Analysis & Edge Cases",
        3: "Tier 3: Pairwise Combinations & Cross-Feature Integration",
        4: "Tier 4: Real-World Scenarios & Production Workflows",
    }

    total_tests = 0
    total_passed = 0
    total_failed = 0
    total_errors = 0
    total_skipped = 0

    overall_start_time = time.time()
    tier_results = []

    for tier_num in tiers_to_run:
        suite = load_tier_suite(tier_num)
        test_count = suite.countTestCases()
        total_tests += test_count

        desc = tier_descriptions[tier_num]
        print(f"{BOLD}▶ Running {desc}...{RESET} ({test_count} tests)")

        tier_start = time.time()
        result = CustomTestResult()
        suite.run(result)
        tier_duration = time.time() - tier_start

        passed = len(result.successes)
        failed = len(result.failures)
        errors = len(result.errors)
        skipped = len(result.skipped)

        total_passed += passed
        total_failed += failed
        total_errors += errors
        total_skipped += skipped

        status_str = f"{GREEN}PASS{RESET}" if (failed == 0 and errors == 0) else f"{RED}FAIL{RESET}"
        tier_results.append((tier_num, desc, test_count, passed, failed, errors, skipped, tier_duration, status_str))

        if verbose or failed > 0 or errors > 0:
            for test, err in result.failures:
                print(f"  {RED}✖ FAILURE:{RESET} {test.id()}\n{DIM}{err}{RESET}")
            for test, err in result.errors:
                print(f"  {RED}✖ ERROR:{RESET} {test.id()}\n{DIM}{err}{RESET}")

        print(f"  └─ Status: {status_str} ({passed}/{test_count} passed in {tier_duration:.3f}s)\n")

    total_duration = time.time() - overall_start_time

    # Summary Table
    print(f"{BOLD}{CYAN}-------------------------------------------------------------------------------{RESET}")
    print(f"{BOLD}TIER BREAKDOWN & EXECUTION SUMMARY{RESET}")
    print(f"{BOLD}{CYAN}-------------------------------------------------------------------------------{RESET}")
    print(f"{'Tier':<8} {'Description':<42} {'Count':<7} {'Pass':<6} {'Fail':<6} {'Status':<8}")
    print(f"{'-'*8} {'-'*42} {'-'*7} {'-'*6} {'-'*6} {'-'*8}")

    for t_num, t_desc, t_cnt, t_pass, t_fail, t_err, t_skip, t_dur, t_stat in tier_results:
        short_desc = (t_desc[:39] + "...") if len(t_desc) > 42 else t_desc
        print(f"Tier {t_num:<3} {short_desc:<42} {t_cnt:<7} {t_pass:<6} {t_fail + t_err:<6} {t_stat:<8}")

    print(f"{BOLD}{CYAN}-------------------------------------------------------------------------------{RESET}")
    pass_rate = (total_passed / total_tests * 100.0) if total_tests > 0 else 0.0

    print(f"{BOLD}Total Tests Run:{RESET}      {total_tests}")
    print(f"{BOLD}Passed:{RESET}              {GREEN}{total_passed}{RESET}")
    print(f"{BOLD}Failures:{RESET}            {RED if total_failed > 0 else GREEN}{total_failed}{RESET}")
    print(f"{BOLD}Errors:{RESET}              {RED if total_errors > 0 else GREEN}{total_errors}{RESET}")
    print(f"{BOLD}Skipped:{RESET}             {YELLOW}{total_skipped}{RESET}")
    print(f"{BOLD}Pass Rate:{RESET}           {GREEN if pass_rate == 100.0 else RED}{pass_rate:.1f}%{RESET}")
    print(f"{BOLD}Total Duration:{RESET}      {total_duration:.3f} seconds\n")

    if total_failed == 0 and total_errors == 0:
        print(f"{BOLD}{GREEN}✔ ALL E2E TESTS PASSED SUCCESSFULLY! Ready for deployment & verification.{RESET}\n")
        return 0
    else:
        print(f"{BOLD}{RED}✖ TEST SUITE CONTAINED FAILURES OR ERRORS.{RESET}\n")
        return 1


def main():
    parser = argparse.ArgumentParser(description="Deadlock Predictor E2E Test Runner")
    parser.add_argument(
        "--tier",
        type=int,
        choices=[1, 2, 3, 4],
        default=None,
        help="Run only tests from a specific tier (1, 2, 3, or 4)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Verbose output showing failure tracebacks",
    )
    args = parser.parse_args()

    exit_code = run_e2e_suite(tier_filter=args.tier, verbose=args.verbose)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
