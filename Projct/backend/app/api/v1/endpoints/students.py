"""
Student-specific endpoints: profile management, ID verification,
and application viewing.
"""

from fastapi import APIRouter

router = APIRouter()


# ── Profile ────────────────────────────────────────────────────────────
@router.get("/profile")
async def get_student_profile():
    """Get the student's profile."""
    return {"message": "Not implemented yet"}


@router.put("/profile")
async def update_student_profile():
    """Update the student's profile."""
    return {"message": "Not implemented yet"}


# ── ID Verification ───────────────────────────────────────────────────
@router.post("/verify-id")
async def verify_student_id():
    """Upload a student ID card for verification."""
    return {"message": "Not implemented yet"}


@router.get("/verification-status")
async def get_verification_status():
    """Get the current ID verification status."""
    return {"message": "Not implemented yet"}


# ── Applications ──────────────────────────────────────────────────────
@router.get("/applications")
async def get_student_applications():
    """Get all applications submitted by the current student."""
    return {"message": "Not implemented yet"}


@router.get("/applications/{application_id}")
async def get_student_application(application_id: str):
    """Get a specific application by ID."""
    return {"message": "Not implemented yet"}
