# Training on parse features (Rust-first)

This document describes how to use the **51-dimensional** [`ParseFeatureSnapshot`](PARSE_FEATURES.md) from `thepulimaangani-parser` for metre or subtype classification **without** training on raw Tamil text.

## What you get from the parser

After `parse_poem` (with metre detection **on**, `no_detect: false`):

- **`parse_features`**: `{ "schema_version": 1, "dense": [ … 51 floats … ] }` on [`ParseResult`](src/types.rs). Same object is serialized in WASM JSON (`parse_poem_wasm`).
- **`top_k_metre_hypotheses`**: up to four coarse [`MetreType`](src/metre.rs) rows with `aggregate_score`, sorted descending after rule priors + linkage boost.

Layout and index semantics: **[`PARSE_FEATURES.md`](PARSE_FEATURES.md)**.

## Labels

Use your curated corpus (e.g. `data/poem_variations.js` keys) as **gold metre** or **gold subtype** (`en` id). Each training row is:

- `dense[0..51]` (must match `PARSE_FEATURE_SCHEMA_VERSION`)
- `label_metre` or `label_subtype` (string id)

Do **not** use raw `original_text` as model input for the small linear head; keep text only for audit and for regenerating features when the parser changes.

## Exporting a dataset (Rust)

1. For each labelled text file or inline string, call `parse_poem(text, ParseOptions::default())`.
2. Read `result.parse_features` (unwrap or skip if `None` when `no_detect` was used).
3. Append one JSON line per sample, e.g. `{"label":"venpaa","schema_version":1,"dense":[...]}`.

You can extend [`examples/dump_parse_features.rs`](examples/dump_parse_features.rs) into a small batch mode, or add `examples/export_training_jsonl.rs` that reads paths + labels from a CSV.

## Model choices (all feasible in Rust)

| Approach | When to use |
|----------|-------------|
| **Hand-tuned boost** (current [`boost_metre_hypotheses_with_dense`](src/metre.rs)) | Fast, no training; tune constants against a dev set. |
| **Linear / softmax on `dense`** | Few hundred parameters; fit with SGD or closed-form least squares per class. |
| **Prototype / k-NN** | One or few examples per class; store mean vector per label. |

Gradient boosting (XGBoost-style) is usually **not** maintained in pure Rust at parity with Python; if you need GBM, export `jsonl`, train offline, then **embed coefficients or tree tables** back into Rust—or keep Python **only** for the search phase and ship Rust for inference.

## Validation

- **Stratify** by parent metre when measuring subtype accuracy.
- With very few examples, prefer **leave-one-metre-out** or bootstrap rather than random k-fold on subtypes.
- When you change **parser** or **feature schema**, re-run `cargo test` (includes [`golden_kural_venpaa_parse_features_match_fixture`](src/parse_features.rs)) and refresh [`tests/test_data/kural_venpaa_parse_features.json`](tests/test_data/kural_venpaa_parse_features.json) if the golden poem’s vector legitimately changes.

## Shipping weights

1. Fit weights in a Rust `example` or offline tool; write e.g. `weights.json` or `postcard` bytes.
2. Commit under `tamil-seiyul-alagi/src/` or `tamil-seiyul-alagi/data/` and `include_str!` / `include_bytes!` in inference code.
3. Bump **`PARSE_FEATURE_SCHEMA_VERSION`** and reject or migrate snapshots when layout changes.

## WASM / TypeScript

The browser receives the same `ParseResult` JSON as native Rust serialization. Optional fields for the UI:

- `parse_features` — plot or log the vector; compare to server golden runs.
- `top_k_metre_hypotheses` — show alternate metre scores without re-parsing.

See [`src/types/parsedPoem.ts`](../../src/types/parsedPoem.ts) and [`src/lib/adaptWasmParseJson.ts`](../../src/lib/adaptWasmParseJson.ts) for adapter fields.
