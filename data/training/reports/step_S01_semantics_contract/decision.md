# S01_semantics_contract — decision

**Status:** `ADOPT`  
**Date:** 2026-07-27  
**Pillar:** Semantics (SOA foundation)  
**improved:** `true` (SOA-foundation value; not a measured scoring gain)

## Rationale

S01 freezes **what symbols mean** in measurement: dense index glossary, score scales, gold-label mapping, serde aliases, presentation vs machine keys. No metre head / weight / dense formula change.

| Criterion | Result |
|-----------|--------|
| SOA artifacts complete | **Yes** — `semantics_contract.md`, public pin API, unit + integration tests, this decision pack |
| Tests / schema | **Green** — crate tests pass; `SEMANTICS_CONTRACT_VERSION = 1`; dense schema still v1 / len 51 |
| Primary metric (`special_type` top-1) | **1.0** (17/17; MC 340/340 @ 20 iters) — **no damage** (≤2pp tolerance) |
| Variation stress | **0.1579** (3/19; MC 60/380) — reported only |
| Unique interpretability | **Yes** — dense glossary ids, gold slug table, score-scale channel ids, alias + presentation rules |

**ADOPT** because: complete SOA semantics freeze + unique interpretability and no top-1 damage.  
**Not REJECT:** tests green; contract matches portfolio §5.2 and PARSE_FEATURES; not a no-value step.  
**Not DEFER:** not blocked on data or dependencies (S00 pins exist; classical stays empty pre-D01).

## What was adopted

1. **Human contract:** [`data/training/reports/semantics_contract.md`](../semantics_contract.md)  
2. **Machine pins:** `tamil-seiyul-alagi/src/semantics_contract.rs` (`SEMANTICS_CONTRACT_VERSION = 1`) re-exported from crate root  
3. **Tests:** lib `semantics_contract` (13) + integration `tests/test_semantics_contract_s01.rs` (8)  

## What was *not* changed (on purpose)

- Dense **formulas** (still owned by `parse_features` / PARSE_FEATURES.md — glossary names only)  
- Anthology row counts / inventory (S02)  
- SOA ledger fingerprint (S03)  
- Classical checker (stays empty until D01)  
- Hybrid numeric weights (fit rewritten comment only; train/LOOCV still 1.0)

## Next

- `S02_anthology_inventory` — special_type vs variation counts, export freshness, forbidden training uses  
- `S03_soa_ledger` — combine ontology + semantics + anthology fingerprints  
- Do not start `A00` until `S03` ledger exists  

## Metrics summary

- **special_type:** top-1 = **1.000**, MRR = **1.000**, correct@2 = **1.000** (MC n_eval=340)  
- **variation:** top-1 = **0.158**, MRR = **0.496**, correct@2 = **0.579** (MC n_eval=380)  
- **Exports:** 36 CSV/JSONL rows refreshed  
- **Contract:** `PARSE_FEATURE_SCHEMA_VERSION=1`, `PARSE_FEATURE_DENSE_LEN=51`, gold 4-way slug map locked  
