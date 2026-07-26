"""
Notification endpoints: fetching, marking read, and deleting.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter()
_ns = NotificationService()


def _serialize(obj):
    if hasattr(obj, "model_dump"): return obj.model_dump(mode="json")
    return obj


@router.get("/")
def get_notifications(user: dict = Depends(get_current_user)):
    """Get all notifications for the current user."""
    uid = user.get("sub", "")
    notifs = _ns.get_user_notifications(uid)
    return {
        "items": [_serialize(n) for n in notifs],
        "unread_count": _ns.get_unread_count(uid),
    }


@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: str, user: dict = Depends(get_current_user)):
    """Mark a single notification as read."""
    ok = _ns.mark_as_read(notification_id)
    if not ok: raise HTTPException(404, "Notification not found.")
    return {"message": "Marked as read."}


@router.post("/mark-all-read")
def mark_all_as_read(user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    uid = user.get("sub", "")
    count = _ns.mark_all_as_read(uid)
    return {"message": f"{count} notifications marked as read."}


@router.delete("/{notification_id}")
def delete_notification(notification_id: str, user: dict = Depends(get_current_user)):
    """Delete a notification."""
    ok = _ns.delete_notification(notification_id)
    if not ok: raise HTTPException(404, "Notification not found.")
    return {"message": "Deleted."}
