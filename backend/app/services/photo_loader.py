"""Loads project + photo metadata from the on-disk `/photos` directory.

The on-disk structure is the source of truth. Folders are project galleries;
the leading number on the folder name is the ordering hint and the rest is the
display name. Loose images at the root become single-photo "projects".
"""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger(__name__)

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}
ORDER_PATTERN = re.compile(r"^(\d+(?:\.\d+)?)\s+(.*)$")


def _slugify(value: str) -> str:
    value = re.sub(r"[^\w\s-]", "", value, flags=re.UNICODE).strip().lower()
    return re.sub(r"[-\s]+", "-", value) or "untitled"


def _parse_folder_name(folder: str) -> tuple[float, str]:
    """Folder like '12 madison inset' → (12.0, 'Madison Inset')."""
    m = ORDER_PATTERN.match(folder)
    if m:
        return float(m.group(1)), _title(m.group(2))
    return 9999.0, _title(folder)


def _title(value: str) -> str:
    # Preserve already-cased words but capitalize each word lightly
    words = value.replace("_", " ").split()
    out = []
    for w in words:
        if w.isupper() and len(w) > 1:
            out.append(w.title())
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def _natural_key(name: str) -> list[object]:
    """Sort filenames so smith2 < smith10."""
    return [int(part) if part.isdigit() else part.lower()
            for part in re.split(r"(\d+)", name)]


@dataclass
class PhotoEntry:
    filename: str
    relative_path: str
    order: int = 0


@dataclass
class ProjectEntry:
    slug: str
    name: str
    folder: str
    order: float
    photos: list[PhotoEntry] = field(default_factory=list)

    @property
    def cover(self) -> str | None:
        return self.photos[0].relative_path if self.photos else None


class PhotoLoader:
    """Walks the photos directory and produces ordered project entries."""

    def __init__(self, root: Path) -> None:
        self.root = root

    def load(self) -> list[ProjectEntry]:
        if not self.root.exists():
            logger.warning("photos directory does not exist: %s", self.root)
            return []

        projects: list[ProjectEntry] = []
        loose: list[Path] = []

        for entry in sorted(self.root.iterdir(), key=lambda p: _natural_key(p.name)):
            if entry.is_dir():
                project = self._load_project(entry)
                if project:
                    projects.append(project)
            elif entry.is_file() and entry.suffix.lower() in IMAGE_EXTS:
                loose.append(entry)

        # Pack loose images into one "Featured" collection so they aren't lost
        if loose:
            photos = [
                PhotoEntry(
                    filename=p.name,
                    relative_path=p.name,
                    order=idx,
                )
                for idx, p in enumerate(sorted(loose, key=lambda p: _natural_key(p.name)))
            ]
            projects.append(
                ProjectEntry(
                    slug="featured-pieces",
                    name="Featured Pieces",
                    folder=".",
                    order=10_000,
                    photos=photos,
                )
            )

        # Final stable ordering by parsed folder number, then name
        projects.sort(key=lambda p: (p.order, p.name.lower()))
        return projects

    # -------------------------------------------------------------- helpers
    def _load_project(self, folder: Path) -> ProjectEntry | None:
        photos = [
            p for p in folder.iterdir()
            if p.is_file() and p.suffix.lower() in IMAGE_EXTS
        ]
        if not photos:
            return None
        photos.sort(key=lambda p: _natural_key(p.name))

        order, display = _parse_folder_name(folder.name)
        slug = _slugify(display)

        return ProjectEntry(
            slug=slug,
            name=display,
            folder=folder.name,
            order=order,
            photos=[
                PhotoEntry(
                    filename=p.name,
                    relative_path=f"{folder.name}/{p.name}",
                    order=idx,
                )
                for idx, p in enumerate(photos)
            ],
        )
