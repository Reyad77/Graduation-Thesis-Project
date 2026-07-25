"""
Pydantic models for the Resumes collection.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Resume(BaseModel):
    """Represents a resume document in Firestore."""

    id: str = ""
    studentUid: str = ""
    major: str = ""
    grade: str = ""
    skills: List[str] = Field(default_factory=list)
    availableHours: str = ""  # e.g. "20 hours/week", "Weekends only"
    experience: str = ""  # Text description of previous experience
    certificates: List[str] = Field(default_factory=list)  # Storage URLs
    isDefault: bool = False
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class ResumeCreateRequest(BaseModel):
    """Payload for creating a new resume."""

    major: str = ""
    grade: str = ""
    skills: List[str] = Field(default_factory=list)
    availableHours: str = ""
    experience: str = ""


class ResumeUpdateRequest(BaseModel):
    """Payload for updating an existing resume."""

    major: Optional[str] = None
    grade: Optional[str] = None
    skills: Optional[List[str]] = None
    availableHours: Optional[str] = None
    experience: Optional[str] = None


class ResumeResponse(BaseModel):
    """Resume data returned in API responses."""

    id: str
    studentUid: str
    major: str
    grade: str
    skills: List[str]
    availableHours: str
    experience: str
    certificates: List[str]
    isDefault: bool
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
