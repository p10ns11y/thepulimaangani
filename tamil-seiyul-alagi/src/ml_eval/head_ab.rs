//! A13 — A/B table: heuristic vs hybrid vs logistic vs k-NN.

use super::dense_logistic::{fit_dense_logistic_model, predict_dense_logistic_model};
use super::knn::{class_prototypes, predict_knn, predict_nearest_prototype};
use super::metrics::{metrics_from_ranked, EvalMetrics};

#[derive(Debug, Clone)]
pub struct HeadAbRow {
    pub head_id: String,
    pub metrics: EvalMetrics,
}

/// Evaluate multiple heads on the same gold/dense set.
/// `heuristic_ranked[i]` = class rank list from parse hypotheses for sample i.
pub fn head_ab_table(
    denses: &[Vec<f32>],
    gold: &[usize],
    heuristic_ranked: &[Vec<usize>],
    class_names: &[&str],
) -> Vec<HeadAbRow> {
    let mut rows = Vec::new();
    rows.push(HeadAbRow {
        head_id: "heuristic_or_hybrid".into(),
        metrics: metrics_from_ranked(gold, heuristic_ranked, class_names),
    });

    let model = fit_dense_logistic_model(denses, gold);
    let mut logistic_ranked = Vec::new();
    for d in denses {
        let (_c, probs) = predict_dense_logistic_model(d, &model);
        let mut order: Vec<usize> = (0..probs.len()).collect();
        order.sort_by(|&i, &j| {
            probs[j]
                .partial_cmp(&probs[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        logistic_ranked.push(order);
    }
    rows.push(HeadAbRow {
        head_id: "dense_logistic".into(),
        metrics: metrics_from_ranked(gold, &logistic_ranked, class_names),
    });

    let protos = class_prototypes(denses, gold);
    let mut proto_ranked = Vec::new();
    for d in denses {
        let c = predict_nearest_prototype(d, &protos);
        let mut order = vec![c];
        for o in 0..4 {
            if o != c {
                order.push(o);
            }
        }
        proto_ranked.push(order);
    }
    rows.push(HeadAbRow {
        head_id: "prototype".into(),
        metrics: metrics_from_ranked(gold, &proto_ranked, class_names),
    });

    let mut knn_ranked = Vec::new();
    for (i, d) in denses.iter().enumerate() {
        // LOO-ish: k=1 on full set still ok for tiny N demo; use k=3
        let c = predict_knn(d, denses, gold, 3.min(denses.len()));
        let mut order = vec![c];
        for o in 0..4 {
            if o != c {
                order.push(o);
            }
        }
        let _ = i;
        knn_ranked.push(order);
    }
    rows.push(HeadAbRow {
        head_id: "knn_k3".into(),
        metrics: metrics_from_ranked(gold, &knn_ranked, class_names),
    });

    rows
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ab_table_has_four_heads() {
        let d = vec![vec![0.0f32; 51], vec![1.0f32; 51]];
        let gold = vec![0, 1];
        let ranked = vec![vec![0, 1], vec![1, 0]];
        let rows = head_ab_table(&d, &gold, &ranked, &["a", "b", "c", "d"]);
        assert_eq!(rows.len(), 4);
    }
}
