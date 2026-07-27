//! Tier C pilots C01–C05 (scaffolds with real, bounded algorithms).

use std::collections::BTreeSet;

/// C01 — active learning: pick highest-entropy samples for labeling.
pub fn active_learning_query_indices(entropies: &[f32], budget: usize) -> Vec<usize> {
    let mut idx: Vec<usize> = (0..entropies.len()).collect();
    idx.sort_by(|&i, &j| {
        entropies[j]
            .partial_cmp(&entropies[i])
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    idx.into_iter().take(budget.min(entropies.len())).collect()
}

/// C02 — metric learning lite: scale features by per-dim Fisher-ish weights.
pub fn metric_feature_scales(denses: &[Vec<f32>], ys: &[usize], dim: usize) -> Vec<f32> {
    let mut scales = vec![1.0f32; dim];
    for j in 0..dim {
        let mut by = [Vec::new(), Vec::new(), Vec::new(), Vec::new()];
        for (d, &y) in denses.iter().zip(ys.iter()) {
            if y < 4 {
                by[y].push(d.get(j).copied().unwrap_or(0.0));
            }
        }
        let means: Vec<f32> = by
            .iter()
            .map(|v| {
                if v.is_empty() {
                    0.0
                } else {
                    v.iter().sum::<f32>() / v.len() as f32
                }
            })
            .collect();
        let global = means.iter().sum::<f32>() / 4.0;
        let between = means.iter().map(|m| (m - global).powi(2)).sum::<f32>();
        scales[j] = (1.0 + between).sqrt();
    }
    scales
}

/// C03 — 1D CNN pilot: single convolutional score over acai stream (toy).
pub fn cnn_stream_score(stream: &str, kernel: &[f32]) -> f32 {
    let x: Vec<f32> = stream
        .chars()
        .map(|c| if c == 'N' { 1.0 } else { -1.0 })
        .collect();
    if x.is_empty() || kernel.is_empty() {
        return 0.0;
    }
    let mut best = f32::NEG_INFINITY;
    if x.len() < kernel.len() {
        return x.iter().sum::<f32>() * kernel[0];
    }
    for i in 0..=x.len() - kernel.len() {
        let mut s = 0.0f32;
        for (k, &kv) in kernel.iter().enumerate() {
            s += x[i + k] * kv;
        }
        best = best.max(s);
    }
    best
}

/// C04 — Bayesian line filter: update 4-way belief with per-line likelihoods.
pub fn bayesian_line_update(prior: [f32; 4], line_likelihood: [f32; 4]) -> [f32; 4] {
    let mut post = [0.0f32; 4];
    for i in 0..4 {
        post[i] = prior[i].max(1e-9) * line_likelihood[i].max(1e-9);
    }
    let s: f32 = post.iter().sum::<f32>().max(1e-12);
    for p in &mut post {
        *p /= s;
    }
    post
}

/// C05 — FST scaffold: accepted symbols set + simple path check for N/R strings.
pub struct AcaiFst {
    pub accept_states: BTreeSet<u32>,
}

impl AcaiFst {
    pub fn venpaa_like_sketch() -> Self {
        // accepts any stream (scaffold); final always 0
        let mut accept_states = BTreeSet::new();
        accept_states.insert(0);
        Self { accept_states }
    }

    pub fn accepts(&self, stream: &str) -> bool {
        let mut state = 0u32;
        for c in stream.chars() {
            if c != 'N' && c != 'R' {
                return false;
            }
            state = (state + 1) % 4;
        }
        self.accept_states.contains(&(state % 4)) || self.accept_states.contains(&0)
    }
}

/// D02-style ILP/SAT backend scaffold: feasibility flag for classical constraints list.
pub fn ilp_sat_feasible(violations: &[String]) -> bool {
    violations.is_empty()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn active_learning_picks_high_entropy() {
        let e = vec![0.1, 0.9, 0.5];
        let q = active_learning_query_indices(&e, 1);
        assert_eq!(q, vec![1]);
    }

    #[test]
    fn bayes_normalizes() {
        let p = bayesian_line_update([0.25; 4], [1.0, 2.0, 1.0, 1.0]);
        let s: f32 = p.iter().sum();
        assert!((s - 1.0).abs() < 1e-5);
    }

    #[test]
    fn fst_accepts_nr() {
        let f = AcaiFst::venpaa_like_sketch();
        assert!(f.accepts("NRN"));
    }
}
