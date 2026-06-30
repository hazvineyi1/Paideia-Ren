---
name: Verify subagent file operations
description: Delegated subagents may report success without actually performing all file rewrites/deletes — verify against the filesystem.
---

Delegated subagents (DESIGN and general) sometimes return a confident "done" summary while
having skipped part of the work — e.g. claiming a page was rewritten when the old file is
untouched, or claiming files were deleted when they still exist on disk.

**Why:** During a multi-page site rebuild, a DESIGN subagent reported it had rewritten the
home page and deleted 8 obsolete page files. In reality the home page kept its old content
and dangling links, and the deletes never happened (twice — a follow-up message also claimed
deletion that didn't occur). A `tsc --noEmit` pass can still be green because unrouted dead
files are valid TS in isolation.

**How to apply:** After a subagent finishes file work, verify with the actual filesystem,
not the summary: `ls` the target dir, `rg` for the markers that should be gone (old copy,
removed-route links, old theme classes) and the markers that should be present. For reliable
deletes, just run `rm` yourself rather than re-delegating. Typecheck passing does not prove
the intended edits happened.
