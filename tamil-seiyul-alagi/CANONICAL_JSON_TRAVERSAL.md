# Canonical WASM / JSON traversal (`ParseResult`)

This document is the **language-agnostic** guide for consumers of the serde JSON emitted by `parse_poem` / `parse_poem_wasm`. Field names follow **Rust / serde** (`snake_case`).

## Versioning

- **`parse_result_schema_version`** (top-level): Bump when cross-field wire invariants change. Introduced at **`1`**. Older payloads omit this field; treat missing as legacy (`0`) if needed.
- **`parse_features.schema_version`**: Independent — dense float layout for ML / metre features only (see `PARSE_FEATURES.md`).

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
