---
name: Study (Coach) WhatsApp notifications
description: Outbound WhatsApp notification design for paideia-study — dedupe/retry semantics and the "connect later" degradation contract.
---

# Coach WhatsApp notifications (Phase 1, outbound utility)

Channel is Twilio WhatsApp over plain REST (fetch, no SDK). Credentials come from env
vars `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`. The user chose
Twilio and deferred connecting ("connect later"), so the system must run before creds exist.

## Degradation contract (non-negotiable)
When env vars are absent, `isWhatsAppConfigured()` is false and sends are skipped
**explicitly** (run summary counts `skipped`), never silently dropped or faked.

## Dedupe + retry: claim-then-release
Idempotency uses a unique `dedupe_key` on the notifications table. The trap (caught in
review) is that burning the key on *unsent* outcomes permanently suppresses retries —
which would lose every pending message once Twilio is finally connected.

**Rule:** only a successful send keeps the dedupe key. Every non-sent outcome releases it.
- claim: insert `queued` row with `dedupeKey` via `onConflictDoNothing` (atomic across concurrent runs; an existing row means a real duplicate).
- not_configured: **delete** the claim row (no key held, no log noise on repeated batches).
- failed: keep the row for audit but set `dedupeKey = null` (frees the unique slot; Postgres allows many NULLs) so a later run retries.
- sent: keep row + key permanently.

**Why:** "connect later" + transient Twilio failures must both be retryable on the next
run without ever double-sending. Retries are automatic on the next batch run; no separate
retry endpoint needed.

## Triggers are pull-based (no scheduler yet)
Audience runners (renewal reminders / brief-ready / review nudges) are fired by
`POST /api/study/admin/notifications/run {kind}` (admin-gated), guarded by an in-process
"run in progress" flag. A real scheduler (e.g. a scheduled deployment hitting this
endpoint) is the intended Phase-1.5 follow-up. Renewal audience = manual-renew (non
auto-renew) paid + active users with period end inside the window; review nudge audience =
users with flashcards whose `nextReviewAt <= now` (reuses the existing SM-2 schedule).

## Copy
No em dashes in any user-facing message (standing user preference). Links built from
`STUDY_APP_URL` or `REPLIT_DEV_DOMAIN` + `/study`.
