# Parse feature vector (51 dimensions)

Structured numeric features for metre confidence boosting and downstream small models. **No raw poem text** is encoded—only counts and histograms from the parse pipeline (`syllables`, `feet`, `linkage`, `lines`).

| Constant | Value |
|----------|--------|
| `PARSE_FEATURE_SCHEMA_VERSION` | `1` |
| `PARSE_FEATURE_DENSE_LEN` | `51` |

**Implementation:** [`src/parse_features.rs`](src/parse_features.rs) (`ParseFeatureVector`, `ParseFeatureSource::from_pipeline`, `ParseFeatureSnapshot::from(&ParseResult)`).  
**Metre boost and coarse-metre prediction:** [`src/metre/prediction.rs`](src/metre/prediction.rs) `boost_metre_hypotheses_with_dense` uses indices **12–18** (linkage type) and **22–26** (linkage special) only. End-to-end metre prediction (heuristic + hybrid, failure modes): **[`METRE_PREDICTION.md`](METRE_PREDICTION.md)**.

**Pipeline:** In `parse_poem` ([`src/lib.rs`](src/lib.rs)), when metre detection is on (`no_detect == false`), features are built from `ParseFeatureSource { letter_count, vikalpa_count, lines, syllables, feet, linkage }`, stored on [`ParseResult::parse_features`](src/types.rs), and the same dense slice is passed to the metre boost. With `no_detect == true`, `parse_features` is omitted (`None`).

**WASM:** `parse_poem_wasm` serializes the full `ParseResult`, including optional `parse_features` and `top_k_metre_hypotheses` (up to four rows, sorted by score after boost).

**Golden vector:** [`tests/test_data/kural_venpaa_parse_features.json`](tests/test_data/kural_venpaa_parse_features.json) (ஒரு விகற்ப குறள் வெண்பா sample); regression test in `parse_features` tests.

**Training workflow:** [`TRAINING_PROCESS.md`](TRAINING_PROCESS.md).

Bump **`PARSE_FEATURE_SCHEMA_VERSION`** and this document whenever the layout changes.

---

## Block overview

| Index range | Length | Rust offset constant | Role |
|-------------|--------|------------------------|------|
| `[0, 12)` | 12 | `GLOBAL_FEATURE_OFFSET` | Global counts and ratios |
| `[12, 19)` | 7 | `LINKAGE_TYPE_FEATURE_OFFSET` | Normalized `LinkageType` histogram |
| `[19, 27)` | 8 | `LINK_SPECIAL_FEATURE_OFFSET` | Normalized `LinkageSpecialType` histogram |
| `[27, 43)` | 16 | `FOOT_PATTERN_BIN_OFFSET` | FNV-1a bins over `foot.foot_type` |
| `[43, 51)` | 8 | `LINE_FOOT_HIST_OFFSET` | Feet-per-line histogram |

---

## Indices 0–11 — global (`GLOBAL_FEATURE_DIM = 12`)

Built from `ParseFeatureSource` / `ParseResult`: `letter_count`, `vikalpa_count`, `lines` (`&[Line]`), `syllables`, `feet`, `linkage`.

| Index | Name (conceptual) | Formula / source |
|-------|-------------------|-------------------|
| `0` | `log_letters` | `ln(1 + letter_count)` (grapheme count in `parse_poem`) |
| `1` | `vikalpa_count` | `1` if `alt_scansion`, else `0` (mirrors `ParseResult.vikalpa_count`) |
| `2` | `line_count` | `lines.len()` as `f32` |
| `3` | `foot_count` | `feet.len()` as `f32` |
| `4` | `syllable_count` | `syllables.len()` as `f32` |
| `5` | `mean_feet_per_line` | Sum of `ln.feet.len()` over lines, divided by `max(lines.len(), 1)` |
| `6` | `max_feet_per_line` | Max of `ln.feet.len()` over lines |
| `7` | `mean_syllables_per_foot` | Sum of `foot.syllables.len()` over feet, divided by `max(feet.len(), 1)` (0 if no feet) |
| `8` | `max_syllables_per_foot` | Max of `foot.syllables.len()` over feet |
| `9` | `ner_ratio` | Count of syllables with `Ner` / `max(ner + nirai, 1)` |
| `10` | `nirai_ratio` | Count of syllables with `Nirai` / `max(ner + nirai, 1)` |
| `11` | `linkage_edge_count` | `linkage.len()` as `f32` |

---

## Indices 12–18 — linkage type (`LINKAGE_TYPE_FEATURE_DIM = 7`)

For each bond in `linkage`, increment the slot for its `linkage_type`, then **divide every slot by `max(linkage.len(), 1)`** so the vector sums to `1.0` when there is at least one edge (else all zeros).

| Index | `LinkageType` variant (JSON string; legacy aliases still deserialize) |
|-------|------------------------|
| `12` | `VenTalai` (was `Venthalai`) |
| `13` | `AciriyaTalai` (was `Aciriyathalai`) |
| `14` | `KaliTalai` (was `Kalithalai`) |
| `15` | `VanjiTalai` (was `Vanjithalai`) |
| `16` | *(reserved; always zero in schema v1)* |
| `17` | *(reserved; always zero in schema v1)* |
| `18` | `Other(_)` |

---

## Indices 19–26 — linkage special (`LINK_SPECIAL_FEATURE_DIM = 8`)

Same normalization: each slot is the **fraction** of edges with that `linkage_special_type` (denominator `max(linkage.len(), 1)`).

| Index | `LinkageSpecialType` variant (JSON string) |
|-------|-------------------------------|
| `19` | `NerondriyaAciriyaTalai` (was `NerondriyaAciriyathalai`) |
| `20` | `NiraiondriyaAciriyaTalai` (was `NiraiondriyaAciriyathalai`) |
| `21` | `IyarcirVenTalai` (was `IyarcirVenthalai`) |
| `22` | `VencirVenTalai` (was `VencirVenthalai`) |
| `23` | `KaliTalai` (same Rust variant name; JSON was `Kalithalai`) |
| `24` | `OndriyaVanjiTalai` (was `OndriyaVanchithalai`) |
| `25` | `OndrathaVanjiTalai` (was `OndrathaVanchithalai`) |
| `26` | `Unknown` |

**Metre boost usage:** Kalippaa uses `dense[23]` (`KaliTalai` special); Vanjippaa uses `dense[24] + dense[25]`; Venpaa adds a small term from that vanji sum.

---

## Indices 27–42 — foot pattern bins (`FOOT_PATTERN_BIN_DIM = 16`)

Per foot, `h = fnv1a_u32(foot.foot_type.as_bytes()) % 16` (see `fnv1a_u32` in `parse_features.rs`). Each bin accumulates `1 / max(feet.len(), 1)` so bins sum to `1.0` when there is at least one foot.

`foot_type` is the hyphenated Ner/Nirai pattern for one linguistic word (e.g. `Ner-Ner`, `Nirai-Ner-Nirai`).

---

## Indices 43–50 — line foot histogram (`LINE_FOOT_HIST_FEATURE_DIM = 8`)

For each physical line, count feet (`ln.feet.len()`), map to a bin `b`, then add `1 / max(lines.len(), 1)` to `dense[43 + b]`.

| Index | Bin `b` | Feet on line (`ln.feet.len()`) |
|-------|---------|---------------------------------|
| `43` | `0` | `0` |
| `44` | `1` | `1` |
| `45` | `2` | `2` |
| `46` | `3` | `3` |
| `47` | `4` | `4` |
| `48` | `5` | `5`–`8` |
| `49` | `6` | `9`–`12` |
| `50` | `7` | `13` or more |

---

## JSON export

```bash
cd tamil-seiyul-alagi
cargo run --example dump_parse_features -- 'கற்றது'
```

Emits `{ "schema_version": 1, "dense": [ ... 51 floats ... ] }`.
