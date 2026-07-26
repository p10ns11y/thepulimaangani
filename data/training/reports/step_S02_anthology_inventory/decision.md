# S02_anthology_inventory — decision

**Status:** `ADOPT`  
**Date:** 2026-07-27  
**Pillar:** Anthology (SOA foundation)  
**improved:** `true` (SOA-foundation value; not a measured scoring gain)

## Rationale

S02 freezes **what evidence we trust**: `special_type` vs `variation` counts, per-metre balance, export paths + fingerprints, forbidden training uses, and the kural golden fixture role. No metre head / weight / dense formula / classical change.

| Criterion | Result |
|-----------|--------|
| SOA artifacts complete | **Yes** — `anthology_inventory.md` + `.json`, public pin API (`ANTHOLOGY_INVENTORY_VERSION = 1`), unit + integration tests, this decision pack |
| Tests / schema | **Green** — crate tests pass (lib 114; S02 integration 10; S00 9; S01 8; poem_variations 5+1 ignored); dense schema still v1 / len 51 |
| Primary metric (`special_type` top-1) | **1.0** (17/17; MC 340/340 @ 20 iters) — **no damage** (≤2pp tolerance) |
| Variation stress | **0.1579** (3/19; MC 60/380) — reported only |
| Unique interpretability | **Yes** — counts, class balance, export fingerprints, forbidden-use catalog, kural role, sinthadi parent pin |

**ADOPT** because: complete SOA anthology freeze + unique interpretability and no top-1 damage.  
**Not REJECT:** tests green; inventory matches live tables and portfolio §5.2; not a no-value step.  
**Not DEFER:** not blocked on data or dependencies (S01 pins exist; classical stays empty pre-D01).

## What was adopted

1. **Human inventory:** [`data/training/reports/anthology_inventory.md`](../anthology_inventory.md)  
2. **Machine counts twin:** [`data/training/reports/anthology_inventory.json`](../anthology_inventory.json)  
3. **Machine pins:** `tamil-seiyul-alagi/src/anthology_inventory.rs` (`ANTHOLOGY_INVENTORY_VERSION = 1`) re-exported from crate root  
4. **Tests:** lib `anthology_inventory` (9) + integration `tests/test_anthology_inventory_s02.rs` (10)  

## What was *not* changed (on purpose)

- Dense layout / formulas (S01 freeze)  
- Ontology entity set (S00 freeze)  
- SOA ledger fingerprint (S03)  
- Classical checker (stays empty until D01)  
- Hybrid numeric weights (fit rewrite is comment-only on `metre_hybrid_weights.inc.rs`)  
- Anthology row add/remove / relabel  

## Next

- `S03_soa_ledger` — combine ontology + semantics + anthology fingerprints into `soa_ledger.md` + `.json`  
- Do not start `A00` until `S03` ledger exists  

## Metrics summary

- **special_type:** top-1 = **1.000**, MRR = **1.000**, correct@2 = **1.000** (MC n_eval=340)  
- **variation:** top-1 = **0.158**, MRR = **0.496**, correct@2 = **0.579** (MC n_eval=380)  
- **Inventory:** N=17 primary / N=19 stress / N=36 total; venpaa 10/6, aciriyappa 3/5, kalippaa 2/5, vanjippaa 2/3  
- **Exports:** 36 CSV/JSONL rows refreshed; fingerprints updated in inventory JSON  
- **Contract:** `ANTHOLOGY_INVENTORY_VERSION=1`, kural golden = feature regression only  
