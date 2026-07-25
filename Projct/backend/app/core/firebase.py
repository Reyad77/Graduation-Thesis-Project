"""
Firebase Admin SDK initialization.

Tries gRPC first; falls back to REST (HTTPS) transport when HTTP/2 is
blocked by the network.

Provides ``get_db()`` — the single entry point for Firestore access.
"""

from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, auth, storage
from google.oauth2 import service_account as sa

from app.core.config import settings


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


def get_db():
    """Return a Firestore client.

    Tries the native gRPC client first.  If the network blocks HTTP/2
    (common on some ISPs / corporate VPNs), falls back to a REST-based
    client that works over HTTPS.
    """
    try:
        from google.cloud.firestore import Client as GrpcClient
        # Quick connectivity check — will raise if gRPC is blocked
        _grpc_db = GrpcClient(project=settings.FIREBASE_PROJECT_ID)
        list(_grpc_db.collections())
        return _grpc_db
    except Exception:
        pass

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
