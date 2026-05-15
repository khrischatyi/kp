"""Aggregates v1 route modules into a single APIRouter."""
from fastapi import APIRouter

from app.api.v1.routes import contact, gallery, health

api_router = APIRouter(prefix="/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(gallery.router, prefix="/gallery", tags=["gallery"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
