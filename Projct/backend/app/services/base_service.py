"""
Base repository / service with generic Firestore CRUD operations.

Works with both the native gRPC Firestore client AND the REST fallback
(for networks that block HTTP/2).

Every domain service inherits from this class to get consistent
create, read, update, delete, query, and pagination behaviour.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Type, TypeVar

from app.core.firebase import get_db

# Pydantic model type bound
M = TypeVar("M")

# Direction constants (compatible with both gRPC and REST)
try:
    from google.cloud.firestore_v1 import Query  # noqa: F401
    DESCENDING = 1  # matches gRPC Query.DESCENDING
    ASCENDING = 2   # matches gRPC Query.ASCENDING
except ImportError:
    DESCENDING = 1
    ASCENDING = 1


class BaseService:
    """Generic CRUD service backed by a single Firestore collection.

    Duck-types the underlying client so the same code works with gRPC
    and REST transports.  Pass ``model_cls`` to convert results to
    Pydantic model instances automatically.
    """

    def __init__(
        self,
        collection_name: str,
        model_cls: Optional[Type[M]] = None,
    ) -> None:
        self.collection_name = collection_name
        self.model_cls = model_cls
        self.db = get_db()
        self.collection = self.db.collection(collection_name)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def _doc_to_dict(doc) -> Optional[Dict[str, Any]]:
        """Convert a snapshot to a plain dict, working with gRPC and REST."""
        if not doc or not doc.exists:
            return None
        data = doc.to_dict() or {}
        data["id"] = doc.id
        return data

    def _snap_to_model(self, doc):
        data = self._doc_to_dict(doc)
        if data is None:
            return None
        if self.model_cls:
            return self.model_cls(**data)
        return data

    def _snaps_to_list(self, docs) -> list:
        results = [self._snap_to_model(d) for d in docs]
        return [r for r in results if r is not None]

    # ------------------------------------------------------------------
    # CREATE
    # ------------------------------------------------------------------

    def create(
        self, data: Dict[str, Any], doc_id: Optional[str] = None,
    ) -> str:
        """Create a document. Returns the document ID."""
        now = self._now()
        data.setdefault("createdAt", now)
        data.setdefault("updatedAt", now)

        if doc_id:
            self.collection.document(doc_id).set(data)
            return doc_id
        else:
            result = self.collection.add(data)
            # gRPC returns (timestamp, ref); REST returns (timestamp, ref)
            return result[1].id  # type: ignore[index]

    # ------------------------------------------------------------------
    # READ
    # ------------------------------------------------------------------

    def get_by_id(self, doc_id: str):
        """Return a document by ID (model instance or dict), or None."""
        doc = self.collection.document(doc_id).get()
        return self._snap_to_model(doc)

    def get_dict_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Return a document by ID as a raw dict, or None."""
        doc = self.collection.document(doc_id).get()
        return self._doc_to_dict(doc)

    def exists(self, doc_id: str) -> bool:
        """Return True if the document exists."""
        return self.collection.document(doc_id).get().exists

    def get_all(
        self,
        page: int = 1,
        page_size: int = 20,
        order_by: Optional[str] = "createdAt",
        descending: bool = True,
    ) -> Dict[str, Any]:
        """Paginated list of all documents."""
        query = self.collection
        if order_by:
            direction = DESCENDING if descending else ASCENDING
            query = query.order_by(order_by, direction)

        limit = page_size * page + 1
        doc_list = list(query.limit(limit).stream())
        offset = (page - 1) * page_size
        page_items = doc_list[offset:offset + page_size]

        return {
            "items": self._snaps_to_list(page_items),
            "page": page,
            "page_size": page_size,
            "has_next": offset + page_size < len(doc_list),
        }

    # ------------------------------------------------------------------
    # QUERY
    # ------------------------------------------------------------------

    def where(
        self,
        field: str,
        operator: str,
        value: Any,
        order_by: Optional[str] = None,
        descending: bool = True,
        limit: int = 20,
    ) -> list:
        """Return documents matching a WHERE filter."""
        query = self.collection.where(field, operator, value)
        if order_by:
            direction = DESCENDING if descending else ASCENDING
            query = query.order_by(order_by, direction)

        docs = list(query.limit(limit).stream())
        return self._snaps_to_list(docs)

    def where_many(
        self,
        filters: List[tuple],
        order_by: Optional[str] = None,
        descending: bool = True,
        limit: int = 20,
    ) -> list:
        """Return documents matching multiple AND filters."""
        query = self.collection
        for field, operator, value in filters:
            query = query.where(field, operator, value)
        if order_by:
            direction = DESCENDING if descending else ASCENDING
            query = query.order_by(order_by, direction)

        docs = list(query.limit(limit).stream())
        return self._snaps_to_list(docs)

    # ------------------------------------------------------------------
    # UPDATE
    # ------------------------------------------------------------------

    def update(self, doc_id: str, data: Dict[str, Any]) -> bool:
        """Merge-update a document. Returns True if it existed."""
        ref = self.collection.document(doc_id)
        if not ref.get().exists:
            return False
        data["updatedAt"] = self._now()
        ref.update(data)
        return True

    # ------------------------------------------------------------------
    # DELETE
    # ------------------------------------------------------------------

    def delete(self, doc_id: str) -> bool:
        """Delete a document. Returns True if it existed."""
        ref = self.collection.document(doc_id)
        if not ref.get().exists:
            return False
        ref.delete()
        return True

    def soft_delete(self, doc_id: str) -> bool:
        """Soft-delete by setting isDeleted = True."""
        return self.update(doc_id, {"isDeleted": True})

    # ------------------------------------------------------------------
    # COUNT
    # ------------------------------------------------------------------

    def count(self) -> int:
        """Approximate document count."""
        return len(list(self.collection.limit(1000).stream()))

    # ------------------------------------------------------------------
    # BATCH (gRPC only)
    # ------------------------------------------------------------------

    def batch_write(
        self,
        creates: Optional[List[Dict[str, Any]]] = None,
        updates: Optional[Dict[str, Dict[str, Any]]] = None,
        deletes: Optional[List[str]] = None,
    ) -> None:
        """Batch multiple writes atomically (gRPC only)."""
        try:
            batch = self.db.batch()
            for item in (creates or []):
                ref = self.collection.document()
                batch.set(ref, item)
            for doc_id, fields in (updates or {}).items():
                fields["updatedAt"] = self._now()
                batch.update(self.collection.document(doc_id), fields)
            for doc_id in (deletes or []):
                batch.delete(self.collection.document(doc_id))
            batch.commit()
        except AttributeError:
            # REST fallback: execute sequentially
            for item in (creates or []):
                self.create(item)
            for doc_id, fields in (updates or {}).items():
                self.update(doc_id, fields)
            for doc_id in (deletes or []):
                self.delete(doc_id)

    # ------------------------------------------------------------------
    # TRANSACTION (gRPC only)
    # ------------------------------------------------------------------

    def run_transaction(self, func):
        """Run inside a Firestore transaction. Falls back to direct call."""
        try:
            transaction = self.db.transaction()
            return func(transaction, self.collection)
        except AttributeError:
            return func(None, self.collection)
