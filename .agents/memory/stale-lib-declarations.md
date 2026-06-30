---
name: Stale lib declarations break consumer typecheck
description: Why adding a DB column compiles in lib/db source but fails typecheck in api-server / web apps until libs are rebuilt.
---

# Stale lib/db declarations break consumer typecheck

After editing a `lib/*` package's source (e.g. adding a column to `lib/db/src/schema/*.ts`),
consumer packages (`artifacts/api-server`, `artifacts/paideia-*`) can fail `tsc --noEmit` with
errors like `Property 'X' does not exist on type` / `Object literal may only specify known
properties` — even though the source clearly has the field.

**Why:** `@workspace/db`'s `package.json` `exports` point at source (`./src/index.ts`), but
consumers resolve it through **TypeScript project references**, which read the package's compiled
`dist/*.d.ts`. Those declarations go stale until rebuilt, so the consumer sees the OLD shape.

**How to apply:** after any change to a shared `lib/*` package's public types, run
`pnpm run typecheck:libs` (root script = `tsc --build`) to regenerate the lib declarations
BEFORE re-typechecking consumers. For DB schema changes also run the column to the database with
`pnpm --filter @workspace/db run push` (drizzle-kit push) — adding a nullable column applies
non-interactively.

Note: web artifacts build with `vite build` (no typecheck), so stale-declaration type errors do
NOT block their dev or production build — but api-server and `pnpm typecheck` will surface them.
