# thepulimaangani-parser Coding Style Guide

## Tools
- \`cargo fmt\`: Auto-format.
- \`cargo clippy --all-targets -- -D warnings\`: Lints/perf.
- \`cargo check\`: Typecheck.
- \`cargo test --lib --tests\`: Verify.

## Naming & Structure
- snake_case vars/fns, UPPER_SNAKE_CASE consts, PascalCase types.
- Public: \`pub\`, \`/// docs\`.
- Modules for data (chars.rs), parse.rs, types.rs.

## Idioms
- Iterators/fold/zip over manual indices.
- Enums + pattern match > str matches.
- \`&str\` / Cow<'a, str> > String allocs.
- \`Result<T, anyhow::Error>\` or custom enum.
- Lazy/static for tables/regex.

## Perf
- \`once_cell::sync::Lazy\` for maps/regex.
- Char iter: \`str::chars()\` + filter_map.
- Avoid \`to_string()\`; use format! sparingly.

## Tests
- Unit: core fns (assert_eq!).
- Integration: full poems.
- Edge: Unicode Tamil combos, empty/invalid.

## Deps
- Minimal. Audit \`cargo tree\`. No runtime deps beyond serde/wasm.

Follow for all future edits.
