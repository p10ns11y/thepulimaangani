//! S02 anthology inventory — machine-readable pins for corpus evidence.
//!
//! Human inventory: repo
//! [`data/training/reports/anthology_inventory.md`](../../data/training/reports/anthology_inventory.md)
//! (+ `.json` twin). Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.0 S02 / §5.2 Anthology.
//!
//! Freezes **counts**, **split policy**, **export paths**, **forbidden training uses**,
//! and the **kural golden fixture role** so silent anthology drift fails tests.
//!
//! Bump [`ANTHOLOGY_INVENTORY_VERSION`] when sample add/remove/relabel, block lengths,
//! export path contracts, or forbidden-use catalog change (S03 fingerprint).
//!
//! Policy (must stay true):
//! - **Primary metrics** use `special_type` (N=17).
//! - **`variation`** is stress-only (N=19) and must remain isolatable.
//! - Golden kural fixture is parse-feature regression only — not multi-class train.
//! - No classical scoring merge; no bulk train on variation without relabel.

use crate::poem_variations::poem_variations_blocks;

/// Anthology inventory version for S03 ledger / consumers.
///
/// Bump when totals, block balance, export path pins, forbidden-use ids, or
/// sample→parent maps change.
pub const ANTHOLOGY_INVENTORY_VERSION: u32 = 1;

/// Total label rows in the curated anthology (special_type + variation).
pub fn anthology_total_row_count() -> usize {
    anthology_special_type_count() + anthology_variation_count()
}

/// Primary-gold row count (`row_kind = special_type`).
pub fn anthology_special_type_count() -> usize {
    poem_variations_blocks()
        .iter()
        .map(|b| b.special_types.len())
        .sum()
}

/// Stress-only row count (`row_kind = variation`).
pub fn anthology_variation_count() -> usize {
    poem_variations_blocks()
        .iter()
        .map(|b| b.variations.len())
        .sum()
}

/// Primary gold `row_kind` string.
pub fn anthology_primary_gold_row_kind() -> &'static str {
    "special_type"
}

/// Stress-only `row_kind` string.
pub fn anthology_stress_only_row_kind() -> &'static str {
    "variation"
}

/// Per-parent block counts: `(parent_metre, special_type_n, variation_n)`.
///
/// Order matches [`crate::poem_variations::poem_variations_blocks`]:
/// venpaa, aciriyappa, kalippaa, vanjippaa.
pub fn anthology_block_counts() -> &'static [(&'static str, usize, usize)] {
    // Frozen table must match live block lengths (asserted in unit tests).
    &[
        ("venpaa", 10, 6),
        ("aciriyappa", 3, 5),
        ("kalippaa", 2, 5),
        ("vanjippaa", 2, 3),
    ]
}

/// Class balance on **primary gold only** (`special_type`).
pub fn anthology_class_balance_special_type() -> &'static [(&'static str, usize)] {
    &[
        ("venpaa", 10),
        ("aciriyappa", 3),
        ("kalippaa", 2),
        ("vanjippaa", 2),
    ]
}

/// Wide tabular export path (repo-root relative).
pub fn anthology_export_csv_path() -> &'static str {
    "data/training/poem_variations_training.csv"
}

/// Nested tooling export path (repo-root relative).
pub fn anthology_export_jsonl_path() -> &'static str {
    "data/training/poem_variations_training.jsonl"
}

/// JS mirror of sample ids + texts (repo-root relative).
pub fn anthology_js_mirror_path() -> &'static str {
    "data/poem_variations.js"
}

/// Parse-feature golden fixture path (repo-root relative).
pub fn anthology_kural_golden_fixture_path() -> &'static str {
    "tamil-seiyul-alagi/tests/test_data/kural_venpaa_parse_features.json"
}

/// Role of the kural golden — feature regression, **not** multi-class train.
pub fn anthology_kural_fixture_role() -> &'static str {
    "parse_feature_regression_not_multiclass_train"
}

/// Machine ids for forbidden training / adopt uses (SOA consumers).
pub fn anthology_forbidden_training_use_ids() -> &'static [&'static str] {
    &[
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
    ]
}

/// Monte Carlo evaluation surface on primary gold: `special_type_n × iterations`.
pub fn anthology_mc_special_type_eval_count(iterations: u32) -> usize {
    anthology_special_type_count() * iterations as usize
}

/// Parent metre slug for a known anthology `sample_id`, or `None` if unknown.
///
/// Looks up the block that owns the sample (tree placement), **not** heuristics
/// from the id string alone — e.g. `sinthadi_aciriyappaa` → `vanjippaa`.
pub fn anthology_sample_parent_metre(sample_id: &str) -> Option<&'static str> {
    for block in poem_variations_blocks() {
        if block.special_types.iter().any(|r| r.en == sample_id)
            || block.variations.iter().any(|r| r.en == sample_id)
        {
            return Some(block.metre_key);
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parse_features::{PARSE_FEATURE_DENSE_LEN, PARSE_FEATURE_SCHEMA_VERSION};
    use crate::poem_variations::poem_variations_blocks;
    use crate::poem_variations_training::{
        gold_metre_type_for_parent, poem_variation_label_rows, poem_variation_special_type_rows,
    };
    use crate::semantics_contract::gold_parent_metre_slugs;

    #[test]
    fn inventory_version_and_row_kind_pins() {
        assert!(ANTHOLOGY_INVENTORY_VERSION >= 1);
        assert_eq!(anthology_primary_gold_row_kind(), "special_type");
        assert_eq!(anthology_stress_only_row_kind(), "variation");
    }

    #[test]
    fn totals_match_live_blocks() {
        let blocks = poem_variations_blocks();
        let special: usize = blocks.iter().map(|b| b.special_types.len()).sum();
        let variation: usize = blocks.iter().map(|b| b.variations.len()).sum();
        assert_eq!(special, 17);
        assert_eq!(variation, 19);
        assert_eq!(anthology_special_type_count(), special);
        assert_eq!(anthology_variation_count(), variation);
        assert_eq!(anthology_total_row_count(), 36);
        assert_eq!(special + variation, anthology_total_row_count());
    }

    #[test]
    fn frozen_block_table_matches_live_lengths() {
        let live = poem_variations_blocks();
        let frozen = anthology_block_counts();
        assert_eq!(frozen.len(), live.len());
        for (i, (slug, s, v)) in frozen.iter().enumerate() {
            assert_eq!(live[i].metre_key, *slug);
            assert_eq!(live[i].special_types.len(), *s);
            assert_eq!(live[i].variations.len(), *v);
        }
        let special_sum: usize = frozen.iter().map(|(_, s, _)| *s).sum();
        let variation_sum: usize = frozen.iter().map(|(_, _, v)| *v).sum();
        assert_eq!(special_sum, anthology_special_type_count());
        assert_eq!(variation_sum, anthology_variation_count());
    }

    #[test]
    fn class_balance_special_type_only() {
        let bal = anthology_class_balance_special_type();
        assert_eq!(
            bal,
            &[
                ("venpaa", 10),
                ("aciriyappa", 3),
                ("kalippaa", 2),
                ("vanjippaa", 2),
            ]
        );
        let n: usize = bal.iter().map(|(_, c)| *c).sum();
        assert_eq!(n, anthology_special_type_count());
        for (slug, expected) in bal {
            let live_n = poem_variations_blocks()
                .iter()
                .find(|b| b.metre_key == *slug)
                .map(|b| b.special_types.len())
                .unwrap_or(0);
            assert_eq!(live_n, *expected, "special_type for {slug}");
        }
        assert_eq!(
            gold_parent_metre_slugs(),
            &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
        );
    }

    #[test]
    fn export_and_golden_path_pins() {
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
        assert!(anthology_kural_golden_fixture_path()
            .ends_with("kural_venpaa_parse_features.json"));
        // Semantics consumer pins unchanged by S02.
        assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
        assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
    }

    #[test]
    fn forbidden_training_use_catalog() {
        let ids = anthology_forbidden_training_use_ids();
        assert!(ids.len() >= 8);
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
            assert!(ids.iter().any(|s| *s == need), "missing {need}");
        }
    }

    #[test]
    fn mc_special_type_eval_count() {
        assert_eq!(anthology_mc_special_type_eval_count(20), 340);
        assert_eq!(
            anthology_mc_special_type_eval_count(20),
            anthology_special_type_count() * 20
        );
    }

    #[test]
    fn sinthadi_aciriyappaa_parent_is_vanjippaa_not_aciriyappa() {
        assert_eq!(
            anthology_sample_parent_metre("sinthadi_aciriyappaa"),
            Some("vanjippaa")
        );
        assert_ne!(
            anthology_sample_parent_metre("sinthadi_aciriyappaa"),
            Some("aciriyappa")
        );
        assert!(gold_metre_type_for_parent("vanjippaa").is_some());
        assert_eq!(anthology_sample_parent_metre("not_a_real_sample"), None);
    }

    #[test]
    fn live_label_rows_match_inventory() {
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
        for (slug, expected) in anthology_class_balance_special_type() {
            let n = special.iter().filter(|r| r.parent_metre == *slug).count();
            assert_eq!(n, *expected, "special_type count for {slug}");
        }
        // Every sample maps back to its label parent.
        for row in &all {
            assert_eq!(
                anthology_sample_parent_metre(&row.sample_id),
                Some(row.parent_metre.as_str())
            );
        }
    }
}
