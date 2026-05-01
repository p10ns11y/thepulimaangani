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

## Curated CSV from `poem_variations.js`

Initial **UTF-8** (no BOM) wide table for multilingual / tabular tooling:

- **Path:** [`data/training/poem_variations_training.csv`](../../data/training/poem_variations_training.csv)
- **Regenerate:** from repo root  
  `cargo run -p thepulimaangani-parser --example export_poem_variations_training_csv`

Columns include `sample_id`, `parent_metre` / `label_metre_en` (coarse gold from the JS tree), `text_lang` (`ta`), Tamil `label_ta` and `text`, parse flags, `predicted_metre` / `top_score` from the current heuristic, **`pred_matches_parent`** (1 if `predicted_metre` matches `parent_metre` ASCII-wise), and **`dense_0` … `dense_50`**.

On a 36-row snapshot, the built-in metre heuristic still disagrees with `parent_metre` on many rows (especially Kalippaa / Vanjippaa and Venpaa “variations”). Treat **`parent_metre` + `sample_id` as supervision targets** and `predicted_metre` as a weak baseline; improve with a model on `dense_*` or richer rules.

**Parser change:** `detect_metre_hypotheses` applies linkage priors when `feet >= 4`, linkage is non-empty, and **Aciriyathalai** mass exceeds **Venthalai** only if it also dominates coarse Kalithalai / Vanjithalai; plus a small **muddy Kali/Vanji** tilt when both coarse masses are present but nearly tied (see [`src/metre.rs`](src/metre.rs)). `boost_metre_hypotheses_with_dense` skips feeding Vanji-special mass into Venpaa when both coarse Kal and Vanji are substantial.

## Shuffled iterations (Monte Carlo)

[`aggregate_metre_monte_carlo`](src/poem_variations_training.rs) runs `parse_poem` over **`special_type`** rows for a fixed number of **deterministic** shuffles (`shuffle_labels_for_iteration` + FNV salt). Use it to aggregate confusion / accuracy **once per tuning pass** (not after every shuffle, which overfits). Example: [`examples/metre_monte_carlo_report.rs`](examples/metre_monte_carlo_report.rs). Unit test `mc_ten_iterations_special_types_majority_correct` guards regression on that aggregate.

## PCA and feature–label alignment

- **PCA on `dense_*` alone** does not depend on WASM string spellings; interpret loadings using **[`PARSE_FEATURES.md`](PARSE_FEATURES.md)** index tables (same order as `linkage_type_index` / `linkage_special_index` in [`src/parse_features.rs`](src/parse_features.rs)).
- **Dev tool:** [`examples/parse_features_pca_metre.rs`](examples/parse_features_pca_metre.rs) reads [`data/training/poem_variations_training.csv`](../../data/training/poem_variations_training.csv), prints top **PC1 loadings** and **correlation of each `dense_j` with a coarse `parent_metre` index** (ordinal 0–3). Run:  
  `cargo run -p thepulimaangani-parser --example parse_features_pca_metre`
- **JSONL:** There is no checked-in `.jsonl` file. For a canonical line-oriented dataset, emit one JSON object per line with at least `label` (or `parent_metre`), `schema_version`, and `dense` (51 floats). You can extend [`examples/dump_parse_features.rs`](examples/dump_parse_features.rs) or add `examples/export_training_jsonl.rs`.

## Exporting a dataset (Rust)

1. For each labelled text file or inline string, call `parse_poem(text, ParseOptions::default())`.
2. Read `result.parse_features` (unwrap or skip if `None` when `no_detect` was used).
3. Append one JSON line per sample, e.g. `{"label":"venpaa","schema_version":1,"dense":[...]}`.

**WASM / JSON names:** `linkage_type`, `linkage_special_type`, and `MetreType` in `ParseResult` JSON use **Tamil-style `Aciriya…`** spellings; legacy `Aasiriy…` / `Asiriya…` strings remain accepted on **deserialize** (`serde` aliases on the enums).

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
