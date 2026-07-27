//! Product-facing dual-truth + multi-head summary attached to ParseResult (UI wire).

use super::dense_logistic::{
    fit_dense_logistic_model, metre_from_class, predict_dense_logistic_model,
};
use super::knn::{class_prototypes, euclidean, predict_nearest_prototype};
use super::pattern_cards::top_features_for_dense;
use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::metre::ml_head::class_index_for_metre;
use crate::metre::MetreType;
use crate::types::{DualTruthSurface, HeadVote, MetreHypothesis, MetreMlProductSurface};

fn metre_label(m: &MetreType) -> String {
    match m {
        MetreType::Venpaa => "Venpaa".into(),
        MetreType::Aciriyappaa => "Aciriyappaa".into(),
        MetreType::Kalippaa => "Kalippaa".into(),
        MetreType::Vanjippaa => "Vanjippaa".into(),
        MetreType::Other(s) => s.clone(),
    }
}

/// Build product surface from parse outputs (classical violations already computed, not scored).
pub fn build_product_surface(
    ml_top: Option<&MetreType>,
    hypotheses: &[MetreHypothesis],
    dense: Option<&[f32]>,
    classical_violations: Vec<String>,
    train_denses: &[Vec<f32>],
    train_ys: &[usize],
) -> MetreMlProductSurface {
    let ml_label = ml_top.map(metre_label);
    let classical_ok = if classical_violations.is_empty() && ml_top.is_some() {
        Some(true)
    } else if ml_top.is_some() {
        Some(false)
    } else {
        None
    };
    let classical_metre = if classical_ok == Some(true) {
        ml_label.clone()
    } else {
        None
    };

    let mut head_votes = Vec::new();
    if let Some(h) = hypotheses.first() {
        head_votes.push(HeadVote {
            head_id: "heuristic_or_hybrid".into(),
            metre_type: metre_label(&h.metre_type),
            score: h.metre_probability.unwrap_or(h.aggregate_score as f32 / 100.0),
            note: "Shipped parse path (rules + optional hybrid logit)".into(),
        });
    }

    if let Some(d) = dense {
        if !train_denses.is_empty() && !train_ys.is_empty() {
            let model = fit_dense_logistic_model(train_denses, train_ys);
            let (c, probs) = predict_dense_logistic_model(d, &model);
            let logistic_score = probs.get(c).copied().unwrap_or(0.0).clamp(0.0, 1.0);
            head_votes.push(HeadVote {
                head_id: "dense_logistic".into(),
                metre_type: metre_label(&metre_from_class(c)),
                score: logistic_score,
                note: "Pure dense multinomial (z-scored class-mean head + temperature)".into(),
            });
            // Prototypes in standardized space (same mean/std as logistic) for comparable geometry.
            let mut z_train: Vec<Vec<f32>> = Vec::with_capacity(train_denses.len());
            for td in train_denses {
                let z = super::dense_logistic::standardize(td, &model.mean, &model.std);
                z_train.push(z.to_vec());
            }
            let z_q = super::dense_logistic::standardize(d, &model.mean, &model.std);
            let protos = class_prototypes(&z_train, train_ys);
            let ck = predict_nearest_prototype(&z_q, &protos);
            let mut inv = [0.0f32; METRE_ML_NUM_CLASSES];
            let mut inv_sum = 0.0f32;
            for i in 0..METRE_ML_NUM_CLASSES {
                let dist = euclidean(&z_q, &protos[i]).max(1e-6);
                inv[i] = 1.0 / dist;
                inv_sum += inv[i];
            }
            let proto_score = if inv_sum > 0.0 {
                (inv[ck] / inv_sum).clamp(0.0, 1.0)
            } else {
                0.0
            };
            head_votes.push(HeadVote {
                head_id: "prototype_knn".into(),
                metre_type: metre_label(&metre_from_class(ck)),
                score: proto_score,
                note: "Nearest class prototype in z-space (soft inverse-distance mass)".into(),
            });
        }
    }

    let pattern_features = dense
        .map(|d| top_features_for_dense(d, 5))
        .unwrap_or_default();

    let mut blurb_parts = vec![
        "Entropy and confidence gap describe how peaked the four-way ML distribution is — not classical proof."
            .to_string(),
    ];
    if classical_ok == Some(false) {
        blurb_parts.push(
            "Classical checks reported violations for the ML top guess (shown separately).".into(),
        );
    } else if classical_ok == Some(true) {
        blurb_parts.push(
            "Classical checks found no violations for the ML top guess (still not sole truth)."
                .into(),
        );
    }

    let dual_compare = crate::metre::dual_compare_label(
        ml_label.as_deref().unwrap_or(""),
        classical_ok.unwrap_or(false),
        classical_metre.as_deref(),
    );
    blurb_parts.push(format!("Dual-compare: {dual_compare}."));

    MetreMlProductSurface {
        dual_truth: DualTruthSurface {
            ml_metre_type: ml_label,
            classical_metre_type: classical_metre,
            classical_ok_for_ml_top: classical_ok,
            classical_violations,
            separation_policy: "ml_scores_parallel_to_classical_violations".into(),
        },
        pattern_features,
        head_votes,
        honesty_label: "Statistical estimate (ML / heuristic) — not classical proof".into(),
        uncertainty_blurb: blurb_parts.join(" "),
        a12_freeze_date: if super::A12_PATTERN_FREEZE {
            Some(super::A12_FREEZE_DATE.into())
        } else {
            None
        },
    }
}

/// Ranked class indices from hybrid hypotheses for metrics.
pub fn ranked_classes_from_hypotheses(hyps: &[MetreHypothesis]) -> Vec<usize> {
    let mut pairs: Vec<(usize, f32)> = hyps
        .iter()
        .filter_map(|h| {
            let c = class_index_for_metre(&h.metre_type)?;
            let s = h
                .metre_probability
                .unwrap_or(h.aggregate_score as f32 / 100.0);
            Some((c, s))
        })
        .collect();
    pairs.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    pairs.into_iter().map(|(c, _)| c).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::RuleId;

    #[test]
    fn surface_honesty_and_dual_truth() {
        let hy = vec![MetreHypothesis {
            metre_type: MetreType::Venpaa,
            aggregate_score: 80,
            violations: vec![],
            rule_ids: vec![RuleId::MetreLength01],
            metre_probability: Some(0.7),
            metre_rank: Some(1),
        }];
        let s = build_product_surface(Some(&MetreType::Venpaa), &hy, None, vec![], &[], &[]);
        assert!(s.honesty_label.contains("Statistical"));
        assert_eq!(s.dual_truth.ml_metre_type.as_deref(), Some("Venpaa"));
        assert_eq!(s.dual_truth.classical_ok_for_ml_top, Some(true));
        assert_eq!(
            s.dual_truth.separation_policy,
            "ml_scores_parallel_to_classical_violations"
        );
        assert!(s.uncertainty_blurb.contains("Dual-compare:"));
    }

    #[test]
    fn prototype_score_is_soft_not_hardcoded_one() {
        use crate::parse_features::PARSE_FEATURE_DENSE_LEN;
        let mut train0 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        let mut train1 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        train0[0] = 0.0;
        train1[0] = 10.0;
        let mut q = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        q[0] = 1.0;
        let hy = vec![MetreHypothesis {
            metre_type: MetreType::Venpaa,
            aggregate_score: 50,
            violations: vec![],
            rule_ids: vec![],
            metre_probability: Some(0.55),
            metre_rank: Some(1),
        }];
        let s = build_product_surface(
            Some(&MetreType::Venpaa),
            &hy,
            Some(&q),
            vec![],
            &[train0, train1],
            &[0, 1],
        );
        let proto = s
            .head_votes
            .iter()
            .find(|h| h.head_id == "prototype_knn")
            .expect("prototype vote");
        assert!(
            proto.score > 0.0 && proto.score < 1.0 + 1e-5,
            "expected soft prototype score in (0,1], got {}",
            proto.score
        );
        let logi = s
            .head_votes
            .iter()
            .find(|h| h.head_id == "dense_logistic")
            .expect("logistic vote");
        assert!(
            logi.score > 0.0 && logi.score < 0.999,
            "logistic must not saturate at 1.0; got {}",
            logi.score
        );
    }
}
