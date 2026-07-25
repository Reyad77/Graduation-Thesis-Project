"""
Pydantic models for the Users collection.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """Valid user roles in the system."""

    STUDENT = "student"
    ENTERPRISE = "enterprise"
    ADMIN = "admin"


# ── Database model ─────────────────────────────────────────────────────
class User(BaseModel):
    """Represents a user document in Firestore."""

    uid: str
    email: str
    role: UserRole
    displayName: str
    phone: str = ""
    preferredLanguage: str = "en"
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    isActive: bool = True


# ── Request models ─────────────────────────────────────────────────────
class UserRegisterRequest(BaseModel):
    """Payload for registering a new user."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    displayName: str = Field(..., min_length=1, max_length=100)
    role: UserRole
    phone: str = ""
    preferredLanguage: str = "en"


class UserLoginRequest(BaseModel):
    """Payload for logging in."""

    email: EmailStr
    password: str


class UserUpdateRequest(BaseModel):
    """Payload for updating a user's profile."""

    displayName: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = None
    preferredLanguage: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """Payload for requesting a password reset."""

    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Payload for confirming a password reset with a token."""

    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Response models ────────────────────────────────────────────────────
class UserResponse(BaseModel):
    """Public user profile returned in API responses."""

    uid: str
    email: str
    role: UserRole
    displayName: str
    phone: str
    preferredLanguage: str
    isActive: bool
    createdAt: Optional[datetime] = None


class TokenResponse(BaseModel):
    """JWT token pair returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds
