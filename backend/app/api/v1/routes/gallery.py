"""Gallery endpoints — metadata for the photo catalogue."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.schemas.gallery import ProjectOut, ProjectsPage
from app.services import gallery_service

router = APIRouter()


@router.get("/projects", response_model=ProjectsPage, summary="Paginated project list")
def list_projects(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    with_photos: bool = Query(True),
) -> ProjectsPage:
    items, total = gallery_service.get_projects_page(page, per_page, with_photos=with_photos)
    has_more = (page * per_page) < total
    return ProjectsPage(
        total=total,
        items=items,
        page=page,
        per_page=per_page,
        has_more=has_more,
    )


@router.get("/projects/all", response_model=list[ProjectOut], summary="Every project")
def all_projects() -> list[ProjectOut]:
    return gallery_service.get_all_projects()


@router.get("/projects/{slug}", response_model=ProjectOut, summary="Project detail by slug")
def project_detail(slug: str) -> ProjectOut:
    project = gallery_service.get_project_by_slug(slug)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{slug}' not found")
    return project


@router.post("/refresh", summary="Refresh photo cache from disk")
def refresh_cache() -> dict[str, str]:
    gallery_service.invalidate_cache()
    return {"status": "refreshed"}
