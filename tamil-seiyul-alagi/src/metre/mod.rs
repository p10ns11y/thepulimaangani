//! Coarse metre: [`MetreType`], linkage summaries, heuristic [`prediction`], hybrid [`ml_head`],
//! and [`classical_checker`] (strict rules — placeholder until implemented).
//!
//! See **[`METRE_PREDICTION.md`](../../METRE_PREDICTION.md)** for first principles, second-order effects, and third-order consequences of changes to this stack.

mod classical_checker;
mod fractions;
pub mod ml_head;
mod prediction;

pub use classical_checker::classical_violations_for_metre;
pub use fractions::linkage_coarse_fractions;
pub use prediction::{
    boost_metre_hypotheses_with_dense, detect_metre_hypotheses, sort_metre_hypotheses_by_score,
};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
pub enum MetreType {
    Venpaa,
    /// ஆசிரியப்பா — WASM/JSON key uses Tamil-style romanization (`aciriya`), not Sanskrit-style `asiriya`.
    #[serde(rename = "Aciriyappaa", alias = "Asiriyappaa")]
    Aciriyappaa,
    Kalippaa,
    Vanjippaa,
    Other(String),
}

/// Named coarse classes used by heuristic + hybrid heads (excludes open `Other`).
pub const METRE_TYPE_NAMED: [MetreType; 4] = [
    MetreType::Venpaa,
    MetreType::Aciriyappaa,
    MetreType::Kalippaa,
    MetreType::Vanjippaa,
];

#[cfg(test)]
mod ontology_enum_tests {
    use super::*;

    /// Compile-time lock: adding a variant without updating this match fails to build.
    fn metre_variant_tag(m: &MetreType) -> &'static str {
        match m {
            MetreType::Venpaa => "Venpaa",
            MetreType::Aciriyappaa => "Aciriyappaa",
            MetreType::Kalippaa => "Kalippaa",
            MetreType::Vanjippaa => "Vanjippaa",
            MetreType::Other(_) => "Other",
        }
    }

    #[test]
    fn metre_type_named_set_is_four_plus_other_escape() {
        assert_eq!(METRE_TYPE_NAMED.len(), 4);
        assert_eq!(metre_variant_tag(&MetreType::Venpaa), "Venpaa");
        assert_eq!(metre_variant_tag(&MetreType::Aciriyappaa), "Aciriyappaa");
        assert_eq!(metre_variant_tag(&MetreType::Kalippaa), "Kalippaa");
        assert_eq!(metre_variant_tag(&MetreType::Vanjippaa), "Vanjippaa");
        assert_eq!(
            metre_variant_tag(&MetreType::Other("x".into())),
            "Other"
        );
    }

    #[test]
    fn metre_type_serializes_canonical_json_keys() {
        assert_eq!(
            serde_json::to_string(&MetreType::Venpaa).unwrap(),
            "\"Venpaa\""
        );
        assert_eq!(
            serde_json::to_string(&MetreType::Aciriyappaa).unwrap(),
            "\"Aciriyappaa\""
        );
        assert_eq!(
            serde_json::to_string(&MetreType::Kalippaa).unwrap(),
            "\"Kalippaa\""
        );
        assert_eq!(
            serde_json::to_string(&MetreType::Vanjippaa).unwrap(),
            "\"Vanjippaa\""
        );
        assert_eq!(
            serde_json::to_string(&MetreType::Other("Custom".into())).unwrap(),
            "{\"Other\":\"Custom\"}"
        );
    }

    #[test]
    fn metre_type_deserializes_canonical_and_legacy_aliases() {
        assert_eq!(
            serde_json::from_str::<MetreType>("\"Venpaa\"").unwrap(),
            MetreType::Venpaa
        );
        assert_eq!(
            serde_json::from_str::<MetreType>("\"Aciriyappaa\"").unwrap(),
            MetreType::Aciriyappaa
        );
        assert_eq!(
            serde_json::from_str::<MetreType>("\"Asiriyappaa\"").unwrap(),
            MetreType::Aciriyappaa
        );
        assert_eq!(
            serde_json::from_str::<MetreType>("\"Kalippaa\"").unwrap(),
            MetreType::Kalippaa
        );
        assert_eq!(
            serde_json::from_str::<MetreType>("\"Vanjippaa\"").unwrap(),
            MetreType::Vanjippaa
        );
    }

    #[test]
    fn classical_channel_placeholder_returns_no_violations() {
        use crate::foot::Foot;
        use crate::linkage::Linkage;
        let empty_feet: &[Foot] = &[];
        let empty_link: &[Linkage] = &[];
        for m in &METRE_TYPE_NAMED {
            assert!(
                classical_violations_for_metre(m, empty_feet, empty_link).is_empty(),
                "classical checker must stay empty until D01 for {m:?}"
            );
        }
    }
}
