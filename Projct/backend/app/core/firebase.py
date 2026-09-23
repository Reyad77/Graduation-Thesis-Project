"""
Firebase Admin SDK initialization.

Tries gRPC first; falls back to REST (HTTPS) transport when HTTP/2 is
blocked by the network.

Provides ``get_db()`` — the single entry point for Firestore access.
"""

import threading
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, auth, storage
from google.oauth2 import service_account as sa

from app.core.config import settings

# Hard deadline for the gRPC connectivity check (seconds). On networks
# that black-hole HTTP/2 instead of refusing it, the gRPC call can hang
# for a very long time — and this check runs during application import.
GRPC_CHECK_TIMEOUT = 5.0


@lru_cache()
def get_firebase_app() -> firebase_admin.App:
    """Return a cached, lazily-initialized Firebase Admin SDK app."""
    cred = credentials.Certificate({
        "type": settings.FIREBASE_TYPE,
        "project_id": settings.FIREBASE_PROJECT_ID,
        "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
        "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "client_id": settings.FIREBASE_CLIENT_ID,
        "auth_uri": settings.FIREBASE_AUTH_URI,
        "token_uri": settings.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_CERT_URL,
        "client_x509_cert_url": settings.FIREBASE_CLIENT_CERT_URL,
    })

    return firebase_admin.initialize_app(cred, {
        "projectId": settings.FIREBASE_PROJECT_ID,
        "storageBucket": f"{settings.FIREBASE_PROJECT_ID}.appspot.com",
    })


def _grpc_connectivity_ok(timeout: float = GRPC_CHECK_TIMEOUT) -> bool:
    """Return True if the gRPC Firestore client can list collections.

    The check runs in a daemon thread with a hard timeout so that a
    network which black-holes HTTP/2 (instead of refusing it) fails fast
    rather than hanging application startup.
    """
    try:
        from google.cloud.firestore import Client as GrpcClient
        grpc_db = GrpcClient(project=settings.FIREBASE_PROJECT_ID)
    except Exception:
        return False

    result: list = []

    def _check() -> None:
        try:
            list(grpc_db.collections())
            result.append(True)
        except Exception:
            result.append(False)

    check_thread = threading.Thread(target=_check, daemon=True)
    check_thread.start()
    check_thread.join(timeout)
    return bool(result)


@lru_cache()
def get_db():
    """Return a Firestore client (cached for the process lifetime).

    Tries the native gRPC client first.  If the network blocks HTTP/2
    (common on some ISPs / corporate VPNs), falls back to a REST-based
    client that works over HTTPS.

    The gRPC probe runs once per process — every service instantiates
    ``get_db()`` at import time, so probing per call made startup slow
    or seemingly hung when gRPC hangs instead of failing fast.
    """
    if _grpc_connectivity_ok():
        from google.cloud.firestore import Client as GrpcClient
        return GrpcClient(project=settings.FIREBASE_PROJECT_ID)

    # gRPC failed — use REST fallback
    from app.core.firebase_rest import _RestFirestoreClient
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
    return _RestFirestoreClient(settings.FIREBASE_PROJECT_ID, creds)


def get_auth() -> auth:
    """Return the Firebase Auth client."""
    _ = get_firebase_app()  # ensure initialized
    return auth


def get_bucket():
    """Return the default Firebase Storage bucket."""
    app = get_firebase_app()
    return storage.bucket(app=app)
