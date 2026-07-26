# S02_anthology_inventory — SOA delta

**Step:** `S02_anthology_inventory`  
**Date:** 2026-07-27  
**Decision:** `ADOPT`  
**improved:** `true` (SOA-foundation value)  
**soa_ok:** `true`

## Ontology

| Change | Detail |
|--------|--------|
| Entity set | **Unchanged** (S00 freeze) |
| Catalog code | **No new ontology entities** |
| Classical | **Empty** — dual-truth remains parallel; forbidden-use pin `fuse_classical_into_ml_score` |

## Semantics

| Change | Detail |
|--------|--------|
| Dense formulas | **Unchanged** (S01 freeze) |
| Schema pins | Consumer re-assert `PARSE_FEATURE_SCHEMA_VERSION = 1`, dense len 51 |
| Gold slug map | **Unchanged** — four S01 parents; inventory does not reparent |
| Schema bump | **Not required** — no dense meaning change |

## Anthology

| Change | Detail |
|--------|--------|
| **Machine pins** | `tamil-seiyul-alagi/src/anthology_inventory.rs` + crate-root re-exports |
| **Version** | `ANTHOLOGY_INVENTORY_VERSION = 1` |
| Totals | 36 all; **17** `special_type` (primary); **19** `variation` (stress) |
| Blocks | venpaa 10/6; aciriyappa 3/5; kalippaa 2/5; vanjippaa 2/3 |
| Class balance (primary) | venpaa 10 (58.8%), aciriyappa 3, kalippaa 2, vanjippaa 2 |
| Split policy | **`special_type` = primary gold**; **`variation` = stress only** |
| Export paths | CSV / JSONL / JS mirror pinned + fingerprints refreshed on measure |
| Kural golden | path + role `parse_feature_regression_not_multiclass_train` |
| Forbidden uses | 10 machine ids via `anthology_forbidden_training_use_ids` |
| Label note | `sinthadi_aciriyappaa` → parent `vanjippaa` (tree, not id string) |
| Human artifacts | `anthology_inventory.md` + `.json` |
| Integration | `tests/test_anthology_inventory_s02.rs` **green** (10/10) |
| Measure | MC / PCA / hybrid / linkage / export examples re-run; primary top-1 **1.0** |

## Drift policy

- Bump `ANTHOLOGY_INVENTORY_VERSION` + inventory docs when sample add/remove/relabel or block lengths change.  
- Re-export CSV/JSONL after parser / dense schema changes; refresh fingerprints.  
- S03 ledger fingerprints this inventory version + counts + export hashes.  
- No classical scoring merge; no bulk train on variation without relabel.  
