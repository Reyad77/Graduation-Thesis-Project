"""
Job endpoints (student view): browsing, searching, applying, and saving jobs.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_jobs():
    """List all active jobs with optional filters."""
    return {"message": "Not implemented yet"}


@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get detailed information about a specific job."""
    return {"message": "Not implemented yet"}


@router.get("/{job_id}/check-application")
async def check_application(job_id: str):
    """Check whether the current student has already applied."""
    return {"message": "Not implemented yet"}


@router.post("/{job_id}/apply")
async def apply_to_job(job_id: str):
    """Apply to a job with a selected resume."""
    return {"message": "Not implemented yet"}


@router.get("/recommended")
async def get_recommended_jobs():
    """Get job recommendations based on the student's profile and skills."""
    return {"message": "Not implemented yet"}


@router.get("/saved")
async def get_saved_jobs():
    """Get all jobs saved/bookmarked by the current student."""
    return {"message": "Not implemented yet"}


@router.post("/{job_id}/save")
async def save_job(job_id: str):
    """Save/bookmark a job for later."""
    return {"message": "Not implemented yet"}


@router.delete("/{job_id}/save")
async def unsave_job(job_id: str):
    """Remove a saved/bookmarked job."""
    return {"message": "Not implemented yet"}
