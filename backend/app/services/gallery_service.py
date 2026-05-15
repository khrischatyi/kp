"""Gallery service — resolves the photo loader output into API DTOs."""
from __future__ import annotations

import logging
from functools import lru_cache
from urllib.parse import quote

from app.core.config import settings
from app.schemas.gallery import PhotoOut, ProjectOut
from app.services.photo_loader import PhotoLoader, ProjectEntry

logger = logging.getLogger(__name__)


def _photo_url(relative_path: str) -> str:
    safe = quote(relative_path, safe="/")
    return f"/photos/{safe}"


def _to_project_out(p: ProjectEntry, *, include_photos: bool = True) -> ProjectOut:
    photos = [
        PhotoOut(
            filename=ph.filename,
            url=_photo_url(ph.relative_path),
            order=ph.order,
        )
        for ph in p.photos
    ] if include_photos else []
    return ProjectOut(
        slug=p.slug,
        name=p.name,
        folder=p.folder,
        order=int(p.order) if p.order != int(p.order) else int(p.order),
        photo_count=len(p.photos),
        cover=_photo_url(p.cover) if p.cover else None,
        photos=photos,
    )


@lru_cache(maxsize=1)
def _cached_projects() -> list[ProjectEntry]:
    loader = PhotoLoader(settings.photos_dir)
    projects = loader.load()
    logger.info("Loaded %d projects from %s", len(projects), settings.photos_dir)
    return projects


def get_all_projects() -> list[ProjectOut]:
    return [_to_project_out(p) for p in _cached_projects()]


def get_projects_page(page: int, per_page: int, with_photos: bool = True) -> tuple[list[ProjectOut], int]:
    all_projects = _cached_projects()
    start = (page - 1) * per_page
    end = start + per_page
    slice_ = all_projects[start:end]
    return ([_to_project_out(p, include_photos=with_photos) for p in slice_], len(all_projects))


def get_project_by_slug(slug: str) -> ProjectOut | None:
    for p in _cached_projects():
        if p.slug == slug:
            return _to_project_out(p)
    return None


def invalidate_cache() -> None:
    _cached_projects.cache_clear()
