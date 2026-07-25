"""
FastAPI application entry point.

Creates the FastAPI app, configures CORS middleware, rate limiting,
and includes all API routers.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.rate_limit import limiter
from app.middleware.validation import RequestLoggingMiddleware, SanitizationMiddleware
from app.i18n.middleware import LanguageMiddleware

# ── Application factory ────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Attach rate limiter to the app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS middleware ────────────────────────────────────────────────────
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Language detection ────────────────────────────────────────────────
app.add_middleware(LanguageMiddleware)

# ── Request logging (all environments) ─────────────────────────────────
app.add_middleware(RequestLoggingMiddleware)

# ── XSS sanitization (production only) ─────────────────────────────────
if not settings.DEBUG:
    app.add_middleware(SanitizationMiddleware)

# ── Include routers ────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# ── Health check ───────────────────────────────────────────────────────
@app.get("/")
async def root():
    """Root health-check endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
