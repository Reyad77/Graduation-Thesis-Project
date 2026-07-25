"""Unit tests for JWT creation and verification."""

import time
from datetime import timedelta

from app.core.security import create_access_token, verify_access_token


class TestJWT:
    def test_create_and_verify_token(self):
        token = create_access_token("user-123", "student")
        assert token is not None
        assert len(token) > 20

        payload = verify_access_token(token)
        assert payload is not None
        assert payload["sub"] == "user-123"
        assert payload["role"] == "student"

    def test_expired_token(self):
        token = create_access_token(
            "user-123", "student",
            expires_delta=timedelta(seconds=-1),  # already expired
        )
        payload = verify_access_token(token)
        assert payload is None

    def test_invalid_token(self):
        payload = verify_access_token("not-a-valid-jwt")
        assert payload is None

    def test_different_roles(self):
        for role in ("student", "enterprise", "admin"):
            token = create_access_token("uid", role)
            payload = verify_access_token(token)
            assert payload["role"] == role
