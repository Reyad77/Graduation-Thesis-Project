"""
Evaluation service — mutual evaluation between students and recruiters
after a part-time job is completed.
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.models.application import ApplicationStatus
from app.models.evaluation import Evaluation, EvaluationCreateRequest
from app.services.base_service import BaseService


class EvaluationService(BaseService):
    """Business-logic operations for mutual evaluations."""

    def __init__(self) -> None:
        super().__init__("evaluations", Evaluation)

    def create_evaluation(
        self,
        application_id: str,
        from_uid: str,
        from_role: str,
        rating: int,
        comment: str,
    ) -> Evaluation:
        """Submit an evaluation for a completed application.

        Raises ValueError with a user-facing message when the evaluation
        is not allowed.
        """
        from app.services.application_service import ApplicationService
        from app.services.job_service import JobService

        app = ApplicationService().get_by_id(application_id)
        if not app:
            raise ValueError("Application not found.")

        if str(getattr(app, "status", "")) != ApplicationStatus.COMPLETED.value:
            raise ValueError("Only completed applications can be evaluated.")

        job = JobService().get_by_id(str(getattr(app, "jobId", "")))
        if not job:
            raise ValueError("Job not found.")

        recruiter_uid = str(getattr(job, "recruiterUid", ""))
        student_uid = str(getattr(app, "studentUid", ""))

        if from_role == "student":
            if student_uid != from_uid:
                raise ValueError("You can only evaluate your own applications.")
            to_uid, to_role = recruiter_uid, "recruiter"
        elif from_role == "recruiter":
            if recruiter_uid != from_uid:
                raise ValueError("Only the job owner can evaluate this applicant.")
            to_uid, to_role = student_uid, "student"
        else:
            raise ValueError("Only students and recruiters can submit evaluations.")

        if not to_uid:
            raise ValueError("Evaluation target not found.")

        # Duplicate check without a composite index: filter in Python.
        existing = self.where(
            "applicationId", "==", application_id, limit=100,
        )
        for e in existing:
            if str(getattr(e, "fromUid", "")) == from_uid:
                raise ValueError("You have already evaluated this application.")

        now = datetime.now(timezone.utc)
        data = {
            "applicationId": application_id,
            "jobId": str(getattr(app, "jobId", "")),
            "fromUid": from_uid,
            "fromRole": from_role,
            "toUid": to_uid,
            "toRole": to_role,
            "rating": rating,
            "comment": comment,
            "createdAt": now,
        }
        doc_id = self.create(data)
        return self.get_by_id(doc_id)  # type: ignore[return-value]

    def get_received(self, to_uid: str) -> List[Evaluation]:
        """Evaluations received by a user, newest first."""
        received = self.where("toUid", "==", to_uid, limit=100)
        received.sort(
            key=lambda e: str(getattr(e, "createdAt", "")),
            reverse=True,
        )
        return received  # type: ignore[return-value]

    def get_all_evaluations(self, page: int = 1, page_size: int = 100) -> Dict:
        """Paginated list of all evaluations (admin)."""
        return self.get_all(page=page, page_size=page_size)

    def delete_evaluation(self, evaluation_id: str) -> bool:
        """Delete an evaluation (admin)."""
        return self.delete(evaluation_id)
