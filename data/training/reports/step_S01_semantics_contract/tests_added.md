# S01_semantics_contract — tests added

**Step:** `S01_semantics_contract`  
**Phase:** measure + decide (ADOPT)  
**Date:** 2026-07-27  
**status:** `ADOPT`  
**improved:** `true` (SOA-foundation value; scoring path unchanged)

## Intent

Lock the Semantics pillar before Tier A method work:

- `PARSE_FEATURE_SCHEMA_VERSION` / dense length 51 / block layout  
- Dense index glossary (global + linkage type + special)  
- Gold `parent_metre` slug → `MetreType` / ML class / wire label  
- Score-scale channels (integer vs probability)  
- Serde canonical write + legacy read aliases  
- Presentation Tamil vs machine Latin  
- Anthology: **`special_type` primary**; **`variation` stress-only**  
- Classical empty until D01  

## TDD note

- **Test-first contract:** unit + integration tests assert public pins and meaning tables.  
- **Expected red:** if `semantics_contract` exports / re-exports were missing, integration tests would fail to compile; if schema/gold/score meanings drifted, asserts fail.  
- **Observed measure run:** **green** — 13 lib + 8 integration + full crate (105 lib, ontology 9, poem_variations 5+1 ignored).  
- **Not a product scoring change:** no dense formula change, no hybrid numeric weight change, no classical rules, no scoring head.

## Paths (`tests_added`)

| Path | Role | Status |
|------|------|--------|
| [`tamil-seiyul-alagi/src/semantics_contract.rs`](../../../../tamil-seiyul-alagi/src/semantics_contract.rs) | Public pins + unit tests | **Green** (13 unit tests) |
| [`tamil-seiyul-alagi/tests/test_semantics_contract_s01.rs`](../../../../tamil-seiyul-alagi/tests/test_semantics_contract_s01.rs) | Integration contract for public API | **Green** (8 tests) |
| [`tamil-seiyul-alagi/src/lib.rs`](../../../../tamil-seiyul-alagi/src/lib.rs) | `pub mod semantics_contract` + crate-root re-exports | Wired |
| [`data/training/reports/semantics_contract.md`](../semantics_contract.md) | Human semantics freeze | Frozen |

## Public API (pins)

```text
SEMANTICS_CONTRACT_VERSION: u32              // = 1
dense_global_feature_ids() -> &[&str]        // 12 conceptual names
dense_linkage_type_slot_ids()                // 7 incl. reserved_4/5 + Other
dense_linkage_special_slot_ids()             // 8 wire keys (= ontology special catalog)
gold_parent_metre_slugs()                    // venpaa, aciriyappa, kalippaa, vanjippaa
score_scale_ids()                            // integer vs probability channel names
dense_block_lengths_v1() -> [usize; 5]       // [12,7,8,16,8]
```

Also consumes (not owned): `PARSE_FEATURE_SCHEMA_VERSION`, `PARSE_FEATURE_DENSE_LEN`,
`gold_metre_type_for_parent` / `gold_metre_label_for_parent`, `poem_variation_*_rows`.

## Unit tests (lib `semantics_contract`)

- `schema_version_and_dense_len_pinned`
- `dense_block_lengths_sum_to_51`
- `global_feature_ids_match_schema_v1_length`
- `linkage_type_slot_ids_and_reserved_bins`
- `linkage_special_slot_ids_match_ontology_catalog`
- `gold_parent_slugs_map_to_metre_type_and_ml_class`
- `score_scale_ids_are_documented_channels`
- `metre_serde_alias_asiriyappaa_reads_to_aciriyappaa`
- `linkage_legacy_aliases_deserialize_only`
- `presentation_metre_is_tamil_machine_is_latin`
- `classical_channel_stays_empty_pre_d01`
- `golden_fixture_schema_version_matches_constant`
- `primary_gold_is_special_type_variation_is_stress_only` *(anthology isolation)*

## Integration tests (`test_semantics_contract_s01`)

- `s01_schema_version_is_one_and_dense_len_51`
- `s01_dense_blocks_sum_to_dense_len`
- `s01_global_feature_glossary_has_twelve_ids`
- `s01_linkage_type_slots_include_two_reserved`
- `s01_special_slots_match_ontology_catalog_order`
- `s01_gold_parent_slugs_map_to_fixed_metres`
- `s01_score_scale_ids_name_probability_vs_integer_channels`
- `s01_primary_gold_special_type_isolates_variation` *(anthology isolation)*

## Measure commands (§6.4)

```bash
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --lib semantics_contract
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --test test_semantics_contract_s01
cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example metre_monte_carlo_report
MC_ROW_KINDS=variation cargo run --example metre_monte_carlo_report
MC_ROW_KINDS=all cargo run --example metre_monte_carlo_report
cargo run --example fit_metre_hybrid_weights
cargo run --example parse_features_pca_metre
cargo run --example training_linkage_vs_gold
cargo run --example export_poem_variations_training_csv
cargo run --example export_poem_variations_training_jsonl
```

## Anthology / ontology notes

- **Anthology:** primary metrics on `special_type`; `variation` stress-only (isolated via `poem_variation_special_type_rows`).  
- **Ontology:** no new entities; special dense order reuses S00 catalog.  
- **Semantics:** dense glossary + score scales + gold slug map + serde/presentation rules frozen in `semantics_contract.md`.  
- **Classical:** empty; dual-truth not fused.  
