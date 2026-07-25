"""
Pydantic models for the Notifications collection.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel


class NotificationType(str, Enum):
    """Valid notification types."""

    APPLICATION_STATUS = "application_status"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    JOB_APPROVED = "job_approved"
    SYSTEM = "system"


class Notification(BaseModel):
    """Represents a notification document in Firestore."""

    id: str = ""
    userId: str = ""  # Recipient uid
    type: NotificationType = NotificationType.SYSTEM
    title: str = ""
    message: str = ""
    isRead: bool = False
    data: Dict[str, Any] = {}  # Additional data (e.g. applicationId)
    createdAt: Optional[datetime] = None


class NotificationResponse(BaseModel):
    """Notification data returned in API responses."""

    id: str
    type: NotificationType
    title: str
    message: str
    isRead: bool
    data: Dict[str, Any]
    createdAt: Optional[datetime] = None
