"""
Admin endpoints: user management, job auditing, banner & announcement CRUD.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_admin
from app.models.announcement import AnnouncementCreateRequest, AnnouncementUpdateRequest
from app.models.banner import BannerCreateRequest, BannerUpdateRequest
from app.services.auth_service import AuthService
from app.services.student_service import StudentService
from app.services.recruiter_service import RecruiterService
from app.services.job_service import JobService
from app.services.notification_service import NotificationService
from app.services.evaluation_service import EvaluationService
from app.services.base_service import BaseService

router = APIRouter()
_auth_svc = AuthService()
_student_svc = StudentService()
_recruiter_svc = RecruiterService()
_job_svc = JobService()
_notif_svc = NotificationService()
_eval_svc = EvaluationService()
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
    users = [_serialize(u) for u in result.get("items", [])]

    # Bulk-enrich verification/approval status with TWO collection reads
    # instead of one read per user (the REST fallback client pays a full
    # round-trip per call, so N+1 here was very slow).
    student_profiles = {
        d.id: d.to_dict() or {}
        for d in _student_svc.collection.limit(500).stream()
    }
    recruiter_profiles = {
        d.id: d.to_dict() or {}
        for d in _recruiter_svc.collection.limit(500).stream()
    }
    for data in users:
        uid = data.get("uid", "")
        if data.get("role") == "student":
            sp = student_profiles.get(uid)
            data["isVerified"] = sp.get("isVerified", False) if sp else False
            data["verificationNotes"] = sp.get("verificationNotes", "") if sp else ""
        elif data.get("role") == "recruiter":
            ep = recruiter_profiles.get(uid)
            data["isApproved"] = ep.get("isApproved", False) if ep else False
            data["declineReason"] = ep.get("declineReason", "") if ep else ""
    return users


@router.get("/users/{uid}")
def get_user(uid: str, user: dict = Depends(get_current_admin)):
    u = _auth_svc.get_by_id(uid)
    if not u: raise HTTPException(404, "User not found.")
    return _serialize(u)


@router.put("/users/{uid}/role")
def update_user_role(uid: str, role: str, user: dict = Depends(get_current_admin)):
    """Change a user's role (student / recruiter / admin)."""
    if role not in ("student", "recruiter", "admin"):
        raise HTTPException(
            400, "Invalid role. Use 'student', 'recruiter', or 'admin'."
        )
    ok = _auth_svc.update(uid, {"role": role})
    if not ok: raise HTTPException(404, "User not found.")
    return {"message": f"Role updated to {role}."}


@router.post("/users/{uid}/verify-student")
def verify_student(uid: str, user: dict = Depends(get_current_admin)):
    # Auto-create student profile if it doesn't exist
    if not _student_svc.exists(uid):
        user_data = _auth_svc.get_dict_by_id(uid) or {}
        _student_svc.create_profile(uid, user_data.get("email", ""))
    ok = _student_svc.verify_student(uid, _uid(user))
    if not ok: raise HTTPException(404, "Student not found.")
    _notif_svc.on_student_verified(uid)
    return {"message": "Student verified."}


@router.post("/users/{uid}/decline-student")
def decline_student(uid: str, reason: str = "", user: dict = Depends(get_current_admin)):
    if not _student_svc.exists(uid):
        user_data = _auth_svc.get_dict_by_id(uid) or {}
        _student_svc.create_profile(uid, user_data.get("email", ""))
    ok = _student_svc.update(uid, {"isVerified": False, "verificationNotes": reason})
    if not ok: raise HTTPException(404, "Student not found.")
    return {"message": "Student verification declined."}


@router.post("/users/{uid}/approve-recruiter")
def approve_recruiter(uid: str, user: dict = Depends(get_current_admin)):
    # Auto-create profile if it doesn't exist
    if not _recruiter_svc.exists(uid):
        user_data = _auth_svc.get_dict_by_id(uid) or {}
        from app.models.recruiter import RecruiterRegistrationRequest
        _recruiter_svc.create_profile(uid, user_data.get("email", ""),
            RecruiterRegistrationRequest(
                recruiterType=user_data.get("recruiterType", "enterprise"),
                companyName=user_data.get("displayName", "Company"),
                contactPerson=user_data.get("displayName", ""),
                contactPhone=user_data.get("phone", ""),
                address="",
            ))
    ok = _recruiter_svc.approve(uid, _uid(user))
    if not ok: raise HTTPException(404, "Recruiter not found.")
    _notif_svc.on_recruiter_approved(uid)
    return {"message": "Recruiter approved."}


@router.post("/users/{uid}/decline-recruiter")
def decline_recruiter(uid: str, reason: str = "", user: dict = Depends(get_current_admin)):
    if not _recruiter_svc.exists(uid):
        user_data = _auth_svc.get_dict_by_id(uid) or {}
        from app.models.recruiter import RecruiterRegistrationRequest
        _recruiter_svc.create_profile(uid, user_data.get("email", ""),
            RecruiterRegistrationRequest(
                recruiterType=user_data.get("recruiterType", "enterprise"),
                companyName=user_data.get("displayName", "Company"),
                contactPerson=user_data.get("displayName", ""),
                contactPhone=user_data.get("phone", ""),
                address="",
            ))
    ok = _recruiter_svc.update(uid, {"isApproved": False, "declineReason": reason})
    if not ok: raise HTTPException(404, "Recruiter not found.")
    return {"message": "Recruiter declined."}


@router.post("/users/{uid}/ban")
def ban_user(uid: str, reason: str = "", user: dict = Depends(get_current_admin)):
    # Ban the user account
    ok = _auth_svc.update(uid, {"isActive": False, "banReason": reason})
    if not ok: raise HTTPException(404, "User not found.")
    # Also ban recruiter profile if exists
    try: _recruiter_svc.ban(uid, reason)
    except: pass
    return {"message": "User banned."}


@router.post("/users/{uid}/unban")
def unban_user(uid: str, user: dict = Depends(get_current_admin)):
    # Unban the user account
    ok = _auth_svc.update(uid, {"timeoutUntil": None, "isActive": True, "banReason": ""})
    if not ok: raise HTTPException(404, "User not found.")
    # Also unban recruiter profile if exists
    try: _recruiter_svc.unban(uid)
    except: pass
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
    # Delete the Firebase Auth account too — otherwise the user could keep
    # logging in (and the login auto-heal would recreate the Firestore doc).
    from app.core.firebase import get_firebase_app
    get_firebase_app()  # ensure the Admin SDK is initialized before Auth calls
    from firebase_admin import auth as firebase_auth
    try:
        firebase_auth.delete_user(uid)
    except Exception:
        pass  # Auth account may not exist (e.g. seeded users)
    # Also try to clean up linked profiles
    _student_svc.delete(uid)
    _recruiter_svc.delete(uid)

    # ── Cascade cleanup: remove every document tied to this user ─────
    from app.core.firebase import get_db
    db = get_db()

    # Capture resume file URLs first (best-effort Storage blob removal)
    resume_urls = []
    for doc in db.collection("resumes").limit(500).stream():
        try:
            data = doc.to_dict() or {}
            if data.get("studentUid") == uid:
                resume_urls.append(data.get("resumeFile", ""))
                db.collection("resumes").document(doc.id).delete()
        except Exception:
            pass
    for url in resume_urls:
        if not url:
            continue
        try:
            from app.core.firebase import get_bucket
            blob_path = url.split("/", 4)[4]
            get_bucket().blob(blob_path).delete()
        except Exception:
            pass  # storage bucket may not exist / blob already gone

    # Jobs posted by this recruiter (track ids for application cleanup)
    job_ids = []
    for doc in db.collection("jobs").limit(500).stream():
        try:
            if (doc.to_dict() or {}).get("recruiterUid") == uid:
                job_ids.append(doc.id)
                db.collection("jobs").document(doc.id).delete()
        except Exception:
            pass

    # Applications: the user's own + any targeting the deleted jobs
    for doc in db.collection("applications").limit(500).stream():
        try:
            data = doc.to_dict() or {}
            if data.get("studentUid") == uid or data.get("jobId") in job_ids:
                db.collection("applications").document(doc.id).delete()
        except Exception:
            pass

    # Saved jobs subcollection under the student profile
    try:
        saved = db.collection("students").document(uid).collection("savedJobs")
        for doc in saved.limit(500).stream():
            saved.document(doc.id).delete()
    except Exception:
        pass

    # Notifications and evaluations involving this user
    for doc in db.collection("notifications").limit(500).stream():
        try:
            if (doc.to_dict() or {}).get("userId") == uid:
                db.collection("notifications").document(doc.id).delete()
        except Exception:
            pass
    for doc in db.collection("evaluations").limit(500).stream():
        try:
            data = doc.to_dict() or {}
            if data.get("fromUid") == uid or data.get("toUid") == uid:
                db.collection("evaluations").document(doc.id).delete()
        except Exception:
            pass

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
    job = _job_svc.get_by_id(job_id)
    _notif_svc.on_job_approved(
        str(getattr(job, "recruiterUid", "")),
        str(getattr(job, "title", "")),
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


# ═════════════════════════════════════════════════════════════════════
# Evaluation management
# ═════════════════════════════════════════════════════════════════════

@router.get("/evaluations")
def get_all_evaluations(user: dict = Depends(get_current_admin)):
    result = _eval_svc.get_all_evaluations()
    return [_serialize(e) for e in result.get("items", [])]


@router.delete("/evaluations/{evaluation_id}")
def delete_evaluation(evaluation_id: str, user: dict = Depends(get_current_admin)):
    ok = _eval_svc.delete_evaluation(evaluation_id)
    if not ok: raise HTTPException(404, "Evaluation not found.")
    return {"message": "Evaluation deleted."}
