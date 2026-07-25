"""
Job endpoints (student view): browsing, searching, applying, and saving jobs.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.dependencies import get_current_student, get_current_user
from app.models.application import ApplicationCreateRequest
from app.services.job_service import JobService, SavedJobService
from app.services.application_service import ApplicationService

router = APIRouter()

_job_svc = JobService()
_app_svc = ApplicationService()
_saved_svc = SavedJobService()


# ═════════════════════════════════════════════════════════════════════
# Browse jobs (public)
# ═════════════════════════════════════════════════════════════════════


@router.get("/")
def list_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    location: str = Query(""),
    skill: str = Query(""),
):
    """List active jobs with optional filters."""
    skills_list = [skill] if skill else None
    return _job_svc.get_active_jobs(
        page=page,
        page_size=page_size,
        location=location if location else None,
        skills=skills_list,
    )


@router.get("/search")
def search_jobs(keyword: str = Query(...), limit: int = Query(50)):
    """Keyword search on job title."""
    jobs = _job_svc.search_jobs(keyword, limit)
    return [_serialize(j) for j in jobs]


@router.get("/{job_id}")
def get_job(job_id: str):
    """Get detailed job information (increments view count)."""
    job = _job_svc.get_job_detail(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return _serialize(job)


# ═════════════════════════════════════════════════════════════════════
# Apply (student-only)
# ═════════════════════════════════════════════════════════════════════


@router.get("/{job_id}/check-application")
def check_application(
    job_id: str,
    user: dict = Depends(get_current_student),
):
    """Check whether the current student already applied to this job."""
    uid = user.get("sub", "")
    applied = _app_svc.already_applied(job_id, uid)
    return {"applied": applied}


@router.post("/{job_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_to_job(
    job_id: str,
    payload: ApplicationCreateRequest,
    user: dict = Depends(get_current_student),
):
    """Apply to a job with a selected resume."""
    uid = user.get("sub", "")

    # Prevent duplicate applications
    if _app_svc.already_applied(job_id, uid):
        raise HTTPException(
            status_code=400,
            detail="You have already applied to this job.",
        )

    # Verify the job exists and is active
    job = _job_svc.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    if getattr(job, "status", None) and str(getattr(job, "status", "")) != "active":
        raise HTTPException(status_code=400, detail="This job is not accepting applications.")

    app = _app_svc.apply(job_id, uid, payload)
    return _serialize(app)


# ═════════════════════════════════════════════════════════════════════
# Recommendations (student-only)
# ═════════════════════════════════════════════════════════════════════


@router.get("/recommended")
def get_recommended_jobs(user: dict = Depends(get_current_student)):
    """Get job recommendations based on student skills."""
    uid = user.get("sub", "")
    from app.services.student_service import StudentService
    student = StudentService().get_profile(uid)
    skills = getattr(student, "skills", []) if student else []
    jobs = _job_svc.get_recommended_jobs(skills)
    return [_serialize(j) for j in jobs]


# ═════════════════════════════════════════════════════════════════════
# Saved jobs (any authenticated user)
# ═════════════════════════════════════════════════════════════════════


@router.get("/saved")
def get_saved_jobs(user: dict = Depends(get_current_user)):
    """Get all jobs saved by the current user."""
    uid = user.get("sub", "")
    saved_ids = _saved_svc.get_saved(uid)
    jobs = []
    for jid in saved_ids:
        job = _job_svc.get_by_id(jid)
        if job:
            jobs.append(_serialize(job))
    return jobs


@router.post("/{job_id}/save")
def save_job(job_id: str, user: dict = Depends(get_current_user)):
    """Save/bookmark a job."""
    uid = user.get("sub", "")
    _saved_svc.save(uid, job_id)
    return {"message": "Job saved."}


@router.delete("/{job_id}/save")
def unsave_job(job_id: str, user: dict = Depends(get_current_user)):
    """Remove a saved job bookmark."""
    uid = user.get("sub", "")
    _saved_svc.unsave(uid, job_id)
    return {"message": "Job removed from saved."}


# ── Helpers ───────────────────────────────────────────────────────────

def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    if isinstance(obj, dict):
        return obj
    return str(obj)
