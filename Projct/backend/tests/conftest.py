"""Shared test fixtures and configuration."""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Return a FastAPI TestClient for integration tests."""
    return TestClient(app)


@pytest.fixture
def sample_user_data():
    """Return valid registration data."""
    import uuid
    suffix = uuid.uuid4().hex[:8]
    return {
        "email": f"test-{suffix}@example.com",
        "password": "testpass123",
        "displayName": "Test User",
        "role": "student",
        "phone": "+1234567890",
        "preferredLanguage": "en",
    }
