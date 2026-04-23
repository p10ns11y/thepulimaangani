# Verify Command

## Purpose
Run quality gates and auto-fix issues to ensure code changes pass all checks before commits.

## Steps
1. Run `cargo fmt` to format Rust code.
2. Run `cargo clippy --fix` to auto-fix Rust lint issues.
3. Run `cargo fmt --check` to verify Rust code formatting.
4. Run `cargo clippy -- -D warnings` to lint Rust code.
5. Run `npm run typecheck` to check TypeScript types.
6. Run `npm run test` to execute Vitest frontend tests.
7. Run `cargo test` to execute Rust backend tests.
8. If all pass, proceed with commit. If any fail, fix issues first.

## Rules
- Always run verify before committing changes.
- Escalate failures to user for resolution.
- No commits without passing all gates.