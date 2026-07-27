//! A03 — pure dense multinomial logistic on **standardized** `dense[51]`.
//!
//! Uses class-mean weights in z-space with temperature scaling so logits stay O(1–10)
//! and softmax does not collapse to a single class at probability 1.0.

use crate::metre::ml_head::{class_index_for_metre, METRE_ML_NUM_CLASSES};
use crate::metre::MetreType;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;

/// Fitted dense-only multinomial head (mean + std for z-score, class means as W, log-prior bias, T).
#[derive(Debug, Clone)]
pub struct DenseLogisticModel {
    pub mean: [f32; PARSE_FEATURE_DENSE_LEN],
    pub std: [f32; PARSE_FEATURE_DENSE_LEN],
    pub weights: [[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    pub bias: [f32; METRE_ML_NUM_CLASSES],
    /// Softmax temperature (>0). Larger → softer probabilities.
    pub temperature: f32,
}

impl Default for DenseLogisticModel {
    fn default() -> Self {
        Self {
            mean: [0.0; PARSE_FEATURE_DENSE_LEN],
            std: [1.0; PARSE_FEATURE_DENSE_LEN],
            weights: [[0.0; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
            bias: [0.0; METRE_ML_NUM_CLASSES],
            temperature: 1.0,
        }
    }
}

/// Softmax of logits.
pub fn softmax(logits: &[f32]) -> Vec<f32> {
    let m = logits.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
    let exps: Vec<f32> = logits.iter().map(|l| (l - m).exp()).collect();
    let s: f32 = exps.iter().sum::<f32>().max(1e-12);
    exps.iter().map(|e| e / s).collect()
}

/// Standardize one dense vector with train mean/std.
pub fn standardize(
    dense: &[f32],
    mean: &[f32; PARSE_FEATURE_DENSE_LEN],
    std: &[f32; PARSE_FEATURE_DENSE_LEN],
) -> [f32; PARSE_FEATURE_DENSE_LEN] {
    let mut z = [0.0f32; PARSE_FEATURE_DENSE_LEN];
    for j in 0..PARSE_FEATURE_DENSE_LEN {
        let x = dense.get(j).copied().unwrap_or(0.0);
        z[j] = (x - mean[j]) / std[j].max(1e-3);
    }
    z
}

/// Logit scores for 4 classes on **already standardized** features: W[c] · z + b[c], then / T.
pub fn dense_logits_standardized(
    z: &[f32; PARSE_FEATURE_DENSE_LEN],
    weights: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    bias: &[f32; METRE_ML_NUM_CLASSES],
    temperature: f32,
) -> [f32; METRE_ML_NUM_CLASSES] {
    let t = temperature.max(1e-3);
    let mut out = [0.0f32; METRE_ML_NUM_CLASSES];
    for c in 0..METRE_ML_NUM_CLASSES {
        let mut s = bias[c];
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            s += weights[c][j] * z[j];
        }
        out[c] = s / t;
    }
    out
}

/// Predict class index + probabilities from dense-only head (standardizes internally).
pub fn predict_dense_logistic_model(dense: &[f32], model: &DenseLogisticModel) -> (usize, Vec<f32>) {
    let z = standardize(dense, &model.mean, &model.std);
    let logits = dense_logits_standardized(&z, &model.weights, &model.bias, model.temperature);
    let probs = softmax(&logits);
    let best = probs
        .iter()
        .enumerate()
        .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
        .map(|(i, _)| i)
        .unwrap_or(0);
    (best, probs)
}

/// Backward-compatible wrapper: fit model then predict (used by older call sites).
pub fn predict_dense_logistic(
    dense: &[f32],
    weights: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    bias: &[f32; METRE_ML_NUM_CLASSES],
) -> (usize, Vec<f32>) {
    // Assume features already roughly scaled; still apply mild temperature.
    let model = DenseLogisticModel {
        mean: [0.0; PARSE_FEATURE_DENSE_LEN],
        std: [1.0; PARSE_FEATURE_DENSE_LEN],
        weights: *weights,
        bias: *bias,
        temperature: 8.0,
    };
    predict_dense_logistic_model(dense, &model)
}

/// Fit standardized class-mean multinomial head.
///
/// 1. Compute feature mean/std on train rows  
/// 2. Class means of z-scored features → weight rows  
/// 3. Bias = log(class count + 0.5)  
/// 4. Temperature chosen so max |logit| ≈ 3 on train (soft but peaked)
pub fn fit_mean_weights(
    denses: &[Vec<f32>],
    ys: &[usize],
) -> (
    [[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    [f32; METRE_ML_NUM_CLASSES],
) {
    let model = fit_dense_logistic_model(denses, ys);
    (model.weights, model.bias)
}

/// Full fit returning standardization + temperature.
pub fn fit_dense_logistic_model(denses: &[Vec<f32>], ys: &[usize]) -> DenseLogisticModel {
    let mut mean = [0.0f32; PARSE_FEATURE_DENSE_LEN];
    let n = denses.len().max(1) as f32;
    for d in denses {
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(d.len()) {
            mean[j] += d[j];
        }
    }
    for m in &mut mean {
        *m /= n;
    }
    let mut var = [0.0f32; PARSE_FEATURE_DENSE_LEN];
    for d in denses {
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(d.len()) {
            let e = d[j] - mean[j];
            var[j] += e * e;
        }
    }
    let mut std = [1.0f32; PARSE_FEATURE_DENSE_LEN];
    for j in 0..PARSE_FEATURE_DENSE_LEN {
        std[j] = (var[j] / n).sqrt().max(1e-3);
    }

    let mut sum = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    let mut cnt = [0u32; METRE_ML_NUM_CLASSES];
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        let z = standardize(d, &mean, &std);
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            sum[y][j] += z[j];
        }
        cnt[y] += 1;
    }
    let mut weights = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    let mut bias = [0.0f32; METRE_ML_NUM_CLASSES];
    for c in 0..METRE_ML_NUM_CLASSES {
        let cn = cnt[c].max(1) as f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            weights[c][j] = sum[c][j] / cn;
        }
        bias[c] = (cnt[c] as f32 + 0.5).ln();
    }

    // Calibrate temperature from train: target max |logit| ~ 3 before /T
    let mut max_abs = 1.0f32;
    for d in denses {
        let z = standardize(d, &mean, &std);
        let logits = dense_logits_standardized(&z, &weights, &bias, 1.0);
        for l in logits {
            max_abs = max_abs.max(l.abs());
        }
    }
    let temperature = (max_abs / 3.0).max(1.0);

    DenseLogisticModel {
        mean,
        std,
        weights,
        bias,
        temperature,
    }
}

pub fn metre_from_class(i: usize) -> MetreType {
    match i {
        0 => MetreType::Venpaa,
        1 => MetreType::Aciriyappaa,
        2 => MetreType::Kalippaa,
        3 => MetreType::Vanjippaa,
        _ => MetreType::Other(format!("class_{i}")),
    }
}

pub fn class_for_metre(m: &MetreType) -> Option<usize> {
    class_index_for_metre(m)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn softmax_sums_to_one() {
        let p = softmax(&[1.0, 2.0, 3.0]);
        let s: f32 = p.iter().sum();
        assert!((s - 1.0).abs() < 1e-5);
    }

    #[test]
    fn mean_weights_predict_self() {
        let mut d0 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        d0[0] = 10.0;
        let mut d1 = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        d1[1] = 10.0;
        let model = fit_dense_logistic_model(&[d0.clone(), d1.clone()], &[0, 1]);
        let (c0, p0) = predict_dense_logistic_model(&d0, &model);
        let (c1, p1) = predict_dense_logistic_model(&d1, &model);
        assert_eq!(c0, 0);
        assert_eq!(c1, 1);
        assert!(p0[0] > 0.5 && p0[0] < 1.0 + 1e-5, "p0={p0:?}");
        assert!(p1[1] > 0.5 && p1[1] < 1.0 + 1e-5, "p1={p1:?}");
    }

    #[test]
    fn standardized_head_not_saturated_wrong_class() {
        // Class 0 small counts, class 3 large — raw means would always pick class 3.
        let mut rows = Vec::new();
        let mut ys = Vec::new();
        for i in 0..4 {
            let mut d = vec![1.0f32; PARSE_FEATURE_DENSE_LEN];
            d[3] = 2.0 + i as f32 * 0.1; // foot_count-ish
            rows.push(d);
            ys.push(0);
        }
        for i in 0..2 {
            let mut d = vec![1.0f32; PARSE_FEATURE_DENSE_LEN];
            d[3] = 20.0 + i as f32;
            rows.push(d);
            ys.push(3);
        }
        let model = fit_dense_logistic_model(&rows, &ys);
        let (c0, p0) = predict_dense_logistic_model(&rows[0], &model);
        assert_eq!(c0, 0, "should prefer class 0 for small-foot sample");
        assert!(
            p0[0] < 0.999,
            "must not saturate to ~1.0; p0={:?}",
            p0
        );
        assert!(p0.iter().all(|&p| p.is_finite() && p >= 0.0 && p <= 1.0));
    }
}
