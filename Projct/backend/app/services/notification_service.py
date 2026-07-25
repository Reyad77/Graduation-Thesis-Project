"""
Notification service — creation, delivery, and real-time notification handling.

Notifications are triggered by key events:
- Application status changes
- Interview scheduling
- Job approval/rejection
- Student verification
- Enterprise approval
"""

from datetime import datetime, timezone
from typing import List, Optional

from app.models.notification import (
    Notification,
    NotificationType,
)
from app.services.base_service import BaseService


class NotificationService(BaseService):
    """Handles notification creation, retrieval, and delivery."""

    def __init__(self) -> None:
        super().__init__("notifications", Notification)

    # ── Create ────────────────────────────────────────────────────────

    def notify(
        self,
        user_id: str,
        type_: NotificationType,
        title: str,
        message: str,
        data: Optional[dict] = None,
    ) -> str:
        """Create and send a notification to a user.

        Returns the new notification's document ID.
        """
        now = datetime.now(timezone.utc)
        doc = {
            "userId": user_id,
            "type": type_.value,
            "title": title,
            "message": message,
            "isRead": False,
            "data": data or {},
            "createdAt": now,
        }
        return self.create(doc)

    # ── Get user's notifications ──────────────────────────────────────

    def get_user_notifications(
        self, user_id: str
    ) -> List[Notification]:
        """Get all notifications for a user, newest first."""
        return self.where(  # type: ignore[return-value]
            "userId", "==", user_id,
            order_by="createdAt", descending=True, limit=100,
        )

    def get_unread_count(self, user_id: str) -> int:
        """Return the number of unread notifications."""
        unread = self.where_many(
            [
                ("userId", "==", user_id),
                ("isRead", "==", False),
            ],
            limit=100,
        )
        return len(unread)

    # ── Mark read ─────────────────────────────────────────────────────

    def mark_as_read(self, notification_id: str) -> bool:
        """Mark a single notification as read."""
        return self.update(notification_id, {"isRead": True})

    def mark_all_as_read(self, user_id: str) -> int:
        """Mark all of a user's notifications as read. Returns count."""
        unread = self.where_many(
            [
                ("userId", "==", user_id),
                ("isRead", "==", False),
            ],
            limit=100,
        )
        for n in unread:
            nid = str(getattr(n, "id", ""))
            self.update(nid, {"isRead": True})
        return len(unread)

    # ── Delete ────────────────────────────────────────────────────────

    def delete_notification(self, notification_id: str) -> bool:
        """Delete a notification."""
        return self.delete(notification_id)

    # ── Trigger helpers (called by other services) ────────────────────

    def on_application_status_changed(
        self, student_uid: str, job_title: str, new_status: str,
    ) -> None:
        """Notify a student that their application status changed."""
        self.notify(
            student_uid,
            NotificationType.APPLICATION_STATUS,
            "Application Status Updated",
            f"Your application for '{job_title}' is now '{new_status}'.",
            {"jobTitle": job_title, "status": new_status},
        )

    def on_interview_scheduled(
        self, student_uid: str, job_title: str, interview_date: str,
    ) -> None:
        """Notify a student about an upcoming interview."""
        self.notify(
            student_uid,
            NotificationType.INTERVIEW_SCHEDULED,
            "Interview Scheduled",
            f"An interview for '{job_title}' has been scheduled on {interview_date}.",
            {"jobTitle": job_title, "date": interview_date},
        )

    def on_job_approved(
        self, enterprise_uid: str, job_title: str,
    ) -> None:
        """Notify an enterprise that their job was approved."""
        self.notify(
            enterprise_uid,
            NotificationType.JOB_APPROVED,
            "Job Posting Approved",
            f"Your job '{job_title}' has been approved and is now active.",
            {"jobTitle": job_title},
        )

    def on_job_rejected(
        self, enterprise_uid: str, job_title: str, reason: str,
    ) -> None:
        """Notify an enterprise that their job was rejected."""
        self.notify(
            enterprise_uid,
            NotificationType.SYSTEM,
            "Job Posting Rejected",
            f"Your job '{job_title}' was rejected. Reason: {reason}",
            {"jobTitle": job_title, "reason": reason},
        )

    def on_student_verified(self, student_uid: str) -> None:
        """Notify a student that their ID has been verified."""
        self.notify(
            student_uid,
            NotificationType.SYSTEM,
            "Identity Verified",
            "Your student ID has been verified. You can now apply for jobs!",
        )

    def on_enterprise_approved(self, enterprise_uid: str) -> None:
        """Notify an enterprise that their registration was approved."""
        self.notify(
            enterprise_uid,
            NotificationType.SYSTEM,
            "Registration Approved",
            "Your enterprise registration has been approved. You can now post jobs!",
        )
