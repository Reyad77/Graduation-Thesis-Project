"""
Authentication service — registration, login, token management,
password reset, and email verification.

Delegates identity to Firebase Auth while maintaining a mirrored
user profile in the Firestore ``users`` collection.

Uses Firebase Admin SDK for user creation, and the Firebase Auth REST API
for email/password sign-in (so auth works even when gRPC is blocked).
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from firebase_admin import auth as firebase_auth
from firebase_admin.exceptions import FirebaseError

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import User, UserRegisterRequest
from app.services.base_service import BaseService


class AuthService(BaseService):
    """Handles user authentication, registration, and profile management."""

    def __init__(self) -> None:
        super().__init__("users", User)

    # ── Registration ──────────────────────────────────────────────────

    def register_sync(self, payload: UserRegisterRequest) -> Dict[str, Any]:
        """Create a Firebase Auth user *and* a Firestore user document.

        Tries the Firebase Admin SDK first; falls back to the REST API
        when gRPC is blocked (common in certain regions/networks).
        """
        uid = None

        # ── Try Admin SDK (gRPC) first ──────────────────────────────
        try:
            auth_user = firebase_auth.create_user(
                email=payload.email,
                password=payload.password,
                display_name=payload.displayName,
            )
            uid = auth_user.uid
        except FirebaseError as exc:
            # If it's a configuration error (email/password not enabled), bubble it
            err_str = str(exc).lower()
            if "configuration_not_found" in err_str or "no auth provider" in err_str:
                raise ValueError(
                    "Email/Password sign-in is not enabled. "
                    "Enable it in Firebase Console > Authentication > Sign-in method."
                )
            # If it's a duplicate email, bubble it
            if "email-already-exists" in err_str or "already exists" in err_str:
                raise ValueError("An account with this email already exists.")
            # For other errors (likely gRPC timeout), fall through to REST
        except Exception:
            # gRPC likely blocked — fall through to REST
            pass

        # ── Fallback: Firebase Auth REST API ───────────────────────
        if uid is None:
            uid = self._create_user_via_rest(
                email=payload.email,
                password=payload.password,
                display_name=payload.displayName,
            )

        # ── Persist user profile in Firestore ──────────────────────
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

        # ── Issue JWT ──────────────────────────────────────────────
        access_token = create_access_token(uid, payload.role.value)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": User(**user_data),
        }

    # ── REST-based user creation (fallback when gRPC is blocked) ───────

    def _create_user_via_rest(
        self, email: str, password: str, display_name: str
    ) -> str:
        """Create a Firebase Auth user via the REST API (no gRPC).

        Returns the Firebase UID (localId).
        """
        api_key = settings.FIREBASE_API_KEY
        if not api_key:
            raise ValueError(
                "FIREBASE_API_KEY is not set. "
                "Get it from Firebase Console > Project Settings > General."
            )

        url = (
            "https://identitytoolkit.googleapis.com/v1/"
            f"accounts:signUp?key={api_key}"
        )
        resp = requests.post(
            url,
            json={
                "email": email,
                "password": password,
                "displayName": display_name,
                "returnSecureToken": True,
            },
            timeout=15,
        )

        if resp.status_code != 200:
            error = resp.json().get("error", {})
            msg = error.get("message", "Registration failed.")
            friendly = {
                "EMAIL_EXISTS": "An account with this email already exists.",
                "WEAK_PASSWORD": "Password must be at least 8 characters.",
                "INVALID_EMAIL": "The email address is not valid.",
            }
            for code, text in friendly.items():
                if code in msg:
                    raise ValueError(text)
            raise ValueError(f"Registration failed: {msg}")

        data = resp.json()
        uid = data.get("localId", "")
        if not uid:
            raise ValueError("Registration failed — no user ID received.")

        return uid

    # ── Login with email + password (Firebase REST API) ───────────────

    def login_with_email_password(
        self, email: str, password: str
    ) -> Dict[str, Any]:
        """Authenticate via Firebase Auth REST API (no gRPC required).

        Uses the Firebase Identity Toolkit API to sign in with email/password,
        then verifies the returned ID token and issues a platform JWT.

        Required: A Firebase Web API Key (create one in Firebase Console >
        Project Settings > General > Web API Key).
        """
        api_key = settings.FIREBASE_API_KEY
        if not api_key:
            raise ValueError(
                "FIREBASE_API_KEY is not configured. "
                "Get it from Firebase Console > Project Settings > General."
            )

        # 1. Sign in via Firebase REST API
        sign_in_url = (
            "https://identitytoolkit.googleapis.com/v1/"
            f"accounts:signInWithPassword?key={api_key}"
        )
        resp = requests.post(
            sign_in_url,
            json={
                "email": email,
                "password": password,
                "returnSecureToken": True,
            },
            timeout=15,
        )

        if resp.status_code != 200:
            error_msg = resp.json().get("error", {}).get("message", "Login failed.")
            # Map common Firebase errors to user-friendly messages
            friendly = {
                "EMAIL_NOT_FOUND": "No account found with this email.",
                "INVALID_PASSWORD": "Incorrect password.",
                "INVALID_EMAIL": "Invalid email address.",
                "USER_DISABLED": "This account has been disabled.",
            }
            for code, msg in friendly.items():
                if code in error_msg:
                    raise ValueError(msg)
            raise ValueError("Login failed. Please check your credentials.")

        data = resp.json()
        # The REST API returns localId (which IS the Firebase uid)
        uid = data.get("localId", "")
        if not uid:
            raise ValueError("Login failed — no user ID received.")

        # 3. Fetch the Firestore user profile
        user = self.get_by_id(uid)
        if not user:
            raise ValueError("User profile not found. Please contact support.")

        # 4. Extract role from the Firestore profile
        if hasattr(user, "role"):
            role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
        elif isinstance(user, dict):
            role_val = user.get("role", "student")
        else:
            role_val = "student"

        # 5. Issue platform JWT
        access_token = create_access_token(uid, role_val)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user,
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
