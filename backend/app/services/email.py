"""Admin email notifications for contact/career submissions.

Best-effort send via SMTP. Failures are logged, never raised — the
submission is already saved to Postgres before this service is invoked.
"""
from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_message(submission: dict[str, Any], sender: str, recipient: str) -> EmailMessage:
    """Compose the admin notification for a contact/career submission.

    Pure function — no I/O — so it can be unit-tested without SMTP.
    """
    is_career = submission.get("source") == "career"
    kind_label = "career application" if is_career else "contact inquiry"
    subject = f"[SCI] New {kind_label} from {submission['name']}"

    phone = submission.get("phone") or "—"
    created_at = submission["created_at"]
    created_iso = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)

    body = (
        f"A new {kind_label} was submitted.\n"
        f"\n"
        f"Name:    {submission['name']}\n"
        f"Email:   {submission['email']}\n"
        f"Phone:   {phone}\n"
        f"Source:  {submission['source']}\n"
        f"Sent at: {created_iso}\n"
        f"\n"
        f"Message:\n"
        f"{submission['message']}\n"
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient
    msg["Reply-To"] = submission["email"]
    msg.set_content(body)
    return msg


def send_admin_notification(submission: dict[str, Any]) -> None:
    """Send the admin notification. Best-effort — never raises."""
    if not settings.smtp_enabled:
        logger.debug("smtp_enabled=false, skipping admin notification")
        return
    if not settings.admin_email:
        logger.warning("ADMIN_EMAIL not configured, skipping admin notification")
        return
    if not settings.smtp_from or not settings.smtp_username or not settings.smtp_password:
        logger.warning("SMTP credentials incomplete, skipping admin notification")
        return

    sender_display = f"SCI Seattle Cabinets <{settings.smtp_from}>"

    try:
        message = _build_message(
            submission,
            sender=sender_display,
            recipient=settings.admin_email,
        )
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as client:
            client.ehlo()
            client.starttls()
            client.ehlo()
            client.login(settings.smtp_username, settings.smtp_password)
            client.send_message(message)
        logger.info(
            "admin notification sent for submission #%s (source=%s)",
            submission.get("id"),
            submission.get("source"),
        )
    except Exception:  # noqa: BLE001 — best-effort, never propagate
        logger.exception(
            "failed to send admin notification for submission #%s",
            submission.get("id"),
        )