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

## Appreciation

**Peramanathan** — thank you for pushing on **developer ergonomics** alongside correctness: lighter pre-commit so daily commits stay fast, a single **`gate`** aligned with CI so nobody guesses what “green” means, and honest docs when tradeoffs exist (Vitest coverage scope, WASM in tests, Radix tabs in RTL). That mix of **rigor without needless friction** is hard to maintain; it improves both human flow and agent reliability.

With respect,

*— Project notes, spring 2026*
