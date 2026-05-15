"""Pydantic schemas for the contact form."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class ContactCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=64)
    message: str = Field(min_length=10, max_length=4000)


class ContactResponse(BaseModel):
    id: int
    created_at: datetime
    message: str = "Thank you. We'll be in touch shortly."
