"""
Application configuration.

Reads settings from environment variables using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Central configuration loaded from .env file and environment variables."""

    # ── Firebase ──────────────────────────────────────────────────────
    FIREBASE_TYPE: str = "service_account"
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_CLIENT_ID: str = ""
    FIREBASE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    FIREBASE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    FIREBASE_AUTH_PROVIDER_CERT_URL: str = (
        "https://www.googleapis.com/oauth2/v1/certs"
    )
    FIREBASE_CLIENT_CERT_URL: str = ""

    # ── Security ──────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ──────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    # ── Environment ───────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Application ───────────────────────────────────────────────────
    APP_NAME: str = "Part-Time Job Information Platform"
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
