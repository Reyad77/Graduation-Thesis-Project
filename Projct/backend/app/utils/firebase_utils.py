"""
Firestore helper utilities: document helpers, pagination, timestamp management.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TypeVar

from firebase_admin import firestore
from google.cloud.firestore_v1 import DocumentSnapshot

T = TypeVar("T")


def doc_to_dict(doc: DocumentSnapshot) -> Optional[Dict[str, Any]]:
    """Convert a Firestore DocumentSnapshot to a plain dict with its ID."""
    if not doc or not doc.exists:
        return None
    data = doc.to_dict() or {}
    data["id"] = doc.id
    return data


def docs_to_list(docs: List[DocumentSnapshot]) -> List[Dict[str, Any]]:
    """Convert a list of Firestore DocumentSnapshots to a list of dicts."""
    return [item for doc in docs if (item := doc_to_dict(doc)) is not None]


def now_utc() -> datetime:
    """Return the current UTC datetime with timezone awareness."""
    return datetime.now(timezone.utc)


def paginated_query(
    collection_ref: firestore.Query,
    page: int = 1,
    page_size: int = 20,
    order_by: Optional[str] = "createdAt",
    descending: bool = True,
) -> Dict[str, Any]:
    """Run a paginated query against a Firestore collection.

    Args:
        collection_ref: A Firestore query or collection reference.
        page: 1-indexed page number.
        page_size: Number of documents per page.
        order_by: Field to order by.
        descending: Whether to sort descending.

    Returns:
        Dict with keys: items, page, page_size, total (estimated), has_next.
    """
    # Firestore pagination is cursor-based; for simplicity we use limit+offset style
    if order_by:
        direction = (
            firestore.Query.DESCENDING if descending else firestore.Query.ASCENDING
        )
        collection_ref = collection_ref.order_by(order_by, direction=direction)

    # Fetch one extra doc to determine if there is a next page
    docs = collection_ref.limit(page_size + (page - 1) * page_size + 1).stream()
    doc_list = list(docs)

    total_estimate = len(doc_list)
    offset = (page - 1) * page_size
    page_items = doc_list[offset : offset + page_size]

    return {
        "items": docs_to_list(page_items),
        "page": page,
        "page_size": page_size,
        "total": total_estimate,  # rough estimate
        "has_next": offset + page_size < len(doc_list),
    }
