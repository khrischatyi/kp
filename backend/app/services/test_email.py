"""Unit tests for app.services.email._build_message."""
from __future__ import annotations

from datetime import datetime, timezone

from app.services.email import _build_message


def _sample(source: str = "contact", phone: str | None = "+1-555-0100") -> dict:
    return {
        "id": 42,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": phone,
        "message": "I love your cabinets — can we talk?",
        "source": source,
        "created_at": datetime(2026, 5, 30, 14, 0, tzinfo=timezone.utc),
    }


def test_build_message_contact_source():
    msg = _build_message(
        _sample(source="contact"),
        sender="SCI <support@calculateremodel.com>",
        recipient="khrischatyy@gmail.com",
    )
    assert msg["Subject"] == "[SCI] New contact inquiry from Jane Doe"
    assert msg["From"] == "SCI <support@calculateremodel.com>"
    assert msg["To"] == "khrischatyy@gmail.com"
    assert msg["Reply-To"] == "jane@example.com"
    body = msg.get_content()
    assert "Name:    Jane Doe" in body
    assert "Email:   jane@example.com" in body
    assert "Phone:   +1-555-0100" in body
    assert "Source:  contact" in body
    # Sample is 2026-05-30 14:00 UTC → 7:00 AM PT (DST in May)
    assert "Sent at: May 30, 2026 at 7:00 AM PT" in body
    assert "Submission ID" not in body
    assert "I love your cabinets" not in body
    assert "Message:" not in body


def test_build_message_career_source_changes_subject():
    msg = _build_message(
        _sample(source="career"),
        sender="SCI <support@calculateremodel.com>",
        recipient="khrischatyy@gmail.com",
    )
    assert msg["Subject"] == "[SCI] New career application from Jane Doe"
    assert "career application" in msg.get_content()


def test_build_message_missing_phone_renders_em_dash():
    msg = _build_message(
        _sample(phone=None),
        sender="SCI <support@calculateremodel.com>",
        recipient="khrischatyy@gmail.com",
    )
    assert "Phone:   —" in msg.get_content()