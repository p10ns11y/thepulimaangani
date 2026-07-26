# SOA ledger — Semantics · Ontology · Anthology (S03)

**Status:** `ADOPT` — composite freeze for metre-ML SOA foundation (ledger written)  
**Date:** 2026-07-27  
**Step:** `S03_soa_ledger`  
**Pillar focus:** soa-all  
**Contract:** [`tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md`](../../../tamil-seiyul-alagi/METRE_ML_METHODS_PORTFOLIO.md) §5.0 `S03_soa_ledger`, §5.2  
**Machine twin:** [`soa_ledger.json`](soa_ledger.json)  
**Machine pins:** `tamil-seiyul-alagi/src/soa_ledger.rs` (`SOA_LEDGER_VERSION = 1`, crate-root re-exports)

**Depends on:** S00 ([`ontology_map.md`](ontology_map.md)), S01 ([`semantics_contract.md`](semantics_contract.md)), S02 ([`anthology_inventory.md`](anthology_inventory.md) + [`.json`](anthology_inventory.json)).

**Scope:** single ledger of ontology versions, semantics schema ids, anthology fingerprint, dual-truth / classical isolation, and split policy so Tier A (`A00+`) can refuse work under `require_soa` when SOA drifts.

**Out of scope:** inventing entities (S00), relabeling dense meaning (S01), adding/removing anthology rows (S02), classical rule implementation (D01+), method training (A\*/B\*/C\*).

---

## 0. Schema fingerprint (machine)

```text
soa=1;ont=1;sem=1;anth=1;dense_schema=1;dense_len=51;parse_result=1;ml_weight=3
```

| Id | Value | Module / source |
|----|------:|-----------------|
| `SOA_LEDGER_VERSION` | **1** | `soa_ledger.rs` |
| `ONTOLOGY_MAP_VERSION` | **1** | `ontology_map.rs` |
| `SEMANTICS_CONTRACT_VERSION` | **1** | `semantics_contract.rs` |
| `ANTHOLOGY_INVENTORY_VERSION` | **1** | `anthology_inventory.rs` |
| `PARSE_FEATURE_SCHEMA_VERSION` | **1** | `parse_features.rs` |
| `PARSE_FEATURE_DENSE_LEN` | **51** | `parse_features.rs` |
| `PARSE_RESULT_SCHEMA_VERSION` | **1** | `types.rs` |
| `METRE_ML_WEIGHT_SCHEMA` | **3** | `metre/ml_head.rs` |

Public API: `soa_schema_ids()`, `soa_schema_fingerprint_string()`, `soa_corpus_fingerprints()`, `SOA_LEDGER_VERSION`.  
Integration lock: `tests/test_soa_ledger_s03.rs`.

**Bump policy:** regenerate this ledger (and prefer bumping `SOA_LEDGER_VERSION`) when any constituent version, dense layout/formulas, gold slug map, anthology counts/paths/forbidden uses, or dual-truth policy changes. Silent renumbering is **forbidden**.

---

## 1. Ontology (what exists) — S00

| Layer | Entities | Pins |
|-------|----------|------|
| Structure | Poem → Line → Foot → Syllable → Letter | `ontology_structural_entity_ids()` |
| Prosodic class | Ner, Nirai | `ontology_syllable_type_ids()` |
| Cir (சீர்) | Maa, Vilam, Kaai, Kani | `ontology_cir_class_ids()` |
| Linkage coarse | VenTalai, AciriyaTalai, KaliTalai, VanjiTalai (+ open Other) | `ontology_linkage_type_fixed_ids()` |
| Linkage special | 8 wire keys incl. Unknown (dense order 0..7) | `ontology_linkage_special_ids()` |
| Issue #36 table | 4 cir × 2 first-acai = **8** cells | `ontology_issue36_bond_table_len()` |
| Metre (fixed) | Venpaa, Aciriyappaa, Kalippaa, Vanjippaa (+ open Other) | `ontology_metre_type_fixed_ids()` |
| Truth channels | `ml_metre`, `classical_metre` — **parallel, never fused** | `ontology_dual_truth_channel_ids()` / `soa_dual_truth_channel_ids()` |
| Features | `ParseFeatureSnapshot` dense[51] | **Derived observables**, not ontology primitives |

**Scope note (v1):** foot ≈ linguistic word today. Foot lattice as first-class ontology is a future version bump.

**Classical:** `classical_violations_for_metre` always returns `[]`. `soa_classical_checker_active() == false` until D01+ with `allow_classical`.

**Entities touched by this ledger (no new terms):** structural hierarchy, Cir/Talai/Metre closed catalogs, dual-truth nodes, dense feature snapshot as derived surface only.

---

## 2. Semantics (what symbols mean) — S01

| Symbol family | Frozen meaning |
|---------------|----------------|
| `dense[0..51)` | Formulas in `PARSE_FEATURES.md` / `parse_features.rs`; layout `[12,7,8,16,8]` @ offsets 0/12/19/27/43 |
| `dense[19..27)` special bins | Order **must** match `ontology_linkage_special_ids()` |
| `aggregate_score` pre-hybrid | Arbitrary integer scale — not a probability |
| `metre_probability` post-hybrid | Softmax mass; needs calibration (A07) for honesty |
| Training export scores | `ParseOptions::poem_variations_training().skip_ml_metre == true` |
| Gold `parent_metre` | Slugs `venpaa` / `aciriyappa` / `kalippaa` / `vanjippaa` → fixed `MetreType` |
| Slug asymmetry | `aciriyappa` (one *a*) → wire `Aciriyappaa` |
| Machine keys | Latin wire keys (`VenTalai`, `special_type_score` snake_case in matrices) |
| Presentation | Tamil/Latin display labels only — not training matrix keys |
| Serde | Canonical write keys; legacy aliases deserialize-only |

**Primary vs stress (portfolio §5.2):**

| `row_kind` | Role | Adopt metrics? |
|------------|------|----------------|
| **`special_type`** | **Primary gold** | **Yes** |
| **`variation`** | Stress / adversarial only | Report separately; **never sole ADOPT** |

---

## 3. Anthology (what evidence we trust) — S02

| Slice | N | Training role |
|-------|--:|---------------|
| All label rows | **36** | Universe of curated samples |
| `special_type` | **17** | Primary train/eval gold |
| `variation` | **19** | Stress only (unless relabeled + inventory bump) |
| Kural golden fixture | 1 vector | Parse-feature regression — **not** multi-class train |
| External poems | 0 | Growth only via Tier C + inventory policy |

### 3.1 Per-metre block balance

| `parent_metre` | special_type | variation | total |
|----------------|-------------:|----------:|------:|
| venpaa | 10 | 6 | 16 |
| aciriyappa | 3 | 5 | 8 |
| kalippaa | 2 | 5 | 7 |
| vanjippaa | 2 | 3 | 5 |

**Class imbalance (special_type):** venpaa 10/17 ≈ 58.8%; kalippaa and vanjippaa only 2 each.

**Tree pin:** `sinthadi_aciriyappaa` → `parent_metre = vanjippaa` (do not re-parent from sample id string).

### 3.2 Export paths

| Artifact | Path |
|----------|------|
| CSV | `data/training/poem_variations_training.csv` |
| JSONL | `data/training/poem_variations_training.jsonl` |
| JS mirror | `data/poem_variations.js` |
| Kural golden | `tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json` |

Regenerate exports:

```bash
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_csv
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example export_poem_variations_training_jsonl
```

### 3.3 Corpus fingerprints (S03 freeze)

SHA-256 of sources at **S03 ledger freeze** (re-read from S02 inventory; must match until re-export).  
Machine pin: `soa_corpus_fingerprints()` → `&[(&'static str, u64, &'static str)]` as `(path, bytes, sha256_hex)`.

| File | bytes | sha256 |
|------|------:|--------|
| `data/training/poem_variations_training.csv` | 29923 | `ba662c50ab7c1f64b7f27e7bd29efe90d03ab5e0fe8b01ed531ff7de0041a4f0` |
| `data/training/poem_variations_training.jsonl` | 198632 | `64e24eb07e578f2ee550935c596e4d84c3fc871eb7a80d3c8cf625d0107f4183` |
| `data/poem_variations.js` | 27306 | `bab20f8752451dcf61e66cb83bf488b58f92fc892fb8a938ea14d80704306cf5` |
| `tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json` | 560 | `6f8fcfd04db7beb2c3668230595ddf2283922d93cbaf1443af0b53c5f4e294c0` |

Canonical sample tables: `tamil-seiyul-alagi/src/poem_variations.rs`.

### 3.4 Forbidden training uses (machine ids)

From `anthology_forbidden_training_use_ids()`:

1. `bulk_train_variation_without_relabel`
2. `variation_as_sole_adopt_criterion`
3. `kural_fixture_as_multiclass_train`
4. `raw_text_as_dense_linear_input`
5. `train_outside_declared_split_without_rebaseline`
6. `invent_ontology_or_relabel_dense_semantics`
7. `fuse_classical_into_ml_score`
8. `predicted_metre_as_gold`
9. `reparent_sinthadi_from_id_string`
10. `external_poems_without_inventory_policy`

---

## 4. How every ML step uses this ledger

1. **Tests** assert ontology enum coverage + semantic invariants before new code (S00/S01 pins + this composite).  
2. **Implementation** only reads anthology splits declared for that step (`special_type` primary unless step explicitly invents variation use).  
3. **Measure** reports metrics **and** SOA deltas (new terms? schema bump? corpus fingerprint change?).  
4. **ADOPT** requires no unapproved SOA drift relative to this ledger.  
5. **`require_soa`:** refuse A\* if this ledger (or `SOA_LEDGER_VERSION` surface) is missing/stale.  
6. **Classical:** stays empty unless step is D01+ **and** `allow_classical` was granted.

---

## 5. Concrete notes for S03 consumers (A00+)

### 5.1 Ontology entities touched (no invention)

- Poem / Line / Foot / Syllable / Letter hierarchy (parse surface)  
- `MetreType` fixed four + gold slug map  
- `LinkageType` / `LinkageSpecialType` (features / export; not gold)  
- Dual-truth channel names; classical channel empty  
- dense[51] as derived observables only  

### 5.2 Semantic invariants to test

| Invariant | Pin / test surface |
|-----------|-------------------|
| Schema fingerprint string exact | `soa_schema_fingerprint_string()` / `s03_*` |
| dense len 51, schema v1, blocks sum | S01 + S03 |
| Special slot order == ontology catalog | S01 + S03 |
| special_type N=17, variation N=19, total 36 | S02 + S03 |
| Block lengths 10+6 / 3+5 / 2+5 / 2+3 | S02 + S03 |
| Gold slugs only four listed | S01 + S02 |
| `sinthadi_aciriyappaa` → vanjippaa | S02 + S03 |
| Primary gold isolable via filter helpers | S01 + S02 + S03 |
| `classical_violations_for_metre` empty | S00 + S03 |
| `soa_classical_checker_active() == false` | S03 |
| Forbidden-use catalog ≥10 ids | S02 + S03 |
| Presentation keys ≠ machine matrix keys | S01 docs |

### 5.3 Anthology split allowed for S03

| Allowed | Forbidden |
|---------|-----------|
| Read/fingerprint S00–S02 artifacts | Bulk-train variation without relabel |
| Assert composite schema id freeze | Variation as sole ADOPT criterion |
| Document dual-truth + classical empty | Fill classical_checker (D01 only) |
| Reference export hashes from S02 | Fuse classical into ML scores |
| Plan A00 baseline against this ledger | Invent ontology / relabel dense mid-step |
| Use special_type as primary gold only | Train outside declared split without re-baseline |
| Report variation stress separately | Treat kural fixture as multi-class train |
| | Treat predicted_metre as gold |

**Declared split:** `special_type` primary gold N=17; `variation` stress only N=19. No held-out split yet — prefer LOO/bootstrap stratified by `parent_metre`.

---

## 6. Report path index

| Key | Path |
|-----|------|
| ontology_map | `data/training/reports/ontology_map.md` |
| semantics_contract | `data/training/reports/semantics_contract.md` |
| anthology_inventory | `data/training/reports/anthology_inventory.md` |
| anthology_inventory_json | `data/training/reports/anthology_inventory.json` |
| soa_ledger | `data/training/reports/soa_ledger.md` |
| soa_ledger_json | `data/training/reports/soa_ledger.json` |

---

## 7. Baseline metrics snapshot (pre-A00, no damage)

Re-measured at S03 ADOPT (portfolio §6.4; heuristic/hybrid on current weights — **not** new scores from S03):

| Slice | top-1 | MRR | notes |
|-------|------:|----:|-------|
| special_type (N=17; MC 17×20=340) | **1.0** | **1.0** | Primary; no damage |
| variation (N=19; MC 19×20=380) | **0.1579** | **0.4956** | Stress only |
| all rows (MC 36×20=720) | **0.5556** | **0.7338** | Includes stress |

S03 does not re-fit numeric hybrid weights or change dense formulas (fit example comment-only side effect).

---

## 8. Decision

| Field | Value |
|-------|-------|
| Step | `S03_soa_ledger` |
| Decision | **ADOPT** |
| improved | **true** (SOA-foundation value; composite `require_soa` surface) |
| soa_ok | **true** |
| Primary metric damage | **None** — special_type top-1 remains **1.0** (MC 340/340) |
| Variation stress | top-1 **0.1579** (MC 60/380) — not adopt criterion |
| Follow-on | `A00_baseline_freeze` may start; do not start D01 without A12 + `allow_classical` |

**Ledger written:** this file + [`soa_ledger.json`](soa_ledger.json) + machine pin `tamil-seiyul-alagi/src/soa_ledger.rs`.

Step pack: [`step_S03_soa_ledger/`](step_S03_soa_ledger/).
