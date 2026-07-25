"""
FastAPI application entry point.

Creates the FastAPI app, configures CORS middleware, and includes all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.validation import RequestLoggingMiddleware, SanitizationMiddleware

# ── Application factory ────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── CORS middleware ────────────────────────────────────────────────────
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request logging (all environments) ─────────────────────────────────
app.add_middleware(RequestLoggingMiddleware)

# ── XSS sanitization (production recommended) ─────────────────────────
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
