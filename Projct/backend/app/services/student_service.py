"""
Student service — profile management, ID verification, resume CRUD,
and job browsing helpers.
"""

from datetime import datetime, timezone
from typing import List, Optional

from app.models.student import Student, StudentUpdateRequest
from app.models.resume import (
    Resume,
    ResumeCreateRequest,
    ResumeUpdateRequest,
)
from app.services.base_service import BaseService


# ── Student profile ──────────────────────────────────────────────────────

class StudentService(BaseService[Student]):
    """Handles the student profile document in the ``students`` collection."""

    def __init__(self) -> None:
        super().__init__("students", Student)

    def get_profile(self, uid: str) -> Optional[Student]:
        """Get a student's profile by UID."""
        return self.get_by_id(uid)

    def create_profile(self, uid: str, email: str) -> Student:
        """Create a blank student profile on first registration."""
        now = datetime.now(timezone.utc)
        data = {
            "uid": uid,
            "studentId": "",
            "major": "",
            "grade": "",
            "year": 1,
            "idCardPhoto": None,
            "isVerified": False,
            "skills": [],
            "availability": "",
            "createdAt": now,
            "updatedAt": now,
        }
        self.create(data, doc_id=uid)
        return self.get_by_id(uid)  # type: ignore[return-value]

    def update_profile(
        self, uid: str, payload: StudentUpdateRequest
    ) -> Optional[Student]:
        """Update a student's profile."""
        if not self.exists(uid):
            return None
        update_data = payload.model_dump(exclude_unset=True)
        self.update(uid, update_data)
        return self.get_by_id(uid)  # type: ignore[return-value]

    def upload_id_card(self, uid: str, photo_url: str) -> bool:
        """Save the student ID card photo URL."""
        return self.update(uid, {"idCardPhoto": photo_url})

    def verify_student(self, uid: str, admin_uid: str) -> bool:
        """Mark a student as verified (admin action)."""
        now = datetime.now(timezone.utc)
        return self.update(uid, {
            "isVerified": True,
            "verifiedAt": now,
            "verifiedBy": admin_uid,
        })

    def get_pending_verifications(self) -> List[Student]:
        """Get students with uploaded ID cards awaiting verification."""
        return self.where("isVerified", "==", False, limit=200)  # type: ignore[return-value]


# ── Resume management ────────────────────────────────────────────────────

class ResumeService(BaseService[Resume]):
    """CRUD operations for student resumes."""

    def __init__(self) -> None:
        super().__init__("resumes", Resume)

    def create_resume(
        self, student_uid: str, payload: ResumeCreateRequest
    ) -> Resume:
        """Create a new resume for a student. First resume is auto-default."""
        now = datetime.now(timezone.utc)
        existing = self.where("studentUid", "==", student_uid, limit=1)
        is_default = len(existing) == 0

        data = {
            "studentUid": student_uid,
            "major": payload.major,
            "grade": payload.grade,
            "skills": payload.skills,
            "availableHours": payload.availableHours,
            "experience": payload.experience,
            "certificates": [],
            "isDefault": is_default,
            "createdAt": now,
            "updatedAt": now,
        }
        doc_id = self.create(data)
        return self.get_by_id(doc_id)  # type: ignore[return-value]

    def update_resume(
        self, resume_id: str, student_uid: str, payload: ResumeUpdateRequest
    ) -> Optional[Resume]:
        """Update a resume, ensuring ownership."""
        resume = self.get_by_id(resume_id)
        if not resume or str(getattr(resume, "studentUid", "")) != student_uid:
            return None
        update_data = payload.model_dump(exclude_unset=True)
        self.update(resume_id, update_data)
        return self.get_by_id(resume_id)  # type: ignore[return-value]

    def delete_resume(self, resume_id: str, student_uid: str) -> bool:
        """Delete a resume belonging to the student."""
        resume = self.get_by_id(resume_id)
        if not resume or str(getattr(resume, "studentUid", "")) != student_uid:
            return False
        return self.delete(resume_id)

    def get_student_resumes(self, student_uid: str) -> List[Resume]:
        """Get all resumes belonging to a student."""
        return self.where(  # type: ignore[return-value]
            "studentUid", "==", student_uid, limit=100,
        )

    def set_default(self, resume_id: str, student_uid: str) -> bool:
        """Set one resume as default and unset all others."""
        resumes = self.get_student_resumes(student_uid)
        for r in resumes:
            rid = str(getattr(r, "id", ""))
            is_target = rid == resume_id
            if bool(getattr(r, "isDefault", False)) != is_target:
                self.update(rid, {"isDefault": is_target})
        return True

    def add_certificate(self, resume_id: str, cert_url: str) -> bool:
        """Append a certificate URL to a resume."""
        resume = self.get_dict_by_id(resume_id)
        if not resume:
            return False
        certs: list = resume.get("certificates", [])
        certs.append(cert_url)
        self.update(resume_id, {"certificates": certs})
        return True

    def remove_certificate(self, resume_id: str, cert_url: str) -> bool:
        """Remove a certificate URL from a resume."""
        resume = self.get_dict_by_id(resume_id)
        if not resume:
            return False
        certs: list = resume.get("certificates", [])
        if cert_url in certs:
            certs.remove(cert_url)
            self.update(resume_id, {"certificates": certs})
        return True
