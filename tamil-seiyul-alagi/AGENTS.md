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
- **Feet:** One foot per **linguistic word**; `foot_type` is a **Ner/Nirai pattern string** (see `foot_pattern.rs`). Tamil classical foot names and தளை strings are built in **`presentation.rs`** and serialized on each **`ParseResult.presentation`** for WASM and other clients.
- **Linkage (talai):** Consecutive foot pairs with positions; **`linkage_type`** is the coarse family (`Venthalai`, `Aciriyathalai`, `Kalithalai`, `Vanjithalai`) for metre-facing logic, and **`linkage_special_type`** is the nuanced bond from the issue #36 table (e.g. `VencirVenthalai`). Cir classes use **Maa / Vilam** (1–2 acai) and **Kaai / Kani** (3+). `VenTalai` + `Unknown` special only when a foot has no syllables. WASM JSON uses Tamil-style romanization (`aciriya…`); legacy `Aasiriy…` / `Asiriya…` keys remain accepted on deserialize.
- **Metre:** Up to four coarse hypotheses in `top_k_metre_hypotheses` (rule priors + linkage boost); `parse_features` on `ParseResult` for WASM/training. See [`PARSE_FEATURES.md`](PARSE_FEATURES.md) and [`TRAINING_PROCESS.md`](TRAINING_PROCESS.md).

Doc drift and cleanup tasks: [GitHub issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49).

## Rules
- Maintain 90%+ test coverage
- Run `cargo test` after changes
- Rebuild WASM with `pnpm run build:wasm`
- No direct pkg/ edits (use wasm-pack)
- Validate Tamil input handling