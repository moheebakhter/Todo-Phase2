"""FastAPI application entry point."""

import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src.core.config import get_settings
from src.api.routes import health, tasks

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Todo Full-Stack API",
    description="RESTful API for the Todo Full-Stack Web Application. "
    "All /tasks endpoints require JWT authentication via Bearer token.",
    version="1.0.0",
)

# Configure CORS middleware with explicit allowed methods and headers
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    # Explicit methods instead of wildcard for security
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # Explicit headers instead of wildcard for security
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests with timing information and add request ID header."""
    request_id = str(uuid4())[:8]
    start_time = time.time()

    # Store request_id in request state for use in exception handlers
    request.state.request_id = request_id

    # Log request
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} - Started"
    )

    response = await call_next(request)

    # Add request ID to response headers for client-side correlation
    response.headers["X-Request-ID"] = request_id

    # Log response with duration
    duration = time.time() - start_time
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} - "
        f"Completed {response.status_code} in {duration:.3f}s"
    )

    return response


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with consistent format."""
    request_id = getattr(request.state, "request_id", "unknown")
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": errors, "request_id": request_id},
        headers={"X-Request-ID": request_id},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions with consistent format."""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{request_id}] Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "request_id": request_id,
        },
        headers={"X-Request-ID": request_id},
    )


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Todo Full-Stack API",
        "docs": "/docs",
        "health": "/api/health",
    }
