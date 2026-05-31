# Contact & Career Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send an admin email notification to `khrischatyy@gmail.com` every time the Contact or Careers form is submitted, without blocking the HTTP response or losing leads on SMTP failure.

**Architecture:** Add a thin `email` service module that's invoked from the existing `POST /api/v1/contact` route via FastAPI `BackgroundTasks`. Compose plain-text MIME messages with stdlib (`smtplib` + `email.message.EmailMessage`). All SMTP exceptions are caught and logged — submissions are saved to Postgres before email is scheduled, so a send failure never loses a lead. Configuration lives in `app/core/config.py` reading from `.env`.

**Tech Stack:** FastAPI 0.115, Pydantic 2 (already in repo), Python stdlib `smtplib`/`email.message`, pytest 8.3. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-05-30-contact-email-notifications-design.md`

**Test runner:** All `pytest` commands assume the backend container is running. Run them inside the container:
`docker compose --env-file .env -f docker-compose.dev.yml exec backend pytest <args>`
Shortcut alias used in this plan: `dcdev exec backend pytest …` — substitute the full command if you don't define the alias.

---

### Task 1: Add SMTP settings to the config layer

**Files:**
- Modify: `backend/app/core/config.py:11-50`

- [ ] **Step 1: Open `backend/app/core/config.py` and add SMTP fields to the `Settings` class**

Insert the new fields **after** the existing `database_url` line and **before** `photos_dir`:

```python
    # -- Email (SMTP) ------------------------------------------------------- #
    smtp_enabled: bool = False
    smtp_host: str = "smtp.office365.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    admin_email: str = ""
```

The defaults make the feature inert until configured (so dev environments without creds keep working).

- [ ] **Step 2: Sanity-check that the module still imports**

Run: `dcdev exec backend python -c "from app.core.config import settings; print(settings.smtp_enabled, settings.smtp_host)"`
Expected output: `False smtp.office365.com`

- [ ] **Step 3: Commit**

```bash
git add backend/app/core/config.py
git commit -m "feat(config): add SMTP settings for admin email notifications"
```

---

### Task 2: Write failing tests for the message builder

**Files:**
- Create: `backend/app/services/test_email.py`

- [ ] **Step 1: Create the test file with three tests for `_build_message`**

Create `backend/app/services/test_email.py`:

```python
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
    assert "I love your cabinets" in body
    assert "Submission ID: #42" in body
    assert "2026-05-30T14:00:00+00:00" in body


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
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `dcdev exec backend pytest app/services/test_email.py -v`
Expected: All 3 tests FAIL with `ModuleNotFoundError: No module named 'app.services.email'` (the `email` module doesn't exist yet).

- [ ] **Step 3: Commit (failing tests first — TDD)**

```bash
git add backend/app/services/test_email.py
git commit -m "test(email): add failing tests for admin notification builder"
```

---

### Task 3: Implement the message builder to make tests pass

**Files:**
- Create: `backend/app/services/email.py`

- [ ] **Step 1: Create `backend/app/services/email.py` with just `_build_message`**

```python
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
        f"\n"
        f"—\n"
        f"Submission ID: #{submission['id']}\n"
    )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = recipient
    msg["Reply-To"] = submission["email"]
    msg.set_content(body)
    return msg
```

- [ ] **Step 2: Run the tests and confirm they pass**

Run: `dcdev exec backend pytest app/services/test_email.py -v`
Expected: 3 passed.

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/email.py
git commit -m "feat(email): build admin notification message"
```

---

### Task 4: Add the SMTP send wrapper

**Files:**
- Modify: `backend/app/services/email.py` (append)

No automated test for the SMTP I/O — it would require network/credentials. The pure builder is already covered. We verify the send path manually after deploy (see Task 7).

- [ ] **Step 1: Append `send_admin_notification` to `backend/app/services/email.py`**

```python
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
```

- [ ] **Step 2: Re-run the test suite to confirm nothing regressed**

Run: `dcdev exec backend pytest app/services/test_email.py -v`
Expected: still 3 passed (the new function isn't covered, but didn't break the builder).

- [ ] **Step 3: Smoke-import the new symbol**

Run: `dcdev exec backend python -c "from app.services.email import send_admin_notification; print(send_admin_notification)"`
Expected: prints the function repr, no exceptions.

- [ ] **Step 4: Commit**

```bash
git add backend/app/services/email.py
git commit -m "feat(email): add SMTP send wrapper with best-effort failure handling"
```

---

### Task 5: Wire the notification into the contact route

**Files:**
- Modify: `backend/app/api/v1/routes/contact.py:1-36` (whole file)

- [ ] **Step 1: Replace the route file with the updated version**

Overwrite `backend/app/api/v1/routes/contact.py` with:

```python
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
```

The `snapshot` dict is built **before** scheduling the task — the ORM object would be detached by the time the background task runs (DB session closes when the request returns).

- [ ] **Step 2: Confirm backend still boots**

If the dev stack is running, the backend auto-reloads. Tail logs to make sure no import error:

Run: `docker compose --env-file .env -f docker-compose.dev.yml logs --tail=50 backend`
Expected: no `ImportError`, no `TypeError`. Last line should show uvicorn ready.

If the stack isn't running, do a one-shot import check:
Run: `dcdev exec backend python -c "from app.api.v1.routes.contact import submit_contact; print('ok')"`
Expected: `ok`.

- [ ] **Step 3: Submit a test request against dev (SMTP disabled by default)**

```bash
curl -i -X POST http://localhost:8080/api/v1/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Plan Test","email":"plan@example.com","message":"hello from the implementation plan","source":"contact"}'
```

Expected:
- HTTP `201 Created`.
- Response JSON contains `id` and `created_at`.
- Backend logs show: `contact submission #N from plan@example.com` AND `smtp_enabled=false, skipping admin notification` (because `SMTP_ENABLED` defaults to `false`).

- [ ] **Step 4: Commit**

```bash
git add backend/app/api/v1/routes/contact.py
git commit -m "feat(contact): schedule admin email after submission via BackgroundTasks"
```

---

### Task 6: Document SMTP env vars in `.env.example`

**Files:**
- Modify: `.env.example` (append new section at end)

- [ ] **Step 1: Append the email section to `.env.example`**

Add to the end of `.env.example`:

```
# -- Email (SMTP via GoDaddy / Microsoft 365) -------------------------------- #
# Set SMTP_ENABLED=true on production. Leave false in dev to avoid sending
# real emails during local testing. The mailbox lives on GoDaddy M365; if
# sending fails with "SmtpClientAuthentication is disabled", enable
# "Authenticated SMTP" for the mailbox in the M365 admin center.
SMTP_ENABLED=false
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=support@yourdomain.com
SMTP_PASSWORD=
SMTP_FROM=support@yourdomain.com
ADMIN_EMAIL=khrischatyy@gmail.com
```

- [ ] **Step 2: Verify `.env.example` is valid (no syntax issues)**

Run: `grep -E '^(SMTP_|ADMIN_)' /Users/tony/www/job/kp/.env.example`
Expected: 7 lines listing all the keys above.

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs(env): document SMTP variables for admin notifications"
```

---

### Task 7: Deploy to the VPS and smoke-test in production

This task is a **manual runbook**, not code. Execute it on the VPS after the previous tasks are merged. Do **not** check in real credentials.

- [ ] **Step 1: SSH to the VPS and pull the latest code**

```bash
ssh <vps-user>@<vps-host>
cd <repo-path>
git pull origin main
```

- [ ] **Step 2: Edit the production `.env` to enable SMTP**

On the VPS, open `.env` and set:

```
SMTP_ENABLED=true
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=support@calculateremodel.com
SMTP_PASSWORD=<paste the real mailbox password here — never commit>
SMTP_FROM=support@calculateremodel.com
ADMIN_EMAIL=khrischatyy@gmail.com
```

- [ ] **Step 3: Rebuild the backend container so it picks up new env vars and code**

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d --build backend
```

Wait until `docker compose -f docker-compose.prod.yml ps` shows `backend` as `Up (healthy)`.

- [ ] **Step 4: Submit a real test submission against production**

From your laptop (replace `<prod-domain>` with the actual domain):

```bash
curl -i -X POST https://<prod-domain>/api/v1/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Prod Smoke Test","email":"<your test inbox>","message":"deploy smoke test from implementation plan","source":"contact"}'
```

Expected:
- HTTP `201 Created`.
- An email arrives at `khrischatyy@gmail.com` within ~30 seconds.
- Subject: `[SCI] New contact inquiry from Prod Smoke Test`.
- Hitting "Reply" in Gmail goes to the test inbox you used.

- [ ] **Step 5: Repeat with `source=career` to verify career path**

```bash
curl -i -X POST https://<prod-domain>/api/v1/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Career Smoke","email":"<your test inbox>","message":"career test","source":"career"}'
```

Expected: email arrives with subject `[SCI] New career application from Career Smoke`.

- [ ] **Step 6: If sending failed — enable SMTP AUTH on the M365 mailbox**

If backend logs show `SMTPAuthenticationError: 535 5.7.139 Authentication unsuccessful, the user credentials were incorrect` **or** `SmtpClientAuthentication is disabled for the tenant`:

1. Sign in to <https://admin.microsoft.com> as a tenant admin.
2. **Users** → **Active users** → click `support@calculateremodel.com`.
3. **Mail** tab → **Manage email apps**.
4. Tick **Authenticated SMTP** → **Save changes**.
5. Wait ~5 minutes for the change to propagate.
6. Retry Step 4.

- [ ] **Step 7: Rotate the password that was shared in chat**

Earlier in design discussion the mailbox password was pasted in chat. Once delivery is confirmed working with the current password, rotate it:

1. M365 admin center → reset password for `support@calculateremodel.com`.
2. Update `SMTP_PASSWORD` in `.env` on the VPS.
3. `docker compose --env-file .env -f docker-compose.prod.yml restart backend`.
4. Re-run Step 4 to confirm the new password works.

---

## Self-Review

**Spec coverage check:**
- ✅ New `app/services/email.py` with `_build_message` + `send_admin_notification` — Tasks 3 & 4.
- ✅ Settings extended in `app/core/config.py` (7 new fields) — Task 1.
- ✅ `app/api/v1/routes/contact.py` uses `BackgroundTasks` — Task 5.
- ✅ `.env.example` documents the new keys — Task 6.
- ✅ Subject differs by `source == "career"` — covered by Task 2 test + Task 3 implementation.
- ✅ Body matches spec format (plain text, ISO timestamp, em-dash for missing phone) — Task 2 tests assert each line.
- ✅ Headers: `From`, `To`, `Reply-To`, `Subject` — Task 2 tests assert all four.
- ✅ Failure handling (best-effort, log not raise) — Task 4 catches `Exception` and uses `logger.exception`.
- ✅ `SMTP_ENABLED=false` no-op — Task 4 early-return + Task 5 Step 3 verifies in dev.
- ✅ `ADMIN_EMAIL` empty no-op — Task 4 early-return.
- ✅ Microsoft 365 SMTP AUTH prerequisite — Task 7 Step 6.
- ✅ Tests: 3 unit tests for the builder — Task 2.
- ✅ Manual smoke test — Task 7 Steps 4 & 5.
- ✅ Password rotation (since it was pasted in chat) — Task 7 Step 7.

**Placeholder scan:** No `TBD`, `TODO`, or "fill in later". Every code step has complete code. Every command is exact except for VPS host/user/domain placeholders in Task 7, which are inherently environment-specific.

**Type / naming consistency:**
- `_build_message(submission, sender, recipient)` signature is identical in Task 2 (tests) and Task 3 (implementation).
- `send_admin_notification(submission)` signature is identical in Task 4 (definition) and Task 5 (call site).
- Settings field names (`smtp_enabled`, `smtp_host`, `smtp_port`, `smtp_username`, `smtp_password`, `smtp_from`, `admin_email`) are identical across Tasks 1, 4, 6.
- Snapshot dict keys (`id`, `name`, `email`, `phone`, `message`, `source`, `created_at`) are identical between Task 5 (creation) and Task 2/3 (consumption).