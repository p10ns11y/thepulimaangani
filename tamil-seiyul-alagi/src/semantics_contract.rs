//! S01 semantics contract — machine-readable pins for measurement meanings.
//!
//! Human contract: repo
//! [`data/training/reports/semantics_contract.md`](../../data/training/reports/semantics_contract.md).
//! Portfolio: `METRE_ML_METHODS_PORTFOLIO.md` §5.2 Semantics.
//!
//! Dense **formulas** remain authoritative in `PARSE_FEATURES.md` / `parse_features.rs`.
//! This module freezes **names**, **schema ids**, **gold slug map**, and **score-scale
//! channel ids** so silent meaning drift fails tests.
//!
//! Bump [`SEMANTICS_CONTRACT_VERSION`] when dense meaning, gold slug map, score-scale
//! contract, or documented wire-key tables change (S03 fingerprint).

use crate::parse_features::{
    FOOT_PATTERN_BIN_DIM, GLOBAL_FEATURE_DIM, LINE_FOOT_HIST_FEATURE_DIM, LINKAGE_TYPE_FEATURE_DIM,
    LINK_SPECIAL_FEATURE_DIM,
};

/// Semantics contract version for S03 ledger / consumers.
pub const SEMANTICS_CONTRACT_VERSION: u32 = 1;

/// Conceptual names for `dense[0..12)` (global block). Order = index offset from
/// [`crate::parse_features::GLOBAL_FEATURE_OFFSET`].
pub fn dense_global_feature_ids() -> &'static [&'static str] {
    &[
        "log_letters",
        "vikalpa_count",
        "line_count",
        "foot_count",
        "syllable_count",
        "mean_feet_per_line",
        "max_feet_per_line",
        "mean_syllables_per_foot",
        "max_syllables_per_foot",
        "ner_ratio",
        "nirai_ratio",
        "linkage_edge_count",
    ]
}

/// Wire keys (or reserved markers) for `dense[12..19)` linkage-type slots.
///
/// Indices 4–5 are reserved zeros in schema v1 (`__reserved_4`, `__reserved_5`).
/// Slot 6 is open `Other(_)`.
pub fn dense_linkage_type_slot_ids() -> &'static [&'static str] {
    &[
        "VenTalai",
        "AciriyaTalai",
        "KaliTalai",
        "VanjiTalai",
        "__reserved_4",
        "__reserved_5",
        "Other",
    ]
}

/// Wire keys for `dense[19..27)` special-bond slots (same order as
/// [`crate::ontology_map::ontology_linkage_special_ids`]).
pub fn dense_linkage_special_slot_ids() -> &'static [&'static str] {
    crate::ontology_map::ontology_linkage_special_ids()
}

/// Anthology `parent_metre` slugs that map to the four fixed coarse metres.
///
/// Note intentional asymmetry: slug `aciriyappa` (one *a*) → wire `Aciriyappaa`.
pub fn gold_parent_metre_slugs() -> &'static [&'static str] {
    &["venpaa", "aciriyappa", "kalippaa", "vanjippaa"]
}

/// Named score / probability channels (documentation pins for tests).
pub fn score_scale_ids() -> &'static [&'static str] {
    &[
        "aggregate_score_pre_hybrid_integer",
        "aggregate_score_post_hybrid_approx_100x_prob",
        "metre_probability",
        "metre_rank",
        "metre_entropy_bits",
        "metre_epistemic_margin",
        "confidence_legacy_integer",
    ]
}

/// Layout block lengths for schema v1 (must sum to
/// [`crate::parse_features::PARSE_FEATURE_DENSE_LEN`]).
pub fn dense_block_lengths_v1() -> [usize; 5] {
    [
        GLOBAL_FEATURE_DIM,
        LINKAGE_TYPE_FEATURE_DIM,
        LINK_SPECIAL_FEATURE_DIM,
        FOOT_PATTERN_BIN_DIM,
        LINE_FOOT_HIST_FEATURE_DIM,
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::linkage::{LinkageSpecialType, LinkageType};
    use crate::metre::classical_violations_for_metre;
    use crate::metre::ml_head::{
        class_index_for_metre, metre_for_class_index, METRE_ML_NUM_CLASSES, METRE_ML_WEIGHT_SCHEMA,
    };
    use crate::metre::MetreType;
    use crate::ontology_map::ontology_linkage_special_ids;
    use crate::parse_features::{
        FOOT_PATTERN_BIN_OFFSET, GLOBAL_FEATURE_OFFSET, LINE_FOOT_HIST_OFFSET,
        LINKAGE_TYPE_FEATURE_OFFSET, LINK_SPECIAL_FEATURE_OFFSET, PARSE_FEATURE_DENSE_LEN,
        PARSE_FEATURE_SCHEMA_VERSION,
    };
    use crate::poem_variations_training::{
        gold_metre_label_for_parent, gold_metre_type_for_parent, poem_variation_label_rows,
        poem_variation_special_type_rows,
    };
    use crate::presentation::to_display;
    use crate::types::{ParseFeatureSnapshot, ParseOptions};

    #[test]
    fn schema_version_and_dense_len_pinned() {
        assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
        assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
        assert_eq!(SEMANTICS_CONTRACT_VERSION, 1);
        // Hybrid weight schema is independent but documented alongside score scales.
        assert_eq!(METRE_ML_WEIGHT_SCHEMA, 3);
    }

    #[test]
    fn dense_block_lengths_sum_to_51() {
        let blocks = dense_block_lengths_v1();
        assert_eq!(blocks, [12, 7, 8, 16, 8]);
        assert_eq!(blocks.iter().sum::<usize>(), PARSE_FEATURE_DENSE_LEN);
        assert_eq!(GLOBAL_FEATURE_OFFSET, 0);
        assert_eq!(LINKAGE_TYPE_FEATURE_OFFSET, 12);
        assert_eq!(LINK_SPECIAL_FEATURE_OFFSET, 19);
        assert_eq!(FOOT_PATTERN_BIN_OFFSET, 27);
        assert_eq!(LINE_FOOT_HIST_OFFSET, 43);
    }

    #[test]
    fn global_feature_ids_match_schema_v1_length() {
        let ids = dense_global_feature_ids();
        assert_eq!(ids.len(), GLOBAL_FEATURE_DIM);
        assert_eq!(ids[0], "log_letters");
        assert_eq!(ids[9], "ner_ratio");
        assert_eq!(ids[10], "nirai_ratio");
        assert_eq!(ids[11], "linkage_edge_count");
    }

    #[test]
    fn linkage_type_slot_ids_and_reserved_bins() {
        let ids = dense_linkage_type_slot_ids();
        assert_eq!(ids.len(), LINKAGE_TYPE_FEATURE_DIM);
        assert_eq!(ids[0], "VenTalai");
        assert_eq!(ids[1], "AciriyaTalai");
        assert_eq!(ids[2], "KaliTalai");
        assert_eq!(ids[3], "VanjiTalai");
        assert_eq!(ids[4], "__reserved_4");
        assert_eq!(ids[5], "__reserved_5");
        assert_eq!(ids[6], "Other");

        // Serialize canonical wire keys for the four fixed families.
        assert_eq!(
            serde_json::to_string(&LinkageType::VenTalai).unwrap(),
            "\"VenTalai\""
        );
        assert_eq!(
            serde_json::to_string(&LinkageType::AciriyaTalai).unwrap(),
            "\"AciriyaTalai\""
        );
    }

    #[test]
    fn linkage_special_slot_ids_match_ontology_catalog() {
        assert_eq!(
            dense_linkage_special_slot_ids(),
            ontology_linkage_special_ids()
        );
        assert_eq!(dense_linkage_special_slot_ids().len(), LINK_SPECIAL_FEATURE_DIM);
        assert_eq!(dense_linkage_special_slot_ids().len(), 8);
    }

    #[test]
    fn gold_parent_slugs_map_to_metre_type_and_ml_class() {
        let expected = [
            ("venpaa", MetreType::Venpaa, "Venpaa", 0usize),
            ("aciriyappa", MetreType::Aciriyappaa, "Aciriyappaa", 1),
            ("kalippaa", MetreType::Kalippaa, "Kalippaa", 2),
            ("vanjippaa", MetreType::Vanjippaa, "Vanjippaa", 3),
        ];
        assert_eq!(gold_parent_metre_slugs().len(), 4);
        assert_eq!(METRE_ML_NUM_CLASSES, 4);

        for (i, (slug, metre, label, class)) in expected.into_iter().enumerate() {
            assert_eq!(gold_parent_metre_slugs()[i], slug);
            assert_eq!(gold_metre_type_for_parent(slug), Some(metre.clone()));
            assert_eq!(gold_metre_label_for_parent(slug), Some(label));
            assert_eq!(class_index_for_metre(&metre), Some(class));
            assert_eq!(metre_for_class_index(class), Some(metre.clone()));
            // Wire JSON for fixed metres uses the label string.
            assert_eq!(
                serde_json::to_string(&metre).unwrap(),
                format!("\"{label}\"")
            );
        }

        // Intentional slug asymmetry documented in contract.
        assert_eq!(
            gold_metre_type_for_parent("aciriyappa"),
            Some(MetreType::Aciriyappaa)
        );
        assert_ne!(
            gold_metre_label_for_parent("aciriyappa"),
            Some("aciriyappa")
        );
        assert_eq!(gold_metre_type_for_parent("asiriyappa"), None);
        assert_eq!(gold_metre_type_for_parent("unknown"), None);
        assert_eq!(class_index_for_metre(&MetreType::Other("x".into())), None);
    }

    #[test]
    fn score_scale_ids_are_documented_channels() {
        let ids = score_scale_ids();
        assert!(ids.contains(&"aggregate_score_pre_hybrid_integer"));
        assert!(ids.contains(&"metre_probability"));
        assert!(ids.contains(&"metre_entropy_bits"));
        // Training path keeps hybrid off → pre-hybrid integer scores in exports.
        let train = ParseOptions::poem_variations_training();
        assert!(
            train.skip_ml_metre,
            "poem_variations_training must skip hybrid so export scores stay pre-hybrid integers"
        );
        assert!(train.uyir_u);
    }

    #[test]
    fn metre_serde_alias_asiriyappaa_reads_to_aciriyappaa() {
        let m: MetreType = serde_json::from_str("\"Asiriyappaa\"").unwrap();
        assert_eq!(m, MetreType::Aciriyappaa);
        // Writes stay canonical.
        assert_eq!(
            serde_json::to_string(&MetreType::Aciriyappaa).unwrap(),
            "\"Aciriyappaa\""
        );
    }

    #[test]
    fn linkage_legacy_aliases_deserialize_only() {
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"Venthalai\"").unwrap(),
            LinkageType::VenTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageSpecialType>("\"IyarcirVenthalai\"").unwrap(),
            LinkageSpecialType::IyarcirVenthalai
        );
        assert_eq!(
            serde_json::to_string(&LinkageSpecialType::IyarcirVenthalai).unwrap(),
            "\"IyarcirVenTalai\""
        );
    }

    #[test]
    fn presentation_metre_is_tamil_machine_is_latin() {
        let disp = to_display("x", &Some(MetreType::Venpaa), &[], &[], &[]);
        assert_eq!(disp.metre_type.as_deref(), Some("வெண்பா"));
        assert_eq!(
            serde_json::to_string(&MetreType::Venpaa).unwrap(),
            "\"Venpaa\""
        );

        let disp_a = to_display("x", &Some(MetreType::Aciriyappaa), &[], &[], &[]);
        assert_eq!(disp_a.metre_type.as_deref(), Some("ஆசிரியப்பா"));
    }

    #[test]
    fn classical_channel_active_after_a12_freeze() {
        // D01 is gated by A12 freeze; empty feet yields a structural classical flag.
        for m in [
            MetreType::Venpaa,
            MetreType::Aciriyappaa,
            MetreType::Kalippaa,
            MetreType::Vanjippaa,
        ] {
            let v = classical_violations_for_metre(&m, &[], &[]);
            assert!(
                v.iter().any(|s| s.contains("empty_feet")),
                "classical D01 should flag empty feet for {m:?}, got {v:?}"
            );
        }
    }

    #[test]
    fn golden_fixture_schema_version_matches_constant() {
        let fixture: ParseFeatureSnapshot = serde_json::from_str(include_str!(
            "../tests/test_data/kural_venpaa_parse_features.json"
        ))
        .expect("kural fixture");
        assert_eq!(fixture.schema_version, PARSE_FEATURE_SCHEMA_VERSION);
        assert_eq!(fixture.dense.len(), PARSE_FEATURE_DENSE_LEN);
    }

    /// Anthology supervision policy (S01): primary metrics use `special_type`;
    /// `variation` is stress-only and must be isolatable from the special filter.
    #[test]
    fn primary_gold_is_special_type_variation_is_stress_only() {
        let all = poem_variation_label_rows();
        assert!(!all.is_empty(), "anthology label rows must exist");

        let special = poem_variation_special_type_rows(&all);
        assert!(!special.is_empty(), "special_type slice must be non-empty");
        assert!(
            special.iter().all(|r| r.row_kind == "special_type"),
            "poem_variation_special_type_rows must yield only special_type"
        );

        let variation_n = all.iter().filter(|r| r.row_kind == "variation").count();
        assert!(variation_n > 0, "variation stress slice must exist");
        assert_eq!(
            special.len() + variation_n,
            all.len(),
            "only special_type and variation row_kinds are supervised labels"
        );
        assert!(
            special.len() < all.len(),
            "variation must be isolatable from primary special_type metrics"
        );

        // Every special_type row's parent_metre must map to a fixed gold metre.
        for row in &special {
            assert!(
                gold_metre_type_for_parent(&row.parent_metre).is_some(),
                "special_type parent_metre {:?} must map under gold contract",
                row.parent_metre
            );
        }
    }
}
