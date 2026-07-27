//! A05 — PCA loadings (power iteration) + multi-class Fisher LDA direction.

use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;

/// First principal component loadings via power iteration on X^T X (dense rows).
pub fn pca_pc1_loadings(denses: &[Vec<f32>], iters: usize) -> Vec<f32> {
    let dim = PARSE_FEATURE_DENSE_LEN;
    let mut v = vec![1.0f32; dim];
    let nrm = (v.iter().map(|x| x * x).sum::<f32>()).sqrt().max(1e-9);
    for x in &mut v {
        *x /= nrm;
    }
    for _ in 0..iters.max(1) {
        let mut w = vec![0.0f32; dim];
        for d in denses {
            let mut proj = 0.0f32;
            for j in 0..dim.min(d.len()) {
                proj += d[j] * v[j];
            }
            for j in 0..dim.min(d.len()) {
                w[j] += proj * d[j];
            }
        }
        let n = (w.iter().map(|x| x * x).sum::<f32>()).sqrt().max(1e-9);
        for j in 0..dim {
            v[j] = w[j] / n;
        }
    }
    v
}

/// Correlation of each dense_j with a 0..3 metre index.
pub fn feature_metre_correlations(denses: &[Vec<f32>], ys: &[usize]) -> Vec<f32> {
    let dim = PARSE_FEATURE_DENSE_LEN;
    let n = denses.len().max(1) as f32;
    let y_mean = ys.iter().map(|&y| y as f32).sum::<f32>() / n;
    let mut out = vec![0.0f32; dim];
    for j in 0..dim {
        let mut x_mean = 0.0f32;
        for d in denses {
            x_mean += d.get(j).copied().unwrap_or(0.0);
        }
        x_mean /= n;
        let mut num = 0.0f32;
        let mut dx = 0.0f32;
        let mut dy = 0.0f32;
        for (d, &y) in denses.iter().zip(ys.iter()) {
            let xv = d.get(j).copied().unwrap_or(0.0) - x_mean;
            let yv = y as f32 - y_mean;
            num += xv * yv;
            dx += xv * xv;
            dy += yv * yv;
        }
        out[j] = num / (dx.sqrt().max(1e-9) * dy.sqrt().max(1e-9));
    }
    out
}

/// Multi-class Fisher LDA: direction ∝ (Sw⁺) Sb · ones, using diagonal within-class covariance.
///
/// Returns a unit-length loading vector over dense features (supervised separation direction).
pub fn fisher_lda_direction(denses: &[Vec<f32>], ys: &[usize]) -> Vec<f32> {
    let dim = PARSE_FEATURE_DENSE_LEN;
    let mut class_sum = vec![vec![0.0f32; dim]; METRE_ML_NUM_CLASSES];
    let mut class_n = [0u32; METRE_ML_NUM_CLASSES];
    let mut global = vec![0.0f32; dim];
    let mut n_tot = 0u32;
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        for j in 0..dim.min(d.len()) {
            class_sum[y][j] += d[j];
            global[j] += d[j];
        }
        class_n[y] += 1;
        n_tot += 1;
    }
    let n_tot_f = n_tot.max(1) as f32;
    for j in 0..dim {
        global[j] /= n_tot_f;
    }
    let mut means = vec![vec![0.0f32; dim]; METRE_ML_NUM_CLASSES];
    for c in 0..METRE_ML_NUM_CLASSES {
        let n = class_n[c].max(1) as f32;
        for j in 0..dim {
            means[c][j] = class_sum[c][j] / n;
        }
    }
    // Diagonal Sw: average within-class variance per feature.
    let mut sw = vec![1e-3f32; dim];
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        for j in 0..dim.min(d.len()) {
            let e = d[j] - means[y][j];
            sw[j] += e * e;
        }
    }
    for j in 0..dim {
        sw[j] /= n_tot_f;
        sw[j] = sw[j].max(1e-6);
    }
    // Between-class variance per feature (sum_c n_c (μ_c - μ)^2) / Sw_j  (diagonal Fisher).
    let mut w = vec![0.0f32; dim];
    for j in 0..dim {
        let mut between = 0.0f32;
        for c in 0..METRE_ML_NUM_CLASSES {
            let nc = class_n[c] as f32;
            if nc <= 0.0 {
                continue;
            }
            let diff = means[c][j] - global[j];
            between += nc * diff * diff;
        }
        w[j] = between / sw[j];
    }
    let nrm = (w.iter().map(|x| x * x).sum::<f32>()).sqrt().max(1e-9);
    for x in &mut w {
        *x /= nrm;
    }
    w
}

/// Top-|loading| indices for a loadings vector (report helper).
pub fn top_abs_loadings(loadings: &[f32], k: usize) -> Vec<(usize, f32)> {
    let mut v: Vec<(usize, f32)> = loadings.iter().enumerate().map(|(i, &x)| (i, x)).collect();
    v.sort_by(|a, b| {
        b.1.abs()
            .partial_cmp(&a.1.abs())
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    v.into_iter().take(k.max(1)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pc1_unit_length() {
        let d = vec![vec![1.0f32; 51], vec![2.0f32; 51]];
        let v = pca_pc1_loadings(&d, 10);
        let n: f32 = v.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!((n - 1.0).abs() < 1e-3);
    }

    #[test]
    fn fisher_lda_unit_and_prefers_separating_dim() {
        // Two well-separated blobs on dim 0 only.
        let mut rows = Vec::new();
        let mut ys = Vec::new();
        for _ in 0..4 {
            let mut a = vec![0.0f32; 51];
            a[0] = 0.0;
            a[1] = 1.0;
            rows.push(a);
            ys.push(0);
        }
        for _ in 0..4 {
            let mut b = vec![0.0f32; 51];
            b[0] = 10.0;
            b[1] = 1.0;
            rows.push(b);
            ys.push(1);
        }
        let w = fisher_lda_direction(&rows, &ys);
        let n: f32 = w.iter().map(|x| x * x).sum::<f32>().sqrt();
        assert!(n.is_finite() && (n - 1.0).abs() < 1e-3, "norm={n}");
        assert!(w[0].abs() + 1e-6 > w[1].abs());
    }
}
