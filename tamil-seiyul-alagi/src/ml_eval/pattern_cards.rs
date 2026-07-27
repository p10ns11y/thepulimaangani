//! A12 — per-metre pattern cards (top dense features by class-mean mass).

use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;
use crate::semantics_contract::dense_global_feature_ids;
use crate::types::PatternFeatureHit;

/// Pattern card for one coarse metre (report artifact).
#[derive(Debug, Clone, PartialEq)]
pub struct PatternCard {
    pub metre_class: u8,
    pub metre_label: String,
    pub top_features: Vec<PatternFeatureHit>,
}

fn feature_id_for(index: usize) -> String {
    let globals = dense_global_feature_ids();
    if index < globals.len() {
        return globals[index].to_string();
    }
    match index {
        12..=18 => format!("linkage_type_bin_{}", index - 12),
        19..=26 => format!("linkage_special_bin_{}", index - 19),
        27..=42 => format!("foot_pattern_bin_{}", index - 27),
        43..=50 => format!("line_foot_hist_{}", index - 43),
        _ => format!("dense_{index}"),
    }
}

/// Build cards: features with highest absolute class-mean relative to global mean.
pub fn build_pattern_cards(
    denses: &[Vec<f32>],
    ys: &[usize],
    top_k: usize,
) -> Vec<PatternCard> {
    let labels = ["Venpaa", "Aciriyappaa", "Kalippaa", "Vanjippaa"];
    let mut class_mean = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    let mut cnt = [0u32; METRE_ML_NUM_CLASSES];
    let mut global = [0.0f32; PARSE_FEATURE_DENSE_LEN];
    let mut gn = 0u32;
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(d.len()) {
            class_mean[y][j] += d[j];
            global[j] += d[j];
        }
        cnt[y] += 1;
        gn += 1;
    }
    let gnn = gn.max(1) as f32;
    for j in 0..PARSE_FEATURE_DENSE_LEN {
        global[j] /= gnn;
    }
    for c in 0..METRE_ML_NUM_CLASSES {
        let n = cnt[c].max(1) as f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            class_mean[c][j] /= n;
        }
    }
    let mut cards = Vec::new();
    for c in 0..METRE_ML_NUM_CLASSES {
        let mut scored: Vec<(usize, f32)> = (0..PARSE_FEATURE_DENSE_LEN)
            .map(|j| (j, class_mean[c][j] - global[j]))
            .collect();
        scored.sort_by(|a, b| {
            b.1.abs()
                .partial_cmp(&a.1.abs())
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        let top_features: Vec<PatternFeatureHit> = scored
            .into_iter()
            .take(top_k.max(1))
            .map(|(j, w)| PatternFeatureHit {
                dense_index: j as u32,
                feature_id: feature_id_for(j),
                weight: w,
                direction: if w >= 0.0 {
                    "elevated".into()
                } else {
                    "depressed".into()
                },
            })
            .collect();
        cards.push(PatternCard {
            metre_class: c as u8,
            metre_label: labels[c].into(),
            top_features,
        });
    }
    cards
}

/// For a single poem dense vector: top absolute components for product UI.
pub fn top_features_for_dense(dense: &[f32], top_k: usize) -> Vec<PatternFeatureHit> {
    let mut scored: Vec<(usize, f32)> = dense
        .iter()
        .enumerate()
        .take(PARSE_FEATURE_DENSE_LEN)
        .map(|(j, &v)| (j, v))
        .collect();
    scored.sort_by(|a, b| {
        b.1.abs()
            .partial_cmp(&a.1.abs())
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    scored
        .into_iter()
        .take(top_k.max(1))
        .map(|(j, w)| PatternFeatureHit {
            dense_index: j as u32,
            feature_id: feature_id_for(j),
            weight: w,
            direction: if w >= 0.0 {
                "positive".into()
            } else {
                "negative".into()
            },
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cards_cover_four_metres() {
        let mut d0 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        d0[9] = 1.0;
        let mut d1 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        d1[10] = 1.0;
        let cards = build_pattern_cards(&[d0, d1], &[0, 1], 3);
        assert_eq!(cards.len(), 4);
        assert!(!cards[0].top_features.is_empty());
    }
}
