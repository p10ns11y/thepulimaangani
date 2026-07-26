# Semantics contract — Tamil prosody metre ML (S01)

**Status:** measurement-semantics freeze for metre-ML SOA foundation  
**Date:** 2026-07-27  
**Agent:** theni (parser / core data / WASM truth)  
**Contract:** [`tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md`](../../../tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md) §5.0 `S01_semantics_contract`, §5.2 Semantics  
**Depends on:** S00 ([`ontology_map.md`](ontology_map.md)), [`PARSE_FEATURES.md`](../../../tamil-seiyul-alagi/PARSE_FEATURES.md), [`METRE_PREDICTION.md`](../../../tamil-seiyul-alagi/METRE_PREDICTION.md)

**Scope:** what each **symbol means** in measurement (dense indices, score scales, gold labels, JSON keys, presentation).  
**Out of scope:** inventing new ontology entities (S00); anthology row inventory counts (S02); SOA ledger fingerprint (S03); classical rule implementation (D01).

### Machine-readable pins (public API)

Rust module: `tamil-seiyul-alagi/src/semantics_contract.rs` (crate root re-exports).  
`SEMANTICS_CONTRACT_VERSION = 1` — bump when dense meaning, gold slug map, score-scale contract, or wire-key tables change (S03 fingerprint).

| Export | Role |
|--------|------|
| `SEMANTICS_CONTRACT_VERSION` | Contract id for S03 |
| `PARSE_FEATURE_SCHEMA_VERSION` / `PARSE_FEATURE_DENSE_LEN` | Re-exported consumer pins (`1` / `51`) |
| `dense_global_feature_ids()` | Conceptual names for `dense[0..12)` |
| `dense_linkage_type_slot_ids()` | Wire keys for `dense[12..19)` slots |
| `dense_linkage_special_slot_ids()` | Wire keys for `dense[19..27)` (same order as ontology special catalog) |
| `gold_parent_metre_slugs()` | Anthology slugs → fixed metres |
| `score_scale_ids()` | Named score / probability channels |

Integration lock: `tests/test_semantics_contract_s01.rs`. Unit pins: `semantics_contract` lib tests.

---

## 1. Schema identity (must not silent-drift)

| Symbol | Value (v1) | Source |
|--------|------------|--------|
| `PARSE_FEATURE_SCHEMA_VERSION` | **1** | `parse_features.rs` |
| `PARSE_FEATURE_DENSE_LEN` | **51** | `parse_features.rs` |
| `METRE_ML_WEIGHT_SCHEMA` | **3** | `metre/ml_head.rs` (hybrid feature layout, not dense layout) |
| `PARSE_RESULT_SCHEMA_VERSION` | **1** | `types.rs` (whole `ParseResult` wire) |
| `SEMANTICS_CONTRACT_VERSION` | **1** | this contract |
| `ONTOLOGY_MAP_VERSION` | **1** | S00 catalog |

**Invariant:** Changing any dense index formula or block layout **requires** bumping `PARSE_FEATURE_SCHEMA_VERSION`, updating [`PARSE_FEATURES.md`](../../../tamil-seiyul-alagi/PARSE_FEATURES.md), refreshing `tests/test_data/kural_venpaa_parse_features.json`, and (when hybrid inputs change) refitting weights / bumping `METRE_ML_WEIGHT_SCHEMA`. Silent renumbering is **forbidden**.

---

## 2. Dense glossary `dense[0..51)` (schema v1)

Authoritative formulas: [`PARSE_FEATURES.md`](../../../tamil-seiyul-alagi/PARSE_FEATURES.md) + `fill_*` in `parse_features.rs`.  
Features are **derived observables**, not ontology primitives (S00).

### 2.1 Block map

| Range | Len | Offset const | Role |
|-------|----:|--------------|------|
| `[0, 12)` | 12 | `GLOBAL_FEATURE_OFFSET` | Global counts / ratios |
| `[12, 19)` | 7 | `LINKAGE_TYPE_FEATURE_OFFSET` | Coarse `LinkageType` histogram (fractions) |
| `[19, 27)` | 8 | `LINK_SPECIAL_FEATURE_OFFSET` | `LinkageSpecialType` histogram (fractions) |
| `[27, 43)` | 16 | `FOOT_PATTERN_BIN_OFFSET` | FNV-1a bins over `foot.foot_type` |
| `[43, 51)` | 8 | `LINE_FOOT_HIST_OFFSET` | Feet-per-line histogram |

### 2.2 Indices 0–11 — global

| j | Id | Formula / meaning |
|---|----|-------------------|
| 0 | `log_letters` | `ln(1 + letter_count)` (grapheme count in `parse_poem`) |
| 1 | `vikalpa_count` | `1` if `alt_scansion`, else `0` |
| 2 | `line_count` | `lines.len() as f32` |
| 3 | `foot_count` | `feet.len() as f32` |
| 4 | `syllable_count` | `syllables.len() as f32` |
| 5 | `mean_feet_per_line` | Σ line foot counts / `max(lines.len(), 1)` |
| 6 | `max_feet_per_line` | max feet on any physical line |
| 7 | `mean_syllables_per_foot` | Σ foot syllable lens / `max(feet.len(), 1)` (0 if no feet) |
| 8 | `max_syllables_per_foot` | max syllables on any foot |
| 9 | `ner_ratio` | count `Ner` / `max(ner+nirai, 1)` |
| 10 | `nirai_ratio` | count `Nirai` / `max(ner+nirai, 1)` |
| 11 | `linkage_edge_count` | `linkage.len() as f32` |

### 2.3 Indices 12–18 — coarse linkage type (normalized fractions)

Denominator: `max(linkage.len(), 1)`. Empty linkage → all zeros (not a uniform prior).

| j | Slot | Wire key (serialize) | Legacy deserialize aliases |
|---|------|----------------------|----------------------------|
| 12 | 0 | `VenTalai` | `Venthalai` |
| 13 | 1 | `AciriyaTalai` | `Aciriyathalai`, `Aasiriyathalai`, `AsiriyaTalai` |
| 14 | 2 | `KaliTalai` | `Kalithalai` |
| 15 | 3 | `VanjiTalai` | `Vanjithalai` |
| 16 | 4 | *(reserved; always 0 in v1)* | — |
| 17 | 5 | *(reserved; always 0 in v1)* | — |
| 18 | 6 | `Other(_)` | open string payload |

### 2.4 Indices 19–26 — special bond (normalized fractions)

Same denominator. Order **must** match `ontology_linkage_special_ids()` / dense special bins 0..7.

| j | Slot | Wire key | Legacy aliases | Rust variant |
|---|-----:|----------|----------------|--------------|
| 19 | 0 | `NerondriyaAciriyaTalai` | `NerondriyaAciriyathalai`, `NerondriyaAasiriyathalai` | `NerondriyaAciriyathalai` |
| 20 | 1 | `NiraiondriyaAciriyaTalai` | `NiraiondriyaAciriyathalai`, `NiraiondriyaAasiriyathalai` | `NiraiondriyaAciriyathalai` |
| 21 | 2 | `IyarcirVenTalai` | `IyarcirVenthalai` | `IyarcirVenthalai` |
| 22 | 3 | `VencirVenTalai` | `VencirVenthalai` | `VencirVenthalai` |
| 23 | 4 | `KaliTalai` | `Kalithalai` | `Kalithalai` |
| 24 | 5 | `OndriyaVanjiTalai` | `OndriyaVanchithalai` | `OndriyaVanchithalai` |
| 25 | 6 | `OndrathaVanjiTalai` | `OndrathaVanchithalai` | `OndrathaVanchithalai` |
| 26 | 7 | `Unknown` | — | `Unknown` |

**Heuristic dense boost usage (v1):** Kalippaa uses `dense[23]`; Vanjippaa uses `dense[24]+dense[25]`; Venpaa may use vanji special mass only when coarse Kali+Vanji are **not** both present (see `boost_metre_hypotheses_with_dense`).

### 2.5 Indices 27–42 — foot pattern bins

Per foot: `fnv1a_u32(foot.foot_type.as_bytes()) % 16`; mass `1 / max(feet.len(), 1)`.  
`foot_type` is the machine Ner/Nirai pattern string (e.g. `Ner-Ner`), **not** Tamil classical names.

### 2.6 Indices 43–50 — line foot histogram

Mass `1 / max(lines.len(), 1)` into bin from `ln.feet.len()`:

| j | Bin | Feet on line |
|---|----:|--------------|
| 43 | 0 | 0 |
| 44 | 1 | 1 |
| 45 | 2 | 2 |
| 46 | 3 | 3 |
| 47 | 4 | 4 |
| 48 | 5 | 5–8 |
| 49 | 6 | 9–12 |
| 50 | 7 | ≥13 |

### 2.7 Golden regression

[`tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json`](../../../tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json) pins one Venpaa sample vector.  
Test: `parse_features::tests::golden_kural_venpaa_parse_features_match_fixture`.  
**Not** a multi-class training set (anthology role: parse-feature regression only).

---

## 3. Score scales (do not confuse channels)

| Channel | Type | Scale / meaning | When present |
|---------|------|-----------------|--------------|
| `MetreHypothesis.aggregate_score` **pre-hybrid** | `i32` | **Arbitrary integer** from rule priors + linkage tilts + dense boost (capped ~100 on boost path). **Not** a probability. | Always on detection path |
| `MetreHypothesis.aggregate_score` **post-hybrid** | `i32` | **≈ 100 × softmax probability** after hybrid reorder (ranking convenience) | Hybrid active (`skip_ml_metre == false` and weights non-trivial) |
| `MetreHypothesis.metre_probability` | `Option<f32>` | Softmax mass ∈ [0,1] for that coarse class; four-way sum ≈ 1 | Hybrid active |
| `MetreHypothesis.metre_rank` | `Option<u8>` | 1-based rank after hybrid | Hybrid active |
| `ParseResult.metre_entropy_bits` | `Option<f32>` | Shannon entropy (bits) of 4-way hybrid distribution | Hybrid active |
| `ParseResult.metre_epistemic_margin` | `Option<f32>` | top₁ − top₂ softmax | Hybrid active |
| `ParseResult.confidence` | `i32` | Separate UI/legacy confidence integer — **not** hybrid probability | Always |
| Classical violations | `Vec<String>` | Always **empty** until D01 (`classical_violations_for_metre`) | N/A |

### 3.1 Training export score semantics

`ParseOptions::poem_variations_training()` sets **`skip_ml_metre: true`** → CSV/JSONL `top_score` / `predicted_metre` are **heuristic + dense boost only**, not hybrid probabilities.  
Monte Carlo adopt metrics on `special_type` use the same eval parse options unless a step **explicitly** enables hybrid.

### 3.2 Dual-truth (semantics of fusion)

- **ML channel** (`ml_metre` / head outputs) and **classical channel** (`classical_metre` / violations) are **parallel**.  
- **Forbidden:** silently subtract classical violations from hybrid / heuristic scores without an explicit A02/D policy.  
- Classical checker **stays empty** for S01 (not D01; `allow_classical` not granted).

---

## 4. Gold labels (anthology → `MetreType`)

### 4.1 Primary fields

| Field | Meaning |
|-------|---------|
| `parent_metre` | Coarse gold **slug** on the anthology tree (`venpaa`, `aciriyappa`, `kalippaa`, `vanjippaa`) |
| `row_kind` | `special_type` or `variation` |
| `gold_metre_type_for_parent(slug)` | Maps slug → `MetreType` (fixed four only) |
| `gold_metre_label_for_parent(slug)` | Maps slug → wire-style label string (`Venpaa`, …) |

### 4.2 Slug → wire metre (intentional asymmetries)

| Anthology slug (`parent_metre`) | `MetreType` / wire JSON | Notes |
|---------------------------------|-------------------------|-------|
| `venpaa` | `Venpaa` | lower-case slug |
| `aciriyappa` | `Aciriyappaa` | **one** *a* in slug; **double** *a* on wire (`Aciriyappaa`) |
| `kalippaa` | `Kalippaa` | |
| `vanjippaa` | `Vanjippaa` | |
| unknown | `None` | not gold |

ML class indices (`METRE_ML_NUM_CLASSES = 4`): Venpaa=0, Aciriyappaa=1, Kalippaa=2, Vanjippaa=3.  
`MetreType::Other` is **not** a gold class and has **no** class index.

### 4.3 `special_type` vs `variation` (supervision policy)

| Slice | Role | Training / ADOPT? |
|-------|------|-------------------|
| **`special_type`** | **Primary gold** | Yes — fit + adopt metrics |
| **`variation`** | Stress / disagreement / poisoning risk | **Report only** unless a step explicitly invents / relabels them |
| Kural golden fixture | Dense regression | Not multi-class train |

**S01 anthology split allowed:** read-only inspection of gold slug map + schema on exported vectors; **no** bulk train on `variation`. Metrics (if measured) report `special_type` primary and `variation` separately.

---

## 5. Machine keys vs presentation

### 5.1 Principle

| Layer | Location | Content |
|-------|----------|---------|
| **Machine / logic** | `ParseResult` fields outside `presentation` | Latin enum renames (`VenTalai`, `Aciriyappaa`), Ner/Nirai patterns, dense floats |
| **Presentation** | `ParseResult.presentation` (`DisplayResult`) | Tamil metre names, classical foot mnemonics, தளை display strings |

**Invariant:** Trainers, hybrid head, dense features, and gold compare **must not** depend on `presentation.*` strings. Presentation may change for UX without a dense schema bump **only if** logic-layer enums and formulas are unchanged.

### 5.2 Metre display map

| Machine (`MetreType` JSON) | Presentation (`presentation.metre_type`) |
|----------------------------|------------------------------------------|
| `Venpaa` | வெண்பா |
| `Aciriyappaa` | ஆசிரியப்பா |
| `Kalippaa` | கலிப்பா |
| `Vanjippaa` | வஞ்சிப்பா |
| `Other(s)` | `s` passthrough |

### 5.3 Syllable display

| Machine | Presentation |
|---------|--------------|
| `Ner` | நேர் |
| `Nirai` | நிரை |

### 5.4 Foot display

- Logic: `Foot.foot_type` = `Ner` / `Nirai` / `Ner-Ner` / …  
- Presentation: `foot_type_tamil`, `foot_type_latin`, combined `foot_type` (`தமிழ் · latin`) via `foot_pattern_labels`.

### 5.5 Talai / linkage display

- Logic: `linkage_type` + `linkage_special_type` (wire Latin keys).  
- Presentation: `presentation.talai[].talai_type` Tamil strings (e.g. `இயற்சீர் வெண்டளை`); falls back to coarse family Tamil when special is `Unknown`.

---

## 6. Serde alias table (deserialize-only legacy)

**Rule:** New writes always emit **canonical rename**. Aliases exist only so old JSON still deserializes.

### 6.1 `LinkageType`

| Canonical write | Accepted on read |
|-----------------|------------------|
| `VenTalai` | `Venthalai` |
| `AciriyaTalai` | `Aciriyathalai`, `Aasiriyathalai`, `AsiriyaTalai` |
| `KaliTalai` | `Kalithalai` |
| `VanjiTalai` | `Vanjithalai` |

### 6.2 `LinkageSpecialType`

| Canonical write | Accepted on read |
|-----------------|------------------|
| `NerondriyaAciriyaTalai` | `NerondriyaAciriyathalai`, `NerondriyaAasiriyathalai` |
| `NiraiondriyaAciriyaTalai` | `NiraiondriyaAciriyathalai`, `NiraiondriyaAasiriyathalai` |
| `IyarcirVenTalai` | `IyarcirVenthalai` |
| `VencirVenTalai` | `VencirVenthalai` |
| `KaliTalai` | `Kalithalai` |
| `OndriyaVanjiTalai` | `OndriyaVanchithalai` |
| `OndrathaVanjiTalai` | `OndrathaVanchithalai` |
| `Unknown` | — |

### 6.3 `MetreType`

| Canonical write | Accepted on read |
|-----------------|------------------|
| `Aciriyappaa` | `Asiriyappaa` |
| `Venpaa` / `Kalippaa` / `Vanjippaa` | (no legacy aliases beyond default enum tags) |

Source: `#[serde(rename = …, alias = …)]` on enums in `linkage.rs`, `metre/mod.rs`. Unit tests in those modules + S00/S01 locks.

---

## 7. Ontology entities touched (read-only for S01)

S01 does **not** add entities. It pins **meanings** of:

| Entity / symbol | How semantics attaches |
|-----------------|------------------------|
| `ParseFeatureSnapshot.dense[j]` | Exact formulas + schema version |
| `LinkageType` / `LinkageSpecialType` | Dense bin order + wire keys + aliases |
| `MetreType` / ML class index | Gold map + score channels |
| `MetreHypothesis` score fields | Integer vs probability scales |
| `parent_metre` / `row_kind` | Gold meaning + supervision policy |
| `presentation` | Human labels only |
| Classical channel | Empty; no fusion |

---

## 8. Semantic invariants to test (S01 checklist)

1. `PARSE_FEATURE_SCHEMA_VERSION == 1` and `PARSE_FEATURE_DENSE_LEN == 51`.  
2. Block offsets sum: 12+7+8+16+8 = 51.  
3. Global feature id list length 12; reserved linkage type slots 4–5 remain unused in index map.  
4. Dense special slot ids == `ontology_linkage_special_ids()` order.  
5. Golden kural fixture `schema_version` matches constant; dense length 51.  
6. Gold: four slugs map bijectively to four fixed metres / ML class indices; unknown slug → `None`.  
7. `aciriyappa` → `Aciriyappaa` (slug vs wire asymmetry).  
8. Canonical serde **write** keys match tables; legacy aliases **read** only.  
9. Presentation metre strings are Tamil; machine metre JSON is Latin wire keys.  
10. `classical_violations_for_metre` returns `[]` for all fixed metres (S01 / pre-D01).  
11. Training options: `poem_variations_training().skip_ml_metre == true`.  
12. Softmax sum ≈ 1 when hybrid probabilities present (existing ml_head tests).

---

## 9. Anthology split allowed for this step

| Allowed | Forbidden |
|---------|-----------|
| Use `gold_metre_*_for_parent` on any row kind for **mapping tests** | Treat `variation` top-1 as ADOPT criterion |
| Read special_type / variation only to assert `row_kind` strings | Bulk-train hybrid weights on variation (poison) |
| Reference kural golden for dense schema | Invent new gold slugs without contract bump |
| Report metrics split if measured | Fuse classical violations into scores |

Primary gold remains **`special_type`**. **`variation` = stress only** for S01.

---

## 10. Drift policy

| Change | Required bumps / actions |
|--------|--------------------------|
| Dense formula or layout | `PARSE_FEATURE_SCHEMA_VERSION`, PARSE_FEATURES.md, golden fixture, `SEMANTICS_CONTRACT_VERSION`, hybrid refit if inputs change |
| Gold slug set or meaning | `SEMANTICS_CONTRACT_VERSION`, training docs, S02 inventory if counts change |
| New wire key / drop alias | Document here; keep aliases until consumers migrate |
| Presentation-only Tamil copy | No dense schema bump if logic enums unchanged |
| Classical rules live | D01 + dual-truth policy; not S01 |

---

## 11. Related artifacts

| Artifact | Path |
|----------|------|
| Dense formulas | `tamil-seiyul-alagi/PARSE_FEATURES.md` |
| Score / hybrid reasoning | `tamil-seiyul-alagi/METRE_PREDICTION.md` |
| Ontology freeze | `data/training/reports/ontology_map.md` |
| Anthology inventory | `data/training/reports/anthology_inventory.md` (S02) |
| Training workflow | `tamil-seiyul-alagi/TRAINING_PROCESS.md` |
| Wire traversal | `tamil-seiyul-alagi/CANONICAL_JSON_TRAVERSAL.md` |
| Step pack | `data/training/reports/step_S01_semantics_contract/` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-27 | S01 initial freeze: dense glossary, score scales, gold map, serde aliases, presentation vs machine |
