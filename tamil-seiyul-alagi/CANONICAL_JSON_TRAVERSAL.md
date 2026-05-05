# Canonical WASM / JSON traversal (`ParseResult`)

This document is the **language-agnostic** guide for consumers of the serde JSON emitted by `parse_poem` / `parse_poem_wasm`. Field names follow **Rust / serde** (`snake_case`).

## Versioning

- **`parse_result_schema_version`** (top-level): Bump when cross-field wire invariants change. Introduced at **`1`**. Older payloads omit this field; treat missing as legacy (`0`) if needed.
- **`parse_features.schema_version`**: Independent — dense float layout for ML / metre features only (see `PARSE_FEATURES.md`).

## OpenAPI 3 contract (generated)

A standard **OpenAPI 3.0.3** document with **`components.schemas`** (JSON Schema fragments for each Rust wire type) lives at **`src/generated/parseResult.openapi.json`**. **`paths`** is empty — this file is for tooling and docs, not HTTP routes. Internal **`$ref`** values use **`#/components/schemas/<TypeName>`**.

Regenerate from the crate root after changing **`ParseResult`** or nested serde types:

```bash
pnpm run codegen:parse-result-openapi
pnpm run codegen:parse-result-client
```

The second command emits **`src/generated/parseResult.wire.ts`** (openapi-typescript) and thin aliases in **`src/generated/parseResultWire.ts`** (`ParseResultWire`). Or run both in one step: `pnpm run codegen:parse-result`.

### TypeScript vs runtime validation (later)

- **Shipped today:** OpenAPI drives **static types** (`ParseResultWire`, used by `wasmWireParseResult` / `adaptWasmParseJson`). Runtime checks use a **minimal Zod** schema (`original_text` + `syllables`) plus **`.passthrough()`** so extra WASM fields do not break consumers.
- **Future (when full-graph runtime validation is worth the cost):** generate **Zod** from the same contract (e.g. dereferenced JSON Schema + `json-schema-to-zod`, or another generator aligned with **Zod 4**), or maintain a hand-written Zod that tracks **`ParseResultWire`**. Expect larger bundles and more brittle codegen for nested **oneOf** / Rust enums; weigh against continuing minimal Zod + compile-time types.

## Recommended traversal patterns

### Poem-wide feet and தளை (linkage)

1. Use **`feet`** as the ordered list of feet (one per linguistic word), poem order.
2. Each **`Foot`** includes **`foot_index_global`** (`Some(i)` where `i` matches position in **`feet`** and indices in **`linkage`** / **`talai`** edges).
3. Iterate **`linkage`** (or **`talai`** — same bond list in normal parses) for consecutive-foot bonds; `from_foot` / `to_foot` refer to **`foot_index_global`**.

### Physical lines (editor / line-major UI)

1. Prefer **`lines`**: one entry per **physical** line of normalized text; each has **`feet`** for that line in order.
2. Each foot in **`lines[*].feet`** carries **`foot_index_global`** when derived from **`poem.lines[].linguistic_words`** or from **`poem.lines[].words`** (see `flat_lines_from_poem` in `types.rs`). Use it to join to **`feet`**, **`linkage`**, and **`presentation.feet`** without re-inferring indices.

### Hierarchical tree (graphemes / letters)

1. Use **`poem`**: nested **`lines`** → **`linguistic_words`** / **`words`** → **`syllables`** (`inner` + **`letters`**). **`syllables_flat`** inside **`poem`** parallels flat syllable scans.

### Human-readable labels (Tamil / Latin)

1. Use **`presentation`**: metre string, **`presentation.feet`** (aligned with poem-wide foot order), **`presentation.talai`** (display strings for bonds).

### Flat syllable list

1. Top-level **`syllables`** matches the classical metre-facing flat list (parallel to foot grouping).

## Redundant fields (by design)

The same logical poem appears in multiple shapes (**`poem`**, **`lines`**, **`feet`**, **`syllables`**) so **different clients** can choose the cheapest path. Prefer **`lines` + `foot_index_global`** for line-aware UIs; prefer **`feet` + `linkage`** for global prosody graphs.

## Regenerating committed fixtures

From the **repository root** (not only `tamil-seiyul-alagi/`):

```bash
pnpm run dump:test-fixtures
```

This runs:

- `dump_live_preview_fixture` → `src/lib/__tests__/fixtures/samplePoemThreeLines.parseResult.json`
- `dump_kural_parse_features_fixture` → `tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json`

Then rebuild WASM: `pnpm run build:wasm`.
