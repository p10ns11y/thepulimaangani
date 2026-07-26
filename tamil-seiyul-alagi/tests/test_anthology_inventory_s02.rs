//! S02_anthology_inventory — TEST-FIRST contract for machine-readable inventory pins.
//!
//! Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 / §5.2 Anthology.
//! Human inventory: `data/training/reports/anthology_inventory.md` (+ `.json` twin).
//!
//! These integration tests intentionally depend on a **public** inventory surface that
//! does not exist until the implement agent exports it from `anthology_inventory`
//! (crate-root re-exports). Expected state after test-first: **compile red**
//! (unresolved imports / missing symbols).
//!
//! Anthology policy (must stay true after implement):
//! - **Primary metrics** use `special_type` (N=17).
//! - **`variation`** is stress-only (N=19) and must remain isolatable.
//! - Golden kural fixture is parse-feature regression only — not multi-class train.

use thepulimaangani_parser::{
    anthology_block_counts, anthology_class_balance_special_type, anthology_export_csv_path,
    anthology_export_jsonl_path, anthology_forbidden_training_use_ids, anthology_js_mirror_path,
    anthology_kural_fixture_role, anthology_kural_golden_fixture_path,
    anthology_mc_special_type_eval_count, anthology_primary_gold_row_kind,
    anthology_sample_parent_metre, anthology_special_type_count, anthology_stress_only_row_kind,
    anthology_total_row_count, anthology_variation_count, gold_metre_type_for_parent,
    gold_parent_metre_slugs, poem_variation_label_rows, poem_variation_special_type_rows,
    MetreType, PARSE_FEATURE_DENSE_LEN, PARSE_FEATURE_SCHEMA_VERSION, ANTHOLOGY_INVENTORY_VERSION,
};

/// Version pin for S03 ledger / consumers.
#[test]
fn s02_anthology_inventory_version_is_positive() {
    assert!(
        ANTHOLOGY_INVENTORY_VERSION >= 1,
        "ANTHOLOGY_INVENTORY_VERSION must be published for ledger fingerprinting"
    );
}

/// Exact totals: 36 all = 17 special_type (primary) + 19 variation (stress).
#[test]
fn s02_totals_special_type_primary_variation_stress() {
    assert_eq!(anthology_total_row_count(), 36);
    assert_eq!(anthology_special_type_count(), 17);
    assert_eq!(anthology_variation_count(), 19);
    assert_eq!(
        anthology_special_type_count() + anthology_variation_count(),
        anthology_total_row_count()
    );
    assert_eq!(anthology_primary_gold_row_kind(), "special_type");
    assert_eq!(anthology_stress_only_row_kind(), "variation");
}

/// Per-metre block balance (special / variation) matches Rust tables / inventory freeze.
#[test]
fn s02_per_metre_block_counts_match_inventory() {
    let blocks = anthology_block_counts();
    assert_eq!(
        blocks,
        &[
            ("venpaa", 10, 6),
            ("aciriyappa", 3, 5),
            ("kalippaa", 2, 5),
            ("vanjippaa", 2, 3),
        ]
    );
    let special_sum: usize = blocks.iter().map(|(_, s, _)| *s).sum();
    let variation_sum: usize = blocks.iter().map(|(_, _, v)| *v).sum();
    assert_eq!(special_sum, anthology_special_type_count());
    assert_eq!(variation_sum, anthology_variation_count());
}

/// Primary-gold class balance isolates special_type only (venpaa majority).
#[test]
fn s02_class_balance_special_type_only() {
    assert_eq!(
        anthology_class_balance_special_type(),
        &[
            ("venpaa", 10),
            ("aciriyappa", 3),
            ("kalippaa", 2),
            ("vanjippaa", 2),
        ]
    );
    let n: usize = anthology_class_balance_special_type()
        .iter()
        .map(|(_, c)| *c)
        .sum();
    assert_eq!(n, anthology_special_type_count());
    // Gold parent slugs (S01) must cover the same four parents.
    assert_eq!(
        gold_parent_metre_slugs(),
        &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
    );
}

/// Export + mirror + kural golden paths are documented for regenerate/fingerprint.
#[test]
fn s02_export_and_golden_paths_are_stable() {
    assert_eq!(
        anthology_export_csv_path(),
        "data/training/poem_variations_training.csv"
    );
    assert_eq!(
        anthology_export_jsonl_path(),
        "data/training/poem_variations_training.jsonl"
    );
    assert_eq!(anthology_js_mirror_path(), "data/poem_variations.js");
    assert_eq!(
        anthology_kural_golden_fixture_path(),
        "tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json"
    );
    assert_eq!(
        anthology_kural_fixture_role(),
        "parse_feature_regression_not_multiclass_train"
    );
}

/// Forbidden training uses must be enumerated (machine ids) for SOA consumers.
#[test]
fn s02_forbidden_training_use_ids_cover_policy() {
    let ids = anthology_forbidden_training_use_ids();
    assert!(ids.len() >= 8, "expected full forbidden-use catalog");
    for need in [
        "bulk_train_variation_without_relabel",
        "variation_as_sole_adopt_criterion",
        "kural_fixture_as_multiclass_train",
        "raw_text_as_dense_linear_input",
        "train_outside_declared_split_without_rebaseline",
        "invent_ontology_or_relabel_dense_semantics",
        "fuse_classical_into_ml_score",
        "predicted_metre_as_gold",
        "reparent_sinthadi_from_id_string",
        "external_poems_without_inventory_policy",
    ] {
        assert!(
            ids.iter().any(|s| *s == need),
            "missing forbidden-use id {need}"
        );
    }
}

/// MC surface on primary gold: 17 × 20 = 340 evals.
#[test]
fn s02_mc_special_type_eval_count_is_seventeen_times_iters() {
    assert_eq!(anthology_mc_special_type_eval_count(20), 340);
    assert_eq!(
        anthology_mc_special_type_eval_count(20),
        anthology_special_type_count() * 20
    );
}

/// Label note: sample_id `sinthadi_aciriyappaa` → parent_metre vanjippaa (not aciriyappa).
#[test]
fn s02_sinthadi_aciriyappaa_parent_is_vanjippaa() {
    assert_eq!(
        anthology_sample_parent_metre("sinthadi_aciriyappaa"),
        Some("vanjippaa")
    );
    assert_eq!(
        gold_metre_type_for_parent("vanjippaa"),
        Some(MetreType::Vanjippaa)
    );
    // Must not silently map to Aciriyappaa from the sample id string alone.
    assert_ne!(
        anthology_sample_parent_metre("sinthadi_aciriyappaa"),
        Some("aciriyappa")
    );
}

/// Live label helpers must agree with inventory pins; special_type isolation holds.
#[test]
fn s02_live_rows_match_inventory_and_isolate_special_type() {
    let all = poem_variation_label_rows();
    assert_eq!(all.len(), anthology_total_row_count());

    let special = poem_variation_special_type_rows(&all);
    assert_eq!(special.len(), anthology_special_type_count());
    assert!(special.iter().all(|r| r.row_kind == "special_type"));

    let variation_n = all
        .iter()
        .filter(|r| r.row_kind == anthology_stress_only_row_kind())
        .count();
    assert_eq!(variation_n, anthology_variation_count());
    assert_eq!(special.len() + variation_n, all.len());

    for row in &special {
        assert!(
            gold_metre_type_for_parent(&row.parent_metre).is_some(),
            "special_type parent_metre {:?} must map under gold contract",
            row.parent_metre
        );
    }

    // Per-metre special counts from live rows match inventory class balance.
    for (slug, expected) in anthology_class_balance_special_type() {
        let n = special.iter().filter(|r| r.parent_metre == *slug).count();
        assert_eq!(n, *expected, "special_type count for {slug}");
    }
}

/// Semantics consumer pin: kural golden fixture still schema_version=1 dense_len=51.
/// (Fixture path is inventory-owned; schema pins remain S01.)
#[test]
fn s02_kural_fixture_schema_pins_unchanged() {
    assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
    assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
    // Path pin must point at the committed golden used by parse_features tests.
    assert!(
        anthology_kural_golden_fixture_path().ends_with("kural_venpaa_parse_features.json"),
        "kural golden path must end with fixture filename"
    );
}
