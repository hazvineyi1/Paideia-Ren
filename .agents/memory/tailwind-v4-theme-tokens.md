---
name: Tailwind v4 theme tokens
description: Why a custom color utility can silently render transparent in the pnpm-monorepo artifacts (Tailwind v4, no tailwind.config.js).
---

These artifacts use Tailwind v4 with the theme defined inside `src/index.css` via an
`@theme inline { ... }` block (there is no `tailwind.config.js`).

Rule: a utility like `bg-primary-hero` / `text-foo` ONLY exists if its color is registered
in the `@theme inline` block, e.g. `--color-primary-hero: hsl(var(--primary-hero));`.
Defining only `--primary-hero: ...` under `:root` is NOT enough — the utility class won't be
generated, so the element gets no background and silently falls through to whatever is behind it.

**Why:** Caused an invisible hero — white hero text on a transparent section over the
near-white page background. The `--primary-hero` HSL var existed in `:root` but was never
mapped in `@theme`, so `bg-primary-hero` was a no-op.

**How to apply:** When a colored section/button renders transparent or with wrong color,
grep the `@theme inline` block in `index.css` for `--color-<name>`. If missing, add the
mapping there (not just the `:root` var). Sibling tokens that DO work (e.g. `bg-primary`)
are the template to copy.
