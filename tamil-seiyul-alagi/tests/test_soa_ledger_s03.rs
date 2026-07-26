//! S03_soa_ledger — TEST-FIRST contract for composite SOA fingerprint.
//!
//! Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 S03 / §5.2.
//! Human ledger: `data/training/reports/soa_ledger.md` (+ `.json` twin).
//!
//! Gates Tier A (`require_soa`): ontology + semantics + anthology versions,
//! schema ids, and **corpus fingerprints** must stay coherent; classical
//! remains empty pre-D01.
//!
//! ## Contract surface
//!
//! Public ledger exports required by this suite:
//! - schema id freeze + fingerprint string (`SOA_LEDGER_VERSION`, …)
//! - report path index for S00–S02 + ledger twins
//! - primary gold = `special_type`; variation = stress only
//! - **`soa_corpus_fingerprints()`** — anthology export/fixture sha256 pins
//!
//! Do not weaken asserts; re-export pins from crate root.

use thepulimaangani_parser::{
    anthology_block_counts, anthology_export_csv_path, anthology_export_jsonl_path,
    anthology_forbidden_training_use_ids, anthology_js_mirror_path,
    anthology_kural_golden_fixture_path, anthology_sample_parent_metre,
    anthology_special_type_count, anthology_total_row_count, anthology_variation_count,
    classical_violations_for_metre, dense_block_lengths_v1, dense_linkage_special_slot_ids,
    gold_parent_metre_slugs, ontology_linkage_special_ids, ontology_metre_type_fixed_ids,
    poem_variation_label_rows, poem_variation_special_type_rows, soa_classical_checker_active,
    soa_corpus_fingerprints, soa_dual_truth_channel_ids, soa_primary_gold_row_kind,
    soa_report_paths, soa_schema_fingerprint_string, soa_schema_ids, soa_stress_only_row_kind,
    MetreType, ANTHOLOGY_INVENTORY_VERSION, ONTOLOGY_MAP_VERSION, PARSE_FEATURE_DENSE_LEN,
    PARSE_FEATURE_SCHEMA_VERSION, PARSE_RESULT_SCHEMA_VERSION, SEMANTICS_CONTRACT_VERSION,
    SOA_LEDGER_VERSION,
};

#[test]
fn s03_ledger_version_is_positive() {
    assert!(
        SOA_LEDGER_VERSION >= 1,
        "SOA_LEDGER_VERSION must be published for A00 require_soa"
    );
}

#[test]
fn s03_constituent_versions_are_one() {
    assert_eq!(ONTOLOGY_MAP_VERSION, 1);
    assert_eq!(SEMANTICS_CONTRACT_VERSION, 1);
    assert_eq!(ANTHOLOGY_INVENTORY_VERSION, 1);
    assert_eq!(SOA_LEDGER_VERSION, 1);
}

#[test]
fn s03_schema_ids_match_production_constants() {
    let ids = soa_schema_ids();
    let map: std::collections::HashMap<&str, u32> = ids.iter().copied().collect();
    assert_eq!(map["SOA_LEDGER_VERSION"], SOA_LEDGER_VERSION);
    assert_eq!(map["ONTOLOGY_MAP_VERSION"], ONTOLOGY_MAP_VERSION);
    assert_eq!(map["SEMANTICS_CONTRACT_VERSION"], SEMANTICS_CONTRACT_VERSION);
    assert_eq!(map["ANTHOLOGY_INVENTORY_VERSION"], ANTHOLOGY_INVENTORY_VERSION);
    assert_eq!(map["PARSE_FEATURE_SCHEMA_VERSION"], PARSE_FEATURE_SCHEMA_VERSION);
    assert_eq!(map["PARSE_FEATURE_DENSE_LEN"], PARSE_FEATURE_DENSE_LEN as u32);
    assert_eq!(map["PARSE_RESULT_SCHEMA_VERSION"], PARSE_RESULT_SCHEMA_VERSION);
    assert_eq!(map["PARSE_FEATURE_SCHEMA_VERSION"], 1);
    assert_eq!(map["PARSE_FEATURE_DENSE_LEN"], 51);
    assert_eq!(map["METRE_ML_WEIGHT_SCHEMA"], 3);
}

#[test]
fn s03_schema_fingerprint_string_includes_all_ids() {
    let fp = soa_schema_fingerprint_string();
    assert_eq!(
        fp,
        "soa=1;ont=1;sem=1;anth=1;dense_schema=1;dense_len=51;parse_result=1;ml_weight=3"
    );
}

#[test]
fn s03_report_paths_list_s00_s01_s02_and_ledger() {
    let keys: Vec<&str> = soa_report_paths().iter().map(|(k, _)| *k).collect();
    for need in [
        "ontology_map",
        "semantics_contract",
        "anthology_inventory",
        "anthology_inventory_json",
        "soa_ledger",
        "soa_ledger_json",
    ] {
        assert!(keys.contains(&need), "missing report path key {need}");
    }
}

/// Anthology: primary metrics on `special_type`; isolate `variation` as stress-only.
#[test]
fn s03_primary_gold_is_special_type_variation_is_stress() {
    assert_eq!(soa_primary_gold_row_kind(), "special_type");
    assert_eq!(soa_stress_only_row_kind(), "variation");
    assert_eq!(anthology_special_type_count(), 17);
    assert_eq!(anthology_variation_count(), 19);
    assert_eq!(anthology_total_row_count(), 36);
    let all = poem_variation_label_rows();
    let special_rows = poem_variation_special_type_rows(&all);
    assert_eq!(special_rows.len(), 17);
    assert!(special_rows.iter().all(|r| r.row_kind == "special_type"));
}

#[test]
fn s03_block_balance_and_gold_slugs() {
    assert_eq!(
        anthology_block_counts(),
        &[
            ("venpaa", 10, 6),
            ("aciriyappa", 3, 5),
            ("kalippaa", 2, 5),
            ("vanjippaa", 2, 3),
        ]
    );
    assert_eq!(
        gold_parent_metre_slugs(),
        &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
    );
    assert_eq!(ontology_metre_type_fixed_ids().len(), 4);
    // Tree placement, not id-string heuristic.
    assert_eq!(
        anthology_sample_parent_metre("sinthadi_aciriyappaa"),
        Some("vanjippaa")
    );
}

/// Semantics: dense length / schema_version / special order ↔ ontology catalog.
#[test]
fn s03_dense_layout_and_special_order_coherent() {
    assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
    assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
    assert_eq!(dense_block_lengths_v1(), [12, 7, 8, 16, 8]);
    assert_eq!(
        dense_block_lengths_v1().iter().sum::<usize>(),
        PARSE_FEATURE_DENSE_LEN
    );
    assert_eq!(
        dense_linkage_special_slot_ids(),
        ontology_linkage_special_ids()
    );
}

#[test]
fn s03_dual_truth_classical_empty_pre_d01() {
    assert_eq!(soa_dual_truth_channel_ids(), &["ml_metre", "classical_metre"]);
    assert!(!soa_classical_checker_active());
    for m in [
        MetreType::Venpaa,
        MetreType::Aciriyappaa,
        MetreType::Kalippaa,
        MetreType::Vanjippaa,
    ] {
        assert!(
            classical_violations_for_metre(&m, &[], &[]).is_empty(),
            "classical must stay empty pre-D01 for {m:?}"
        );
    }
}

#[test]
fn s03_forbidden_training_use_catalog_present() {
    let ids = anthology_forbidden_training_use_ids();
    assert!(ids.len() >= 10);
    for need in [
        "bulk_train_variation_without_relabel",
        "variation_as_sole_adopt_criterion",
        "fuse_classical_into_ml_score",
        "invent_ontology_or_relabel_dense_semantics",
        "predicted_metre_as_gold",
    ] {
        assert!(ids.iter().any(|s| *s == need), "missing forbidden id {need}");
    }
}

/// Corpus fingerprints: machine pins matching S02 inventory / S03 ledger freeze.
///
/// Shape: `(path, bytes, sha256_hex)` — four sources (csv, jsonl, js, kural).
#[test]
fn s03_corpus_fingerprints_match_ledger_freeze() {
    let fps = soa_corpus_fingerprints();
    assert_eq!(
        fps.len(),
        4,
        "S03 must pin exactly four corpus sources (csv, jsonl, js, kural)"
    );
    assert_eq!(
        fps,
        &[
            (
                "data/training/poem_variations_training.csv",
                29923,
                "ba662c50ab7c1f64b7f27e7bd29efe90d03ab5e0fe8b01ed531ff7de0041a4f0",
            ),
            (
                "data/training/poem_variations_training.jsonl",
                198632,
                "64e24eb07e578f2ee550935c596e4d84c3fc871eb7a80d3c8cf625d0107f4183",
            ),
            (
                "data/poem_variations.js",
                27306,
                "bab20f8752451dcf61e66cb83bf488b58f92fc892fb8a938ea14d80704306cf5",
            ),
            (
                "tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json",
                560,
                "6f8fcfd04db7beb2c3668230595ddf2283922d93cbaf1443af0b53c5f4e294c0",
            ),
        ]
    );
}

/// Fingerprint paths must agree with anthology export path pins (no dual sources).
#[test]
fn s03_corpus_fingerprint_paths_match_anthology_export_pins() {
    let fps = soa_corpus_fingerprints();
    let paths: Vec<&str> = fps.iter().map(|(p, _, _)| *p).collect();
    assert!(
        paths.contains(&anthology_export_csv_path()),
        "csv path must match anthology_export_csv_path"
    );
    assert!(
        paths.contains(&anthology_export_jsonl_path()),
        "jsonl path must match anthology_export_jsonl_path"
    );
    assert!(
        paths.contains(&anthology_js_mirror_path()),
        "js path must match anthology_js_mirror_path"
    );
    assert!(
        paths.contains(&anthology_kural_golden_fixture_path()),
        "kural path must match anthology_kural_golden_fixture_path"
    );
}

/// Each fingerprint entry: non-zero bytes and 64-char lowercase hex sha256.
#[test]
fn s03_corpus_fingerprint_entries_have_valid_shape() {
    for (path, bytes, sha) in soa_corpus_fingerprints() {
        assert!(*bytes > 0, "{path}: bytes must be positive");
        assert_eq!(
            sha.len(),
            64,
            "{path}: sha256 hex must be 64 chars, got {}",
            sha.len()
        );
        assert!(
            sha.chars().all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase()),
            "{path}: sha256 must be lowercase hex"
        );
    }
}
