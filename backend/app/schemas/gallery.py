"""Pydantic schemas for gallery endpoints."""
from __future__ import annotations

from pydantic import BaseModel, Field


class PhotoOut(BaseModel):
    id: int | None = None
    filename: str
    url: str = Field(..., description="Public path under /photos")
    width: int | None = None
    height: int | None = None
    order: int = 0


class ProjectOut(BaseModel):
    id: int | None = None
    slug: str
    name: str
    folder: str
    order: int = 0
    photo_count: int
    cover: str | None = None
    photos: list[PhotoOut] = []


class ProjectsPage(BaseModel):
    total: int
    items: list[ProjectOut]
    page: int
    per_page: int
    has_more: bool
