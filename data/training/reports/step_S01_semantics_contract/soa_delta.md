# S01_semantics_contract — SOA delta

**Step:** `S01_semantics_contract`  
**Date:** 2026-07-27  
**Decision:** `ADOPT`  

## Ontology

| Change | Detail |
|--------|--------|
| Entity set | **Unchanged** (S00 freeze) |
| Dense bins | Still **derived observables**, not new ontology primitives |
| Classical | **Empty** — dual-truth channels remain parallel |

## Semantics

| Change | Detail |
|--------|--------|
| **New public pin module** | `pub mod semantics_contract` + `SEMANTICS_CONTRACT_VERSION = 1` |
| Dense glossary | Named ids for global[12], linkage-type slots[7] (incl. reserved), special slots[8] |
| Layout lock | Block lengths `[12, 7, 8, 16, 8]` sum to 51; offsets 0/12/19/27/43 |
| Schema pins | `PARSE_FEATURE_SCHEMA_VERSION = 1`, `PARSE_FEATURE_DENSE_LEN = 51` |
| Score scales | Documented: pre-hybrid integer vs post-hybrid ≈100×prob vs `metre_probability` |
| Training scores | `poem_variations_training().skip_ml_metre == true` locked in tests |
| Gold slug map | `venpaa`/`aciriyappa`/`kalippaa`/`vanjippaa` → fixed `MetreType` + ML class index |
| Serde | Canonical write keys; legacy aliases deserialize-only (documented + tests) |
| Presentation | Tamil labels in `presentation`; machine Latin wire keys for logic/ML |
| Doc | `data/training/reports/semantics_contract.md` |

**No dense formula or histogram semantics changed** — only named + tested.

## Anthology

| Change | Detail |
|--------|--------|
| Corpus contents | **No row add/remove** |
| Export refresh | CSV/JSONL regenerated (36 rows) via portfolio §6.4 examples |
| Split policy | **`special_type` = primary gold**; **`variation` = stress only** |
| Gold mapping | Read-only pin tests; no bulk train on variation |
| Fingerprint | Deferred to S02 inventory + S03 ledger |

## Drift policy

- Bump `SEMANTICS_CONTRACT_VERSION` if dense meaning, gold slugs, score-scale contract, or wire-key tables change.  
- Bump `PARSE_FEATURE_SCHEMA_VERSION` (+ golden fixture + PARSE_FEATURES.md) if layout/formulas change.  
- Presentation-only Tamil copy may change without dense schema bump **only if** logic enums/formulas unchanged.  
- Classical must not fuse into hybrid/heuristic scores without A02/D policy.  
