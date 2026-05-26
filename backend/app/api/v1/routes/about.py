"""Public about page content endpoint."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AboutContent
from app.schemas.admin import AboutOut

router = APIRouter()


@router.get("", response_model=AboutOut, summary="Get about page content")
def get_about(db: Session = Depends(get_db)):
    row = db.query(AboutContent).filter(AboutContent.id == 1).first()
    if not row:
        raise HTTPException(status_code=404, detail="About content not found")
    return row
