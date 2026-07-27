//! Metre ML portfolio Tier A–D evaluation heads, dual-truth, and product-facing summaries.
//!
//! Contract: [`crate`]/Ydocs in `METRE_ML_METHODS_PORTFOLIO.md`]. Classical scores never fuse
//! into hybrid aggregate scores — dual-truth only.

pub mod association;
pub mod calibration;
pub mod dense_logistic;
pub mod disagreement;
pub mod head_ab;
pub mod knn;
pub mod metrics;
pub mod motifs;
pub mod pattern_cards;
pub mod product_surface;

// Offline / research modules — optional for lean WASM (`--no-default-features`).
#[cfg(feature = "ml-eval-offline")]
pub mod mi_chi2;
#[cfg(feature = "ml-eval-offline")]
pub mod offline_b;
#[cfg(feature = "ml-eval-offline")]
pub mod pca_lda;
#[cfg(feature = "ml-eval-offline")]
pub mod pilots_c;

/// Portfolio step ids A00–D03 (canonical order after S03).
pub const TIER_STEP_IDS: &[&str] = &[
    "A00_baseline_freeze",
    "A01_eval_harness",
    "A02_two_truth_schema",
    "A03_pure_dense_logistic",
    "A04_prototypes_knn",
    "A05_lda_pca_reports",
    "A06_mi_and_chi2",
    "A07_calibration",
    "A08_association_rules",
    "A09_sequence_motifs",
    "A10_ablation",
    "A11_counterfactuals",
    "A12_pattern_cards",
    "A13_head_ab",
    "B01_tree_importances",
    "B02_clustering",
    "B03_anomaly",
    "B04_kernel_nb_ceilings",
    "B05_hmm_crf_sketch",
    "B06_graph_motifs",
    "B07_dtw_emd",
    "B08_ordinal_likeness",
    "C01_active_learning",
    "C02_metric_learning",
    "C03_cnn_transformer_pilot",
    "C04_bayesian_line_filter",
    "C05_fst_scaffold",
    "D01_classical_violations",
    "D02_ilp_sat_backend",
    "D03_dual_compare_report",
];

/// Set when A12 pattern cards + freeze artifact are committed (gates D01).
pub const A12_PATTERN_FREEZE: bool = true;

/// A12 freeze date (ISO) for dual-truth classical gate docs.
pub const A12_FREEZE_DATE: &str = "2026-07-27";

/// Whether classical checker may attach violations (requires A12 freeze).
pub fn classical_path_allowed() -> bool {
    A12_PATTERN_FREEZE
}

#[cfg(test)]
mod tier_catalog_tests {
    use super::*;

    #[test]
    fn tier_step_ids_cover_a_through_d() {
        assert_eq!(TIER_STEP_IDS.len(), 30);
        assert_eq!(TIER_STEP_IDS[0], "A00_baseline_freeze");
        assert_eq!(TIER_STEP_IDS[29], "D03_dual_compare_report");
        assert!(A12_PATTERN_FREEZE);
        assert!(classical_path_allowed());
    }
}
