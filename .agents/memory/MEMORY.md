# Memory Index

- [Tailwind v4 theme tokens](tailwind-v4-theme-tokens.md) — a `bg-x`/`text-x` utility only exists if `x` is mapped in the `@theme inline` block; a `:root` `--var` alone renders transparent (silent invisible-element bug).
- [Verify subagent file ops](subagent-verify-file-ops.md) — design/general subagents sometimes report success but skip file rewrites/deletes; always re-check the filesystem, don't trust the summary.
