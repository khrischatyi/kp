"""Contact form submission endpoint."""
from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import ContactSubmission
from app.schemas.contact import ContactCreate, ContactResponse
from app.services.email import send_admin_notification

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact inquiry",
)
def submit_contact(
    payload: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ContactResponse:
    submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
        source=payload.source,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    logger.info("contact submission #%d from %s", submission.id, submission.email)

    snapshot = {
        "id": submission.id,
        "name": submission.name,
        "email": submission.email,
        "phone": submission.phone,
        "message": submission.message,
        "source": submission.source,
        "created_at": submission.created_at,
    }
    background_tasks.add_task(send_admin_notification, snapshot)

    return ContactResponse(id=submission.id, created_at=submission.created_at)