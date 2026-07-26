# S00_ontology_map — SOA delta

**Step:** `S00_ontology_map`  
**Date:** 2026-07-27  
**Decision:** ADOPT  

## Ontology

| Change | Detail |
|--------|--------|
| **New public catalog** | `pub mod ontology_map` with frozen id lists + `ONTOLOGY_MAP_VERSION = 1` |
| **Structural ids** | `Poem`, `Line`, `Foot`, `Syllable`, `Letter` |
| **Closed sets locked** | SyllableType (Ner/Nirai); CirAcaiClass (Maa/Vilam/Kaai/Kani); MetreType fixed 4; LinkageType fixed 4; LinkageSpecialType 8 wire keys |
| **#36 table** | `ontology_issue36_bond_table_len() == 8`; unit tests cover all cir × first-acai cells |
| **Dual-truth nodes** | `ml_metre` ∥ `classical_metre` named in catalog; classical checker remains empty |
| **Doc map** | `data/training/reports/ontology_map.md` inventory freeze |

**No new ontology *terms* invented beyond shipped parse types.** Catalog is a read-only index of existing enums/hierarchy.

## Semantics

| Change | Detail |
|--------|--------|
| Dense formulas | **Unchanged** (S01 owns glossary) |
| Schema pins in S00 tests | `PARSE_FEATURE_SCHEMA_VERSION = 1`, `PARSE_FEATURE_DENSE_LEN = 51`, linkage dims 7+8 |
| Score scales | **Unchanged** |
| Gold slug bridge | Unit test still maps `parent_metre` → `MetreType` (training bridge only) |

## Anthology

| Change | Detail |
|--------|--------|
| Corpus contents | **No intentional row add/remove** |
| Export refresh | CSV/JSONL regenerated (36 rows) via portfolio §6.4 examples |
| Primary gold | Metrics computed on **`special_type`** (17 rows) |
| Stress | **`variation`** reported separately (19 rows) |
| Fingerprint | Deferred to S02 inventory + S03 ledger |

## Drift policy

- Bump `ONTOLOGY_MAP_VERSION` if catalog ids, #36 cardinality, or dual-truth channel set changes.  
- Any new enum variant must update catalog helpers + fail exhaustiveness tests until lists match.  
- Classical channel must not fuse into hybrid score without explicit A02/D policy.  
