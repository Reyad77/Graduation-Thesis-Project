"""
FastAPI dependency injection helpers.

Provides reusable dependencies for authentication, authorization, and
common database access patterns.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth as firebase_auth

from app.core.security import verify_access_token

# ── Bearer token scheme ────────────────────────────────────────────────
security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> dict:
    """Validate the JWT / Bearer token and return the current user's payload.

    Raises 401 if no token or invalid token is provided.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = credentials.credentials

    # Try our own JWT first; if that fails, try Firebase ID token
    payload = verify_access_token(token)
    if payload is not None:
        return payload

    # Fallback: verify as Firebase ID token
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_current_student(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require the current user to have the 'student' role."""
    if current_user.get("role") != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student role required",
        )
    return current_user


async def get_current_enterprise(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require the current user to have the 'enterprise' role."""
    if current_user.get("role") != "enterprise":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Enterprise role required",
        )
    return current_user


async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require the current user to have the 'admin' role."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user
