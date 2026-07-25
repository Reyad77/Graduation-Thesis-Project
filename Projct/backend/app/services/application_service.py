"""
Application service — status updates, interview scheduling, resume viewing,
and the full application lifecycle.
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.models.application import (
    Application,
    ApplicationCreateRequest,
    ApplicationStatus,
    ApplicationStatusUpdateRequest,
    InterviewSchedule,
    InterviewScheduleRequest,
)
from app.services.base_service import BaseService


class ApplicationService(BaseService):
    """Business-logic operations for job applications."""

    def __init__(self) -> None:
        super().__init__("applications", Application)

    # ── Apply ─────────────────────────────────────────────────────────

    def apply(
        self, job_id: str, student_uid: str, payload: ApplicationCreateRequest
    ) -> Application:
        """Submit a new job application."""
        now = datetime.now(timezone.utc)
        data = {
            "jobId": job_id,
            "studentUid": student_uid,
            "resumeId": payload.resumeId,
            "status": ApplicationStatus.PENDING.value,
            "interviewSchedule": None,
            "appliedAt": now,
            "updatedAt": now,
            "notes": "",
            "hiredAt": None,
            "completedAt": None,
        }
        doc_id = self.create(data)

        # Increment the job's applications count
        from app.core.firebase import get_db
        db = get_db()
        job_ref = db.collection("jobs").document(job_id)
        job_doc = job_ref.get()
        if job_doc.exists:
            current = job_doc.to_dict().get("applicationsCount", 0) if job_doc.to_dict() else 0
            job_ref.update({"applicationsCount": current + 1})

        return self.get_by_id(doc_id)  # type: ignore[return-value]

    # ── Check existing application ────────────────────────────────────

    def already_applied(self, job_id: str, student_uid: str) -> bool:
        """Check whether a student has already applied to a job."""
        existing = self.where_many(
            [
                ("jobId", "==", job_id),
                ("studentUid", "==", student_uid),
            ],
            limit=1,
        )
        return len(existing) > 0

    # ── Student's applications ────────────────────────────────────────

    def get_student_applications(
        self, student_uid: str
    ) -> List[Application]:
        """Get all applications submitted by a student."""
        return self.where(  # type: ignore[return-value]
            "studentUid", "==", student_uid,
            order_by="appliedAt", descending=True, limit=100,
        )

    def get_student_application(
        self, application_id: str, student_uid: str
    ) -> Optional[Application]:
        """Get a specific application belonging to a student."""
        app = self.get_by_id(application_id)
        if not app or str(getattr(app, "studentUid", "")) != student_uid:
            return None
        return app  # type: ignore[return-value]

    # ── Enterprise: manage applications ───────────────────────────────

    def get_job_applications(
        self, job_id: str, enterprise_uid: str
    ) -> List[Application]:
        """Get all applications for a job belonging to the enterprise."""
        from app.services.job_service import JobService
        job_svc = JobService()
        job = job_svc.get_by_id(job_id)
        if not job or str(getattr(job, "enterpriseUid", "")) != enterprise_uid:
            return []
        return self.where(  # type: ignore[return-value]
            "jobId", "==", job_id,
            order_by="appliedAt", descending=True, limit=200,
        )

    def get_all_enterprise_applications(
        self, enterprise_uid: str
    ) -> List[Application]:
        """Get all applications across all jobs of an enterprise."""
        from app.services.job_service import JobService
        job_svc = JobService()
        jobs = job_svc.get_enterprise_jobs(enterprise_uid)
        job_ids = [str(getattr(j, "id", "")) for j in jobs]

        all_apps: List[Application] = []
        for jid in job_ids:
            apps = self.where("jobId", "==", jid, limit=100)
            all_apps.extend(apps)  # type: ignore[arg-type]
        return all_apps

    def update_status(
        self,
        application_id: str,
        payload: ApplicationStatusUpdateRequest,
    ) -> Optional[Application]:
        """Update an application's status."""
        if not self.exists(application_id):
            return None

        update_data: dict = {"status": payload.status.value}
        if payload.notes:
            update_data["notes"] = payload.notes

        now = datetime.now(timezone.utc)
        if payload.status == ApplicationStatus.HIRED:
            update_data["hiredAt"] = now
        elif payload.status == ApplicationStatus.COMPLETED:
            update_data["completedAt"] = now

        self.update(application_id, update_data)
        return self.get_by_id(application_id)  # type: ignore[return-value]

    # ── Interview scheduling ──────────────────────────────────────────

    def schedule_interview(
        self,
        application_id: str,
        payload: InterviewScheduleRequest,
    ) -> Optional[Application]:
        """Schedule an interview for an application."""
        if not self.exists(application_id):
            return None

        now = datetime.now(timezone.utc)
        interview = {
            "date": payload.date,
            "location": payload.location,
            "notes": payload.notes,
            "sentAt": now,
        }
        self.update(application_id, {
            "interviewSchedule": interview,
            "status": ApplicationStatus.INTERVIEW.value,
        })
        return self.get_by_id(application_id)  # type: ignore[return-value]

    # ── Resume viewing (enterprise) ───────────────────────────────────

    def get_application_with_resume(
        self, application_id: str, enterprise_uid: str
    ) -> Optional[Dict]:
        """Return the application along with the attached resume data."""
        app = self.get_by_id(application_id)
        if not app:
            return None

        # Verify ownership through the job
        job_id = str(getattr(app, "jobId", ""))
        from app.services.job_service import JobService
        job = JobService().get_by_id(job_id)
        if not job or str(getattr(job, "enterpriseUid", "")) != enterprise_uid:
            return None

        resume_id = str(getattr(app, "resumeId", ""))
        from app.services.student_service import ResumeService
        resume = ResumeService().get_by_id(resume_id)

        return {
            "application": self._doc_to_dict_safe(app),
            "resume": self._doc_to_dict_safe(resume) if resume else None,
        }

    # ── Stats helpers ─────────────────────────────────────────────────

    def count_by_status(self, job_id: str) -> Dict[str, int]:
        """Count applications grouped by status for a given job."""
        apps = self.where("jobId", "==", job_id, limit=500)
        counts: Dict[str, int] = {}
        for a in apps:
            s = str(getattr(a, "status", "unknown"))
            counts[s] = counts.get(s, 0) + 1
        return counts

    @staticmethod
    def _doc_to_dict_safe(obj) -> Optional[Dict]:
        """Convert a Pydantic model or Firestore dict to a plain dict."""
        if obj is None:
            return None
        if hasattr(obj, "model_dump"):
            return obj.model_dump()  # type: ignore[union-attr]
        if isinstance(obj, dict):
            return obj
        return None
