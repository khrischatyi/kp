"""Healthcheck endpoint."""
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="Service liveness")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "env": settings.app_env,
        "name": settings.app_name,
    }
