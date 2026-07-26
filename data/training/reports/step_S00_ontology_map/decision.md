# S00_ontology_map — decision

**Status:** `ADOPT`  
**Date:** 2026-07-27  
**Pillar:** Ontology (SOA foundation)  
**improved:** `true` (SOA-foundation value; not a measured scoring gain)

## Rationale

S00 is a pure **interpretability / ontology freeze** step: machine-readable entity graph + enum exhaustiveness locks, not a new metre head.

| Criterion | Result |
|-----------|--------|
| SOA artifacts complete | **Yes** — `ontology_map.md`, public catalog API, unit + integration exhaustiveness tests, this decision pack |
| Tests / schema | **Green** — crate tests pass; `ONTOLOGY_MAP_VERSION = 1`; dense schema still v1 / len 51 |
| Primary metric (`special_type` top-1) | **1.0** (17/17; MC 340/340 @ 20 iters) — **no damage** (≤2pp tolerance) |
| Variation stress | **0.1579** (3/19; MC 60/380) — reported only |
| Unique interpretability | **Yes** — structural hierarchy, closed enums, #36 bond table, dual-truth channel nodes documented + locked in code |

**ADOPT** because: complete SOA foundation + unique interpretability and no top-1 damage.  
**Not REJECT:** tests green and ontology map is the step goal.  
**Not DEFER:** not blocked on data or dependencies.

## What was adopted

1. **Human map:** [`data/training/reports/ontology_map.md`](../ontology_map.md)  
2. **Machine catalog:** `tamil-seiyul-alagi/src/ontology_map.rs` (`ONTOLOGY_MAP_VERSION = 1`) re-exported from crate root  
3. **Tests:** lib exhaustiveness (15) + integration `tests/test_ontology_map_s00.rs` (9)  

## What was *not* changed (on purpose)

- Dense layout / formulas (S01)  
- Anthology inventory counts (S02)  
- SOA ledger fingerprint (S03)  
- Classical checker (stays empty until D01)  
- Metre scoring policy / hybrid class map  

## Next

- `S01_semantics_contract` — dense index glossary, score scales, gold-label meaning, serde aliases  
- Do not start `A00` until `S03` ledger exists  

## Metrics summary

- **special_type:** top-1 = **1.000**, MRR = **1.000**, correct@2 = **1.000** (MC n_eval=340)  
- **variation:** top-1 = **0.158**, MRR = **0.496**, correct@2 = **0.579** (MC n_eval=380)  
- **Exports:** 36 CSV/JSONL rows refreshed  
