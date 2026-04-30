# AGENTS.md - Rust WebAssembly Backend Guidelines for Thepulimaangani

## Overview
Rust WebAssembly parser for high-performance Tamil prosody analysis. Implements traditional Tamil prosodic rules.

## Structure
- `src/lib.rs`: `parse_poem`, WASM entry `parse_poem_wasm`
- `src/`: Pipeline modules (`word_scope`, `syllable_builder`, `foot`, `foot_pattern`, `linkage`, `metre`, `poem_tree`, `presentation`, …)
- `pkg/`: Generated WebAssembly bindings (generated, gitignored)
- `Cargo.toml`: Dependencies

## Coding Style
- Standard Rust conventions: snake_case, memory safe
- Use wasm-bindgen for JS interop
- serde_json for data serialization
- Unicode handling for Tamil script (U+0B80-U+0BFF)

## Algorithms (shipped vs roadmap)

- **Syllable classification (Ner/Nirai):** Implemented (`syllable_builder`, `syllable`).
- **Feet:** One foot per **linguistic word**; `foot_type` is a **Ner/Nirai pattern string** (see `foot_pattern.rs`). Classical names (தேமா, …) belong in `presentation.rs` and are **not** wired through WASM yet.
- **Linkage (talai):** Consecutive foot pairs with positions; **table-driven** `linkage_type` / `linkage_category` from last acai cir class (Maa/Vilai/Kaai/Kani) × next first Ner/Nirai ([issue #36](https://github.com/p10ns11y/thepulimaangani/issues/36)). `VenTalai` is only a fallback when a foot has no syllables.
- **Metre:** Heuristic hypotheses (`metre.rs`); not full classical constraint sets yet.

Doc drift and cleanup tasks: [GitHub issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49).

## Rules
- Maintain 90%+ test coverage
- Run `cargo test` after changes
- Rebuild WASM with `pnpm run build:wasm`
- No direct pkg/ edits (use wasm-pack)
- Validate Tamil input handling