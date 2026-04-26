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

## Rules
- Always run tests and typecheck before/after changes
- Rebuild WASM after Rust edits
- No changes without passing all gates
- Use tools efficiently, cache results
- Escalate on failures, no force pushes