//! A04 — class prototypes and k-NN on standardized dense vectors.

use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;

pub fn euclidean(a: &[f32], b: &[f32]) -> f32 {
    let n = a.len().min(b.len());
    let mut s = 0.0f32;
    for i in 0..n {
        let d = a[i] - b[i];
        s += d * d;
    }
    s.sqrt()
}

/// Mean dense per class.
pub fn class_prototypes(
    denses: &[Vec<f32>],
    ys: &[usize],
) -> [[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES] {
    let mut sum = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    let mut cnt = [0u32; METRE_ML_NUM_CLASSES];
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(d.len()) {
            sum[y][j] += d[j];
        }
        cnt[y] += 1;
    }
    let mut p = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    for c in 0..METRE_ML_NUM_CLASSES {
        let n = cnt[c].max(1) as f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            p[c][j] = sum[c][j] / n;
        }
    }
    p
}

/// Nearest prototype class.
pub fn predict_nearest_prototype(
    dense: &[f32],
    protos: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
) -> usize {
    let mut best = 0usize;
    let mut best_d = f32::INFINITY;
    for c in 0..METRE_ML_NUM_CLASSES {
        let d = euclidean(dense, &protos[c]);
        if d < best_d {
            best_d = d;
            best = c;
        }
    }
    best
}

/// k-NN majority vote (k odd preferred). Returns class index.
pub fn predict_knn(dense: &[f32], train_x: &[Vec<f32>], train_y: &[usize], k: usize) -> usize {
    let k = k.max(1).min(train_x.len().max(1));
    let mut dists: Vec<(f32, usize)> = train_x
        .iter()
        .enumerate()
        .map(|(i, x)| (euclidean(dense, x), train_y.get(i).copied().unwrap_or(0)))
        .collect();
    dists.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
    let mut votes = [0u32; METRE_ML_NUM_CLASSES];
    for item in dists.iter().take(k) {
        let y = item.1;
        if y < METRE_ML_NUM_CLASSES {
            votes[y] += 1;
        }
    }
    votes
        .iter()
        .enumerate()
        .max_by_key(|(_, v)| *v)
        .map(|(i, _)| i)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn knn_self_neighbor() {
        let x0 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        let mut x1 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        x1[0] = 5.0;
        let pred = predict_knn(&x1, &[x0, x1.clone()], &[0, 1], 1);
        assert_eq!(pred, 1);
    }
}
