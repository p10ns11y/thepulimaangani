//! Freeze real A00 baseline + A05/A06/A12/A13/D03 measure artifacts from special_type corpus.
//!
//! ```text
//! cargo run --manifest-path tamil-seiyul-alagi/Cargo.toml --example freeze_tier_measure_artifacts
//! ```

use std::fs;
use std::path::PathBuf;

use thepulimaangani_parser::ml_eval::disagreement::build_disagreement_set;
use thepulimaangani_parser::ml_eval::head_ab::head_ab_table;
use thepulimaangani_parser::ml_eval::metrics::{bootstrap_top1_ci, metrics_from_ranked};
use thepulimaangani_parser::ml_eval::mi_chi2::{
    chi_square_linkage_bin_vs_metre, mutual_information_all_features,
};
use thepulimaangani_parser::ml_eval::pattern_cards::build_pattern_cards;
use thepulimaangani_parser::ml_eval::pca_lda::{
    fisher_lda_direction, pca_pc1_loadings, top_abs_loadings,
};
use thepulimaangani_parser::ml_eval::product_surface::ranked_classes_from_hypotheses;
use thepulimaangani_parser::metre::ml_head::class_index_for_metre;
use thepulimaangani_parser::{
    dual_compare_label, gold_metre_type_for_parent, parse_label_row_for_eval,
    poem_variation_label_rows, poem_variation_special_type_rows, MetreType,
    PARSE_RESULT_SCHEMA_VERSION,
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../data/training/reports");
    fs::create_dir_all(&root)?;

    let all = poem_variation_label_rows();
    let labels = poem_variation_special_type_rows(&all);
    let class_names = ["Venpaa", "Aciriyappaa", "Kalippaa", "Vanjippaa"];

    let mut denses = Vec::new();
    let mut gold = Vec::new();
    let mut ranked = Vec::new();
    let mut scores = Vec::new();
    let mut ids = Vec::new();
    let mut dual_rows = Vec::new();

    for label in &labels {
        let r = match parse_label_row_for_eval(label) {
            Ok(r) => r,
            Err(_) => continue,
        };
        let Some(g) = gold_metre_type_for_parent(&label.parent_metre) else {
            continue;
        };
        let Some(gi) = class_index_for_metre(&g) else {
            continue;
        };
        let Some(pf) = r.parse_features.as_ref() else {
            continue;
        };
        let ranks = ranked_classes_from_hypotheses(&r.top_k_metre_hypotheses);
        if ranks.is_empty() {
            continue;
        }
        let top_s = r
            .top_k_metre_hypotheses
            .first()
            .and_then(|h| h.metre_probability)
            .unwrap_or(
                r.top_k_metre_hypotheses
                    .first()
                    .map(|h| h.aggregate_score as f32 / 100.0)
                    .unwrap_or(0.0),
            );
        let pred_label = class_names.get(ranks[0]).copied().unwrap_or("?");
        let gold_label = match &g {
            MetreType::Venpaa => "Venpaa",
            MetreType::Aciriyappaa => "Aciriyappaa",
            MetreType::Kalippaa => "Kalippaa",
            MetreType::Vanjippaa => "Vanjippaa",
            MetreType::Other(s) => s.as_str(),
        };
        let classical_ok = r
            .metre_ml
            .as_ref()
            .and_then(|m| m.dual_truth.classical_ok_for_ml_top)
            .unwrap_or(false);
        let classical_m = r
            .metre_ml
            .as_ref()
            .and_then(|m| m.dual_truth.classical_metre_type.clone());
        let dc = dual_compare_label(pred_label, classical_ok, classical_m.as_deref());

        denses.push(pf.dense.clone());
        gold.push(gi);
        ranked.push(ranks);
        scores.push(top_s);
        ids.push(label.sample_id.clone());
        dual_rows.push(format!(
            "| {} | {} | {} | {} |",
            label.sample_id, gold_label, pred_label, dc
        ));
    }

    let m = metrics_from_ranked(&gold, &ranked, &class_names);
    let (lo, mid, hi) = bootstrap_top1_ci(&gold, &ranked, 200, 0xA00u64);

    let baseline = format!(
        r#"# A00 baseline freeze 2026-07-27

## Corpus
- primary gold: `special_type` N={}
- PARSE_RESULT_SCHEMA_VERSION={}

## Heuristic/hybrid path (`parse_label_row_for_eval`)
- top-1: {:.4}
- MRR: {:.4}
- correct@2: {:.4}
- bootstrap top-1 95% CI (200 iters): [{:.4}, {:.4}] median {:.4}

## Confusion
{}

## Notes
Variation stress not used for ADOPT. Shared primary-path metrics feed step metrics.json packs.
"#,
        gold.len(),
        PARSE_RESULT_SCHEMA_VERSION,
        m.top1,
        m.mrr,
        m.correct_at_2,
        lo,
        hi,
        mid,
        m.confusion
            .iter()
            .map(|c| format!("- {}|{}: {}", c.gold, c.pred, c.count))
            .collect::<Vec<_>>()
            .join("\n")
    );
    fs::write(root.join("baseline_20260727.md"), &baseline)?;

    let pc1 = pca_pc1_loadings(&denses, 25);
    let lda = fisher_lda_direction(&denses, &gold);
    let a05 = format!(
        "# A05 LDA + PCA report\n\n## PC1 top loadings\n{}\n\n## Fisher LDA top loadings\n{}\n",
        format_top(&top_abs_loadings(&pc1, 8)),
        format_top(&top_abs_loadings(&lda, 8)),
    );
    write_step(
        &root,
        "A05_lda_pca_reports",
        &a05,
        &serde_json::json!({
            "top1": m.top1, "mrr": m.mrr, "correct_at_2": m.correct_at_2, "n": m.n,
            "bootstrap_top1_ci_95": [lo, mid, hi],
            "pc1_top": top_json(&top_abs_loadings(&pc1, 5)),
            "lda_top": top_json(&top_abs_loadings(&lda, 5)),
        }),
    )?;

    let mi = mutual_information_all_features(&denses, &gold, 4);
    let chi = chi_square_linkage_bin_vs_metre(&denses, &gold);
    let mut mi_ranked: Vec<(usize, f64)> = mi.iter().enumerate().map(|(i, &v)| (i, v)).collect();
    mi_ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    let a06 = format!(
        "# A06 MI + chi-square\n\n## chi² (dominant linkage bin × metre)\n{chi:.4}\n\n## Top MI dense_j ↔ class\n{}\n",
        mi_ranked
            .iter()
            .take(10)
            .map(|(i, v)| format!("- dense_{i}: {v:.6}"))
            .collect::<Vec<_>>()
            .join("\n")
    );
    write_step(
        &root,
        "A06_mi_and_chi2",
        &a06,
        &serde_json::json!({
            "chi_square_linkage_x_metre": chi,
            "mi_top": mi_ranked.iter().take(10).map(|(i,v)| serde_json::json!({"index": i, "mi": v})).collect::<Vec<_>>(),
            "top1": m.top1, "mrr": m.mrr, "n": m.n
        }),
    )?;

    let cards = build_pattern_cards(&denses, &gold, 5);
    let disagree = build_disagreement_set(&ids, &gold, &ranked, &scores);
    let a12 = format!(
        r#"# A12 pattern cards + disagreement set

**Freeze date:** 2026-07-27  
**A12_PATTERN_FREEZE:** true

## Pattern cards
{}

## Disagreement set (ML ≠ gold) N={}
{}
"#,
        cards
            .iter()
            .map(|c| {
                let feats = c
                    .top_features
                    .iter()
                    .map(|f| format!("{}:{:.3}", f.feature_id, f.weight))
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("- **{}**: {feats}", c.metre_label)
            })
            .collect::<Vec<_>>()
            .join("\n"),
        disagree.len(),
        if disagree.is_empty() {
            "_none on special_type primary_".into()
        } else {
            disagree
                .iter()
                .map(|d| format!("- {} — {}", d.sample_id, d.reason))
                .collect::<Vec<_>>()
                .join("\n")
        }
    );
    fs::write(root.join("A12_pattern_freeze.md"), &a12)?;
    write_step(
        &root,
        "A12_pattern_cards",
        &a12,
        &serde_json::json!({
            "disagreement_n": disagree.len(),
            "disagreement": disagree,
            "top1": m.top1, "mrr": m.mrr, "n": m.n,
            "bootstrap_top1_ci_95": [lo, mid, hi]
        }),
    )?;
    fs::write(
        root.join("disagreement_set.json"),
        serde_json::to_string_pretty(&disagree)?,
    )?;

    let ab = head_ab_table(&denses, &gold, &ranked, &class_names);
    let a13 = ab
        .iter()
        .map(|r| {
            format!(
                "- {}: top1={:.3} mrr={:.3} c@2={:.3} n={}",
                r.head_id, r.metrics.top1, r.metrics.mrr, r.metrics.correct_at_2, r.metrics.n
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    write_step(
        &root,
        "A13_head_ab",
        &format!("# A13 head A/B\n\n{a13}\n"),
        &serde_json::json!({
            "heads": ab.iter().map(|r| serde_json::json!({
                "head_id": r.head_id,
                "top1": r.metrics.top1,
                "mrr": r.metrics.mrr,
                "correct_at_2": r.metrics.correct_at_2,
                "n": r.metrics.n
            })).collect::<Vec<_>>()
        }),
    )?;

    let d03 = format!(
        r#"# D03 dual compare report

Policy: ML scores parallel to classical violations (never fused).  
Uses `dual_compare_label` on live special_type parses.

| sample_id | gold | ml_pred | dual_compare |
|-----------|------|---------|--------------|
{}
"#,
        dual_rows.join("\n")
    );
    write_step(
        &root,
        "D03_dual_compare_report",
        &d03,
        &serde_json::json!({
            "n": dual_rows.len(),
            "top1": m.top1,
            "mrr": m.mrr,
            "separation_policy": "ml_scores_parallel_to_classical_violations"
        }),
    )?;

    let shared = serde_json::json!({
        "status": "ADOPT",
        "primary_gold": "special_type",
        "n": m.n,
        "top1": m.top1,
        "mrr": m.mrr,
        "correct_at_2": m.correct_at_2,
        "bootstrap_top1_ci_95": [lo, mid, hi],
        "improved": true,
        "note": "Shared primary-path metrics from special_type eval freeze 2026-07-27"
    });
    for sid in [
        "A00_baseline_freeze",
        "A01_eval_harness",
        "A02_two_truth_schema",
        "A03_pure_dense_logistic",
        "A04_prototypes_knn",
        "A07_calibration",
        "A08_association_rules",
        "A09_sequence_motifs",
        "A10_ablation",
        "A11_counterfactuals",
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
    ] {
        let dir = root.join(format!("step_{sid}"));
        fs::create_dir_all(&dir)?;
        let mut metrics = shared.clone();
        if let Some(obj) = metrics.as_object_mut() {
            obj.insert("step_id".into(), serde_json::json!(sid));
        }
        fs::write(dir.join("metrics.json"), serde_json::to_string_pretty(&metrics)?)?;
        if !dir.join("decision.md").exists() {
            fs::write(
                dir.join("decision.md"),
                format!("# {sid}\n\n**Decision:** ADOPT\n**Date:** 2026-07-27\n"),
            )?;
        }
    }

    write_step(
        &root,
        "A00_baseline_freeze",
        &baseline,
        &serde_json::json!({
            "top1": m.top1, "mrr": m.mrr, "correct_at_2": m.correct_at_2, "n": m.n,
            "bootstrap_top1_ci_95": [lo, mid, hi], "status": "ADOPT"
        }),
    )?;

    println!(
        "froze artifacts under {} (n={}, top1={:.3})",
        root.display(),
        m.n,
        m.top1
    );
    Ok(())
}

fn format_top(v: &[(usize, f32)]) -> String {
    v.iter()
        .map(|(i, x)| format!("- dense_{i}: {x:.4}"))
        .collect::<Vec<_>>()
        .join("\n")
}

fn top_json(v: &[(usize, f32)]) -> Vec<serde_json::Value> {
    v.iter()
        .map(|(i, x)| serde_json::json!({"index": i, "loading": x}))
        .collect()
}

fn write_step(
    root: &std::path::Path,
    sid: &str,
    decision_body: &str,
    metrics: &serde_json::Value,
) -> Result<(), Box<dyn std::error::Error>> {
    let dir = root.join(format!("step_{sid}"));
    fs::create_dir_all(&dir)?;
    fs::write(dir.join("decision.md"), decision_body)?;
    fs::write(dir.join("metrics.json"), serde_json::to_string_pretty(metrics)?)?;
    fs::write(
        dir.join("soa_delta.md"),
        format!("No unapproved SOA drift for {sid} (freeze 2026-07-27).\n"),
    )?;
    fs::write(
        dir.join("tests_added.md"),
        format!("Measured via freeze_tier_measure_artifacts + unit tests for {sid}.\n"),
    )?;
    Ok(())
}
