"""
Security helpers: JWT encoding/decoding, password hashing, and token verification.

Uses Firebase Auth on the client side, so this module handles server-side
token verification and role-based access helpers.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(
    uid: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT for the given user.

    Args:
        uid: Firebase Auth user ID.
        role: User role (student / enterprise / admin).
        expires_delta: Optional custom expiry; defaults to config value.

    Returns:
        Encoded JWT string.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": uid,
        "role": role,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a JWT.

    Returns the payload dict on success, or None if the token is invalid/expired.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def verify_firebase_token(id_token: str) -> Optional[dict[str, Any]]:
    """Verify a Firebase Auth ID token using the Admin SDK.

    Returns the decoded token dict or None on failure.
    """
    from firebase_admin import auth  # local import to avoid circular deps
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception:
        return None
