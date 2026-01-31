"""Health check endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    """Shallow health check endpoint (liveness probe).

    Returns server health status. No authentication required.
    Does not verify external dependencies.

    Returns:
        dict: {"status": "ok"}
    """
    return {"status": "ok"}


@router.get("/health/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> dict:
    """Deep health check endpoint (readiness probe).

    Verifies database connectivity. No authentication required.
    Use this for load balancer health checks.

    Returns:
        dict: {"status": "ok", "database": "connected"}

    Raises:
        HTTPException: 503 if database is unreachable
    """
    try:
        # Verify database connectivity with a simple query
        await db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected",
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e),
        }
