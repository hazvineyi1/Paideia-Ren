---
name: Host-based domain routing
description: How to route a second custom domain to a specific app in this single-deployment, path-routed monorepo.
---

# Host-based domain routing (e.g. synopscoach.com -> Coach)

This monorepo ships as ONE Replit deployment. `.replit` has `router = "application"`
and each artifact's `.replit-artifact/artifact.toml` declares `router = "path"` with
`paths` (marketing/`paideia-ren` build is served at `/` by `api-server`; Coach
`paideia-study` at `/study/`; Teacher `paideia-app` at `/app/`; `api-server` owns
`/` and `/api`). Each web app is built with a Vite `base` equal to its path
(`BASE_PATH` in artifact.toml), so its assets and wouter router are rooted there.

**Constraint:** the application router routes ONLY by path, not by host. All custom
domains hit the same deployment. So per-domain behavior cannot be expressed in
artifact.toml — it must live in the one server that owns `/`, which is `api-server`
(`artifacts/api-server/src/app.ts`).

**Approach that works:** in `app.ts`, before the static/catch-all marketing serving,
inspect the request host (read `x-forwarded-host` then `host`, lowercase, strip port)
and, for a recognized host, **302-redirect into the target app's path prefix**
(`/study/...`) rather than serving that app's `index.html` at root.

**Why redirect, not serve-at-root:** the Coach is built with base `/study/`, so its
HTML references `/study/assets/...` and its SPA router base is `/study/`. Serving that
HTML at `/` breaks both. Redirecting to `/study/` lets the normal path router serve it
correctly. Visible URL becomes `synopscoach.com/study/...` (acceptable; marketing is
never shown there). Clean root URLs would require a second build at base `/`.

**Guard precisely** or you leak marketing on the custom domain: pass through only
`p === "/api" || p.startsWith("/api/")` and `p.startsWith("/study/")` (trailing slash —
`/studyfoo` must NOT count as a coach route), canonicalize bare `/` and `/study` to
`/study/`, redirect everything else. Domain list is `COACH_HOSTS` env (comma-separated),
defaulting to `synopscoach.com,www.synopscoach.com`.

**User-side:** attaching the domain (DNS + TLS) is done in Replit Publish -> Custom
Domains; the agent cannot do DNS.
