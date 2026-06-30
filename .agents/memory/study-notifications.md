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

## One-shot lifecycle welcomes fire from multiple best-effort triggers
Signup does NOT collect a WhatsApp number (it is set later via PATCH /notifications/settings), so a welcome fired only at signup would never be deliverable. Welcomes (`welcome_platform`, `welcome_ambassador`) therefore fire from several points and rely on the per-user dedupe key for exactly-once delivery:
- platform welcome (`welcome_platform:<userId>`): fired at signup AND on opt-in.
- ambassador welcome (`welcome_ambassador:<userId>`): fired on ambassador join AND on opt-in if already enrolled.
**Why:** the first moment a user is actually reachable on WhatsApp is usually opt-in, not signup/join. Because `not_configured`/`not_opted_in`/`no_number` all RELEASE the dedupe key (see claim-then-release above), whichever trigger first finds them reachable + configured is the one that actually sends; the rest are no-ops.
**How to apply:** all welcome calls are best-effort (try/catch) so they never block signup, join, or settings saves. New lifecycle welcome = add a `NotificationKind`, a sender in service.ts with a stable per-user dedupeKey, and fire it from every plausible "first reachable" trigger. `kind` is free text (no DB CHECK), so new kinds need no migration.

## Copy
No em dashes in any user-facing message (standing user preference). Links built from
`STUDY_APP_URL` or `REPLIT_DEV_DOMAIN` + `/study`.
