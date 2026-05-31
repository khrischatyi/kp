# Contact & Career Email Notifications — Design

**Date:** 2026-05-30
**Author:** alex.k@finturf.com
**Status:** Approved (pending implementation plan)

## Problem

Both the **Contact** and **Careers** forms on the SCI Seattle Cabinets &
Interiors site POST to `POST /api/v1/contact` and persist a `ContactSubmission`
row in Postgres. Today nothing else happens — the admin has to log into the
database (or the planned admin UI) to see new leads. We need an email
notification to `khrischatyy@gmail.com` on every submission so leads are
actioned in real time.

## Goals

- Email the admin on every contact and career submission.
- Do not block the HTTP response on SMTP latency.
- Do not lose submissions if email sending fails.
- Reuse the existing `POST /api/v1/contact` endpoint (Careers already posts
  there with `source="career"`).
- Keep the implementation minimal — no new dependencies, no queue, no retry
  logic.

## Non-Goals

- No auto-reply / confirmation email to the submitter (the page already shows
  an in-UI thank-you).
- No HTML email — plain text only.
- No retry queue or background worker beyond FastAPI's built-in
  `BackgroundTasks` (the DB row is the durable record).
- No admin UI changes.

## Approach

Add a small email service to the FastAPI backend, invoked from the existing
`submit_contact` route via FastAPI's `BackgroundTasks`. Send is best-effort:
exceptions are logged, never raised. Uses Python stdlib (`smtplib` +
`email.mime.text`) — no new dependencies.

```
POST /api/v1/contact
  ├─ validate + insert ContactSubmission       (existing)
  ├─ db.commit()                               (existing)
  ├─ background_tasks.add_task(send_admin_notification, submission_snapshot)
  └─ return ContactResponse                    (existing)

send_admin_notification(submission_snapshot):
  ├─ if not settings.smtp_enabled: log.debug + return
  ├─ build MIME message (subject + body depend on source)
  ├─ smtplib.SMTP(host, port) + starttls() + login() + send_message()
  └─ on exception: log.error, do not raise
```

The submission passed to the background task is a **plain dict snapshot**
taken before the function returns, not the SQLAlchemy ORM object — the DB
session is closed by the time the background task runs.

## Architecture

### New file: `backend/app/services/email.py`

Two functions, ~60 lines total:

```python
def _build_message(submission: dict) -> EmailMessage:
    """Compose subject + body + headers from a submission snapshot."""

def send_admin_notification(submission: dict) -> None:
    """Best-effort send; catches and logs all exceptions."""
```

`_build_message` is pure (no I/O) so it's easy to unit-test.
`send_admin_notification` is the I/O wrapper.

### Changed file: `backend/app/core/config.py`

Add to `Settings`:

```python
smtp_enabled: bool = False
smtp_host: str = "smtp.office365.com"
smtp_port: int = 587
smtp_username: str = ""
smtp_password: str = ""
smtp_from: str = ""        # display + envelope from
admin_email: str = ""      # destination
```

Defaults make the feature inert until configured, so dev environments without
SMTP creds keep working.

### Changed file: `backend/app/api/v1/routes/contact.py`

```python
from fastapi import BackgroundTasks
from app.services.email import send_admin_notification

@router.post(...)
def submit_contact(
    payload: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ContactResponse:
    submission = ContactSubmission(...)
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

### Changed file: `.env.example`

New section appended:

```
# -- Email (SMTP via GoDaddy / Microsoft 365) ------------------------------- #
SMTP_ENABLED=false
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=support@yourdomain.com
SMTP_PASSWORD=
SMTP_FROM=support@yourdomain.com
ADMIN_EMAIL=khrischatyy@gmail.com
```

The real `SMTP_PASSWORD` is set in `.env` on the production VPS only — never
committed to git.

## Email Content

### Subject

- `source == "career"` → `[SCI] New career application from {name}`
- otherwise            → `[SCI] New contact inquiry from {name}`

### Body (plain text)

```
A new {contact inquiry|career application} was submitted.

Name:    {name}
Email:   {email}
Phone:   {phone or "—"}
Source:  {source}
Sent at: {created_at ISO 8601}

Message:
{message}

—
Submission ID: #{id}
```

### Headers

| Header     | Value                                                |
|------------|------------------------------------------------------|
| `From`     | `SCI Seattle Cabinets <{SMTP_FROM}>`                 |
| `To`       | `{ADMIN_EMAIL}`                                      |
| `Reply-To` | `{submitter email}` — replying in Gmail goes to them |
| `Subject`  | as above                                             |

## Configuration

### `.env` on the VPS (production)

```
SMTP_ENABLED=true
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=support@calculateremodel.com
SMTP_PASSWORD=<the mailbox password — set on the server, never in git>
SMTP_FROM=support@calculateremodel.com
ADMIN_EMAIL=khrischatyy@gmail.com
```

### Microsoft 365 mailbox prerequisite

Microsoft disabled **SMTP AUTH (Authenticated SMTP)** by default for new
tenants. If the first deploy fails with `SmtpAuthDisabled` or similar, enable
it for the mailbox in the M365 admin center:

1. M365 admin → **Users** → **Active users** → click `support@calculateremodel.com`.
2. **Mail** tab → **Manage email apps** → tick **Authenticated SMTP** → Save.

(Alternatively the tenant-wide default can be flipped via
`Set-TransportConfig -SmtpClientAuthenticationDisabled $false`, but per-mailbox
is safer.)

## Failure Handling

| Scenario                              | Behavior                                                    |
|---------------------------------------|-------------------------------------------------------------|
| SMTP connection refused / timeout     | Caught in background task → `log.error` → form still 201    |
| Auth rejected (bad password / no SMTP AUTH) | Same as above                                         |
| `SMTP_ENABLED=false`                  | No-op, `log.debug("email disabled")`                        |
| `ADMIN_EMAIL` empty                   | Skip send + `log.warning("admin_email not configured")`     |
| DB insert fails                       | Existing behavior — request fails before the email is scheduled |

The Postgres row is the durable record. If an email is silently lost, the
admin UI / DB still has the lead.

## Testing

One unit test file: **`backend/app/services/test_email.py`**

- `test_build_message_contact` — submission with `source="contact"`; assert
  Subject, `From`, `To`, `Reply-To`, body contains all fields.
- `test_build_message_career` — submission with `source="career"`; assert
  subject reflects "career application".
- `test_build_message_no_phone` — `phone=None` renders as `—`.

No live-SMTP test. Manual smoke test on the VPS after deploy: submit each form
and confirm the email arrives at `khrischatyy@gmail.com`.

## Rollout

1. Merge the implementation.
2. On the VPS, edit `.env`: set all `SMTP_*` and `ADMIN_EMAIL` values; set
   `SMTP_ENABLED=true`.
3. `docker compose -f docker-compose.prod.yml up -d --build backend` to pick
   up new env vars and code.
4. Submit a test message through both `/contacts` and `/careers`. Confirm
   delivery to `khrischatyy@gmail.com` and that `Reply-To` works.
5. If sending fails, check `docker compose logs backend` — most likely cause
   is SMTP AUTH disabled (see the M365 prerequisite section).

## Open Questions

None — design approved 2026-05-30.

## Out of Scope / Future Work

- Submitter auto-reply ("Thank you, we received your message").
- Admin UI to view submissions (already planned elsewhere — see `routes/admin.py`).
- Retry queue or dead-letter handling for failed sends.
- HTML email template.
- Per-source routing (e.g., career applications to a different recipient).