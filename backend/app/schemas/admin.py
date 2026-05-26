"""Pydantic schemas for admin endpoints."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str


class ContactOut(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    message: str
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AboutOut(BaseModel):
    title: str
    body: str
    updated_at: datetime

    model_config = {"from_attributes": True}


class AboutUpdate(BaseModel):
    title: str
    body: str
