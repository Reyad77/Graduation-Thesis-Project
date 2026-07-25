"""
Student endpoints: profile management, ID verification, and applications.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_student
from app.models.student import StudentUpdateRequest
from app.services.student_service import StudentService
from app.services.application_service import ApplicationService

router = APIRouter()

_student_svc = StudentService()
_app_svc = ApplicationService()


# ── Profile ────────────────────────────────────────────────────────────

@router.get("/profile")
def get_student_profile(user: dict = Depends(get_current_student)):
    """Get the current student's profile."""
    uid = user.get("sub", "")
    profile = _student_svc.get_profile(uid)
    if not profile:
        # Create a blank profile if one doesn't exist yet
        email = user.get("email", "")
        profile = _student_svc.create_profile(uid, email)
    return _serialize(profile)


@router.put("/profile")
def update_student_profile(
    payload: StudentUpdateRequest,
    user: dict = Depends(get_current_student),
):
    """Update the student's profile."""
    uid = user.get("sub", "")
    updated = _student_svc.update_profile(uid, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return _serialize(updated)


# ── ID Verification ───────────────────────────────────────────────────

@router.post("/verify-id")
def upload_student_id(
    id_card_photo: str,
    user: dict = Depends(get_current_student),
):
    """Submit student ID card photo URL for verification."""
    uid = user.get("sub", "")
    ok = _student_svc.upload_id_card(uid, id_card_photo)
    if not ok:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return {"message": "ID card uploaded successfully.", "idCardPhoto": id_card_photo}


@router.get("/verification-status")
def get_verification_status(user: dict = Depends(get_current_student)):
    """Check ID verification status."""
    uid = user.get("sub", "")
    profile = _student_svc.get_profile(uid)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return {
        "isVerified": bool(getattr(profile, "isVerified", False)),
    }


# ── Applications ──────────────────────────────────────────────────────

@router.get("/applications")
def get_my_applications(user: dict = Depends(get_current_student)):
    """Get all applications submitted by the current student."""
    uid = user.get("sub", "")
    apps = _app_svc.get_student_applications(uid)
    return [_serialize(a) for a in apps]


@router.get("/applications/{application_id}")
def get_my_application(
    application_id: str,
    user: dict = Depends(get_current_student),
):
    """Get a specific application by ID."""
    uid = user.get("sub", "")
    app = _app_svc.get_student_application(application_id, uid)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    return _serialize(app)


# ── Helpers ───────────────────────────────────────────────────────────

def _serialize(obj):
    """Convert a Pydantic model to a JSON-safe dict."""
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if isinstance(obj, dict):
        return obj
    return str(obj)
