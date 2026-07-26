# S03_soa_ledger — decision

**Status:** `ADOPT`  
**Date:** 2026-07-27  
**Pillar:** soa-all (Ontology + Semantics + Anthology)  
**improved:** `true` (SOA-foundation value — composite `require_soa` surface; not a scoring gain)

## Rationale

S03 freezes the **composite SOA ledger**: ontology catalog versions, semantics schema ids, anthology counts + corpus fingerprints, dual-truth / classical isolation, and split policy so Tier A `require_soa` has a single machine + human surface. No metre head / weight / dense formula / classical / row inventory change.

| Criterion | Result |
|-----------|--------|
| SOA artifacts complete | **Yes** — **ledger written:** `soa_ledger.md` + `.json`, public pin API (`SOA_LEDGER_VERSION = 1`), unit + integration tests, this decision pack |
| Tests / schema | **Green** — full crate: lib 121, S03 integration 13, S00–S02 integrations green; dense schema still v1 / len 51 |
| Primary metric (`special_type` top-1) | **1.0** (MC 340/340 @ 20 iters; MRR 1.0) — **no damage** (≤2pp tolerance) |
| Variation stress | **0.1579** (MC 60/380; MRR 0.4956) — reported only |
| Unique interpretability | **Yes** — single fingerprint string + schema id table + corpus hashes + split policy for A00+ |

**ADOPT** because: complete SOA foundation + unique interpretability and no top-1 damage.  
**Not REJECT:** tests green; ledger matches portfolio §5.0/§5.2 and S00–S02 freezes.  
**Not DEFER:** not blocked (S00–S02 ADOPT artifacts exist; classical stays empty pre-D01).

## What was adopted

1. **Human ledger:** [`data/training/reports/soa_ledger.md`](../soa_ledger.md)  
2. **Machine twin:** [`data/training/reports/soa_ledger.json`](../soa_ledger.json)  
3. **Machine pins:** `tamil-seiyul-alagi/src/soa_ledger.rs` (`SOA_LEDGER_VERSION = 1`, `soa_corpus_fingerprints()`) re-exported from crate root  
4. **Tests:** lib `soa_ledger` (7 unit) + integration `tests/test_soa_ledger_s03.rs` (13)  

## What was *not* changed (on purpose)

- Ontology entity set (S00 freeze)  
- Dense layout / formulas / gold slug map (S01 freeze)  
- Anthology row counts / sample texts (S02 freeze)  
- Classical checker (stays empty until D01 + `allow_classical`)  
- Hybrid numeric weights (fit ran; comment-only rewrite side effect)  
- Product/WASM parse surface fields  

## Measure commands (portfolio §6.4)

All required examples re-run at measure time:

- `metre_monte_carlo_report` (default special_type, variation, all)  
- `fit_metre_hybrid_weights` (train 1.0 / LOOCV 1.0; no numeric weight change)  
- `parse_features_pca_metre`  
- `training_linkage_vs_gold`  
- `export_poem_variations_training_csv` / `_jsonl` (36 rows; fingerprints unchanged)  
- `cargo test` full crate green  

## Next

- `A00_baseline_freeze` — snapshot MC + hybrid + PCA + linkage_vs_gold against this ledger  
- Do not start D01 without A12 artifacts + `allow_classical`  
- Bump ledger when any S00/S01/S02 version or corpus hash changes  

## Metrics summary

- **special_type:** top-1 = **1.000**, MRR = **1.000** (MC 340/340)  
- **variation:** top-1 = **0.1579**, MRR = **0.4956** (stress only)  
- **Schema fingerprint:** `soa=1;ont=1;sem=1;anth=1;dense_schema=1;dense_len=51;parse_result=1;ml_weight=3`  
- **Corpus:** CSV/JSONL/JS/kural fingerprints match `soa_corpus_fingerprints()`  
