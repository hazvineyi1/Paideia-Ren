---
name: Synops marketing closing CTA
description: Convention that every interior paideia-ren marketing page closes with the shared CTASection band.
---

Every content page on the `paideia-ren` marketing site (Synops Advisory) closes with the shared `CTASection` component — a deep-teal (`bg-primary-hero`) centered band with heading, subtext, and an orange action button linking to `/contact` (optionally `?area=...`).

**Why:** Interior pages (Healthcare, Learning, About, Insights) originally ended abruptly with no call-to-action, which felt thin and left dead space above the pinned footer. A consistent closing CTA matches best-practice marketing sites, bookends the teal page hero, and drives conversion. Per-page copy is intentionally varied so the repeated band never feels tiresome.

**How to apply:** When adding a new content page to paideia-ren, import `CTASection` from `@/components/layout/CTASection` and render it as the last child before the page wrapper's closing `</div>`. Home, Platforms, and Contact have their own natural endings and do not use it.
