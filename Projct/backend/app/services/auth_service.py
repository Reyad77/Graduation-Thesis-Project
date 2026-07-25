"""
Authentication service — registration, login, token management,
password reset, and email verification.

Delegates identity to Firebase Auth while maintaining a mirrored
user profile in the Firestore ``users`` collection.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from firebase_admin import auth as firebase_auth
from firebase_admin.exceptions import FirebaseError

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User, UserRegisterRequest
from app.services.base_service import BaseService


class AuthService(BaseService[User]):
    """Handles user authentication, registration, and profile management."""

    def __init__(self) -> None:
        super().__init__("users", User)

    # ── Registration ──────────────────────────────────────────────────

    async def register(self, payload: UserRegisterRequest) -> Dict[str, Any]:
        """Create a Firebase Auth user *and* a Firestore user document.

        Returns a JWT access token and the user profile.
        """
        # 1. Create Firebase Auth user
        try:
            auth_user = firebase_auth.create_user(
                email=payload.email,
                password=payload.password,
                display_name=payload.displayName,
            )
        except FirebaseError as exc:
            raise ValueError(self._auth_error_message(exc))

        uid = auth_user.uid

        # 2. Persist user profile in Firestore
        now = datetime.now(timezone.utc)
        user_data = {
            "uid": uid,
            "email": payload.email,
            "role": payload.role.value,
            "displayName": payload.displayName,
            "phone": payload.phone or "",
            "preferredLanguage": payload.preferredLanguage or "en",
            "isActive": True,
            "createdAt": now,
            "updatedAt": now,
        }
        self.create(user_data, doc_id=uid)

        # 3. Issue tokens
        access_token = create_access_token(uid, payload.role.value)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": User(**user_data),
        }

    # ── Login via Firebase ID token ───────────────────────────────────

    def login_with_firebase_token(self, id_token: str) -> Dict[str, Any]:
        """Verify a Firebase ID token from the client and return JWT + user."""
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            uid = decoded["uid"]

            user = self.get_by_id(uid)
            if not user:
                raise ValueError("User not found in database.")

            role_val = (
                user.role.value
                if hasattr(user, "role") and hasattr(user.role, "value")
                else (user.get("role") if isinstance(user, dict) else "student")
            )

            access_token = create_access_token(uid, role_val)

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                "user": user,
            }
        except FirebaseError as exc:
            raise ValueError(str(exc))

    # ── Current user ──────────────────────────────────────────────────

    def get_current_user(self, uid: str) -> Optional[User]:
        """Return the Firestore user document for the given UID."""
        return self.get_by_id(uid)

    # ── Token refresh ─────────────────────────────────────────────────

    def refresh_token(self, uid: str, role: str) -> Dict[str, Any]:
        """Issue a new access token."""
        access_token = create_access_token(uid, role)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        }

    # ── Password management ───────────────────────────────────────────

    def send_password_reset_email(self, email: str) -> None:
        """Send a password-reset email via Firebase Auth."""
        try:
            firebase_auth.generate_password_reset_link(email)
        except FirebaseError as exc:
            raise ValueError(str(exc))

    # ── Helpers ───────────────────────────────────────────────────────

    @staticmethod
    def _auth_error_message(exc: FirebaseError) -> str:
        """Translate Firebase error codes into user-friendly messages."""
        code = getattr(exc, "code", "")
        messages = {
            "email-already-exists": "An account with this email already exists.",
            "invalid-email": "The email address is not valid.",
            "weak-password": "Password must be at least 8 characters.",
        }
        return messages.get(code, str(exc))
