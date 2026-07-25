"""
Notification endpoints: fetching, marking read, and deleting notifications.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_notifications():
    """Get all notifications for the current user."""
    return {"message": "Not implemented yet"}


@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """Mark a single notification as read."""
    return {"message": "Not implemented yet"}


@router.post("/mark-all-read")
async def mark_all_as_read():
    """Mark all notifications as read for the current user."""
    return {"message": "Not implemented yet"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a notification."""
    return {"message": "Not implemented yet"}
