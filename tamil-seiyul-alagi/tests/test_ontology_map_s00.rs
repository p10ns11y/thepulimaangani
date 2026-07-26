//! S00_ontology_map — TEST-FIRST contract for machine-readable ontology catalog.
//!
//! Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 / §5.2.
//! Human map: `data/training/reports/ontology_map.md` (implement step).
//!
//! These integration tests intentionally depend on a **public** catalog surface that
//! does not exist until the implement agent exports it. Expected state after
//! test-first: **compile red** (unresolved imports / missing symbols).
//!
//! Enum exhaustiveness locks that use *existing* types live in
//! `src/ontology_map.rs` (unit tests; may already be green).

use thepulimaangani_parser::{
    ontology_cir_class_ids, ontology_dual_truth_channel_ids, ontology_issue36_bond_table_len,
    ontology_linkage_special_ids, ontology_linkage_type_fixed_ids, ontology_metre_type_fixed_ids,
    ontology_structural_entity_ids, ontology_syllable_type_ids, ONTOLOGY_MAP_VERSION,
};

/// Structural containment entities required by portfolio Ontology pillar.
#[test]
fn s00_structural_entities_are_poem_line_foot_syllable_letter() {
    let ids = ontology_structural_entity_ids();
    assert_eq!(
        ids,
        &["Poem", "Line", "Foot", "Syllable", "Letter"],
        "S00 structural hierarchy must be exactly these five ids"
    );
}

/// Ner / Nirai closed set.
#[test]
fn s00_syllable_type_catalog_is_ner_nirai() {
    assert_eq!(ontology_syllable_type_ids(), &["Ner", "Nirai"]);
}

/// Cir classes: Maa / Vilam / Kaai / Kani (Vilam, not Vilai).
#[test]
fn s00_cir_class_catalog_is_four() {
    assert_eq!(
        ontology_cir_class_ids(),
        &["Maa", "Vilam", "Kaai", "Kani"]
    );
}

/// Coarse metre: four fixed classes (Other is open escape, not catalogued as fixed).
#[test]
fn s00_metre_type_fixed_catalog_is_four() {
    assert_eq!(
        ontology_metre_type_fixed_ids(),
        &["Venpaa", "Aciriyappaa", "Kalippaa", "Vanjippaa"]
    );
}

/// Coarse Talai families (wire keys).
#[test]
fn s00_linkage_type_fixed_catalog_is_four() {
    assert_eq!(
        ontology_linkage_type_fixed_ids(),
        &["VenTalai", "AciriyaTalai", "KaliTalai", "VanjiTalai"]
    );
}

/// Special bonds including Unknown — eight total (#36 + empty-foot channel).
#[test]
fn s00_linkage_special_catalog_is_eight() {
    let ids = ontology_linkage_special_ids();
    assert_eq!(ids.len(), 8);
    assert!(ids.contains(&"Unknown"));
    // Productive specials (wire-style names preferred in catalog).
    for need in [
        "NerondriyaAciriyaTalai",
        "NiraiondriyaAciriyaTalai",
        "IyarcirVenTalai",
        "VencirVenTalai",
        "KaliTalai",
        "OndriyaVanjiTalai",
        "OndrathaVanjiTalai",
    ] {
        assert!(
            ids.iter().any(|s| *s == need),
            "missing special bond catalog id {need}"
        );
    }
}

/// Issue #36 table is total over 4 cir × 2 first-acai = 8 productive cells.
#[test]
fn s00_issue36_bond_table_has_eight_cells() {
    assert_eq!(ontology_issue36_bond_table_len(), 8);
}

/// Dual-truth channel *nodes* (designed; wire fields may land in A02).
#[test]
fn s00_dual_truth_channel_ids_are_parallel() {
    let ch = ontology_dual_truth_channel_ids();
    assert!(
        ch.iter().any(|s| *s == "ml_metre"),
        "ml_metre channel required"
    );
    assert!(
        ch.iter().any(|s| *s == "classical_metre"),
        "classical_metre channel required (may be empty until D01)"
    );
    assert_eq!(
        ch.len(),
        2,
        "exactly two parallel truth channels; do not fuse"
    );
}

/// Catalog version pin for SOA ledger (S03) consumers.
#[test]
fn s00_ontology_map_version_is_positive() {
    assert!(
        ONTOLOGY_MAP_VERSION >= 1,
        "ONTOLOGY_MAP_VERSION must be published for ledger fingerprinting"
    );
}
