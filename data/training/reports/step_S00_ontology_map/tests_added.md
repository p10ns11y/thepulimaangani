# S00_ontology_map — tests added

**Step:** `S00_ontology_map`  
**Phase:** complete (test-first → implement → measure → ADOPT)  
**Date:** 2026-07-27  

## Intent

Lock the Ontology pillar before any Tier A method work:

- Structural hierarchy: Poem → Line → Foot → Syllable → Letter  
- Closed enums: `SyllableType`, `CirAcaiClass`, `MetreType` (4+Other), `LinkageType`, `LinkageSpecialType`  
- #36 cir × first-acai bond table (8 cells)  
- Dual-truth channel *nodes* (`ml_metre` ∥ `classical_metre`) — parallel, never fused  
- Classical checker remains empty until D01  

## Paths (`tests_added`)

| Path | Role | Status after ADOPT |
|------|------|---------------------|
| [`tamil-seiyul-alagi/src/ontology_map.rs`](../../../../tamil-seiyul-alagi/src/ontology_map.rs) | Public catalog + unit/property exhaustiveness | **Green** (15 tests) |
| [`tamil-seiyul-alagi/tests/test_ontology_map_s00.rs`](../../../../tamil-seiyul-alagi/tests/test_ontology_map_s00.rs) | Integration contract for public catalog API | **Green** (9 tests) |
| [`tamil-seiyul-alagi/src/lib.rs`](../../../../tamil-seiyul-alagi/src/lib.rs) | `pub mod ontology_map` + crate-root re-exports | Wired |
| [`data/training/reports/ontology_map.md`](../ontology_map.md) | Human entity graph | Frozen inventory |

## Public API (shipped)

```text
ONTOLOGY_MAP_VERSION: u32                    // = 1
ontology_structural_entity_ids() -> &[&str]  // Poem, Line, Foot, Syllable, Letter
ontology_syllable_type_ids()                 // Ner, Nirai
ontology_cir_class_ids()                     // Maa, Vilam, Kaai, Kani
ontology_metre_type_fixed_ids()              // Venpaa, Aciriyappaa, Kalippaa, Vanjippaa
ontology_linkage_type_fixed_ids()            // VenTalai, AciriyaTalai, KaliTalai, VanjiTalai
ontology_linkage_special_ids()               // 8 wire-style specials incl. Unknown
ontology_issue36_bond_table_len() -> usize   // 8
ontology_dual_truth_channel_ids()            // ml_metre, classical_metre
```

## Unit tests (lib `ontology_map`)

- `public_catalog_matches_s00_contract`
- `public_special_catalog_ids_match_serde_wire_keys`
- `syllable_type_has_exactly_ner_and_nirai`
- `cir_acai_class_has_exactly_four_variants`
- `letter_type_has_exactly_four_variants`
- `linkage_type_fixed_families_are_four_plus_other`
- `linkage_special_type_has_exactly_eight_variants_with_dense_indices`
- `metre_type_fixed_classes_match_ml_and_gold_slugs`
- `parse_feature_schema_pins_for_ontology_consumers`
- `cir_class_from_foot_acai_count_and_last_type`
- `issue36_table_covers_all_cir_times_first_acai`
- `issue36_productive_specials_are_seven`
- `classical_checker_stays_empty_for_all_fixed_metres`
- `poem_tree_layers_are_public_ontology_surface`
- `metre_type_json_keys_are_canonical`

## Integration tests (`test_ontology_map_s00`)

- `s00_structural_entities_are_poem_line_foot_syllable_letter`
- `s00_syllable_type_catalog_is_ner_nirai`
- `s00_cir_class_catalog_is_four`
- `s00_metre_type_fixed_catalog_is_four`
- `s00_linkage_type_fixed_catalog_is_four`
- `s00_linkage_special_catalog_is_eight`
- `s00_issue36_bond_table_has_eight_cells`
- `s00_dual_truth_channel_ids_are_parallel`
- `s00_ontology_map_version_is_positive`

## Commands (green)

```bash
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --lib ontology_map
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml --test test_ontology_map_s00
cargo test --manifest-path tamil-seiyul-alagi/Cargo.toml
```

**Observed (measure):** lib ontology_map 15 passed; integration 9 passed; full crate green (1 ignored poem_variations hint).

## Anthology / semantics notes

- **Anthology:** primary metrics on `special_type`; `variation` stress separate.  
- **Semantics:** dense layout pinned as consumer pin only (S01 owns formula glossary).  
- **Classical:** empty; dual-truth nodes named, not fused.  
