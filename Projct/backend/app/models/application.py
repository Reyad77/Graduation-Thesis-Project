"""
Pydantic models for the Applications collection.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    """Valid states for a job application."""

    PENDING = "pending"
    REVIEWING = "reviewing"
    INTERVIEW = "interview"
    HIRED = "hired"
    REJECTED = "rejected"
    COMPLETED = "completed"


class InterviewSchedule(BaseModel):
    """Interview scheduling details embedded in an application."""

    date: Optional[datetime] = None
    location: str = ""
    notes: str = ""
    sentAt: Optional[datetime] = None


class Application(BaseModel):
    """Represents an application document in Firestore."""

    id: str = ""
    jobId: str = ""
    studentUid: str = ""
    resumeId: str = ""
    status: ApplicationStatus = ApplicationStatus.PENDING
    interviewSchedule: Optional[InterviewSchedule] = None
    appliedAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    notes: str = ""
    hiredAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None


class ApplicationCreateRequest(BaseModel):
    """Payload for creating a new application (student applies to a job)."""

    resumeId: str = Field(..., description="ID of the resume to attach")


class ApplicationStatusUpdateRequest(BaseModel):
    """Payload for updating an application's status."""

    status: ApplicationStatus
    notes: str = ""


class InterviewScheduleRequest(BaseModel):
    """Payload for scheduling an interview."""

    date: datetime
    location: str
    notes: str = ""


class ApplicationResponse(BaseModel):
    """Application data returned in API responses."""

    id: str
    jobId: str
    studentUid: str
    resumeId: str
    status: ApplicationStatus
    interviewSchedule: Optional[InterviewSchedule] = None
    appliedAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    notes: str
    hiredAt: Optional[datetime] = None
    completedAt: Optional[datetime] = None
