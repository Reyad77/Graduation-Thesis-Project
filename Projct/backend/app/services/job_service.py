"""
Job service — job posting CRUD, search, recommendations, and admin auditing.
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from app.models.job import (
    Job,
    JobCreateRequest,
    JobUpdateRequest,
    JobStatus,
)
from app.services.base_service import BaseService


class JobService(BaseService):
    """CRUD and business-logic operations for job postings."""

    def __init__(self) -> None:
        super().__init__("jobs", Job)

    # ── Recruiter job management ──────────────────────────────────────

    def create_job(
        self, recruiter_uid: str, payload: JobCreateRequest
    ) -> Job:
        """Create a new job posting (starts 'pending' for admin review)."""
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=30)

        data = {
            "recruiterUid": recruiter_uid,
            "title": payload.title,
            "responsibilities": payload.responsibilities,
            "salary": payload.salary,
            "workingHours": payload.workingHours,
            "quota": payload.quota,
            "location": payload.location,
            "skillRequirements": payload.skillRequirements,
            "duration": payload.duration,
            "status": JobStatus.PENDING.value,
            "views": 0,
            "applicationsCount": 0,
            "postedAt": now,
            "expiresAt": expires_at,
            "updatedAt": now,
            "auditNotes": "",
            "auditedBy": None,
            "auditAt": None,
        }
        doc_id = self.create(data)
        return self.get_by_id(doc_id)  # type: ignore[return-value]

    def update_job(
        self, job_id: str, recruiter_uid: str, payload: JobUpdateRequest
    ) -> Optional[Job]:
        """Update a job that belongs to the given recruiter."""
        job = self.get_by_id(job_id)
        if not job or str(getattr(job, "recruiterUid", "")) != recruiter_uid:
            return None
        update_data = payload.model_dump(exclude_unset=True)
        self.update(job_id, update_data)
        return self.get_by_id(job_id)  # type: ignore[return-value]

    def delete_job(self, job_id: str, recruiter_uid: str) -> bool:
        """Delete a job belonging to the recruiter."""
        job = self.get_by_id(job_id)
        if not job or str(getattr(job, "recruiterUid", "")) != recruiter_uid:
            return False
        return self.delete(job_id)

    def update_status(
        self, job_id: str, recruiter_uid: str, new_status: JobStatus
    ) -> Optional[Job]:
        """Change a job's status (recruiter can activate/pause)."""
        job = self.get_by_id(job_id)
        if not job or str(getattr(job, "recruiterUid", "")) != recruiter_uid:
            return None
        self.update(job_id, {"status": new_status.value})
        return self.get_by_id(job_id)  # type: ignore[return-value]

    def get_recruiter_jobs(
        self, recruiter_uid: str
    ) -> List[Job]:
        """Get all jobs posted by a recruiter (newest first).

        Sorts in Python so the query does not require the
        recruiterUid+postedAt composite index on the REST fallback client.
        """
        jobs = self.where(  # type: ignore[assignment]
            "recruiterUid", "==", recruiter_uid, limit=200,
        )
        jobs.sort(key=lambda j: str(getattr(j, "postedAt", "")), reverse=True)
        return jobs

    # ── Student job browsing ──────────────────────────────────────────

    def get_active_jobs(
        self,
        page: int = 1,
        page_size: int = 20,
        location: Optional[str] = None,
        skills: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Return paginated active jobs with optional filters.

        Note: Firestore only supports one ``array_contains`` per query.
        Multi-skill filtering should be done client-side or via a search index.
        """
        filters: List[tuple] = [("status", "==", JobStatus.ACTIVE.value)]
        if location:
            filters.append(("location", "==", location))
        if skills and len(skills) == 1:
            filters.append(
                ("skillRequirements", "array_contains", skills[0])
            )

        # Fetch without order_by and sort/slice in Python: avoids needing
        # composite indexes on the REST fallback client.
        items = self.where_many(
            filters, limit=page_size * page + 1,
        )
        items.sort(
            key=lambda j: str(getattr(j, "postedAt", "")),
            reverse=True,
        )
        offset = (page - 1) * page_size
        return items[offset:offset + page_size]  # type: ignore[return-value]

    def get_job_detail(self, job_id: str) -> Optional[Job]:
        """Get a job and increment its view count."""
        job = self.get_by_id(job_id)
        if job:
            views = int(getattr(job, "views", 0))
            self.update(job_id, {"views": views + 1})
        return job  # type: ignore[return-value]

    def search_jobs(self, keyword: str, limit: int = 50) -> List[Job]:
        """Simple keyword search on job title.

        For production: integrate Algolia, Typesense, or Firebase Extensions.
        """
        # Firestore doesn't support full-text search.
        # This performs a prefix match on the title field (case-sensitive).
        end = keyword[:-1] + chr(ord(keyword[-1]) + 1) if keyword else ""
        active_jobs = self.where(
            "status", "==", JobStatus.ACTIVE.value,
            order_by="title", limit=limit,
        )
        # Filter client-side for partial title match
        keyword_lower = keyword.lower()
        return [  # type: ignore[return-value]
            j for j in active_jobs
            if keyword_lower in str(getattr(j, "title", "")).lower()
        ][:limit]

    def get_recommended_jobs(self, skills: List[str]) -> List[Job]:
        """Get jobs whose skill requirements overlap with the student's skills."""
        seen: set[str] = set()
        recommended: List[Job] = []
        for skill in skills[:5]:
            matches = self.where(
                "skillRequirements", "array_contains", skill, limit=20,
            )
            for job in matches:
                jid = str(getattr(job, "id", ""))
                status = str(getattr(job, "status", ""))
                if jid not in seen and status == JobStatus.ACTIVE.value:
                    seen.add(jid)
                    recommended.append(job)  # type: ignore[arg-type]
        return recommended

    # ── Admin auditing ────────────────────────────────────────────────

    def get_pending_jobs(self) -> List[Job]:
        """Get all jobs awaiting admin approval (oldest first).

        Sorts in Python so the query does not require the
        status+postedAt composite index on the REST fallback client.
        """
        jobs = self.where(  # type: ignore[assignment]
            "status", "==", JobStatus.PENDING.value, limit=200,
        )
        jobs.sort(key=lambda j: str(getattr(j, "postedAt", "")))
        return jobs

    def approve_job(self, job_id: str, admin_uid: str) -> bool:
        """Approve a pending job (admin action)."""
        now = datetime.now(timezone.utc)
        return self.update(job_id, {
            "status": JobStatus.ACTIVE.value,
            "auditedBy": admin_uid,
            "auditAt": now,
            "postedAt": now,
        })

    def reject_job(self, job_id: str, admin_uid: str, notes: str) -> bool:
        """Reject a pending job (admin action)."""
        now = datetime.now(timezone.utc)
        return self.update(job_id, {
            "status": JobStatus.REJECTED.value,
            "auditNotes": notes,
            "auditedBy": admin_uid,
            "auditAt": now,
        })

    def remove_job(self, job_id: str) -> bool:
        """Admin removes a job entirely from the platform."""
        return self.delete(job_id)

    # ── Auto-expiry ──────────────────────────────────────────────────

    def expire_stale_jobs(self) -> int:
        """Deactivate jobs past their expiry date. Returns number expired."""
        now = datetime.now(timezone.utc)
        active_jobs = self.where(
            "status", "==", JobStatus.ACTIVE.value, limit=500,
        )
        count = 0
        for job in active_jobs:
            expires_at = getattr(job, "expiresAt", None)
            jid = str(getattr(job, "id", ""))
            if expires_at and expires_at < now:
                self.update(jid, {"status": JobStatus.EXPIRED.value})
                count += 1
        return count


# ── Saved jobs ───────────────────────────────────────────────────────────

class SavedJobService:
    """Manages the ``savedJobs`` sub-collection under a student's profile."""

    def __init__(self) -> None:
        from app.core.firebase import get_db
        self.db = get_db()

    def save(self, student_uid: str, job_id: str) -> None:
        """Save/bookmark a job for a student."""
        self.db.collection("students").document(student_uid) \
            .collection("savedJobs").document(job_id).set({
                "jobId": job_id,
                "savedAt": datetime.now(timezone.utc),
            })

    def unsave(self, student_uid: str, job_id: str) -> None:
        """Remove a saved job bookmark."""
        self.db.collection("students").document(student_uid) \
            .collection("savedJobs").document(job_id).delete()

    def get_saved(self, student_uid: str) -> List[str]:
        """Return the list of saved job IDs."""
        # Use limit().stream() so this works with the REST fallback client too
        docs = self.db.collection("students").document(student_uid) \
            .collection("savedJobs").limit(500).stream()
        return [doc.id for doc in docs]

    def is_saved(self, student_uid: str, job_id: str) -> bool:
        """Check if a job is already saved."""
        doc = self.db.collection("students").document(student_uid) \
            .collection("savedJobs").document(job_id).get()
        return doc.exists
