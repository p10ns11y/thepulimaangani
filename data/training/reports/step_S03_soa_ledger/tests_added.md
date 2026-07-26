# S03_soa_ledger — tests added (TEST-FIRST)

**Step:** `S03_soa_ledger`  
**Phase:** **measure complete** (`ADOPT`)  
**Date:** 2026-07-27  
**status:** `ADOPT`  
**improved:** `true` (SOA-foundation value)  
**soa_ok:** `true` (schema ids + corpus fingerprints + S00–S02 freezes coherent; ledger written)

## Purpose

Lock the composite SOA ledger before Tier A method work (`A00+` / `require_soa`):

- Schema id freeze (ontology + semantics + anthology + dense + weight schemas)  
- **Corpus fingerprints** (csv / jsonl / js / kural sha256 + bytes)  
- Primary gold = `special_type`; variation = stress only  
- Classical checker empty pre-D01  
- Special dense slot order aligns with ontology catalog  
- Anthology block balance + tree pin (`sinthadi` → vanjippaa)  
- Forbidden-use catalog present  

## Implement note

| Surface | Status after implement |
|---------|------------------------|
| Schema ids / fingerprint string / report paths / gold split / dense↔ontology / classical | Green |
| **`soa_corpus_fingerprints()`** crate-root export | **Green** — 4× `(path, bytes, sha256)` matching ledger §3.3 |

```text
soa_corpus_fingerprints() -> &'static [(&'static str, u64, &'static str)]
// (path, bytes, sha256_hex) — four S03 freeze rows matching soa_ledger.md §3.3
```

No dense formulas, hybrid weights, classical checker, or anthology row changes.

## Paths (`tests_added`)

| Path | Role | Status |
|------|------|--------|
| [`tamil-seiyul-alagi/tests/test_soa_ledger_s03.rs`](../../../../tamil-seiyul-alagi/tests/test_soa_ledger_s03.rs) | Integration contract | **Green** (13 tests) |
| [`tamil-seiyul-alagi/src/soa_ledger.rs`](../../../../tamil-seiyul-alagi/src/soa_ledger.rs) | Schema + corpus pins + unit tests | **Green** (7 unit) |
| [`data/training/reports/soa_ledger.md`](../soa_ledger.md) | Human composite freeze | Present (hashes in §3.3 + API pin) |
| [`data/training/reports/soa_ledger.json`](../soa_ledger.json) | Machine twin | Present (`anthology.fingerprints` + `public_api`) |

## Test kinds chosen

| Kind | Why |
|------|-----|
| **Unit-style pin** | Version ≥ 1, constituent versions = 1 |
| **Golden / snapshot** | Exact schema fingerprint string; exact 4× corpus `(path, bytes, sha256)` |
| **Invariant / property** | Dense blocks sum to 51; special slots == ontology catalog order; fingerprint hex shape |
| **Integration** | Live `poem_variation_*` special_type isolation; classical empty for all fixed metres |
| **Ontology coverage** | Four fixed metres; dual-truth channel ids |
| **Anthology isolation** | `special_type` N=17 primary; `variation` N=19 stress; block table; sinthadi→vanjippaa |
| **MC regression** | Not re-run in test-first (S02 floor: special_type top-1 = 1.0) |

## Integration tests (`test_soa_ledger_s03`)

| Test | Focus | Red if missing |
|------|-------|----------------|
| `s03_ledger_version_is_positive` | version ≥ 1 | `SOA_LEDGER_VERSION` |
| `s03_constituent_versions_are_one` | ont/sem/anth/soa = 1 | version pins |
| `s03_schema_ids_match_production_constants` | id table vs constants | `soa_schema_ids` |
| `s03_schema_fingerprint_string_includes_all_ids` | exact fingerprint | `soa_schema_fingerprint_string` |
| `s03_report_paths_list_s00_s01_s02_and_ledger` | path index | `soa_report_paths` |
| `s03_primary_gold_is_special_type_variation_is_stress` | split isolation | gold row-kind pins |
| `s03_block_balance_and_gold_slugs` | counts + sinthadi pin | anthology + gold |
| `s03_dense_layout_and_special_order_coherent` | semantics↔ontology | dense / special ids |
| `s03_dual_truth_classical_empty_pre_d01` | classical isolation | dual-truth + classical |
| `s03_forbidden_training_use_catalog_present` | forbidden ids | anthology catalog |
| `s03_corpus_fingerprints_match_ledger_freeze` | **corpus sha256 freeze** | **`soa_corpus_fingerprints`** |
| `s03_corpus_fingerprint_paths_match_anthology_export_pins` | path single-source | **`soa_corpus_fingerprints`** |
| `s03_corpus_fingerprint_entries_have_valid_shape` | bytes>0, 64 hex | **`soa_corpus_fingerprints`** |

## Commands

```bash
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --test test_soa_ledger_s03
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --lib soa_ledger
```

## Ontology / semantics / anthology notes

- **Ontology:** no new entities; dual-truth `ml_metre` ∥ `classical_metre`; classical empty.  
- **Semantics:** dense schema v1 / len 51 / blocks `[12,7,8,16,8]`; special slot order ≡ ontology catalog.  
- **Anthology:** **special_type** = primary gold (N=17); **variation** = stress only (N=19); corpus fingerprints must be machine-pinned for `require_soa`.  
