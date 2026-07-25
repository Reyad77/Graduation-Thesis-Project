"""
Enterprise endpoints: job posting CRUD, status management, and applicants.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_enterprise
from app.models.job import JobCreateRequest, JobUpdateRequest, JobStatus
from app.services.job_service import JobService
from app.services.enterprise_service import EnterpriseService

router = APIRouter()
_job_svc = JobService()
_ent_svc = EnterpriseService()


def _uid(user: dict) -> str:
    return user.get("sub", "")


def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


# ── Enterprise profile ────────────────────────────────────────────────

@router.get("/profile")
def get_profile(user: dict = Depends(get_current_enterprise)):
    profile = _ent_svc.get_profile(_uid(user))
    if not profile:
        raise HTTPException(404, "Profile not found.")
    return _serialize(profile)


@router.put("/profile")
def update_profile(payload: dict, user: dict = Depends(get_current_enterprise)):
    from app.models.enterprise import EnterpriseUpdateRequest
    updated = _ent_svc.update_profile(_uid(user), EnterpriseUpdateRequest(**payload))
    if not updated: raise HTTPException(404, "Profile not found.")
    return _serialize(updated)


# ── Job posting CRUD ──────────────────────────────────────────────────

@router.get("/jobs")
def list_enterprise_jobs(user: dict = Depends(get_current_enterprise)):
    jobs = _job_svc.get_enterprise_jobs(_uid(user))
    return [_serialize(j) for j in jobs]


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(payload: JobCreateRequest, user: dict = Depends(get_current_enterprise)):
    job = _job_svc.create_job(_uid(user), payload)
    return _serialize(job)


@router.put("/jobs/{job_id}")
def update_job(job_id: str, payload: JobUpdateRequest, user: dict = Depends(get_current_enterprise)):
    updated = _job_svc.update_job(job_id, _uid(user), payload)
    if not updated: raise HTTPException(404, "Job not found or not yours.")
    return _serialize(updated)


@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, user: dict = Depends(get_current_enterprise)):
    ok = _job_svc.delete_job(job_id, _uid(user))
    if not ok: raise HTTPException(404, "Job not found or not yours.")
    return {"message": "Job deleted."}


@router.patch("/jobs/{job_id}/status")
def update_job_status(job_id: str, status: str, user: dict = Depends(get_current_enterprise)):
    try: new_status = JobStatus(status)
    except ValueError: raise HTTPException(400, f"Invalid status: {status}")
    updated = _job_svc.update_status(job_id, _uid(user), new_status)
    if not updated: raise HTTPException(404, "Job not found.")
    return _serialize(updated)


# ── Applicants ────────────────────────────────────────────────────────

@router.get("/jobs/{job_id}/applications")
def get_job_applications(job_id: str, user: dict = Depends(get_current_enterprise)):
    from app.services.application_service import ApplicationService
    apps = ApplicationService().get_job_applications(job_id, _uid(user))
    return [_serialize(a) for a in apps]
