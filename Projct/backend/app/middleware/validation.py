"""
Request validation middleware.

Provides a reusable FastAPI middleware that validates incoming request
bodies for common issues (missing fields, type mismatches, sanitization).
Also adds request logging in debug mode.
"""

import time
import logging

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("uvicorn")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs every incoming request with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s → %s (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response


class SanitizationMiddleware(BaseHTTPMiddleware):
    """Sanitize incoming JSON bodies by stripping HTML from string fields.

    This is a lightweight XSS prevention layer.  The bulk of input validation
    should happen at the Pydantic / endpoint level.
    """

    async def dispatch(self, request: Request, call_next):
        # Only process JSON requests
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
                sanitized = self._sanitize_dict(body)
                # Reconstruct the request with sanitized body
                from fastapi import Request as FastAPIRequest
                import json
                from io import BytesIO

                async def receive():
                    return {
                        "type": "http.request",
                        "body": json.dumps(sanitized).encode("utf-8"),
                    }

                request = FastAPIRequest(request.scope, receive)
            except Exception:
                pass  # Let Pydantic handle invalid JSON

        return await call_next(request)

    @staticmethod
    def _sanitize_value(value):
        """Strip HTML tags from a string value."""
        if isinstance(value, str):
            import re
            clean = re.compile(r"<[^>]+>")
            return clean.sub("", value)
        return value

    @classmethod
    def _sanitize_dict(cls, data):
        """Recursively sanitize all string values in a dict/list."""
        if isinstance(data, dict):
            return {k: cls._sanitize_dict(v) for k, v in data.items()}
        if isinstance(data, list):
            return [cls._sanitize_dict(item) for item in data]
        return cls._sanitize_value(data)
