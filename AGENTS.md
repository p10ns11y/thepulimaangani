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
- Coverage: Maintain 90%+ in both

## Commits
- Atomic changes
- Messages: "feat: add feature", "fix: resolve issue", "refactor: improve code"
- No secrets or binaries

## Branches and post-merge sync

- **Default branch:** `malar` (stable integration target on remote).

- **Feature branch names:** pick by responsibility — start with [trinity-and-native-agents/AGENT_ROLES.md](trinity-and-native-agents/AGENT_ROLES.md) (one-page quick pick). Full pollinator table: [trinity-and-native-agents/creators.md](trinity-and-native-agents/creators.md). Examples: `pattampoochi` for general frontend/UI, `thithali` for short UI prototypes, `vannathupoochi` for tokens/themes, `thumpi` for AI-heavy or deep architecture, `theni` for parser/core logic.

- **After every PR merge:** from the repo root, run `./dx/syncagents.sh` so local branches stay aligned with `origin/malar` (skips open PR heads and `legacy`). The script creates any **missing local tracking branches** for `origin/*` after fetch, then resets non-default locals to the default branch tip. Use `PUSH=1` only when you intend to push updated tips. Details: [dx/sync-branches-architecture-simple.md](dx/sync-branches-architecture-simple.md).

## Rules
- Always run tests and typecheck before/after changes
- Rebuild WASM after Rust edits
- No changes without passing all gates
- Use tools efficiently, cache results
- Escalate on failures, no force pushes