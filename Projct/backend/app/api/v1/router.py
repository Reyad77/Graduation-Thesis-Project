"""
API v1 router aggregator.

Collects all endpoint routers into a single APIRouter instance.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    applications,
    auth,
    evaluations,
    jobs,
    notifications,
    recruiters,
    resumes,
    students,
)

api_router = APIRouter()

# ── Authentication ─────────────────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# ── Student endpoints ──────────────────────────────────────────────────
api_router.include_router(students.router, prefix="/students", tags=["Students"])

# ── Resume endpoints ───────────────────────────────────────────────────
api_router.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])

# ── Job endpoints (student view) ───────────────────────────────────────
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])

# ── Recruiter endpoints ────────────────────────────────────────────────
api_router.include_router(recruiters.router, prefix="/recruiter", tags=["Recruiter"])

# ── Application endpoints (recruiter view) ─────────────────────────────
api_router.include_router(
    applications.router, prefix="/recruiter", tags=["Applications"]
)

# ── Admin endpoints ────────────────────────────────────────────────────
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])

# ── Notification endpoints ─────────────────────────────────────────────
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["Notifications"]
)

# ── Evaluation endpoints ────────────────────────────────────────────────
api_router.include_router(
    evaluations.router, prefix="/evaluations", tags=["Evaluations"]
)
