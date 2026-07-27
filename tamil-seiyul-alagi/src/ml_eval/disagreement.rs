//! A12 — disagreement set: samples where ML top ≠ gold `parent_metre`.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::metre::ml_head::class_index_for_metre;
use crate::metre::MetreType;

/// One disagreement row for freeze ledger / research UI (not learner chrome).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, JsonSchema)]
pub struct DisagreementRow {
    pub sample_id: String,
    pub gold_metre: String,
    pub predicted_metre: String,
    pub gold_class: u8,
    pub pred_class: u8,
    pub top_score: f32,
    pub reason: String,
}

fn label_for_class(c: usize) -> String {
    match c {
        0 => "Venpaa".into(),
        1 => "Aciriyappaa".into(),
        2 => "Kalippaa".into(),
        3 => "Vanjippaa".into(),
        _ => format!("class_{c}"),
    }
}

/// Build disagreement set from gold class, ranked predictions, optional scores & sample ids.
pub fn build_disagreement_set(
    sample_ids: &[String],
    gold: &[usize],
    ranked: &[Vec<usize>],
    top_scores: &[f32],
) -> Vec<DisagreementRow> {
    let n = gold.len().min(ranked.len());
    let mut out = Vec::new();
    for i in 0..n {
        let g = gold[i];
        let pred = ranked[i].first().copied().unwrap_or(usize::MAX);
        if pred == g {
            continue;
        }
        let id = sample_ids
            .get(i)
            .cloned()
            .unwrap_or_else(|| format!("row_{i}"));
        let score = top_scores.get(i).copied().unwrap_or(0.0);
        out.push(DisagreementRow {
            sample_id: id,
            gold_metre: label_for_class(g),
            predicted_metre: label_for_class(pred),
            gold_class: g as u8,
            pred_class: pred as u8,
            top_score: score,
            reason: format!(
                "ML top {} ≠ gold {} (score={:.3})",
                label_for_class(pred),
                label_for_class(g),
                score
            ),
        });
    }
    out
}

/// Convenience when gold is MetreType.
pub fn gold_class(m: &MetreType) -> Option<usize> {
    class_index_for_metre(m)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_mismatches_only() {
        let ids = vec!["a".into(), "b".into(), "c".into()];
        let gold = vec![0, 1, 2];
        let ranked = vec![vec![0, 1], vec![0, 1], vec![2, 1]];
        let scores = vec![0.9, 0.5, 0.8];
        let d = build_disagreement_set(&ids, &gold, &ranked, &scores);
        assert_eq!(d.len(), 1);
        assert_eq!(d[0].sample_id, "b");
        assert_eq!(d[0].gold_class, 1);
        assert_eq!(d[0].pred_class, 0);
    }
}
