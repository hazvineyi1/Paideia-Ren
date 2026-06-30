---
name: Synops brand naming vs internal identifiers
description: Display-name rebrand mapping for the three web portals, and the rule that internal identifiers stay unchanged.
---

# Synops brand naming

The product is commercial (NOT a non-profit — no Donate/SDG/UNESCO/philanthropy/501c3 framing).

Display-name mapping (user-facing copy, titles, prompts, artifact.toml titles only):
- Company / umbrella: "Paideia-Ren" / "Paideia-Ren Inc." -> **Synops**
- Teacher product (artifact `paideia-app`) -> **Synops Teacher**
- Student product (artifact `paideia-study`) -> **Synops Coach**

**Rule:** internal identifiers must NOT change — `@workspace/*` package names, folder names
(`paideia-ren`, `paideia-app`, `paideia-study`), import paths, route slugs (e.g. `/study-tutor`),
DB keys/columns, IP-salt defaults, outbound bot User-Agent URLs. Only display strings change.

**How to apply:** when rebranding, grep user-facing terms but exclude internal matches
(`paideia-ren/dist`, `paideia-ren.com` UA, `paideia-ren-default-salt`, route slugs). After
deleting non-profit-only pages, also remove their routes, nav/footer links, and any home-page
cards that link to them (a dangling `<Link href>` to a removed route 404s at runtime).
