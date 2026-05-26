"""Admin endpoints — login, contact submissions, about page editing."""
from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AboutContent, ContactSubmission
from app.schemas.admin import (
    AboutOut,
    AboutUpdate,
    ContactOut,
    LoginRequest,
    LoginResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Credentials ──────────────────────────────────────────────────────────────
ADMIN_USERNAME = "vladimir"
ADMIN_PASSWORD_HASH = hashlib.sha256(b"$$$Pro100tak").hexdigest()

# ── Simple token store (in-memory, single-process) ───────────────────────────
_active_tokens: set[str] = set()


def _verify_token(authorization: str = Header(...)) -> str:
    """Dependency that validates the Bearer token."""
    token = authorization.removeprefix("Bearer ").strip()
    if token not in _active_tokens:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return token


# ── Auth ─────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse, summary="Admin login")
def admin_login(payload: LoginRequest):
    pwd_hash = hashlib.sha256(payload.password.encode()).hexdigest()
    if payload.username != ADMIN_USERNAME or pwd_hash != ADMIN_PASSWORD_HASH:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong username or password")
    token = secrets.token_urlsafe(32)
    _active_tokens.add(token)
    logger.info("admin login successful")
    return LoginResponse(token=token)


# ── Contacts ─────────────────────────────────────────────────────────────────
@router.get(
    "/contacts",
    response_model=list[ContactOut],
    summary="List contact submissions, optionally filtered by source",
)
def list_contacts(
    source: str | None = None,
    db: Session = Depends(get_db),
    _token: str = Depends(_verify_token),
):
    q = db.query(ContactSubmission)
    if source:
        q = q.filter(ContactSubmission.source == source)
    rows = q.order_by(ContactSubmission.created_at.desc()).all()
    return rows


# ── About ────────────────────────────────────────────────────────────────────
@router.get("/about", response_model=AboutOut, summary="Get about page content")
def get_about(
    db: Session = Depends(get_db),
    _token: str = Depends(_verify_token),
):
    row = db.query(AboutContent).filter(AboutContent.id == 1).first()
    if not row:
        raise HTTPException(status_code=404, detail="About content not found")
    return row


@router.put("/about", response_model=AboutOut, summary="Update about page content")
def update_about(
    payload: AboutUpdate,
    db: Session = Depends(get_db),
    _token: str = Depends(_verify_token),
):
    row = db.query(AboutContent).filter(AboutContent.id == 1).first()
    if not row:
        row = AboutContent(id=1, title=payload.title, body=payload.body)
        db.add(row)
    else:
        row.title = payload.title
        row.body = payload.body
        row.updated_at = func.now()
    db.commit()
    db.refresh(row)
    logger.info("about content updated")
    return row
