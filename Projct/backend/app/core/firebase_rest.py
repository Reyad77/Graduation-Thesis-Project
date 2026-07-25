"""
REST-based Firestore client that works over HTTPS (no gRPC required).

Use this when gRPC / HTTP/2 is blocked by your network.  Provides the same
interface that ``BaseService`` and all domain services rely on:
    db.collection(name).document(id).get() / .set(data) / .update(data) / .delete()
    db.collection(name).add(data)
    db.collection(name).where(filter).order_by(field).limit(n).stream()
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Iterator

import requests
from google.oauth2 import service_account as sa
from google.auth.transport.requests import Request as AuthRequest


# Firestore REST API base URL
REST_BASE = "https://firestore.googleapis.com/v1"


# ---------------------------------------------------------------------------
# Minimal re-implementation of the gRPC Document / Collection API via REST
# ---------------------------------------------------------------------------

class _RestDocSnapshot:
    """Mimics ``google.cloud.firestore_v1.DocumentSnapshot``."""

    def __init__(self, reference: "_RestDocRef", data: Optional[Dict]) -> None:
        self.reference = reference
        self._data = data
        self.id = reference._doc_id
        self.exists = data is not None

    def to_dict(self) -> Optional[Dict]:
        """Return stored fields, converting Firestore REST value types to plain Python."""
        if not self._data:
            return None
        return _fields_to_python(self._data.get("fields", {}))

    def get(self, key: str):
        """Mimics dict-like .get() on snapshots (used by `doc_to_dict`)."""
        d = self.to_dict()
        return d.get(key) if d else None


class _RestDocRef:
    """Mimics ``google.cloud.firestore_v1.DocumentReference``."""

    def __init__(self, client: "_RestFirestoreClient", path: str) -> None:
        self._client = client
        self._path = path  # projects/{project}/databases/(default)/documents/{collection}/{docId}
        self.id = path.rsplit("/", 1)[-1]  # public id attribute
        self._doc_id = self.id
        # parent path is everything up to the last segment
        self.parent = path.rsplit("/", 1)[0]

    def get(self) -> _RestDocSnapshot:
        url = f"{REST_BASE}/{self._path}"
        resp = self._client._request("GET", url)
        if resp is not None and "name" in resp:
            return _RestDocSnapshot(self, resp)
        return _RestDocSnapshot(self, None)

    def set(self, data: Dict, merge: bool = False) -> None:
        """Create or overwrite a document.

        Uses POST to the parent collection for new documents (REST API
        requirement), and PATCH for overwriting existing documents.
        """
        body: Dict[str, Any] = {"fields": _python_to_fields(data)}
        exists = self.get().exists

        if not exists:
            # Create via POST: parent = path up to /documents, then collection name
            # self._path = "projects/{p}/databases/(default)/documents/{coll}/{docId}"
            parts = self._path.split("/")
            # parts = ['projects','{p}','databases','(default)','documents','users','seed-student-1']
            collection_id = parts[-2]  # e.g. "users"
            parent_path = "/".join(parts[:-2])  # e.g. "projects/{p}/databases/(default)/documents"
            params = {"documentId": self._doc_id}
            url = f"{REST_BASE}/{parent_path}/{collection_id}"
            self._client._request("POST", url, body=body, params=params)
        else:
            url = f"{REST_BASE}/{self._path}"
            self._client._request("PATCH", url, body=body, params=None)

    def update(self, data: Dict) -> None:
        """Merge-update. Only the fields in ``data`` are written."""
        url = f"{REST_BASE}/{self._path}"
        body: Dict[str, Any] = {"fields": _python_to_fields(data)}
        # Firestore REST API: updateMask.fieldPaths must be repeated per field
        params = [("updateMask.fieldPaths", f) for f in data.keys()]
        self._client._request("PATCH", url, body=body, params=params)

    def delete(self) -> None:
        url = f"{REST_BASE}/{self._path}"
        self._client._request("DELETE", url)


class _RestQuery:
    """Mimics ``google.cloud.firestore_v1.Query`` for filtering + ordering + limiting."""

    def __init__(self, client: "_RestFirestoreClient", collection_path: str) -> None:
        self._client = client
        self._collection_path = collection_path
        self._filters: List[str] = []
        self._order_by: Optional[str] = None
        self._descending: bool = False
        self._limit: Optional[int] = None

    def where(self, field: str, operator: str, value: Any) -> "_RestQuery":
        """Add a filter. Maps Firestore gRPC operators to REST structured query."""
        # Map common operators
        op_map = {
            "==": "EQUAL",
            "!=": "NOT_EQUAL",
            "<": "LESS_THAN",
            "<=": "LESS_THAN_OR_EQUAL",
            ">": "GREATER_THAN",
            ">=": "GREATER_THAN_OR_EQUAL",
            "array_contains": "ARRAY_CONTAINS",
            "in": "IN",
            "array_contains_any": "ARRAY_CONTAINS_ANY",
        }
        rest_op = op_map.get(operator, "EQUAL")

        if isinstance(value, bool):
            rest_value = {"booleanValue": value}
        elif isinstance(value, str):
            rest_value = {"stringValue": value}
        elif isinstance(value, (int, float)):
            rest_value = {"integerValue": str(int(value))} if isinstance(value, int) and not isinstance(value, bool) else {"doubleValue": float(value)}
        elif isinstance(value, list):
            rest_value = {
                "arrayValue": {
                    "values": [_val_to_rest(v) for v in value]
                }
            }
        else:
            rest_value = {"stringValue": str(value)}

        filter_str = (
            f"{field} {rest_op} {json.dumps(rest_value)}"
        )
        self._filters.append(filter_str)
        return self

    def order_by(self, field: str, direction: Any = None) -> "_RestQuery":
        self._order_by = field
        # direction is a Firestore enum; DESCENDING has value 1
        self._descending = getattr(direction, "value", direction) == 1
        return self

    def limit(self, n: int) -> "_RestQuery":
        self._limit = n
        return self

    def stream(self) -> Iterator[_RestDocSnapshot]:
        """Execute the query and yield document snapshots."""
        body: Dict[str, Any] = {
            "structuredQuery": {
                "from": [{"collectionId": self._collection_path.split("/")[-1]}],
            }
        }

        # Filters
        if self._filters:
            # For simplicity, join multiple filters with AND
            filters = []
            for f in self._filters[:1]:  # REST API: one filter at a time for simplicity
                field_str, rest = f.split(" ", 1)
                rest_op, rest_json = rest.split(" ", 1)
                filters.append({
                    "fieldFilter": {
                        "field": {"fieldPath": field_str},
                        "op": rest_op,
                        "value": json.loads(rest_json),
                    }
                })
            if filters:
                body["structuredQuery"]["where"] = (
                    filters[0] if len(filters) == 1
                    else {"compositeFilter": {"op": "AND", "filters": filters}}
                )

        # Order by
        if self._order_by:
            body["structuredQuery"]["orderBy"] = [{
                "field": {"fieldPath": self._order_by},
                "direction": "DESCENDING" if self._descending else "ASCENDING",
            }]

        # Limit
        if self._limit:
            body["structuredQuery"]["limit"] = self._limit

        # runQuery URL: parent must be .../documents, not .../documents/{collection}
        # self._collection_path = "projects/{p}/databases/(default)/documents/{coll}"
        parent_path = "/".join(self._collection_path.split("/")[:-1])
        url = f"{REST_BASE}/{parent_path}:runQuery"
        results = self._client._request("POST", url, body=body)

        if not results:
            return

        # The REST API returns an array of result objects
        if isinstance(results, list):
            for item in results:
                if "document" in item:
                    doc_data = item["document"]
                    doc_id = doc_data["name"].rsplit("/", 1)[-1]
                    doc_path = doc_data["name"].removeprefix(
                        self._client._db_path + "/"
                    )
                    doc_ref = _RestDocRef(self._client, doc_path)
                    yield _RestDocSnapshot(doc_ref, doc_data)
        elif isinstance(results, dict) and "document" in results:
            doc_data = results["document"]
            doc_id = doc_data["name"].rsplit("/", 1)[-1]
            doc_path = doc_data["name"].removeprefix(
                self._client._db_path + "/"
            )
            doc_ref = _RestDocRef(self._client, doc_path)
            yield _RestDocSnapshot(doc_ref, doc_data)

    # Extra helpers for compatibility with BaseService
    def where_single(self, field: str, operator: str, value: Any):
        """Chained .where() — used by ``where_many``."""
        return self.where(field, operator, value)

    # For where_many compatibility
    def where_filter(self, field_filter):
        """Accept a ``FieldFilter`` object from ``google.cloud.firestore``."""
        return self.where(
            field_filter.field_path,
            field_filter.op_string,
            field_filter.value,
        )


class _RestCollectionRef:
    """Mimics ``google.cloud.firestore_v1.CollectionReference``."""

    def __init__(self, client: "_RestFirestoreClient", name: str) -> None:
        self._client = client
        self._name = name  # e.g. "jobs"
        self._path = f"{client._db_path}/{name}"

    def document(self, doc_id: Optional[str] = None) -> _RestDocRef:
        did = doc_id or _auto_id()
        return _RestDocRef(self._client, f"{self._path}/{did}")

    def add(self, data: Dict) -> tuple:
        """Add a document with an auto-generated ID. Returns (timestamp, doc_ref)."""
        doc_id = _auto_id()
        ref = self.document(doc_id)
        ref.set(data)
        # Return (timestamp, ref) like the gRPC client does
        return (datetime.now(timezone.utc), ref)

    def where(self, field: str, operator: str, value: Any) -> _RestQuery:
        q = _RestQuery(self._client, self._path)
        return q.where(field, operator, value)

    def order_by(self, field: str, direction: Any = None) -> _RestQuery:
        q = _RestQuery(self._client, self._path)
        return q.order_by(field, direction)

    def limit(self, n: int) -> _RestQuery:
        q = _RestQuery(self._client, self._path)
        return q.limit(n)


class _RestFirestoreClient:
    """REST-based replacement for ``google.cloud.firestore.Client``.

    Uses the Firestore REST API (v1) with OAuth2 tokens obtained from
    the service account credentials.
    """

    def __init__(self, project_id: str, creds: sa.Credentials) -> None:
        self._project_id = project_id
        self._creds = creds
        self._db_path = f"projects/{project_id}/databases/(default)/documents"
        self._session = requests.Session()
        self._token: Optional[str] = None
        self._token_expiry: float = 0.0

    # -- auth ----------------------------------------------------------

    def _get_token(self) -> str:
        now = datetime.now(timezone.utc).timestamp()
        if self._token and now < self._token_expiry - 60:
            return self._token
        self._creds.refresh(AuthRequest())
        self._token = self._creds.token  # type: ignore[assignment]
        self._token_expiry = now + 3600
        return self._token  # type: ignore[return-value]

    def _request(
        self, method: str, url: str, body: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Optional[Any]:
        """Send an authenticated request to the Firestore REST API."""
        headers = {
            "Authorization": f"Bearer {self._get_token()}",
            "Content-Type": "application/json",
        }
        kwargs: Dict[str, Any] = {"headers": headers, "timeout": 30}
        if body is not None:
            kwargs["json"] = body
        if params:
            kwargs["params"] = params

        resp = self._session.request(method, url, **kwargs)

        if resp.status_code in (200, 201):
            return resp.json() if resp.text else None
        elif resp.status_code == 204:  # No Content (DELETE success)
            return None
        elif resp.status_code == 404:
            return None
        else:
            detail = resp.text[:300] if resp.text else "no body"
            resp.raise_for_status()
            return None

    def collection(self, name: str) -> _RestCollectionRef:
        return _RestCollectionRef(self, name)

    def collections(self) -> list:
        """List root-level collections (for health checks). Hard to do with REST."""
        return []

    def close(self):
        self._session.close()


# ---------------------------------------------------------------------------
# Value conversion helpers (Python <-> Firestore REST)
# ---------------------------------------------------------------------------

def _val_to_rest(value: Any) -> Dict[str, Any]:
    """Convert a Python value to a Firestore REST Value dict."""
    if value is None:
        return {"nullValue": None}
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        return {"integerValue": str(value)}
    if isinstance(value, float):
        return {"doubleValue": value}
    if isinstance(value, str):
        return {"stringValue": value}
    if isinstance(value, dict):
        return {"mapValue": {"fields": _python_to_fields(value)}}
    if isinstance(value, list):
        return {"arrayValue": {"values": [_val_to_rest(v) for v in value]}}
    if isinstance(value, datetime):
        # Format as RFC 3339: "2026-07-25T12:00:00.000000Z"
        ts = value.isoformat()
        # If it already ends with Z, leave it.  If it has +00:00, strip it and add Z.
        if ts.endswith("+00:00"):
            ts = ts[:-6] + "Z"
        elif not ts.endswith("Z"):
            ts += "Z"
        return {"timestampValue": ts}
    return {"stringValue": str(value)}


def _python_to_fields(data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Convert a Python dict to Firestore REST fields format."""
    return {k: _val_to_rest(v) for k, v in data.items()}


def _fields_to_python(fields: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Convert Firestore REST fields to a plain Python dict."""
    result: Dict[str, Any] = {}
    for key, value in fields.items():
        result[key] = _rest_val_to_python(value)
    return result


def _rest_val_to_python(value: Dict[str, Any]) -> Any:
    """Convert a single Firestore REST Value to Python."""
    if "nullValue" in value:
        return None
    if "booleanValue" in value:
        return value["booleanValue"]
    if "integerValue" in value:
        return int(value["integerValue"])
    if "doubleValue" in value:
        return float(value["doubleValue"])
    if "stringValue" in value:
        return value["stringValue"]
    if "timestampValue" in value:
        return value["timestampValue"]
    if "mapValue" in value:
        return _fields_to_python(value["mapValue"].get("fields", {}))
    if "arrayValue" in value:
        return [
            _rest_val_to_python(v)
            for v in value["arrayValue"].get("values", [])
        ]
    return None


def _auto_id() -> str:
    """Generate a Firestore-compatible auto document ID (20 random chars)."""
    import random
    import string
    return "".join(
        random.choices(string.ascii_letters + string.digits, k=20)
    )


# ---------------------------------------------------------------------------
# Factory function — returns either gRPC or REST client
# ---------------------------------------------------------------------------

def get_firestore_client():
    """Return a Firestore client, preferring gRPC with REST fallback."""
    from app.core.config import settings
    from google.oauth2 import service_account as sa

    creds = sa.Credentials.from_service_account_info(
        {
            "type": settings.FIREBASE_TYPE,
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": settings.FIREBASE_AUTH_URI,
            "token_uri": settings.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_CERT_URL,
            "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL,
        },
        scopes=["https://www.googleapis.com/auth/datastore"],
    )

    # Try gRPC first
    try:
        import firebase_admin
        from firebase_admin import firestore
        try:
            app = firebase_admin.get_app()
        except ValueError:
            app = firebase_admin.initialize_app(
                firebase_admin.credentials.Certificate(
                    settings.FIREBASE_PRIVATE_KEY_ID
                )
            )
        db = firestore.client(app)
        # Quick connectivity test
        list(db.collections())
        return db
    except Exception:
        pass

    # Fall back to REST
    return _RestFirestoreClient(settings.FIREBASE_PROJECT_ID, creds)
