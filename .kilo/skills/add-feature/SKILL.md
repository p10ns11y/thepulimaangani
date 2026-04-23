# Add Feature Skill

## Overview
Guide agents on implementing new features in thepulimaangani, covering planning, execution, and validation.

## Steps
1. **Plan Feature**: Analyze requirements, decompose into frontend/Rust tasks.
2. **Implement Frontend**: Add React components/routes, integrate WASM calls.
3. **Implement Backend**: Add Rust parsing logic if needed.
4. **Build WASM**: Run `npm run build:wasm` to regenerate bindings.
5. **Test**: Run `npm run test`, `cargo test`, `npm run typecheck`.
6. **Validate**: Ensure Tamil prosody logic works correctly.
7. **Review**: Suggest code review after changes.

## Rules
- Follow AGENTS.md guidelines per layer
- Cache tool results for efficiency
- Escalate on build/test failures
- Maintain 90%+ coverage