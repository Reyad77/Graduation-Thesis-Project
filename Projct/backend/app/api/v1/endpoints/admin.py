"""
Admin endpoints: user management, job auditing, banner & announcement CRUD.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_admin
from app.models.announcement import AnnouncementCreateRequest, AnnouncementUpdateRequest
from app.models.banner import BannerCreateRequest, BannerUpdateRequest
from app.services.auth_service import AuthService
from app.services.student_service import StudentService
from app.services.enterprise_service import EnterpriseService
from app.services.job_service import JobService
from app.services.notification_service import NotificationService
from app.services.base_service import BaseService

router = APIRouter()
_auth_svc = AuthService()
_student_svc = StudentService()
_ent_svc = EnterpriseService()
_job_svc = JobService()
_notif_svc = NotificationService()
_banner_svc = BaseService("banners")
_announce_svc = BaseService("announcements")


def _uid(user: dict) -> str:
    return user.get("sub", "")


def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


# ═════════════════════════════════════════════════════════════════════
# User management
# ═════════════════════════════════════════════════════════════════════

@router.get("/users")
def list_users(user: dict = Depends(get_current_admin)):
    result = _auth_svc.get_all(page=1, page_size=100, order_by="createdAt")
    return [_serialize(u) for u in result.get("items", [])]


@router.get("/users/{uid}")
def get_user(uid: str, user: dict = Depends(get_current_admin)):
    u = _auth_svc.get_by_id(uid)
    if not u: raise HTTPException(404, "User not found.")
    return _serialize(u)


@router.post("/users/{uid}/verify-student")
def verify_student(uid: str, user: dict = Depends(get_current_admin)):
    ok = _student_svc.verify_student(uid, _uid(user))
    if not ok: raise HTTPException(404, "Student not found.")
    _notif_svc.on_student_verified(uid)
    return {"message": "Student verified."}


@router.post("/users/{uid}/approve-enterprise")
def approve_enterprise(uid: str, user: dict = Depends(get_current_admin)):
    ok = _ent_svc.approve(uid, _uid(user))
    if not ok: raise HTTPException(404, "Enterprise not found.")
    _notif_svc.on_enterprise_approved(uid)
    return {"message": "Enterprise approved."}


@router.post("/users/{uid}/ban")
def ban_user(uid: str, reason: str = "", user: dict = Depends(get_current_admin)):
    ok = _ent_svc.ban(uid, reason)
    if not ok: raise HTTPException(404, "Enterprise not found.")
    return {"message": "User banned."}


@router.post("/users/{uid}/unban")
def unban_user(uid: str, user: dict = Depends(get_current_admin)):
    ok = _ent_svc.unban(uid)
    if not ok: raise HTTPException(404, "Enterprise not found.")
    # Also clear timeout
    _auth_svc.update(uid, {"timeoutUntil": None, "isActive": True})
    return {"message": "User unbanned."}


@router.post("/users/{uid}/timeout")
def timeout_user(uid: str, minutes: int, user: dict = Depends(get_current_admin)):
    """Temporarily ban a user for the given number of minutes."""
    if minutes < 1 or minutes > 14400:  # max 10 days
        raise HTTPException(400, "Duration must be between 1 and 14400 minutes.")
    from datetime import datetime, timedelta, timezone
    until = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    _auth_svc.update(uid, {"timeoutUntil": until, "isActive": False})
    return {"message": f"User timed out for {minutes} minutes.", "timeoutUntil": until.isoformat()}


@router.delete("/users/{uid}")
def delete_user(uid: str, user: dict = Depends(get_current_admin)):
    """Permanently delete a user and their data."""
    ok = _auth_svc.delete(uid)
    if not ok: raise HTTPException(404, "User not found.")
    # Also try to clean up linked profiles
    _student_svc.delete(uid)
    _ent_svc.delete(uid)
    return {"message": "User deleted permanently."}


# ═════════════════════════════════════════════════════════════════════
# Job auditing
# ═════════════════════════════════════════════════════════════════════

@router.get("/jobs/pending")
def get_pending_jobs(user: dict = Depends(get_current_admin)):
    jobs = _job_svc.get_pending_jobs()
    return [_serialize(j) for j in jobs]


@router.get("/jobs")
def get_all_jobs(user: dict = Depends(get_current_admin)):
    result = _job_svc.get_all(page=1, page_size=100, order_by="postedAt")
    return [_serialize(j) for j in result.get("items", [])]


@router.post("/jobs/{job_id}/approve")
def approve_job(job_id: str, user: dict = Depends(get_current_admin)):
    ok = _job_svc.approve_job(job_id, _uid(user))
    if not ok: raise HTTPException(404, "Job not found.")
    _notif_svc.on_job_approved(
        str(getattr(_job_svc.get_by_id(job_id), "enterpriseUid", "")), ""
    )
    return {"message": "Job approved."}


@router.post("/jobs/{job_id}/reject")
def reject_job(job_id: str, notes: str = "", user: dict = Depends(get_current_admin)):
    ok = _job_svc.reject_job(job_id, _uid(user), notes)
    if not ok: raise HTTPException(404, "Job not found.")
    return {"message": "Job rejected."}


@router.post("/jobs/{job_id}/remove")
def remove_job(job_id: str, user: dict = Depends(get_current_admin)):
    ok = _job_svc.remove_job(job_id)
    if not ok: raise HTTPException(404, "Job not found.")
    return {"message": "Job removed."}


# ═════════════════════════════════════════════════════════════════════
# Banner management
# ═════════════════════════════════════════════════════════════════════

@router.get("/banners")
def get_banners(user: dict = Depends(get_current_admin)):
    result = _banner_svc.get_all(page=1, page_size=50)
    return [_serialize(b) for b in result.get("items", [])]


@router.post("/banners", status_code=status.HTTP_201_CREATED)
def create_banner(payload: BannerCreateRequest, user: dict = Depends(get_current_admin)):
    doc_id = _banner_svc.create(payload.model_dump())
    return _serialize(_banner_svc.get_by_id(doc_id))


@router.put("/banners/{banner_id}")
def update_banner(banner_id: str, payload: BannerUpdateRequest,
                  user: dict = Depends(get_current_admin)):
    ok = _banner_svc.update(banner_id, payload.model_dump(exclude_unset=True))
    if not ok: raise HTTPException(404, "Banner not found.")
    return _serialize(_banner_svc.get_by_id(banner_id))


@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: str, user: dict = Depends(get_current_admin)):
    ok = _banner_svc.delete(banner_id)
    if not ok: raise HTTPException(404, "Banner not found.")
    return {"message": "Banner deleted."}


# ═════════════════════════════════════════════════════════════════════
# Announcement management
# ═════════════════════════════════════════════════════════════════════

@router.get("/announcements")
def get_announcements(user: dict = Depends(get_current_admin)):
    result = _announce_svc.get_all(page=1, page_size=50)
    return [_serialize(a) for a in result.get("items", [])]


@router.post("/announcements", status_code=status.HTTP_201_CREATED)
def create_announcement(payload: AnnouncementCreateRequest,
                        user: dict = Depends(get_current_admin)):
    data = payload.model_dump()
    data["createdBy"] = _uid(user)
    doc_id = _announce_svc.create(data)
    return _serialize(_announce_svc.get_by_id(doc_id))


@router.put("/announcements/{announcement_id}")
def update_announcement(announcement_id: str, payload: AnnouncementUpdateRequest,
                        user: dict = Depends(get_current_admin)):
    ok = _announce_svc.update(announcement_id, payload.model_dump(exclude_unset=True))
    if not ok: raise HTTPException(404, "Announcement not found.")
    return _serialize(_announce_svc.get_by_id(announcement_id))


@router.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: str, user: dict = Depends(get_current_admin)):
    ok = _announce_svc.delete(announcement_id)
    if not ok: raise HTTPException(404, "Announcement not found.")
    return {"message": "Announcement deleted."}
