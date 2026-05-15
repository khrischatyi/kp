"""Contact form submission endpoint."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ContactSubmission
from app.schemas.contact import ContactCreate, ContactResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact inquiry",
)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)) -> ContactResponse:
    submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    logger.info("contact submission #%d from %s", submission.id, submission.email)
    return ContactResponse(id=submission.id, created_at=submission.created_at)
