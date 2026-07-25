"""
Language detection middleware.

Extracts the user's preferred language from the Accept-Language header
and stores it in request.state for downstream use.
"""

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

SUPPORTED_LANGS = {"en", "zh", "bn", "hi", "ar", "nl", "fr"}
DEFAULT_LANG = "en"


class LanguageMiddleware(BaseHTTPMiddleware):
    """Detect the request language and attach it to request.state.lang."""

    async def dispatch(self, request: Request, call_next):
        lang = DEFAULT_LANG

        # Check Accept-Language header
        accept = request.headers.get("accept-language", "")
        if accept:
            # Parse the first language code (e.g., "bn-BD" → "bn")
            for segment in accept.replace(";", ",").split(","):
                code = segment.strip().split("-")[0].lower()
                if code in SUPPORTED_LANGS:
                    lang = code
                    break

        # Also check X-Lang header (explicit override)
        x_lang = request.headers.get("x-lang", "").lower()
        if x_lang in SUPPORTED_LANGS:
            lang = x_lang

        request.state.lang = lang
        response = await call_next(request)
        response.headers["Content-Language"] = lang
        return response


def get_lang(request: Request) -> str:
    """Convenience: return the detected language for the request."""
    return getattr(request.state, "lang", DEFAULT_LANG)
