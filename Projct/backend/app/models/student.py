"""
Pydantic models for the Students collection.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class Student(BaseModel):
    """Represents a student document in Firestore."""

    uid: str
    studentId: str = ""
    major: str = ""
    grade: str = ""  # e.g. "Freshman", "Sophomore", "Junior", "Senior"
    year: int = 1  # 1, 2, 3, 4
    idCardPhoto: Optional[str] = None  # Firebase Storage URL
    isVerified: bool = False
    verifiedAt: Optional[datetime] = None
    verifiedBy: Optional[str] = None  # Admin uid
    skills: List[str] = Field(default_factory=list)
    availability: str = ""  # e.g. "Weekends", "Weekday evenings"
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class StudentUpdateRequest(BaseModel):
    """Payload for updating a student's profile."""

    studentId: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    year: Optional[int] = None
    skills: Optional[List[str]] = None
    availability: Optional[str] = None


class StudentResponse(BaseModel):
    """Student data returned in API responses."""

    uid: str
    studentId: str
    major: str
    grade: str
    year: int
    isVerified: bool
    skills: List[str]
    availability: str
    createdAt: Optional[datetime] = None
