"""FastAPI application entry point."""

import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from src.core.config import get_settings
from src.api.routes import health, tasks, auth

from sqlmodel import SQLModel
from src.models.task import Task  # noqa: F401 — ensure model registers in SQLModel.metadata
from src.models.user import User  # noqa: F401 — ensure users table is created

from src.api.deps import get_engine

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

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://todo-phase2-bd7v.vercel.app"],  # test ke liye
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins_list,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
#     allow_headers=["Authorization", "Content-Type", "Accept"],
# )

@app.on_event("startup")
async def create_tables():
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(auth.router)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid4())[:8]
    start_time = time.time()

    request.state.request_id = request_id
    logger.info(f"[{request_id}] {request.method} {request.url.path} - Started")

    response = await call_next(request)

    response.headers["X-Request-ID"] = request_id
    duration = time.time() - start_time
    logger.info(
        f"[{request_id}] {request.method} {request.url.path} - "
        f"Completed {response.status_code} in {duration:.3f}s"
    )
    return response

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    request_id = getattr(request.state, "request_id", "unknown")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "request_id": request_id},
        headers={"X-Request-ID": request_id},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception(f"[{request_id}] Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error", "request_id": request_id},
        headers={"X-Request-ID": request_id},
    )

@app.get("/")
async def root():
    return {
        "message": "Todo Full-Stack API",
        "docs": "/docs",
        "health": "/api/health",
    }
