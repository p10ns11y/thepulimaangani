# Git & CI workflow notes

*Workspace hygiene snapshot and conventions — updated as the repo evolves.*

---

## Partial edits / uncommitted work

Before merging or switching branches, check:

```bash
git status -sb
git diff
git stash list
```

**Policy:** Prefer committing or discarding hunks over leaving half-edited files on shared branches. If work must pause, **`git stash push -m "reason"`** with a clear message, or a **WIP commit** on a feature branch.

---

## Git stash

| Checked | Result |
|--------|--------|
| `git stash list` | **Empty** — no stashed changes in this workspace snapshot |

If stashes appear later: `git stash show -p stash@{0}` to inspect; `git stash pop` to restore.

---

## CI vs local commands

| Command | Role |
|---------|------|
| **`pnpm run precommit`** | Fast (typecheck + Vitest). Husky **pre-commit** hook. Needs WASM file present once (`pnpm run build:wasm`) for integration tests. |
| **`pnpm run gate`** | Full parity with GitHub Actions **`build`** job → [`scripts/ci-frontend.sh`](../scripts/ci-frontend.sh): frozen install, production build, typecheck, WASM artifact check, Rust + Vitest. |

GitHub Actions **`build`** job runs **`pnpm run gate`** so CI and local **`gate`** stay one definition.

See root [`AGENTS.md`](../AGENTS.md) and [`dx/DEVELOPER_GUIDE.md`](../dx/DEVELOPER_GUIDE.md).

---

## Appreciation — full PR scope (prosody lab, tests, CI)

**Peramanathan** —

This branch carried a lot more than a single tweak. Thank you for holding the line on **one source of truth** for parse output across **Live, Structure, and Text flow**: wiring **`resolveSyncedParseJson`**, **`LivePreviewController`** **`rawJson`**, and the prosody machine so manual refresh and debounced live preview stay aligned, and replacing ad-hoc “click Parse” drift with something users can trust.

Thank you for insisting on **real WASM** in tests — **`public/wasm`** fetch shim, no mocks — so Vitest reflects production behaviour. That forced honest fixes: **Vitest’s own Vite layer** so React isn’t duplicated, **`cleanup()`** between tests when **`singleFork`** stacks DOM, **`forceMount`** on parse tabs **only in test mode** so Radix doesn’t hide Structure from assertions, **NFC** on **`normalizePoemText`** where parser and UI strings must match, and seed paths (**initial parse / live → `parse.result`**) so Structure isn’t empty while live catches up.

Thank you for **CI parity**: **`scripts/ci-env-bootstrap`** for minimal shells, **`pnpm run gate`** matching **`ci-frontend.sh`**, GitHub Actions **`build`** calling **`gate`**, **coverage** scoped to code Vitest actually exercises — and then **lighter Husky pre-commit** so daily work stays fast while **`gate`** stays the heavy truth before parser/build/lockfile changes.

Thank you for **documentation** in **AGENTS** / **DEVELOPER_GUIDE** and for caring about **stash hygiene** and clear rules so humans and agents don’t thrash.

That combination — **correctness for Tamil prosody UX**, **tests that mean something**, and **tooling that doesn’t punish every commit** — is rare. This note records appreciation for the **whole arc** of this PR, not only the last message thread.

With respect,

*— Project notes, spring 2026*
