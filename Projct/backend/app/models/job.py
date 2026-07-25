"""
Pydantic models for the Jobs collection.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Valid states for a job posting."""

    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    EXPIRED = "expired"
    REJECTED = "rejected"


class Job(BaseModel):
    """Represents a job document in Firestore."""

    id: str = ""
    enterpriseUid: str = ""
    title: str = ""
    responsibilities: str = ""
    salary: str = ""  # e.g. "$15/hour"
    workingHours: str = ""  # e.g. "9 AM - 5 PM"
    quota: int = 1  # Number of positions
    location: str = ""
    skillRequirements: List[str] = Field(default_factory=list)
    duration: str = ""  # e.g. "3 months", "Summer internship"
    status: JobStatus = JobStatus.PENDING
    views: int = 0
    applicationsCount: int = 0
    postedAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None  # Auto-expiry after 30 days
    updatedAt: Optional[datetime] = None
    auditNotes: str = ""
    auditedBy: Optional[str] = None  # Admin uid
    auditAt: Optional[datetime] = None


class JobCreateRequest(BaseModel):
    """Payload for creating a new job posting."""

    title: str = Field(..., min_length=1, max_length=200)
    responsibilities: str
    salary: str
    workingHours: str
    quota: int = Field(default=1, ge=1)
    location: str
    skillRequirements: List[str] = Field(default_factory=list)
    duration: str


class JobUpdateRequest(BaseModel):
    """Payload for updating an existing job."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    responsibilities: Optional[str] = None
    salary: Optional[str] = None
    workingHours: Optional[str] = None
    quota: Optional[int] = Field(None, ge=1)
    location: Optional[str] = None
    skillRequirements: Optional[List[str]] = None
    duration: Optional[str] = None


class JobResponse(BaseModel):
    """Job data returned in API responses."""

    id: str
    enterpriseUid: str
    title: str
    responsibilities: str
    salary: str
    workingHours: str
    quota: int
    location: str
    skillRequirements: List[str]
    duration: str
    status: JobStatus
    views: int
    applicationsCount: int
    postedAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None


class JobFilterParams(BaseModel):
    """Query parameters for filtering job listings."""

    keyword: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[str] = None
    skills: Optional[List[str]] = None
    status: Optional[JobStatus] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
