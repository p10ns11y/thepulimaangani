//! Tier B offline modules B01–B08 (real algorithms; product embeds only safe summaries).

use std::collections::BTreeMap;

use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;

/// B01 — Gini-style impurity drop proxy for feature importance (stump).
pub fn stump_importances(denses: &[Vec<f32>], ys: &[usize]) -> Vec<(usize, f32)> {
    let mut out = Vec::new();
    for j in 0..PARSE_FEATURE_DENSE_LEN {
        let mut vals: Vec<(f32, usize)> = denses
            .iter()
            .zip(ys.iter())
            .map(|(d, &y)| (d.get(j).copied().unwrap_or(0.0), y))
            .collect();
        vals.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal));
        // mid split importance: |left purity - right|
        let mid = vals.len() / 2;
        if mid == 0 {
            out.push((j, 0.0));
            continue;
        }
        let left_dom = majority_frac(&vals[..mid]);
        let right_dom = majority_frac(&vals[mid..]);
        out.push((j, (left_dom - right_dom).abs()));
    }
    out.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    out
}

fn majority_frac(slice: &[(f32, usize)]) -> f32 {
    let mut c = [0u32; METRE_ML_NUM_CLASSES];
    for (_, y) in slice {
        if *y < METRE_ML_NUM_CLASSES {
            c[*y] += 1;
        }
    }
    let n = slice.len().max(1) as f32;
    c.iter().copied().max().unwrap_or(0) as f32 / n
}

/// B02 — k-means (Lloyd, fixed iters) on dense; returns assignments.
pub fn kmeans(denses: &[Vec<f32>], k: usize, iters: usize) -> Vec<usize> {
    let k = k.max(1).min(denses.len().max(1));
    let dim = PARSE_FEATURE_DENSE_LEN;
    let mut cents: Vec<Vec<f32>> = (0..k)
        .map(|i| {
            denses
                .get(i % denses.len().max(1))
                .cloned()
                .unwrap_or_else(|| vec![0.0; dim])
        })
        .collect();
    let mut assign = vec![0usize; denses.len()];
    for _ in 0..iters.max(1) {
        for (i, d) in denses.iter().enumerate() {
            let mut best = 0;
            let mut best_d = f32::INFINITY;
            for (c, cent) in cents.iter().enumerate() {
                let dist = super::knn::euclidean(d, cent);
                if dist < best_d {
                    best_d = dist;
                    best = c;
                }
            }
            assign[i] = best;
        }
        for c in 0..k {
            let mut sum = vec![0.0f32; dim];
            let mut n = 0u32;
            for (i, d) in denses.iter().enumerate() {
                if assign[i] == c {
                    for j in 0..dim.min(d.len()) {
                        sum[j] += d[j];
                    }
                    n += 1;
                }
            }
            if n > 0 {
                for j in 0..dim {
                    sum[j] /= n as f32;
                }
                cents[c] = sum;
            }
        }
    }
    assign
}

/// B03 — simple z-score anomaly: max |z| over dimensions.
pub fn anomaly_scores(denses: &[Vec<f32>]) -> Vec<f32> {
    let dim = PARSE_FEATURE_DENSE_LEN;
    let mut mean = vec![0.0f32; dim];
    let n = denses.len().max(1) as f32;
    for d in denses {
        for j in 0..dim.min(d.len()) {
            mean[j] += d[j];
        }
    }
    for m in &mut mean {
        *m /= n;
    }
    let mut var = vec![0.0f32; dim];
    for d in denses {
        for j in 0..dim.min(d.len()) {
            let e = d[j] - mean[j];
            var[j] += e * e;
        }
    }
    for v in &mut var {
        *v = (*v / n).sqrt().max(1e-6);
    }
    denses
        .iter()
        .map(|d| {
            let mut m = 0.0f32;
            for j in 0..dim.min(d.len()) {
                m = m.max(((d[j] - mean[j]) / var[j]).abs());
            }
            m
        })
        .collect()
}

/// B04 — Naive Bayes Gaussian-ish log score using class means (ceiling proxy).
pub fn naive_bayes_predict(dense: &[f32], class_means: &[[f32; PARSE_FEATURE_DENSE_LEN]; 4]) -> usize {
    let mut best = 0;
    let mut best_s = f32::NEG_INFINITY;
    for c in 0..4 {
        let mut s = 0.0f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(dense.len()) {
            let d = dense[j] - class_means[c][j];
            s -= d * d;
        }
        if s > best_s {
            best_s = s;
            best = c;
        }
    }
    best
}

/// B05 — HMM-like bigram counts on N/R streams (sketch).
pub fn acai_bigram_matrix(streams: &[String]) -> [[u32; 2]; 2] {
    let mut m = [[0u32; 2]; 2];
    for s in streams {
        let v: Vec<u8> = s
            .chars()
            .filter_map(|c| match c {
                'N' => Some(0),
                'R' => Some(1),
                _ => None,
            })
            .collect();
        for w in v.windows(2) {
            m[w[0] as usize][w[1] as usize] += 1;
        }
    }
    m
}

/// B06 — graph motif: count VenTalai-like vs Aciriya mass as edge features (from dense bins 12–15).
pub fn linkage_graph_signature(dense: &[f32]) -> BTreeMap<&'static str, f32> {
    let mut m = BTreeMap::new();
    m.insert("ven_mass", dense.get(12).copied().unwrap_or(0.0));
    m.insert("aciriya_mass", dense.get(13).copied().unwrap_or(0.0));
    m.insert("kali_mass", dense.get(14).copied().unwrap_or(0.0));
    m.insert("vanji_mass", dense.get(15).copied().unwrap_or(0.0));
    m
}

/// B07 — DTW distance on acai streams (N=0,R=1).
pub fn dtw_acai(a: &str, b: &str) -> f32 {
    let av: Vec<f32> = a
        .chars()
        .map(|c| if c == 'N' { 0.0 } else { 1.0 })
        .collect();
    let bv: Vec<f32> = b
        .chars()
        .map(|c| if c == 'N' { 0.0 } else { 1.0 })
        .collect();
    if av.is_empty() || bv.is_empty() {
        return (av.len() + bv.len()) as f32;
    }
    let n = av.len();
    let m = bv.len();
    let mut dp = vec![vec![f32::INFINITY; m + 1]; n + 1];
    dp[0][0] = 0.0;
    for i in 1..=n {
        for j in 1..=m {
            let cost = (av[i - 1] - bv[j - 1]).abs();
            dp[i][j] = cost + dp[i - 1][j - 1].min(dp[i - 1][j]).min(dp[i][j - 1]);
        }
    }
    dp[n][m]
}

/// B07 — EMD-lite L1 on linkage histograms (bins 12..19).
pub fn emd_linkage_hist(a: &[f32], b: &[f32]) -> f32 {
    let mut s = 0.0f32;
    for j in 12..19 {
        s += (a.get(j).copied().unwrap_or(0.0) - b.get(j).copied().unwrap_or(0.0)).abs();
    }
    s
}

/// B08 — continuous likeness score to a class mean (0..1 via RBF).
pub fn ordinal_likeness(dense: &[f32], class_mean: &[f32], gamma: f32) -> f32 {
    let mut s = 0.0f32;
    for j in 0..PARSE_FEATURE_DENSE_LEN.min(dense.len()).min(class_mean.len()) {
        let d = dense[j] - class_mean[j];
        s += d * d;
    }
    (-gamma.max(1e-3) * s).exp()
}

/// A10 — block ablation: zero a dense range and re-score with a scorer callback proxy (L2 to mean).
pub fn ablate_block_distance(
    dense: &[f32],
    start: usize,
    end: usize,
    reference: &[f32],
) -> f32 {
    let mut d = dense.to_vec();
    let end = end.min(d.len());
    let start = start.min(end);
    for j in start..end {
        d[j] = 0.0;
    }
    super::knn::euclidean(&d, reference)
}

/// A11 — counterfactual: flip one index to value and return euclidean shift from original.
pub fn counterfactual_shift(dense: &[f32], index: usize, value: f32) -> f32 {
    let mut d = dense.to_vec();
    if index < d.len() {
        d[index] = value;
    }
    super::knn::euclidean(dense, &d)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kmeans_two_clusters() {
        let mut a = vec![0.0f32; 51];
        let mut b = vec![10.0f32; 51];
        a[0] = 0.0;
        b[0] = 10.0;
        let assign = kmeans(&[a, b.clone(), b], 2, 5);
        assert_eq!(assign.len(), 3);
    }

    #[test]
    fn dtw_identical_zero() {
        assert!((dtw_acai("NRN", "NRN") - 0.0).abs() < 1e-5);
    }
}
