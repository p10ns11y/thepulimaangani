# AGENTS.md - Rust WebAssembly Backend Guidelines for Thepulimaangani

## Overview
Rust WebAssembly parser for high-performance Tamil prosody analysis. Implements traditional Tamil prosodic rules.

## Structure
- `src/lib.rs`: Main parser implementation
- `pkg/`: Generated WebAssembly bindings (generated, gitignored)
- `Cargo.toml`: Dependencies

## Coding Style
- Standard Rust conventions: snake_case, memory safe
- Use wasm-bindgen for JS interop
- serde_json for data serialization
- Unicode handling for Tamil script (U+0B80-U+0BFF)

## Algorithms
- Syllable classification: Ner/Nirai
- Foot types: TODO
- Metre detection: TODO
- Bond analysis: TODO

## Rules
- Maintain 90%+ test coverage
- Run `cargo test` after changes
- Rebuild WASM with `pnpm run build:wasm`
- No direct pkg/ edits (use wasm-pack)
- Validate Tamil input handling