//! S03 SOA ledger — composite fingerprint of Ontology + Semantics + Anthology.
//!
//! Human ledger: repo
//! [`data/training/reports/soa_ledger.md`](../../data/training/reports/soa_ledger.md)
//! (+ `.json` twin). Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 S03 / §5.2.
//!
//! Aggregates the three foundation version pins and schema ids so Tier A
//! (`A00_baseline_freeze` and later) can refuse work when SOA drifts without a
//! re-baseline.
//!
//! Bump [`SOA_LEDGER_VERSION`] when any constituent version, schema id, or the
//! composite freeze policy documented in the ledger changes. Constituent bumps
//! (S00/S01/S02 modules, `PARSE_FEATURE_SCHEMA_VERSION`, etc.) require a ledger
//! refresh even if this constant stays the same **only when** the change is
//! already covered by those pins — prefer bumping this version whenever the
//! published ledger JSON is regenerated after a constituent change.

use crate::anthology_inventory::ANTHOLOGY_INVENTORY_VERSION;
use crate::metre::ml_head::METRE_ML_WEIGHT_SCHEMA;
use crate::ontology_map::ONTOLOGY_MAP_VERSION;
use crate::parse_features::{PARSE_FEATURE_DENSE_LEN, PARSE_FEATURE_SCHEMA_VERSION};
use crate::semantics_contract::SEMANTICS_CONTRACT_VERSION;
use crate::types::PARSE_RESULT_SCHEMA_VERSION;

/// Composite SOA ledger version for consumers (A00+ `require_soa`).
///
/// Bump when the published ledger freeze set changes: constituent version
/// policy, schema-id set, dual-truth / classical isolation, or split policy
/// summary that A\* steps are allowed to read.
pub const SOA_LEDGER_VERSION: u32 = 2;

/// Schema / catalog ids frozen by this ledger (machine keys for reports).
///
/// Order is stable for snapshot tests. Values are the **current** numeric ids
/// from production constants (not presentation labels).
pub fn soa_schema_ids() -> &'static [(&'static str, u32)] {
    &[
        ("SOA_LEDGER_VERSION", SOA_LEDGER_VERSION),
        ("ONTOLOGY_MAP_VERSION", ONTOLOGY_MAP_VERSION),
        ("SEMANTICS_CONTRACT_VERSION", SEMANTICS_CONTRACT_VERSION),
        ("ANTHOLOGY_INVENTORY_VERSION", ANTHOLOGY_INVENTORY_VERSION),
        ("PARSE_FEATURE_SCHEMA_VERSION", PARSE_FEATURE_SCHEMA_VERSION),
        ("PARSE_FEATURE_DENSE_LEN", PARSE_FEATURE_DENSE_LEN as u32),
        ("PARSE_RESULT_SCHEMA_VERSION", PARSE_RESULT_SCHEMA_VERSION),
        ("METRE_ML_WEIGHT_SCHEMA", METRE_ML_WEIGHT_SCHEMA),
    ]
}

/// Human report paths (repo-root relative) that together form the SOA freeze.
pub fn soa_report_paths() -> &'static [(&'static str, &'static str)] {
    &[
        ("ontology_map", "data/training/reports/ontology_map.md"),
        ("semantics_contract", "data/training/reports/semantics_contract.md"),
        ("anthology_inventory", "data/training/reports/anthology_inventory.md"),
        ("anthology_inventory_json", "data/training/reports/anthology_inventory.json"),
        ("soa_ledger", "data/training/reports/soa_ledger.md"),
        ("soa_ledger_json", "data/training/reports/soa_ledger.json"),
    ]
}

/// Primary gold row kind for adopt metrics (portfolio §5.2 Anthology).
pub fn soa_primary_gold_row_kind() -> &'static str {
    crate::anthology_inventory::anthology_primary_gold_row_kind()
}

/// Stress-only row kind (never sole ADOPT criterion).
pub fn soa_stress_only_row_kind() -> &'static str {
    crate::anthology_inventory::anthology_stress_only_row_kind()
}

/// Dual-truth channel ids — parallel; classical must stay empty pre-D01.
pub fn soa_dual_truth_channel_ids() -> &'static [&'static str] {
    crate::ontology_map::ontology_dual_truth_channel_ids()
}

/// Whether classical_checker is allowed to emit non-empty violations in this freeze.
///
/// True after A12 pattern freeze (gates D01 classical dual path).
pub fn soa_classical_checker_active() -> bool {
    crate::ml_eval::classical_path_allowed()
}

/// Compact fingerprint string of schema ids (stable for logs / metrics JSON).
///
/// Format: `soa=V;ont=V;sem=V;anth=V;dense_schema=V;dense_len=N;parse_result=V;ml_weight=V`
pub fn soa_schema_fingerprint_string() -> String {
    format!(
        "soa={};ont={};sem={};anth={};dense_schema={};dense_len={};parse_result={};ml_weight={}",
        SOA_LEDGER_VERSION,
        ONTOLOGY_MAP_VERSION,
        SEMANTICS_CONTRACT_VERSION,
        ANTHOLOGY_INVENTORY_VERSION,
        PARSE_FEATURE_SCHEMA_VERSION,
        PARSE_FEATURE_DENSE_LEN,
        PARSE_RESULT_SCHEMA_VERSION,
        METRE_ML_WEIGHT_SCHEMA,
    )
}

/// Corpus fingerprints frozen at S03 ledger freeze: `(path, bytes, sha256_hex)`.
///
/// Order matches ledger §3.3 / S02 inventory: CSV export, JSONL export, JS mirror,
/// kural golden fixture. Paths must agree with
/// [`crate::anthology_inventory`] export path pins (asserted in unit + integration
/// tests). Bump [`SOA_LEDGER_VERSION`] (and regenerate ledger docs) when any hash
/// or byte length changes after re-export.
pub fn soa_corpus_fingerprints() -> &'static [(&'static str, u64, &'static str)] {
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::anthology_inventory::{
        anthology_special_type_count, anthology_total_row_count, anthology_variation_count,
        ANTHOLOGY_INVENTORY_VERSION,
    };
    use crate::metre::classical_violations_for_metre;
    use crate::metre::MetreType;
    use crate::ontology_map::{
        ontology_dual_truth_channel_ids, ontology_linkage_special_ids, ontology_metre_type_fixed_ids,
        ONTOLOGY_MAP_VERSION,
    };
    use crate::semantics_contract::{
        dense_block_lengths_v1, dense_linkage_special_slot_ids, gold_parent_metre_slugs,
        SEMANTICS_CONTRACT_VERSION,
    };

    #[test]
    fn ledger_version_and_schema_ids_pinned() {
        assert!(SOA_LEDGER_VERSION >= 1);
        let ids = soa_schema_ids();
        assert_eq!(ids.len(), 8);
        assert_eq!(ids[0], ("SOA_LEDGER_VERSION", SOA_LEDGER_VERSION));
        assert_eq!(ids[1], ("ONTOLOGY_MAP_VERSION", ONTOLOGY_MAP_VERSION));
        assert_eq!(ids[2], ("SEMANTICS_CONTRACT_VERSION", SEMANTICS_CONTRACT_VERSION));
        assert_eq!(ids[3], ("ANTHOLOGY_INVENTORY_VERSION", ANTHOLOGY_INVENTORY_VERSION));
        assert_eq!(ids[4], ("PARSE_FEATURE_SCHEMA_VERSION", PARSE_FEATURE_SCHEMA_VERSION));
        assert_eq!(ids[5], ("PARSE_FEATURE_DENSE_LEN", PARSE_FEATURE_DENSE_LEN as u32));
        assert_eq!(ids[6], ("PARSE_RESULT_SCHEMA_VERSION", PARSE_RESULT_SCHEMA_VERSION));
        assert_eq!(ids[7], ("METRE_ML_WEIGHT_SCHEMA", METRE_ML_WEIGHT_SCHEMA));
        // Frozen foundation numbers at S03 ADOPT.
        assert_eq!(ONTOLOGY_MAP_VERSION, 1);
        assert_eq!(SEMANTICS_CONTRACT_VERSION, 1);
        assert_eq!(ANTHOLOGY_INVENTORY_VERSION, 1);
        assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
        assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
        assert_eq!(PARSE_RESULT_SCHEMA_VERSION, 2);
        assert_eq!(METRE_ML_WEIGHT_SCHEMA, 3);
        assert_eq!(SOA_LEDGER_VERSION, 2);
    }

    #[test]
    fn schema_fingerprint_string_stable_shape() {
        let fp = soa_schema_fingerprint_string();
        assert!(fp.starts_with("soa=2;ont=1;sem=1;anth=1;"));
        assert!(fp.contains("dense_schema=1"));
        assert!(fp.contains("dense_len=51"));
        assert!(fp.contains("parse_result=2"));
        assert!(fp.contains("ml_weight=3"));
    }

    #[test]
    fn report_paths_cover_three_pillars_and_ledger() {
        let paths = soa_report_paths();
        assert!(paths.iter().any(|(k, p)| *k == "ontology_map" && p.ends_with("ontology_map.md")));
        assert!(paths
            .iter()
            .any(|(k, p)| *k == "semantics_contract" && p.ends_with("semantics_contract.md")));
        assert!(paths
            .iter()
            .any(|(k, p)| *k == "anthology_inventory" && p.ends_with("anthology_inventory.md")));
        assert!(paths
            .iter()
            .any(|(k, p)| *k == "soa_ledger" && p.ends_with("soa_ledger.md")));
        assert!(paths
            .iter()
            .any(|(k, p)| *k == "soa_ledger_json" && p.ends_with("soa_ledger.json")));
    }

    #[test]
    fn primary_gold_special_type_variation_stress() {
        assert_eq!(soa_primary_gold_row_kind(), "special_type");
        assert_eq!(soa_stress_only_row_kind(), "variation");
        assert_eq!(anthology_special_type_count(), 17);
        assert_eq!(anthology_variation_count(), 19);
        assert_eq!(anthology_total_row_count(), 36);
    }

    #[test]
    fn dual_truth_and_classical_isolation() {
        assert_eq!(soa_dual_truth_channel_ids(), ontology_dual_truth_channel_ids());
        assert_eq!(soa_dual_truth_channel_ids(), &["ml_metre", "classical_metre"]);
        // A12 freeze unlocks D01 classical path (violations annotate; never fuse into hybrid score).
        assert!(soa_classical_checker_active());
        for m in [
            MetreType::Venpaa,
            MetreType::Aciriyappaa,
            MetreType::Kalippaa,
            MetreType::Vanjippaa,
        ] {
            let v = classical_violations_for_metre(&m, &[], &[]);
            assert!(
                v.iter().any(|s| s.contains("empty_feet")),
                "classical D01 flags empty feet for {m:?}, got {v:?}"
            );
        }
    }

    #[test]
    fn dense_semantics_align_with_ontology_special_catalog() {
        assert_eq!(dense_linkage_special_slot_ids(), ontology_linkage_special_ids());
        assert_eq!(dense_block_lengths_v1().iter().sum::<usize>(), PARSE_FEATURE_DENSE_LEN);
        assert_eq!(ontology_metre_type_fixed_ids().len(), 4);
        assert_eq!(
            gold_parent_metre_slugs(),
            &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
        );
    }

    #[test]
    fn corpus_fingerprints_four_sources_match_export_paths() {
        use crate::anthology_inventory::{
            anthology_export_csv_path, anthology_export_jsonl_path, anthology_js_mirror_path,
            anthology_kural_golden_fixture_path,
        };

        let fps = soa_corpus_fingerprints();
        assert_eq!(fps.len(), 4);
        assert_eq!(fps[0].0, anthology_export_csv_path());
        assert_eq!(fps[1].0, anthology_export_jsonl_path());
        assert_eq!(fps[2].0, anthology_js_mirror_path());
        assert_eq!(fps[3].0, anthology_kural_golden_fixture_path());
        for (path, bytes, sha) in fps {
            assert!(*bytes > 0, "{path}: bytes must be positive");
            assert_eq!(sha.len(), 64, "{path}: sha256 must be 64 hex chars");
            assert!(
                sha.chars()
                    .all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase()),
                "{path}: sha256 must be lowercase hex"
            );
        }
        // Freeze values matching soa_ledger.md §3.3 / S02 inventory.
        assert_eq!(fps[0].1, 29923);
        assert_eq!(
            fps[0].2,
            "ba662c50ab7c1f64b7f27e7bd29efe90d03ab5e0fe8b01ed531ff7de0041a4f0"
        );
        assert_eq!(fps[1].1, 198632);
        assert_eq!(
            fps[1].2,
            "64e24eb07e578f2ee550935c596e4d84c3fc871eb7a80d3c8cf625d0107f4183"
        );
        assert_eq!(fps[2].1, 27306);
        assert_eq!(
            fps[2].2,
            "bab20f8752451dcf61e66cb83bf488b58f92fc892fb8a938ea14d80704306cf5"
        );
        assert_eq!(fps[3].1, 560);
        assert_eq!(
            fps[3].2,
            "6f8fcfd04db7beb2c3668230595ddf2283922d93cbaf1443af0b53c5f4e294c0"
        );
    }
}
