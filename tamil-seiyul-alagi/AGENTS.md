# AGENTS.md - Rust WebAssembly Backend Guidelines for Thepulimaangani

## Overview
Rust WebAssembly parser for high-performance Tamil prosody analysis. Implements traditional Tamil prosodic rules.

## Structure
- `src/lib.rs`: `parse_poem`, WASM entry `parse_poem_wasm`
- `src/`: Pipeline modules (`word_scope`, `syllable_builder`, `foot`, `foot_pattern`, `linkage`, `metre`, `poem_tree`, `presentation`, …)
- `pkg/`: Generated WebAssembly bindings (generated, gitignored)
- `Cargo.toml`: Dependencies

## Coding Style
- **English for தளை:** write **Talai** with a capital **T** at sentence start (otherwise *talai* in running text is fine). Prefer **Talai** over **Thalai** — the latter reads like தலை (head), not தளை (linkage).
- Standard Rust conventions: snake_case, memory safe
- Use wasm-bindgen for JS interop
- serde_json for data serialization
- Unicode handling for Tamil script (U+0B80-U+0BFF)

## Algorithms (shipped vs roadmap)

- **Syllable classification (Ner/Nirai):** Implemented (`syllable_builder`, `syllable`).
- **Feet:** One foot per **linguistic word**; `foot_type` is a **Ner/Nirai pattern string** (see `foot_pattern.rs`). Tamil classical foot names and தளை strings are built in **`presentation.rs`** and serialized on each **`ParseResult.presentation`** for WASM and other clients.
- **Linkage (Talai):** Consecutive foot pairs with positions; **`linkage_type`** is the coarse family (`VenTalai`, `AciriyaTalai`, `KaliTalai`, `VanjiTalai`) for metre-facing logic, and **`linkage_special_type`** is the nuanced bond from the issue #36 table (e.g. `VencirVenTalai`). Cir classes use **Maa / Vilam** (1–2 acai) and **Kaai / Kani** (3+). **`VenTalai` + `Unknown`** when a foot has no syllables or cir cannot be read. WASM JSON uses **`Talai`** (not `thalai`) in Latin keys; older spellings remain accepted on deserialize via `serde` aliases.
- **Metre:** Coarse metre under [`src/metre/`](src/metre/) — `mod.rs` (`MetreType`), `prediction.rs` (heuristic + dense boost), `ml_head.rs` (shipped hybrid logit + `metre_hybrid_weights.inc.rs`; regenerate with `cargo run --example fit_metre_hybrid_weights`), `fractions.rs`, `classical_checker.rs` (placeholder). See [`PARSE_FEATURES.md`](PARSE_FEATURES.md) and [`TRAINING_PROCESS.md`](TRAINING_PROCESS.md).

Doc drift and cleanup tasks: [GitHub issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49).

## Rules
- Maintain 90%+ test coverage
- Run `cargo test` after changes
- Rebuild WASM with `pnpm run build:wasm`
- No direct pkg/ edits (use wasm-pack)
- Validate Tamil input handling