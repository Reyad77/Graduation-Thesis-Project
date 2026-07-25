"""
Application management (enterprise view): status updates, interview
scheduling, and resume viewing.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_enterprise
from app.models.application import ApplicationStatusUpdateRequest, InterviewScheduleRequest
from app.services.application_service import ApplicationService

router = APIRouter()
_app_svc = ApplicationService()


def _uid(user: dict) -> str:
    return user.get("sub", "")


def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


# ── List ──────────────────────────────────────────────────────────────

@router.get("/applications")
def list_applications(user: dict = Depends(get_current_enterprise)):
    apps = _app_svc.get_all_enterprise_applications(_uid(user))
    return [_serialize(a) for a in apps]


@router.get("/applications/{application_id}")
def get_application(application_id: str, user: dict = Depends(get_current_enterprise)):
    app = _app_svc.get_by_id(application_id)
    if not app:
        raise HTTPException(404, "Application not found.")
    return _serialize(app)


# ── Status update ─────────────────────────────────────────────────────

@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: str,
    payload: ApplicationStatusUpdateRequest,
    user: dict = Depends(get_current_enterprise),
):
    updated = _app_svc.update_status(application_id, payload)
    if not updated:
        raise HTTPException(404, "Application not found.")
    # Notify student
    from app.services.notification_service import NotificationService as NS
    ns = NS()
    student_uid = str(getattr(updated, "studentUid", ""))
    job_id = str(getattr(updated, "jobId", ""))
    if student_uid:
        ns.on_application_status_changed(student_uid, job_id, payload.status.value)
    return _serialize(updated)


# ── Interview ─────────────────────────────────────────────────────────

@router.post("/applications/{application_id}/interview")
def schedule_interview(
    application_id: str,
    payload: InterviewScheduleRequest,
    user: dict = Depends(get_current_enterprise),
):
    updated = _app_svc.schedule_interview(application_id, payload)
    if not updated:
        raise HTTPException(404, "Application not found.")
    # Notify student
    from app.services.notification_service import NotificationService as NS
    ns = NS()
    student_uid = str(getattr(updated, "studentUid", ""))
    job_id = str(getattr(updated, "jobId", ""))
    if student_uid:
        ns.on_interview_scheduled(student_uid, job_id, str(payload.date))
    return _serialize(updated)


# ── Resume viewing ────────────────────────────────────────────────────

@router.get("/applications/{application_id}/resume")
def view_applicant_resume(
    application_id: str,
    user: dict = Depends(get_current_enterprise),
):
    result = _app_svc.get_application_with_resume(application_id, _uid(user))
    if not result:
        raise HTTPException(404, "Application or resume not found.")
    return result
