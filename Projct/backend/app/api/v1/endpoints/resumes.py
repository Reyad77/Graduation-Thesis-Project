"""
Resume management endpoints (student-only).
"""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.dependencies import get_current_student
from app.models.resume import ResumeCreateRequest, ResumeUpdateRequest
from app.services.student_service import ResumeService

router = APIRouter()
_resume_svc = ResumeService()


def _uid(user: dict) -> str:
    return user.get("sub", "")


def _serialize(obj):
    if hasattr(obj, "model_dump"):
        return obj.model_dump(mode="json")
    return obj


# ── List & Get ─────────────────────────────────────────────────────────

@router.get("/")
def list_resumes(user: dict = Depends(get_current_student)):
    """Get all resumes of the current student."""
    resumes = _resume_svc.get_student_resumes(_uid(user))
    return [_serialize(r) for r in resumes]


@router.get("/{resume_id}")
def get_resume(resume_id: str, user: dict = Depends(get_current_student)):
    """Get a specific resume."""
    r = _resume_svc.get_by_id(resume_id)
    if not r or str(getattr(r, "studentUid", "")) != _uid(user):
        raise HTTPException(status_code=404, detail="Resume not found.")
    return _serialize(r)


# ── Create & Update ────────────────────────────────────────────────────

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_resume(
    payload: ResumeCreateRequest,
    user: dict = Depends(get_current_student),
):
    """Create a new resume."""
    resume = _resume_svc.create_resume(_uid(user), payload)
    return _serialize(resume)


@router.put("/{resume_id}")
def update_resume(
    resume_id: str,
    payload: ResumeUpdateRequest,
    user: dict = Depends(get_current_student),
):
    """Update an existing resume."""
    updated = _resume_svc.update_resume(resume_id, _uid(user), payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return _serialize(updated)


@router.delete("/{resume_id}")
def delete_resume(resume_id: str, user: dict = Depends(get_current_student)):
    """Delete a resume."""
    ok = _resume_svc.delete_resume(resume_id, _uid(user))
    if not ok:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"message": "Resume deleted."}


# ── Certificates ──────────────────────────────────────────────────────

@router.post("/{resume_id}/certificate")
def upload_certificate(
    resume_id: str,
    cert_url: str,
    user: dict = Depends(get_current_student),
):
    """Add a certificate URL to a resume."""
    ok = _resume_svc.add_certificate(resume_id, cert_url)
    if not ok:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"message": "Certificate added.", "url": cert_url}


@router.delete("/{resume_id}/certificate/{cert_url:path}")
def delete_certificate(
    resume_id: str,
    cert_url: str,
    user: dict = Depends(get_current_student),
):
    """Remove a certificate from a resume."""
    ok = _resume_svc.remove_certificate(resume_id, cert_url)
    if not ok:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"message": "Certificate removed."}


# ── Resume file upload (PDF/image attachment) ─────────────────────────

ALLOWED_FILE_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/{resume_id}/file")
async def upload_resume_file(
    resume_id: str,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_student),
):
    """Attach a resume file (PDF/image) to a resume."""
    resume = _resume_svc.get_dict_by_id(resume_id)
    if not resume or str(resume.get("studentUid", "")) != _uid(user):
        raise HTTPException(status_code=404, detail="Resume not found.")

    if file.content_type not in ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PDF or image files (PNG/JPEG) are allowed.",
        )

    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, detail="File must be 5 MB or smaller."
        )

    from app.core.firebase import get_bucket
    safe_name = "".join(
        c for c in (file.filename or "resume.pdf") if c.isalnum() or c in "._-"
    ) or "resume.pdf"
    blob_path = f"resumes/{_uid(user)}/{resume_id}_{safe_name}"
    try:
        blob = get_bucket().blob(blob_path)
        blob.upload_from_string(content, content_type=file.content_type)
        blob.make_public()
    except Exception:
        raise HTTPException(
            status_code=503,
            detail=(
                "File storage is not available. Make sure Firebase Storage "
                "is enabled for this project (Firebase Console > Build > Storage)."
            ),
        )

    _resume_svc.update(resume_id, {
        "resumeFile": blob.public_url,
        "resumeFileName": file.filename or safe_name,
    })
    return {"message": "Resume file uploaded.", "resumeFile": blob.public_url}


@router.delete("/{resume_id}/file")
def delete_resume_file(resume_id: str, user: dict = Depends(get_current_student)):
    """Remove the attached resume file."""
    resume = _resume_svc.get_dict_by_id(resume_id)
    if not resume or str(resume.get("studentUid", "")) != _uid(user):
        raise HTTPException(status_code=404, detail="Resume not found.")

    url = resume.get("resumeFile", "")
    if url:
        try:
            from app.core.firebase import get_bucket
            # public_url format: https://storage.googleapis.com/{bucket}/{blob}
            blob_path = url.split("/", 4)[4]
            get_bucket().blob(blob_path).delete()
        except Exception:
            pass  # Best effort — the Firestore fields are cleared either way

    _resume_svc.update(resume_id, {"resumeFile": "", "resumeFileName": ""})
    return {"message": "Resume file removed."}


# ── Default ────────────────────────────────────────────────────────────

@router.put("/{resume_id}/set-default")
def set_default_resume(
    resume_id: str,
    user: dict = Depends(get_current_student),
):
    """Set this resume as the default."""
    ok = _resume_svc.set_default(resume_id, _uid(user))
    if not ok:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"message": "Default resume set."}
