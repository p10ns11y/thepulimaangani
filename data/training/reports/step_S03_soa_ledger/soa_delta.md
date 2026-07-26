# S03_soa_ledger — SOA delta

**Step:** `S03_soa_ledger`  
**Date:** 2026-07-27  
**Decision:** `ADOPT`  
**Ledger written:** yes — `data/training/reports/soa_ledger.md` + `soa_ledger.json`

## Ontology

| Change | Detail |
|--------|--------|
| Entity set | **Unchanged** (S00 freeze) |
| Catalog versions | Consumed as `ONTOLOGY_MAP_VERSION = 1` in composite fingerprint |
| Dual-truth | Re-asserted: `ml_metre` ∥ `classical_metre`; never fused |
| Classical | **Empty** — `soa_classical_checker_active() == false` |

## Semantics

| Change | Detail |
|--------|--------|
| Dense meaning | **Unchanged** (S01 freeze) |
| Schema ids | Composite table: dense schema 1 / len 51 / parse_result 1 / ml_weight 3 |
| Gold / split | special_type primary; variation stress only |
| Fingerprint string | `soa_schema_fingerprint_string()` frozen |

## Anthology

| Change | Detail |
|--------|--------|
| Corpus contents | **No row add/remove** |
| Fingerprints | Re-published in ledger JSON; re-export at measure kept same sha256 |
| Split policy | Re-stated for A00+ consumers |
| Primary MC | special_type top-1 **1.0** (340/340); variation **0.1579** (stress) |

## Composite (new / adopted)

| Change | Detail |
|--------|--------|
| **New public pin module** | `pub mod soa_ledger` + `SOA_LEDGER_VERSION = 1` |
| **Corpus pin API** | `soa_corpus_fingerprints()` — 4× `(path, bytes, sha256)` re-exported from crate root |
| **Human + machine ledger** | `data/training/reports/soa_ledger.md` + `.json` |
| **Integration** | `tests/test_soa_ledger_s03.rs` (13 green) |
| **require_soa surface** | Schema id table + fingerprint + corpus hashes + report paths |

## Drift policy

- Bump constituent versions first (S00/S01/S02 / dense schema / weight schema), then refresh this ledger and prefer bumping `SOA_LEDGER_VERSION`.  
- Corpus re-export requires fingerprint update in both S02 inventory and S03 ledger.  
- Classical non-empty output requires D01+ `allow_classical` and ledger note.  
