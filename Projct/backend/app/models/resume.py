"""
Pydantic models for the Resumes collection.

A resume mirrors a real job-site resume: personal summary, education,
work experience entries, projects, skills, languages, certificates,
and availability.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ExperienceEntry(BaseModel):
    """One work-experience entry."""

    title: str = ""
    company: str = ""
    startDate: str = ""
    endDate: str = ""
    description: str = ""


class ProjectEntry(BaseModel):
    """One personal/academic project entry."""

    name: str = ""
    description: str = ""
    link: str = ""


class LanguageEntry(BaseModel):
    """One language entry (e.g. English — Fluent)."""

    language: str = ""
    level: str = ""  # Basic / Conversational / Fluent / Native


class Resume(BaseModel):
    """Represents a resume document in Firestore."""

    id: str = ""
    studentUid: str = ""
    summary: str = ""  # Professional summary
    university: str = ""
    major: str = ""
    grade: str = ""
    skills: List[str] = Field(default_factory=list)
    availableHours: str = ""  # e.g. "20 hours/week", "Weekends only"
    experience: str = ""  # Free-text description of previous experience
    experiences: List[ExperienceEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    languages: List[LanguageEntry] = Field(default_factory=list)
    certificates: List[str] = Field(default_factory=list)  # Storage URLs
    resumeFile: str = ""  # Uploaded resume file (PDF/image) storage URL
    resumeFileName: str = ""  # Original file name for display
    isDefault: bool = False
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class ResumeCreateRequest(BaseModel):
    """Payload for creating a new resume."""

    summary: str = ""
    university: str = ""
    major: str = ""
    grade: str = ""
    skills: List[str] = Field(default_factory=list)
    availableHours: str = ""
    experience: str = ""
    experiences: List[ExperienceEntry] = Field(default_factory=list)
    projects: List[ProjectEntry] = Field(default_factory=list)
    languages: List[LanguageEntry] = Field(default_factory=list)


class ResumeUpdateRequest(BaseModel):
    """Payload for updating an existing resume."""

    summary: Optional[str] = None
    university: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    skills: Optional[List[str]] = None
    availableHours: Optional[str] = None
    experience: Optional[str] = None
    experiences: Optional[List[ExperienceEntry]] = None
    projects: Optional[List[ProjectEntry]] = None
    languages: Optional[List[LanguageEntry]] = None


class ResumeResponse(BaseModel):
    """Resume data returned in API responses."""

    id: str
    studentUid: str
    summary: str
    university: str
    major: str
    grade: str
    skills: List[str]
    availableHours: str
    experience: str
    experiences: List[ExperienceEntry]
    projects: List[ProjectEntry]
    languages: List[LanguageEntry]
    certificates: List[str]
    resumeFile: str
    resumeFileName: str
    isDefault: bool
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
