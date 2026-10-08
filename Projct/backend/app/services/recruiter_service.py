"""
Recruiter service — registration, profile management, and admin approval.

Recruiters can be individual users or enterprises (``recruiterType``).
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.models.recruiter import (
    Recruiter,
    RecruiterRegistrationRequest,
    RecruiterUpdateRequest,
)
from app.services.base_service import BaseService


class RecruiterService(BaseService):
    """CRUD and business-logic operations for recruiter profiles."""

    def __init__(self) -> None:
        super().__init__("recruiters", Recruiter)

    def get_profile(self, uid: str) -> Optional[Recruiter]:
        """Get a recruiter profile by UID."""
        return self.get_by_id(uid)

    def create_profile(
        self,
        uid: str,
        email: str,
        payload: RecruiterRegistrationRequest,
    ) -> Recruiter:
        """Create a recruiter profile on registration."""
        now = datetime.now(timezone.utc)
        data = {
            "uid": uid,
            "recruiterType": payload.recruiterType,
            "companyName": payload.companyName,
            "businessLicense": None,
            "storePhotos": [],
            "description": payload.description,
            "contactPerson": payload.contactPerson,
            "contactPhone": payload.contactPhone,
            "address": payload.address,
            "website": payload.website or "",
            "isApproved": False,
            "approvedAt": None,
            "approvedBy": None,
            "isBanned": False,
            "banReason": "",
            "createdAt": now,
            "updatedAt": now,
        }
        self.create(data, doc_id=uid)
        return self.get_by_id(uid)  # type: ignore[return-value]

    def update_profile(
        self, uid: str, payload: RecruiterUpdateRequest
    ) -> Optional[Recruiter]:
        """Update a recruiter profile."""
        if not self.exists(uid):
            return None
        update_data = payload.model_dump(exclude_unset=True)
        self.update(uid, update_data)
        return self.get_by_id(uid)  # type: ignore[return-value]

    def upload_business_license(self, uid: str, license_url: str) -> bool:
        """Save the business license URL."""
        return self.update(uid, {"businessLicense": license_url})

    def approve(self, uid: str, admin_uid: str) -> bool:
        """Approve a recruiter (admin action)."""
        now = datetime.now(timezone.utc)
        return self.update(uid, {
            "isApproved": True,
            "approvedAt": now,
            "approvedBy": admin_uid,
        })

    def ban(self, uid: str, reason: str) -> bool:
        """Ban a recruiter (admin action)."""
        return self.update(uid, {"isBanned": True, "banReason": reason})

    def unban(self, uid: str) -> bool:
        """Remove a ban from a recruiter."""
        return self.update(uid, {"isBanned": False, "banReason": ""})

    def get_pending_approvals(self) -> List[Recruiter]:
        """Get all recruiters awaiting admin approval."""
        return self.where("isApproved", "==", False, limit=200)  # type: ignore[return-value]

    def get_all_recruiters(self, page: int = 1, page_size: int = 20) -> Dict:
        """Get a paginated list of all recruiters."""
        return self.get_all(page=page, page_size=page_size)
