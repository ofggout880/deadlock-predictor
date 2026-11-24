"""
Pytest configuration, shared fixtures, and TestClient setup.
File: backend/tests/conftest.py
"""

import sys
from pathlib import Path
from typing import Any, Dict, Generator, List

import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app
from app.client.deadlock_client import DeadlockClient
from app.services.mock_service import MockService


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """TestClient fixture with app lifecycle managed."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def mock_deadlock_client() -> DeadlockClient:
    """Provides an isolated DeadlockClient configured in offline mode."""
    return DeadlockClient(offline_mode=True)


@pytest.fixture
def sample_match_history() -> List[Dict[str, Any]]:
    """Fixture providing 20 sample match telemetry dictionaries."""
    return MockService.generate_player_matches(80128750, count=20)


@pytest.fixture
def sample_archetypes() -> List[Dict[str, Any]]:
    """Fixture providing 4 calibrated reference archetypes."""
    return MockService.get_archetypes()
