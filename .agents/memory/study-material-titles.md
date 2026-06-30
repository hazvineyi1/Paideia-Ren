---
name: Study material title derivation
description: How material titles are set in the Coach (paideia-study) material-creation flow
---

Material titles in the study material-creation form are auto-derived per input method; there is no global "Material title" field.

- Paste Text: the only path with a manual title input (required client-side).
- Web URL: server derives from the fetched page `<title>` (extract.ts `extractHtmlTitle`), falling back to the raw URL. The title is also preserved on the thin-page `researchTopic` fallback.
- Research a Topic: server uses the typed topic text as the label.
- Upload Files: server uses each filename without extension, or "Study Pack (N sources)" when combining. The client sends no `title` for files.

`upload.ts` `cleanTitle()` collapses whitespace and caps derived titles at 200 chars (fallback "Untitled material").

**Why:** the old standalone title field sat above the method picker, was mandatory even when redundant, and confused the topic/url/file paths. Keep `title` state bound only to the Paste tab so file/url/topic uploads can never be silently renamed by stale shared state.
**How to apply:** do not reintroduce a shared/global title field; if a path needs a manual title, give it its own state.
