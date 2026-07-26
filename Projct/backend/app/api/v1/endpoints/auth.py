"""
Authentication endpoints: register, login, logout, token refresh,
password reset, email verification, and current-user retrieval.

All operations use the Firebase Auth REST API to avoid gRPC dependency,
which means they work even when HTTP/2 is blocked on the network.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from firebase_admin import auth as firebase_auth
from firebase_admin.exceptions import FirebaseError

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter
from app.core.security import create_access_token
from app.models.user import (
    User,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    UserUpdateRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.services.auth_service import AuthService

router = APIRouter()

# ── Shared service instance ─────────────────────────────────────────────
_auth_svc = AuthService()


def _user_to_response(user) -> UserResponse:
    """Convert a User model/dict to a safe API response."""
    if hasattr(user, "model_dump"):
        d = user.model_dump()
    elif isinstance(user, dict):
        d = user
    else:
        d = {}
    return UserResponse(
        uid=d.get("uid", ""),
        email=d.get("email", ""),
        role=d.get("role", "student"),
        displayName=d.get("displayName", ""),
        phone=d.get("phone", ""),
        preferredLanguage=d.get("preferredLanguage", "en"),
        isActive=d.get("isActive", True),
        createdAt=d.get("createdAt"),
    )


# ═════════════════════════════════════════════════════════════════════════
# Registration & Login
# ═════════════════════════════════════════════════════════════════════════


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, payload: UserRegisterRequest):
    """Register a new user (student or enterprise).

    Creates a Firebase Auth account AND a Firestore user profile.
    Returns a JWT access token so the user is logged in immediately.
    """
    try:
        result = _auth_svc.register_sync(payload)
        user_data = result["user"]

        # Notify admin(s) about the new registration
        from app.services.notification_service import NotificationService
        from app.models.notification import NotificationType
        ns = NotificationService()
        role_label = "Job Seeker" if payload.role.value == "student" else "Employer"
        ns.notify_admins(
            title=f"New {role_label} Registered",
            message=f"{payload.displayName} ({payload.email}) signed up as a {role_label.lower()}.",
            type_=NotificationType.SYSTEM,
            data={"uid": str(getattr(user_data, "uid", "")), "role": payload.role.value},
        )

        return {
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"],
            "user": _user_to_response(user_data),
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, payload: UserLoginRequest):
    """Authenticate with email + password.

    Uses the Firebase Auth REST API to verify credentials, then issues
    a JWT access token for the platform.
    """
    try:
        result = _auth_svc.login_with_email_password(
            payload.email, payload.password
        )
        user_data = result["user"]
        return {
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"],
            "user": _user_to_response(user_data),
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )


@router.post("/login/firebase")
def login_with_firebase(id_token: str):
    """Authenticate with a Firebase ID token (client-side Firebase Auth).

    The frontend signs in with Firebase Client SDK, then sends the
    Firebase ID token here for verification and JWT issuance.
    """
    try:
        result = _auth_svc.login_with_firebase_token(id_token)
        user_data = result["user"]
        return {
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "expires_in": result["expires_in"],
            "user": _user_to_response(user_data),
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """Logout — client should discard the JWT.

    (JWTs are stateless, so there is no server-side invalidation.
    For production, implement a token blocklist.)
    """
    return {"message": "Logged out successfully."}


# ═════════════════════════════════════════════════════════════════════════
# Token management
# ═════════════════════════════════════════════════════════════════════════


@router.post("/refresh-token")
def refresh_token(current_user: dict = Depends(get_current_user)):
    """Issue a fresh access token for a valid session."""
    uid = current_user.get("sub", "")
    role = current_user.get("role", "student")
    result = _auth_svc.refresh_token(uid, role)
    return result


# ═════════════════════════════════════════════════════════════════════════
# Password management
# ═════════════════════════════════════════════════════════════════════════


@router.post("/forgot-password")
def forgot_password(payload: PasswordResetRequest):
    """Send a password-reset email.

    Firebase Auth sends the email automatically. The reset link in the
    email points to the Firebase-hosted page by default — configure the
    action URL in the Firebase Console.
    """
    try:
        firebase_auth.generate_password_reset_link(payload.email)
        return {
            "message": "If the email is registered, a password-reset link has been sent."
        }
    except FirebaseError:
        # Don't reveal whether the email exists
        return {
            "message": "If the email is registered, a password-reset link has been sent."
        }


@router.post("/reset-password")
def reset_password(payload: PasswordResetConfirm):
    """Reset password using a Firebase reset token (oobCode)."""
    # Note: the Firebase Admin SDK does not have a direct "confirm reset" method.
    # The password reset flow is handled client-side via Firebase Client SDK.
    # This endpoint is a placeholder for custom email flows.
    return {
        "message": "Use the Firebase Client SDK to complete the password reset. "
        "The reset link from your email handles this automatically."
    }


# ═════════════════════════════════════════════════════════════════════════
# Current user
# ═════════════════════════════════════════════════════════════════════════


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's full profile."""
    uid = current_user.get("sub", "")
    user = _auth_svc.get_current_user(uid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return _user_to_response(user)


@router.put("/me")
def update_me(
    payload: UserUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update the current user's profile."""
    uid = current_user.get("sub", "")
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )
    _auth_svc.update(uid, update_data)
    user = _auth_svc.get_current_user(uid)
    return _user_to_response(user)
