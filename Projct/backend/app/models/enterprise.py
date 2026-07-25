"""
Pydantic models for the Enterprises collection.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, HttpUrl


class Enterprise(BaseModel):
    """Represents an enterprise document in Firestore."""

    uid: str
    companyName: str = ""
    businessLicense: Optional[str] = None  # Storage URL
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


class EnterpriseRegistrationRequest(BaseModel):
    """Payload for registering a new enterprise."""

    companyName: str
    contactPerson: str
    contactPhone: str
    address: str
    description: str = ""
    website: str = ""


class EnterpriseUpdateRequest(BaseModel):
    """Payload for updating an enterprise profile."""

    companyName: Optional[str] = None
    description: Optional[str] = None
    contactPerson: Optional[str] = None
    contactPhone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


class EnterpriseResponse(BaseModel):
    """Enterprise data returned in API responses."""

    uid: str
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
