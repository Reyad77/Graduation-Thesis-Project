"""
Firebase Admin SDK initialization.

Provides a lazily-initialized Firebase app instance and utility functions
for Firestore, Auth, and Storage access.
"""

from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore, auth, storage

from app.core.config import settings


@lru_cache()
def get_firebase_app() -> firebase_admin.App:
    """Return a cached, lazily-initialized Firebase Admin SDK app.

    Uses lru_cache so the app is created once per process.
    """
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


def get_db() -> firestore.Client:
    """Return a Firestore client connected to the default project."""
    app = get_firebase_app()
    return firestore.client(app)


def get_auth() -> auth:
    """Return the Firebase Auth client."""
    _ = get_firebase_app()  # ensure initialized
    return auth


def get_bucket():
    """Return the default Firebase Storage bucket."""
    app = get_firebase_app()
    return storage.bucket(app=app)
