"""Integration tests for auth API endpoints."""

import pytest


class TestAuthEndpoints:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_register_missing_fields(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "bad",
        })
        assert response.status_code == 422  # validation error

    def test_login_missing_password(self, client):
        response = client.post("/api/v1/auth/login", json={
            "email": "test@example.com",
        })
        assert response.status_code == 422

    def test_me_without_token(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_register_invalid_email(self, client):
        response = client.post("/api/v1/auth/register", json={
            "email": "not-email",
            "password": "12345678",
            "displayName": "Test",
            "role": "student",
        })
        assert response.status_code == 422

    def test_swagger_docs(self, client):
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_schema(self, client):
        response = client.get("/openapi.json")
        assert response.status_code == 200
        schema = response.json()
        assert "paths" in schema
        # Verify all major endpoint groups exist
        paths = schema["paths"]
        assert "/api/v1/auth/login" in paths
        assert "/api/v1/auth/register" in paths
        assert "/api/v1/jobs/" in paths
        assert "/api/v1/students/profile" in paths
