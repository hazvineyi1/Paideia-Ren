# Paideia-Ren Teaching Companion

Marketing site (`paideia-ren`), teacher app (`paideia-app`), and shared API
(`api-server`) for an African-curriculum-first lesson planning, worksheet,
quiz, and parent-update copilot for teachers.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/paideia-app run dev` — teacher web app
- `pnpm --filter @workspace/paideia-ren run dev` — marketing site
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `OPENAI_API_KEY`, `ADMIN_EMAILS`
  (comma-separated founder emails — these accounts get the `/admin` portal
  and bypass the free-tier generation quota)
- Stripe is wired via the Replit Stripe connector (no env keys needed in
  dev). To seed the Unlimited subscription product in Stripe, run:
  `pnpm --filter @workspace/scripts exec tsx src/seed-products.ts`
  Webhooks are auto-registered on api-server startup via
  `stripe-replit-sync`. When publishing, paste the live Stripe keys
  (`pk_live_…`, `sk_live_…`) in the Publish pane.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontends: React + Vite + wouter + Tailwind + shadcn/ui
- API: Express 5; DB: PostgreSQL + Drizzle ORM
- Auth: session cookie + bcrypt password
- Brand: Indigo `#1F2A5C`, Gold `#C9971C`, Terracotta `#C2562C`,
  Cormorant Garamond + Inter, English-only, no em dashes

## Where things live

- DB schema: `lib/db/src/schema/copilot.ts`
- API routes: `artifacts/api-server/src/routes/copilot/*`
- Teacher app: `artifacts/paideia-app/src/`
- Marketing site: `artifacts/paideia-ren/src/`

## Architecture decisions

- Founder-approval signup gate. New teachers land in `status='pending'`
  and see an Awaiting Approval screen; founder approves/suspends in
  `/admin`. No outbound email — all founder ↔ teacher comms happen
  inside the founder admin portal.
- Share-a-resource is by email. Recipients claim a copy from
  `/shared`, which duplicates the resource into their library.
- Free tier is 4 AI generations per calendar month, combined across
  lesson plans, worksheets, quizzes, and parent updates. Subscribed
  teachers and admin emails get unlimited. Counted server-side in
  `middlewares/quota.ts`; over-limit POSTs return HTTP 402 and the
  frontend auto-redirects to `/app/upgrade`. The quota check is
  read-then-act, so a determined teacher could squeeze one extra
  generation with simultaneous double-submits; acceptable bound.
- Subscription state lives on `copilot_teachers.subscription_status`
  and `subscription_current_period_end`, kept in sync by the Stripe
  webhook + `lib/stripeSync.ts`, which mirrors `stripe.subscriptions`
  back onto the teacher row.
- Class profiles auto-fill subject/year/notes into all four "New X" forms.
- Per-IP in-memory rate limiting on signup, login, password reset, and
  pilot submission (see `middlewares/rateLimit.ts`).

## Product

- Teachers: lesson plans, worksheets, quizzes (with class assignment),
  parent-update drafts, class profiles, library, shared inbox,
  onboarding wizard, founder-issued password reset.
- Founder admin (`/admin`): weekly digest, pending teacher queue with
  approve/suspend/reset-link, pilot inbox with unread badge, events.
- Marketing site: home, For Schools (with FAQ), pilot form
  with success screen, Privacy and Terms pages.

## Deployment

Deploy via Replit's Publish flow. Each artifact in `artifacts/*` is its
own deployable web service:

1. From the workspace, open the deployment skill / Publish panel and
   choose **Autoscale** (stateless HTTP) for `api-server`,
   `paideia-app`, and `paideia-ren`. Use **Reserved VM** only if you
   need a persistent process.
2. Set the same `DATABASE_URL`, `OPENAI_API_KEY`, and `ADMIN_EMAILS`
   secrets on every deployed artifact.
3. Run `pnpm --filter @workspace/db run push` once against the
   production database before first launch.
4. Wire DNS: in your registrar, point your apex domain (e.g.
   `paideia-ren.com`) at the marketing site deployment, and a
   subdomain (e.g. `app.paideia-ren.com`) at the teacher app
   deployment. Replit's Custom Domains panel will show you the exact
   A / TXT records to add and will provision TLS automatically.
5. After DNS propagates, set `VITE_API_BASE_URL` on the two frontend
   deployments to the API's public origin (e.g.
   `https://api.paideia-ren.com`).
6. Add your founder email(s) to `ADMIN_EMAILS` on the API deployment
   before founders sign up. Accounts whose email is in `ADMIN_EMAILS`
   skip the pending-approval queue and are activated automatically on
   signup, and `/admin` is granted to them on every login.

## User preferences

- No em dashes anywhere in user-facing copy.
- No outbound email — keep all messaging inside the founder admin
  portal.
- Brand colours and font pair (Cormorant Garamond + Inter) are
  authoritative; don't substitute without asking.

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after editing
  `lib/db/src/schema/*` or the API will fail at runtime.
- After changing shared schema or types, the api-server and
  paideia-app may both need a typecheck; run `pnpm run typecheck`.
- Parent drafts have no `title` or `subject` column; the library
  derives a synthetic title from `studentName`.
- Rate limiter is in-memory only — fine for a single-node deployment;
  swap for Redis if you scale horizontally.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript
  setup, and package details.
- See the `deployment` skill for production debugging.
