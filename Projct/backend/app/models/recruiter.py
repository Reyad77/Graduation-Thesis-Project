"""
Pydantic models for the Recruiters collection.

Recruiters can be individual users (e.g. a family hiring a private tutor)
or enterprises.  The ``recruiterType`` field distinguishes the two kinds;
business-license details apply to enterprise recruiters only.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class RecruiterType(str, Enum):
    """The two kinds of recruiter account."""

    INDIVIDUAL = "individual"
    ENTERPRISE = "enterprise"


class Recruiter(BaseModel):
    """Represents a recruiter document in Firestore."""

    uid: str
    recruiterType: str = RecruiterType.INDIVIDUAL.value
    companyName: str = ""
    businessLicense: Optional[str] = None  # Storage URL (enterprise recruiters)
    storePhotos: List[str] = []  # Storage URLs
    description: str = ""
    contactPerson: str = ""
    contactPhone: str = ""
    address: str = ""
    website: str = ""
    isApproved: bool = False
    approvedAt: Optional[datetime] = None
    approvedBy: Optional[str] = None  # Admin uid
    isBanned: bool = False
    banReason: str = ""
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class RecruiterRegistrationRequest(BaseModel):
    """Payload for registering a new recruiter profile.

    Individual recruiters only need their contact details; enterprise
    recruiters additionally provide company information.
    """

    recruiterType: str = RecruiterType.INDIVIDUAL.value
    companyName: str = ""
    contactPerson: str = ""
    contactPhone: str = ""
    address: str = ""
    description: str = ""
    website: str = ""


class RecruiterUpdateRequest(BaseModel):
    """Payload for updating a recruiter profile."""

    recruiterType: Optional[str] = None
    companyName: Optional[str] = None
    businessLicense: Optional[str] = None
    description: Optional[str] = None
    contactPerson: Optional[str] = None
    contactPhone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


class RecruiterResponse(BaseModel):
    """Recruiter data returned in API responses."""

    uid: str
    recruiterType: str
    companyName: str
    description: str
    contactPerson: str
    contactPhone: str
    address: str
    website: str
    isApproved: bool
    isBanned: bool
    storePhotos: List[str]
    createdAt: Optional[datetime] = None
