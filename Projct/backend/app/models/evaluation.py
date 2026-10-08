"""
Pydantic models for the Evaluations collection.

Upon completion of part-time work, the two parties evaluate each other:
students evaluate recruiters (job description accuracy, communication,
timely payment) and recruiters evaluate students (work attitude,
punctuality, work quality).
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Evaluation(BaseModel):
    """Represents an evaluation document in Firestore."""

    id: str = ""
    applicationId: str = ""
    jobId: str = ""
    fromUid: str = ""
    fromRole: str = ""  # "student" | "recruiter"
    toUid: str = ""
    toRole: str = ""  # "student" | "recruiter"
    rating: int = Field(..., ge=1, le=5)
    comment: str = ""
    createdAt: Optional[datetime] = None


class EvaluationCreateRequest(BaseModel):
    """Payload for submitting an evaluation."""

    applicationId: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field("", max_length=1000)


class EvaluationResponse(BaseModel):
    """Evaluation data returned in API responses."""

    id: str
    applicationId: str
    jobId: str
    fromUid: str
    fromRole: str
    toUid: str
    toRole: str
    rating: int
    comment: str
    createdAt: Optional[datetime] = None
