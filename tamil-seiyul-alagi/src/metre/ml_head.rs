//! Hybrid coarse-metre head: multinomial logit on **[`PARSE_FEATURE_DENSE_LEN`] parse features ∥
//! normalized heuristic scores** (plans A–C: dense-only model + rule-score channel + hybrid).
//!
//! Weights are **shipped as constants** (fitted offline via `examples/fit_metre_hybrid_weights.rs`).
//! At inference: logits → softmax → reorder [`MetreHypothesis`] and attach **calibrated**
//! probabilities on each hypothesis for new-poem confidence (`metre_probability`, `metre_entropy_bits`).

use crate::parse_features::PARSE_FEATURE_DENSE_LEN;
use crate::types::MetreHypothesis;

use super::MetreType;

/// Four fixed coarse classes (same order as [`detect_metre_hypotheses`](super::prediction::detect_metre_hypotheses)).
pub const METRE_ML_NUM_CLASSES: usize = 4;

/// Feature dimension: dense (51) ∥ heuristic softmax (4) ∥ RBF kernels to **class prototypes** (4).
pub const METRE_ML_FEATURE_DIM: usize = PARSE_FEATURE_DENSE_LEN + 4 + METRE_ML_NUM_CLASSES;

/// Bump when feature layout, class set, or **normalization** contract changes.
pub const METRE_ML_WEIGHT_SCHEMA: u32 = 3;

const RBF_GAMMA: f32 = 1.8;

/// Shipped hybrid logit: `logit[k] = bias[k] + dot(weight_row[k], x)` for `x` in R^`METRE_ML_FEATURE_DIM`.
#[derive(Debug, Clone)]
pub struct HybridMetreHead {
    pub schema: u32,
    /// `bias[class]`
    pub bias: [f32; METRE_ML_NUM_CLASSES],
    /// Row-major `weight[class * METRE_ML_FEATURE_DIM + j] == W[class][j]`
    pub weights: [f32; METRE_ML_NUM_CLASSES * METRE_ML_FEATURE_DIM],
}

impl Default for HybridMetreHead {
    fn default() -> Self {
        Self {
            schema: METRE_ML_WEIGHT_SCHEMA,
            bias: [0.0; METRE_ML_NUM_CLASSES],
            weights: [0.0; METRE_ML_NUM_CLASSES * METRE_ML_FEATURE_DIM],
        }
    }
}

/// Fitted on **special_type** rows from [`crate::poem_variations`](crate::poem_variations) (see `examples/fit_metre_hybrid_weights.rs`).
/// Regenerate when corpus or feature schema changes.
pub fn shipped_hybrid_metre_head() -> &'static HybridMetreHead {
    &SHIPPED_HYBRID_METRE_HEAD
}

include!("metre_hybrid_weights.inc.rs");

fn rbf_block(
    dense: &[f32],
    proto: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    out: &mut [f32; METRE_ML_NUM_CLASSES],
) {
    for c in 0..METRE_ML_NUM_CLASSES {
        let mut s = 0.0f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            let d = dense.get(j).copied().unwrap_or(0.0) - proto[c][j];
            s += d * d;
        }
        out[c] = (-RBF_GAMMA * s).exp();
    }
}

/// Mean parse `dense` per gold class. With `exclude_row == Some(i)`, row `i` is omitted (LOOCV prototypes).
pub fn compute_dense_prototypes_excluding(
    denses: &[Vec<f32>],
    ys: &[usize],
    exclude_row: Option<usize>,
) -> [[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES] {
    let mut sum = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    let mut cnt = [0u32; METRE_ML_NUM_CLASSES];
    for (i, d) in denses.iter().enumerate() {
        if exclude_row == Some(i) {
            continue;
        }
        let c = ys[i];
        if c >= METRE_ML_NUM_CLASSES {
            continue;
        }
        for j in 0..PARSE_FEATURE_DENSE_LEN.min(d.len()) {
            sum[c][j] += d[j];
        }
        cnt[c] += 1;
    }
    let mut proto = [[0.0f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES];
    for c in 0..METRE_ML_NUM_CLASSES {
        let n = cnt[c].max(1) as f32;
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            proto[c][j] = sum[c][j] / n;
        }
    }
    proto
}

/// Same as [`build_hybrid_feature_vector`] but RBF block uses `proto` (training / cross-val).
pub fn build_hybrid_feature_vector_with_proto(
    dense: &[f32],
    heuristic_scores: &[MetreHypothesis; 4],
    tau: f32,
    proto: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
) -> [f32; METRE_ML_FEATURE_DIM] {
    let mut x = [0.0f32; METRE_ML_FEATURE_DIM];
    for j in 0..PARSE_FEATURE_DENSE_LEN.min(dense.len()) {
        x[j] = dense[j];
    }
    let tau = tau.max(1e-3);
    let mut logits = [0.0f32; 4];
    for i in 0..4 {
        logits[i] = heuristic_scores[i].aggregate_score as f32 / tau;
    }
    let p = softmax4(logits);
    for i in 0..4 {
        x[PARSE_FEATURE_DENSE_LEN + i] = p[i];
    }
    let mut rbf = [0.0f32; METRE_ML_NUM_CLASSES];
    rbf_block(dense, proto, &mut rbf);
    for i in 0..METRE_ML_NUM_CLASSES {
        x[PARSE_FEATURE_DENSE_LEN + 4 + i] = rbf[i];
    }
    x
}

/// True when shipped weights look fitted (non-trivial); otherwise callers should skip hybrid re-ranking.
pub fn hybrid_head_is_active(head: &HybridMetreHead) -> bool {
    head.bias.iter().any(|b| b.abs() > 1e-5)
        || head
            .weights
            .iter()
            .any(|w| w.abs() > 1e-4)
}

fn normalize_features_inplace(x: &mut [f32; METRE_ML_FEATURE_DIM]) {
    for j in 0..METRE_ML_FEATURE_DIM {
        x[j] = (x[j] - SHIPPED_FEATURE_MEAN[j]) * SHIPPED_FEATURE_INV_STD[j];
    }
}

fn softmax4(logits: [f32; METRE_ML_NUM_CLASSES]) -> [f32; METRE_ML_NUM_CLASSES] {
    let m = logits
        .iter()
        .copied()
        .fold(f32::NEG_INFINITY, f32::max);
    let mut exps = [0.0f32; METRE_ML_NUM_CLASSES];
    let mut s = 0.0f32;
    for i in 0..METRE_ML_NUM_CLASSES {
        let e = (logits[i] - m).exp();
        exps[i] = e;
        s += e;
    }
    let inv = if s > 0.0 { 1.0 / s } else { 0.25 };
    for e in &mut exps {
        *e *= inv;
    }
    exps
}

fn logit_row(head: &HybridMetreHead, class: usize, x: &[f32]) -> f32 {
    let base = class * METRE_ML_FEATURE_DIM;
    let mut z = head.bias[class];
    for j in 0..METRE_ML_FEATURE_DIM {
        z += head.weights[base + j] * x[j];
    }
    z
}

/// Build hybrid feature: parse `dense` (51) ∥ softmax(heuristic scores / `tau`) ∥ RBF to shipped class prototypes.
pub fn build_hybrid_feature_vector(
    dense: &[f32],
    heuristic_scores: &[MetreHypothesis; 4],
    tau: f32,
) -> [f32; METRE_ML_FEATURE_DIM] {
    let mut x = [0.0f32; METRE_ML_FEATURE_DIM];
    for j in 0..PARSE_FEATURE_DENSE_LEN.min(dense.len()) {
        x[j] = dense[j];
    }
    let tau = tau.max(1e-3);
    let mut logits = [0.0f32; 4];
    for i in 0..4 {
        logits[i] = heuristic_scores[i].aggregate_score as f32 / tau;
    }
    let p = softmax4(logits);
    for i in 0..4 {
        x[PARSE_FEATURE_DENSE_LEN + i] = p[i];
    }
    let mut rbf = [0.0f32; METRE_ML_NUM_CLASSES];
    rbf_block(dense, &SHIPPED_RBF_PROTO, &mut rbf);
    for i in 0..METRE_ML_NUM_CLASSES {
        x[PARSE_FEATURE_DENSE_LEN + 4 + i] = rbf[i];
    }
    x
}

pub fn class_index_for_metre(m: &MetreType) -> Option<usize> {
    match m {
        MetreType::Venpaa => Some(0),
        MetreType::Aciriyappaa => Some(1),
        MetreType::Kalippaa => Some(2),
        MetreType::Vanjippaa => Some(3),
        MetreType::Other(_) => None,
    }
}

pub fn metre_for_class_index(i: usize) -> Option<MetreType> {
    match i {
        0 => Some(MetreType::Venpaa),
        1 => Some(MetreType::Aciriyappaa),
        2 => Some(MetreType::Kalippaa),
        3 => Some(MetreType::Vanjippaa),
        _ => None,
    }
}

/// Apply hybrid logit, set `aggregate_score` from **100 × probability** (ranking), fill `metre_probability`
/// on each hypothesis, return **(top class index, entropy bits, margin top1-top2)**.
pub fn apply_hybrid_metre_head(
    head: &HybridMetreHead,
    dense: &[f32],
    hypotheses: &mut [MetreHypothesis],
    tau_heuristic: f32,
) -> Option<(usize, f32, f32)> {
    if dense.len() != PARSE_FEATURE_DENSE_LEN || hypotheses.len() != 4 {
        return None;
    }
    if !hybrid_head_is_active(head) {
        return None;
    }
    if head.schema != METRE_ML_WEIGHT_SCHEMA {
        return None;
    }
    let mut ordered: [MetreHypothesis; 4] = std::array::from_fn(|_| MetreHypothesis {
        metre_type: MetreType::Venpaa,
        aggregate_score: 0,
        violations: vec![],
        rule_ids: vec![],
        metre_probability: None,
        metre_rank: None,
    });
    for h in hypotheses.iter() {
        let i = class_index_for_metre(&h.metre_type)?;
        ordered[i] = h.clone();
    }
    let mut x = build_hybrid_feature_vector(dense, &ordered, tau_heuristic);
    normalize_features_inplace(&mut x);
    let mut logits = [0.0f32; METRE_ML_NUM_CLASSES];
    for k in 0..METRE_ML_NUM_CLASSES {
        logits[k] = logit_row(head, k, &x);
    }
    let p = softmax4(logits);
    let mut order = [0usize, 1, 2, 3];
    order.sort_by(|&a, &b| p[b].partial_cmp(&p[a]).unwrap_or(std::cmp::Ordering::Equal));
    let margin = p[order[0]] - p[order[1]];
    for (rank, &ci) in order.iter().enumerate() {
        if let Some(h) = hypotheses
            .iter_mut()
            .find(|h| class_index_for_metre(&h.metre_type) == Some(ci))
        {
            let prob = p[ci];
            h.aggregate_score = (prob * 100.0).round() as i32;
            h.metre_probability = Some(prob);
            h.metre_rank = Some((rank + 1) as u8);
        }
    }
    let entropy = -p
        .iter()
        .filter(|&&x| x > 1e-12)
        .map(|&x| x * x.ln())
        .sum::<f32>()
        / std::f32::consts::LN_2;
    Some((order[0], entropy, margin))
}

/// Train hybrid logit with **L2**-regularized multinomial cross-entropy (batch gradient descent).
/// `xs` must already be **column-standardized** (same transform as inference).
pub fn fit_hybrid_metre_head(
    xs: &[[f32; METRE_ML_FEATURE_DIM]],
    y_class: &[usize],
    l2: f32,
    lr: f32,
    steps: usize,
) -> HybridMetreHead {
    let n = xs.len().max(1) as f32;
    let mut head = HybridMetreHead::default();
    let l2 = l2.max(0.0);
    let lr = lr.max(1e-6);
    for _ in 0..steps {
        let mut grad_b = [0.0f32; METRE_ML_NUM_CLASSES];
        let mut grad_w = [0.0f32; METRE_ML_NUM_CLASSES * METRE_ML_FEATURE_DIM];
        for (i, x) in xs.iter().enumerate() {
            let y = y_class[i];
            if y >= METRE_ML_NUM_CLASSES {
                continue;
            }
            let mut logits = [0.0f32; METRE_ML_NUM_CLASSES];
            for k in 0..METRE_ML_NUM_CLASSES {
                logits[k] = logit_row(&head, k, x);
            }
            let prob = softmax4(logits);
            for k in 0..METRE_ML_NUM_CLASSES {
                let diff = if k == y { prob[k] - 1.0 } else { prob[k] };
                grad_b[k] += diff;
                for j in 0..METRE_ML_FEATURE_DIM {
                    grad_w[k * METRE_ML_FEATURE_DIM + j] += diff * x[j];
                }
            }
        }
        for k in 0..METRE_ML_NUM_CLASSES {
            head.bias[k] -= lr * (grad_b[k] / n + l2 * head.bias[k]);
            for j in 0..METRE_ML_FEATURE_DIM {
                let idx = k * METRE_ML_FEATURE_DIM + j;
                head.weights[idx] -= lr * (grad_w[idx] / n + l2 * head.weights[idx]);
            }
        }
    }
    head
}

pub fn accuracy_on(xs: &[[f32; METRE_ML_FEATURE_DIM]], y_class: &[usize], head: &HybridMetreHead) -> f64 {
    let mut correct = 0usize;
    for (i, x) in xs.iter().enumerate() {
        let y = y_class[i];
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        let mut logits = [0.0f32; METRE_ML_NUM_CLASSES];
        for k in 0..METRE_ML_NUM_CLASSES {
            logits[k] = logit_row(head, k, x);
        }
        let p = softmax4(logits);
        let pred = (0..METRE_ML_NUM_CLASSES).max_by(|&a, &b| p[a].partial_cmp(&p[b]).unwrap()).unwrap();
        if pred == y {
            correct += 1;
        }
    }
    correct as f64 / y_class.len().max(1) as f64
}
