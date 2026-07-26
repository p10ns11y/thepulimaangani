//! S01_semantics_contract — integration lock for public semantics pins.
//!
//! Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 / §5.2.
//! Human contract: `data/training/reports/semantics_contract.md`.

use thepulimaangani_parser::{
    dense_block_lengths_v1, dense_global_feature_ids, dense_linkage_special_slot_ids,
    dense_linkage_type_slot_ids, gold_metre_label_for_parent, gold_metre_type_for_parent,
    gold_parent_metre_slugs, ontology_linkage_special_ids, poem_variation_label_rows,
    poem_variation_special_type_rows, score_scale_ids, MetreType, PARSE_FEATURE_DENSE_LEN,
    PARSE_FEATURE_SCHEMA_VERSION, SEMANTICS_CONTRACT_VERSION,
};

#[test]
fn s01_schema_version_is_one_and_dense_len_51() {
    assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
    assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
    assert_eq!(SEMANTICS_CONTRACT_VERSION, 1);
}

#[test]
fn s01_dense_blocks_sum_to_dense_len() {
    let sum: usize = dense_block_lengths_v1().iter().sum();
    assert_eq!(sum, PARSE_FEATURE_DENSE_LEN);
    assert_eq!(dense_block_lengths_v1(), [12, 7, 8, 16, 8]);
}

#[test]
fn s01_global_feature_glossary_has_twelve_ids() {
    assert_eq!(dense_global_feature_ids().len(), 12);
    assert_eq!(dense_global_feature_ids()[0], "log_letters");
    assert_eq!(dense_global_feature_ids()[11], "linkage_edge_count");
}

#[test]
fn s01_linkage_type_slots_include_two_reserved() {
    let ids = dense_linkage_type_slot_ids();
    assert_eq!(ids.len(), 7);
    assert_eq!(ids[4], "__reserved_4");
    assert_eq!(ids[5], "__reserved_5");
    assert_eq!(ids[0], "VenTalai");
}

#[test]
fn s01_special_slots_match_ontology_catalog_order() {
    assert_eq!(
        dense_linkage_special_slot_ids(),
        ontology_linkage_special_ids()
    );
}

#[test]
fn s01_gold_parent_slugs_map_to_fixed_metres() {
    assert_eq!(
        gold_parent_metre_slugs(),
        &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
    );
    assert_eq!(
        gold_metre_type_for_parent("venpaa"),
        Some(MetreType::Venpaa)
    );
    assert_eq!(
        gold_metre_type_for_parent("aciriyappa"),
        Some(MetreType::Aciriyappaa)
    );
    assert_eq!(
        gold_metre_label_for_parent("aciriyappa"),
        Some("Aciriyappaa")
    );
    assert_eq!(
        gold_metre_type_for_parent("kalippaa"),
        Some(MetreType::Kalippaa)
    );
    assert_eq!(
        gold_metre_type_for_parent("vanjippaa"),
        Some(MetreType::Vanjippaa)
    );
    assert_eq!(gold_metre_type_for_parent("other"), None);
}

#[test]
fn s01_score_scale_ids_name_probability_vs_integer_channels() {
    let ids = score_scale_ids();
    assert!(ids.iter().any(|s| s.contains("pre_hybrid_integer")));
    assert!(ids.iter().any(|s| *s == "metre_probability"));
    assert!(ids.iter().any(|s| s.contains("post_hybrid")));
}

/// Anthology: primary metrics on `special_type`; isolate `variation` as stress-only.
#[test]
fn s01_primary_gold_special_type_isolates_variation() {
    let all = poem_variation_label_rows();
    let special = poem_variation_special_type_rows(&all);
    assert!(!special.is_empty());
    assert!(special.iter().all(|r| r.row_kind == "special_type"));
    let variation_n = all.iter().filter(|r| r.row_kind == "variation").count();
    assert!(variation_n > 0);
    assert_eq!(special.len() + variation_n, all.len());
}
