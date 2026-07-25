"""
Pydantic models for the Banners collection.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class Banner(BaseModel):
    """Represents a carousel/promotional banner document in Firestore."""

    id: str = ""
    imageUrl: str = ""  # Storage URL
    link: str = ""  # Where the banner redirects
    title: str = ""
    order: int = 0  # Display order
    isActive: bool = True
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class BannerCreateRequest(BaseModel):
    """Payload for creating a new banner."""

    title: str = Field(..., min_length=1, max_length=100)
    link: str = ""
    order: int = 0
    isActive: bool = True


class BannerUpdateRequest(BaseModel):
    """Payload for updating an existing banner."""

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    link: Optional[str] = None
    order: Optional[int] = None
    isActive: Optional[bool] = None


class BannerResponse(BaseModel):
    """Banner data returned in API responses."""

    id: str
    imageUrl: str
    link: str
    title: str
    order: int
    isActive: bool
    createdAt: Optional[datetime] = None
