# Memory index

- [Host-based domain routing](host-based-domain-routing.md) — single deployment, app router is path-only; route a 2nd domain to an app via a host-check redirect in api-server (owns `/`), not by serving its HTML at root.
- [Study (Coach) billing](study-billing.md) — multi-provider African mobile-money + card billing, 3 tiers (free/plus/pro) + admin coupons: resolve provider by stored row; gate Stripe price to paideia_plan=coach; mock activates lazily on owner poll; enforce coupon cap atomically in the increment WHERE.
- [Study (Coach) WhatsApp notifications](study-notifications.md) — Twilio WhatsApp, "connect later": skip explicitly when unconfigured; only successful sends keep the dedupe key, every non-sent outcome releases it so retries survive deferred config + transient failures; one-shot welcomes fire from multiple best-effort triggers (signup/opt-in/join), idempotent per-user.
- [Study material titles](study-material-titles.md) — titles auto-derive per method (page <title>/topic/filename); paste is the only manual-title path; never share title state across tabs.
