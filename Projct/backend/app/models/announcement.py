"""
Pydantic models for the Announcements collection.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class AnnouncementType(str, Enum):
    """Valid announcement/content types."""

    ANNOUNCEMENT = "announcement"
    ARTICLE = "article"


class Announcement(BaseModel):
    """Represents an announcement/article document in Firestore."""

    id: str = ""
    title: str = ""
    content: str = ""
    type: AnnouncementType = AnnouncementType.ANNOUNCEMENT
    bannerImage: Optional[str] = None  # Storage URL
    isActive: bool = True
    priority: int = 0  # For ordering; higher = more prominent
    createdAt: Optional[datetime] = None
    createdBy: Optional[str] = None  # Admin uid
    updatedAt: Optional[datetime] = None


class AnnouncementCreateRequest(BaseModel):
    """Payload for creating an announcement or article."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str
    type: AnnouncementType = AnnouncementType.ANNOUNCEMENT
    isActive: bool = True
    priority: int = 0


class AnnouncementUpdateRequest(BaseModel):
    """Payload for updating an announcement or article."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    type: Optional[AnnouncementType] = None
    isActive: Optional[bool] = None
    priority: Optional[int] = None


class AnnouncementResponse(BaseModel):
    """Announcement data returned in API responses."""

    id: str
    title: str
    content: str
    type: AnnouncementType
    bannerImage: Optional[str]
    isActive: bool
    priority: int
    createdAt: Optional[datetime] = None
