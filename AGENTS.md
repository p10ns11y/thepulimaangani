# AGENTS.md - Global Project Guidelines for Thepulimaangani

## Project Overview
Thepulimaangani is a Tamil prosody analysis web application with React/TypeScript frontend and Rust WebAssembly backend. Agents must follow strict rules to ensure reliability, minimize regressions, and maintain high-quality code.

## Structure
- `src/`: React/TypeScript frontend (TanStack Start/Router, Vite, Tailwind)
- `tamil-seiyul-alagi/`: Rust WebAssembly parser
- `src/wasm/`: Generated WASM bindings (gitignored, regenerated via build)

## Commands
- Development: `pnpm run dev`
- Build: `pnpm run build` (includes WASM)
- WASM Build: `pnpm run build:wasm`
- Test: `pnpm run test` (Vitest) + `cargo test` (Rust)
- Typecheck: `pnpm run typecheck`
- **Fast commit hook (Husky):** `pnpm run precommit` — typecheck + Vitest only (needs WASM present once under `public/wasm/` or `src/wasm/` for integration tests).
- **Full CI parity before push / PR:** `pnpm run ci:frontend` or `pnpm run gate` — frozen lockfile → build → typecheck → wasm check → Rust + Vitest (matches GitHub Actions **`build`** job).

## Deployment (Vercel)
- Full flow: [**CI and deployment** in `dx/DEVELOPER_GUIDE.md`](dx/DEVELOPER_GUIDE.md#ci-and-deployment). In short: [`vercel.json`](vercel.json) runs the wasm toolchain install, then `NITRO_PRESET=vercel pnpm run build`, and **`outputDirectory` is `.vercel/output`** (Nitro Build Output v3). Do not point the Vercel project at `dist` or `dist/client` only.

## Coding Style
- TypeScript: Strict typing, no `any`
- Rust: Standard Rust conventions, memory safe
- Naming: CamelCase for components, snake_case for Rust
- Imports: Group by type, absolute paths

## Testing
- Frontend: Vitest for components and logic
- Rust: Cargo test with coverage
- Integration: End-to-end parsing tests
- Coverage: **Rust** — aim for 90%+ (see `tamil-seiyul-alagi`). **Frontend (Vitest v8)** — enforced thresholds and **included file globs** are in [`vitest.config.ts`](vitest.config.ts) (prosody + `lib` + `machines` + tested hooks; routes/shell are out of scope until mounted in tests).

## Commits
- Atomic changes
- Messages: "feat: add feature", "fix: resolve issue", "refactor: improve code"
- No secrets or binaries

## Branches and post-merge sync

- **Default branch:** `malar` (stable integration target on remote).

- **Feature branch names:** pick by responsibility — start with [trinity-and-native-agents/AGENT_ROLES.md](trinity-and-native-agents/AGENT_ROLES.md) (one-page quick pick). Full pollinator table: [trinity-and-native-agents/creators.md](trinity-and-native-agents/creators.md). Examples: `pattampoochi` for general frontend/UI, `thithali` for short UI prototypes, `vannathupoochi` for tokens/themes, `thumpi` for AI-heavy or deep architecture, `theni` for parser/core logic.

- **After every PR merge:** from the repo root, run **`./dx/syncagents-agent.sh`** for **autonomous agents / minimal clones** (skips auto-creating a local branch for every `origin/*`; optional `PUSH=1` only when your environment limits which branches exist and what credentials can push). **Humans** doing a full-machine sync (all `origin/*` locals + gated push): **`./dx/syncagents-push-human.sh`**. Direct use of **`./dx/syncagents.sh`** is the core engine (creates missing `origin/*` tracking branches by default, then resets non-default locals to the default tip; skips open PR heads and `legacy`) — prefer the agent or human wrappers unless you intend that behaviour. **Autonomous agents:** read **Autonomous agents & safety** in [dx/sync-branches-architecture-simple.md](dx/sync-branches-architecture-simple.md); use **`DRY_RUN=1 ./dx/syncagents-agent.sh`** (or `DRY_RUN=1 ./dx/syncagents.sh`) first. Policy: [dx/HUMAN_SYNC.md](dx/HUMAN_SYNC.md).

## Rules
- Run **`pnpm run gate`** before pushing or opening a PR when you touched **Rust, WASM, build, or lockfile** — it matches the GitHub Actions **`build`** job. Day-to-day commits rely on the lighter **`pnpm run precommit`** (Husky).
- Rebuild WASM after Rust edits
- No changes without passing all gates
- Use tools efficiently, cache results
- Escalate on failures, no force pushes