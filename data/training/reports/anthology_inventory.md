# S02 — Anthology inventory (metre ML)

**Step:** `S02_anthology_inventory`  
**Status:** `ADOPT`  
**Date:** 2026-07-27  
**Machine pin:** `ANTHOLOGY_INVENTORY_VERSION = 1` (`tamil-seiyul-alagi/src/anthology_inventory.rs`)  
**Portfolio:** [`tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md`](../../../tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md) §5.0 S02, §5.2 Anthology  
**Training process:** [`tamil-seiyul-alagi/TRAINING_PROCESS.md`](../../../tamil-seiyul-alagi/TRAINING_PROCESS.md)  
**Machine-readable twin:** [`anthology_inventory.json`](anthology_inventory.json)  
**Decision pack:** [`step_S02_anthology_inventory/decision.md`](step_S02_anthology_inventory/decision.md)

---

## 1. What the anthology is

Curated multi-poem corpus used as **evidence** for coarse metre ML (`parent_metre` ∈ {`venpaa`, `aciriyappa`, `kalippaa`, `vanjippaa`}).

| Layer | Path | Role |
|-------|------|------|
| Canonical tables | `tamil-seiyul-alagi/src/poem_variations.rs` | Source of truth: per-metre `special_types` + `variations` blocks |
| Label / export helpers | `tamil-seiyul-alagi/src/poem_variations_training.rs` | `poem_variation_label_rows()`, filters, CSV/JSONL builders, MC aggregate |
| JS mirror (UI / keys) | `data/poem_variations.js` | Same sample ids + texts (kept in sync with Rust) |
| Wide tabular export | `data/training/poem_variations_training.csv` | Labels + `dense_0…dense_50` + heuristic baseline columns |
| Nested tooling export | `data/training/poem_variations_training.jsonl` | Same rows + full `linkage` + `parse_features` object |
| Parse-feature golden | `tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json` | Schema regression only (not multi-class train set) |

**Invariant (portfolio):** No ML step may train on anthology rows outside the **declared split** without a schema/docs bump and re-baseline.

---

## 2. Exact counts (authoritative)

Counts match:

1. Rust unit test `blocks_match_expected_counts` / `label_row_count_matches_poem_variations` (36 rows)
2. Committed CSV (36 data rows + header)
3. Committed JSONL (36 lines)

### 2.1 Totals by `row_kind`

| `row_kind` | N | Training role |
|------------|---:|---------------|
| **`special_type`** | **17** | **Primary gold** for fit + adopt metrics |
| **`variation`** | **19** | **Stress / disagreement only** — report separately |
| **All** | **36** | Full export surface |

All 36 rows parse successfully (`parse_ok=1`) under `ParseOptions::poem_variations_training()`.  
`feature_schema_version` = **1** on all exported dense vectors.

### 2.2 Per `parent_metre` × `row_kind`

| parent_metre | special_type | variation | total | % of corpus |
|--------------|-------------:|----------:|------:|------------:|
| **venpaa** | 10 | 6 | 16 | 44.4% |
| **aciriyappa** | 3 | 5 | 8 | 22.2% |
| **kalippaa** | 2 | 5 | 7 | 19.4% |
| **vanjippaa** | 2 | 3 | 5 | 13.9% |
| **Σ** | **17** | **19** | **36** | 100% |

Rust block lengths (must stay equal to the table above):

| metre_key | special_types | variations |
|-----------|--------------:|-----------:|
| venpaa | 10 | 6 |
| aciriyappa | 3 | 5 |
| kalippaa | 2 | 5 |
| vanjippaa | 2 | 3 |

### 2.3 Class balance on primary gold (`special_type` only)

| parent_metre | N | share of primary gold |
|--------------|---:|----------------------:|
| venpaa | 10 | **58.8%** |
| aciriyappa | 3 | 17.6% |
| kalippaa | 2 | 11.8% |
| vanjippaa | 2 | 11.8% |

**Imbalance risk:** Venpaa alone is majority of primary gold. Kalippaa / Vanjippaa have only **two** special_type samples each — any nonlinear model will overfit; prefer linear/logistic, prototypes, LOO/bootstrap, and stratified reporting.

### 2.4 Heuristic baseline vs gold (current CSV snapshot)

`pred_matches_parent` (top-1 heuristic/hybrid export vs `parent_metre`):

| slice | match | mismatch |
|-------|------:|---------:|
| special_type | **17 / 17** | 0 |
| variation | 3 / 19 | **16 / 19** |
| overall | 20 / 36 | 16 / 36 |

Interpretation: the shipped head already hits primary gold on this tiny set; **variation is hard / noisy relative to parent**, which is exactly why it is stress-only.

Monte Carlo regression uses **special_type only**: 17 × 20 iterations = **340** evals (floor ≥280/340 in `mc_twenty_iterations_special_types_majority_correct`).

---

## 3. Sample id roster

### 3.1 `special_type` (primary gold) — 17

| parent_metre | sample_id |
|--------------|-----------|
| venpaa | `oru_vikarpa_kural_venpaa` |
| venpaa | `iru_vikarpa_kural_venpaa` |
| venpaa | `nerisai_sinthiyal_venpaa` |
| venpaa | `inisai_sinthiyal_venpaa` |
| venpaa | `oru_vikarpa_nerisai_venpaa` |
| venpaa | `iru_vikarpa_nerisai_venpaa` |
| venpaa | `oru_vikarpa_inisai_venpaa` |
| venpaa | `pala_vikarpa_inisai_venpaa` |
| venpaa | `paqrodai_venpaa` |
| venpaa | `kalivenpaa` |
| aciriyappa | `nerisai_aciriyappaa` |
| aciriyappa | `inaikkural_aciriyappaa` |
| aciriyappa | `nilaimandila_aciriyappaa` |
| kalippaa | `tharavukocha_kalippaa` |
| kalippaa | `venkalippaa` |
| vanjippaa | `kuraladi_vanjippaa` |
| vanjippaa | `sinthadi_aciriyappaa` |

**Label note:** `sinthadi_aciriyappaa` sits under **`parent_metre = vanjippaa`** in the anthology tree. Gold coarse metre for training is **Vanjippaa**, not Aciriyappaa — do not re-parent from the sample id string alone.

### 3.2 `variation` (stress only) — 19

| parent_metre | sample_id |
|--------------|-----------|
| venpaa | `kurattazhisai`, `kural_vensenthurai`, `ventazhisai`, `vellathazhisai`, `vendurai`, `velivirutham` |
| aciriyappa | `aciriya_thazhisai`, `aciriya_thurai`, `arucir_kazhinediladi_aciriya_virutham`, `elucir_kazhinediladi_aciriya_virutham`, `encir_kazhinediladi_aciriya_virutham` |
| kalippaa | `kalithazhisai`, `kalithurai`, `kattalai_kalippaa`, `kattalai_kalithurai`, `kalivirutham` |
| vanjippaa | `vanjithazhisai`, `vanjithurai`, `vanjivirutham` |

---

## 4. Declared splits & filters

| Split / filter | How | Default use |
|----------------|-----|-------------|
| Primary gold | `poem_variation_special_type_rows(...)` or `row_kind == "special_type"` | Train + adopt metrics |
| Stress | `row_kind == "variation"` | Report only unless relabeled |
| Explicit multi-kind | `poem_variation_rows_by_kinds(rows, &["special_type", ...])` | MC / linkage tools |
| Env filter (examples) | `MC_ROW_KINDS=special_type\|variation\|all` | Defaults to **`special_type`** |

**No formal train/dev/test partition is checked in.** With N=17 primary rows:

- Prefer **leave-one-sample-out**, leave-one-metre-out diagnostics, or **bootstrap** CIs.
- Stratify by `parent_metre` when reporting subtype or multi-class accuracy.
- Never treat a random k-fold that mixes variation into train as the adopt gate.

---

## 5. Export commands and paths

From **repo root**:

```bash
# Wide CSV → data/training/poem_variations_training.csv
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_csv

# JSONL (labels + parse_features + linkage) → data/training/poem_variations_training.jsonl
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_jsonl
```

Package-name equivalents (same crate):

```bash
cargo run -p thepulimaangani-parser --example export_poem_variations_training_csv
cargo run -p thepulimaangani-parser --example export_poem_variations_training_jsonl
```

| Artifact | Path |
|----------|------|
| CSV | [`data/training/poem_variations_training.csv`](../../poem_variations_training.csv) |
| JSONL | [`data/training/poem_variations_training.jsonl`](../../poem_variations_training.jsonl) |

**CSV columns (high level):** `sample_id`, `parent_metre`, `label_metre_en`, `text_lang`, `row_kind`, `label_ta`, `text`, `parse_ok`, `parse_error`, `predicted_metre`, `top_score`, `pred_matches_parent`, `feature_schema_version`, `dense_0`…`dense_50`.

**JSONL:** one object per line with the same labels, nested `parse_features`, and full `linkage` (`linkage_type` / `linkage_special_type`).

**When to re-export:** any parser, linkage serde, or `PARSE_FEATURE_SCHEMA_VERSION` change — so `dense_*` and baseline predictions stay aligned with shipped code.

---

## 6. Golden kural fixture (not a train set)

| Field | Value |
|-------|--------|
| **Path** | [`tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json`](../../../tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json) |
| **Role** | Golden **dense[51]** regression for schema stability |
| **Related sample** | `oru_vikarpa_kural_venpaa` (ஒரு விகற்ப குறள் வெண்பா) text |
| **Test** | `golden_kural_venpaa_parse_features_match_fixture` in `parse_features.rs` |
| **Regenerate** | `cd tamil-seiyul-alagi && cargo run --example dump_kural_parse_features_fixture` |
| **Or all fixtures** | `pnpm run dump:test-fixtures` (repo root) |
| **Parse options** | Fixture dump uses `no_detect = true` (features without metre-head side effects) |

**Do not** use this fixture alone as a multi-class training set. It guards feature layout; supervision for metre class still comes from anthology `parent_metre` on `special_type` rows.

---

## 7. Corpus fingerprints (inventory snapshot)

SHA-256 of sources at **S02 measure ADOPT** (also in `anthology_inventory.json`):

| File | bytes | sha256 |
|------|------:|--------|
| `data/training/poem_variations_training.csv` | 29923 | `ba662c50ab7c1f64b7f27e7bd29efe90d03ab5e0fe8b01ed531ff7de0041a4f0` |
| `data/training/poem_variations_training.jsonl` | 198632 | `64e24eb07e578f2ee550935c596e4d84c3fc871eb7a80d3c8cf625d0107f4183` |
| `data/poem_variations.js` | 27306 | `bab20f8752451dcf61e66cb83bf488b58f92fc892fb8a938ea14d80704306cf5` |
| `tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json` | 560 | `6f8fcfd04db7beb2c3668230595ddf2283922d93cbaf1443af0b53c5f4e294c0` |

S03 `soa_ledger` should re-hash these (or re-read this inventory) when freezing baselines.

---

## 8. Forbidden training uses (explicit)

Machine ids (crate: `anthology_forbidden_training_use_ids()`):

| id | Meaning |
|----|---------|
| `bulk_train_variation_without_relabel` | Bulk-train on all `variation` rows without relabel (portfolio §3.8 / §5.2) |
| `variation_as_sole_adopt_criterion` | Use `variation` metrics as sole ADOPT criterion |
| `kural_fixture_as_multiclass_train` | Train multi-class head primarily on kural golden fixture |
| `raw_text_as_dense_linear_input` | Feed raw poem text into the small dense linear head |
| `train_outside_declared_split_without_rebaseline` | Train outside declared split without docs bump + re-baseline |
| `invent_ontology_or_relabel_dense_semantics` | Invent ontology terms or relabel dense semantics mid-step |
| `fuse_classical_into_ml_score` | Silently fuse classical violations into the ML score channel |
| `predicted_metre_as_gold` | Treat export `predicted_metre` as gold (gold = `parent_metre` + `sample_id`) |
| `reparent_sinthadi_from_id_string` | Re-parent `sinthadi_aciriyappaa` to Aciriyappaa from id alone |
| `external_poems_without_inventory_policy` | Ingest external poems without inventory + label policy |

Prose restatement: do **not** bulk-train variation, adopt on variation alone, train on the kural fixture, use raw text as dense input, train outside the declared split, invent ontology/semantics, fuse classical into ML scores, use predicted_metre as gold, reparent sinthadi from the id string, or grow external poems without inventory policy.

---

## 9. Risks for ML training (summary)

| Risk | Severity | Mitigation |
|------|----------|------------|
| N=17 primary gold | High | Linear heads, LOO/bootstrap, no deep nets first |
| Venpaa 10/17 special_type | High | Stratified metrics; class weights or macro-F1; per-metre cards |
| Kalippaa / Vanjippaa only 2 special each | High | Do not claim fine-grained Kal/Vanji separation without more labels |
| Variation noise vs parent | Medium | Stress reports only; optional future relabel campaign |
| No checked-in holdout split | Medium | Document split per experiment; freeze fingerprints in S03/A00 |
| Export drift after parser changes | Medium | Re-run CSV/JSONL examples; bump schema version when layout changes |
| Heuristic already 17/17 on special_type | Medium | Use MC, MRR, correct@2, entropy honesty, ablations — not train accuracy alone |

---

## 10. Ontology entities touched (read-only)

S02 does **not** invent ontology. It inventories how gold maps onto existing S00 entities:

| Entity / relation | How anthology uses it |
|-------------------|------------------------|
| `MetreType` (4 fixed) | Gold via `parent_metre` → `gold_metre_type_for_parent` |
| Poem / Line / Foot / Syllable | Parse each sample text; features derived, not relabeled |
| LinkageType / LinkageSpecialType | Exported on JSONL rows for tooling; not gold labels |
| Dual-truth (`ml_metre` ∥ `classical_metre`) | Classical checker stays **empty** (pre-D01; no `allow_classical`) |
| Dense `ParseFeatureSnapshot` | Observables on every exported row; schema_version = 1 |

**Out of scope for S02:** new enum variants, classical rule fill, dense formula changes.

---

## 11. Semantic invariants to test (pin list)

These are already partially locked by S00/S01 + `poem_variations*` unit tests; S03 will fingerprint them.

| Invariant | Pin source |
|-----------|------------|
| Total label rows = **36** | `anthology_total_row_count` + `label_row_count_matches_poem_variations` |
| Per-metre block lengths 10+6 / 3+5 / 2+5 / 2+3 | `anthology_block_counts` + `blocks_match_expected_counts` |
| `special_type` N = **17**; MC 17×20 = 340 | `anthology_mc_special_type_eval_count` + MC unit tests |
| Venpaa special_type N = **10** | `anthology_class_balance_special_type` + hybrid venpaa pin |
| Primary filter yields only `special_type` | S01 + `poem_variation_special_type_rows` + S02 live-row test |
| Gold slugs only `{venpaa,aciriyappa,kalippaa,vanjippaa}` | S01 gold map + `gold_metre_type_for_parent` |
| `sinthadi_aciriyappaa` gold parent = **vanjippaa** | `anthology_sample_parent_metre` |
| Kural fixture schema_version = 1, dense len 51 | path/role pins + parse_features golden |
| Forbidden-use catalog (≥10 machine ids) | `anthology_forbidden_training_use_ids` |
| Classical violations empty | S00/S01 classical empty pins |
| Training parse: `skip_ml_metre == true` | S01 score-scale / training options pin |

---

## 12. Anthology split allowed for this step (S02)

| Allowed | Forbidden |
|---------|-----------|
| Count and roster all `special_type` and `variation` rows | Bulk-train hybrid / logistic heads on `variation` |
| Document export paths, fingerprints, forbidden uses | Use `variation` metrics as sole ADOPT criterion |
| Reference kural golden path + regenerate command | Treat kural fixture as multi-class train set |
| Read CSV/JSONL for balance / heuristic baseline notes | Merge `predicted_metre` as gold |
| Assert `row_kind` isolation helpers | Add/remove rows without inventory bump + re-baseline |
| Stratified balance tables for LOO/bootstrap design | Fill `classical_checker` (D01 only) |
| Inventory-level stress reporting (3/19 heuristic) | Fuse classical into ML score channel |

**Declared S02 split:** primary inventory + metrics narrative on **`special_type` (N=17)**; **`variation` (N=19)** inventoried for stress only.

---

## 13. S02 completion checklist

- [x] Inventory `special_type` vs `variation` counts (17 vs 19; total 36)
- [x] Per-`parent_metre` balance tables
- [x] Export commands + output paths documented
- [x] Golden kural fixture path + role documented
- [x] Forbidden training uses listed explicitly
- [x] Ontology entities / semantic pin list / S02 split table
- [x] Artifacts: `anthology_inventory.md` + `anthology_inventory.json`
- [x] Step pack: `step_S02_anthology_inventory/`
- [x] Machine pins: `src/anthology_inventory.rs` + crate-root re-exports (`ANTHOLOGY_INVENTORY_VERSION=1`)
- [x] Integration: `tests/test_anthology_inventory_s02.rs` green
- [x] Live re-export via cargo examples (CSV/JSONL 36 rows; fingerprints refreshed)
- [x] **Measure** → **ADOPT** (SOA foundation; primary top-1 undamaged)

**Decision:** `ADOPT` — see [`step_S02_anthology_inventory/decision.md`](step_S02_anthology_inventory/decision.md).  
**Next:** `S03_soa_ledger` fingerprints this inventory (version + counts + export hashes).
