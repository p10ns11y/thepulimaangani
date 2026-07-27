//! A01 — unified metrics harness (top-1, MRR, correct@2, confusion, bootstrap CI).

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq)]
pub struct ConfusionCell {
    pub gold: String,
    pub pred: String,
    pub count: u32,
}

#[derive(Debug, Clone, PartialEq)]
pub struct EvalMetrics {
    pub n: usize,
    pub top1: f64,
    pub mrr: f64,
    pub correct_at_2: f64,
    pub confusion: Vec<ConfusionCell>,
}

/// One sample: gold class index, ranked predicted class indices (best first).
pub fn metrics_from_ranked(gold: &[usize], ranked: &[Vec<usize>], class_names: &[&str]) -> EvalMetrics {
    assert_eq!(gold.len(), ranked.len());
    let n = gold.len();
    if n == 0 {
        return EvalMetrics {
            n: 0,
            top1: 0.0,
            mrr: 0.0,
            correct_at_2: 0.0,
            confusion: vec![],
        };
    }
    let mut top1_hits = 0u32;
    let mut mrr_sum = 0.0f64;
    let mut c2 = 0u32;
    let mut conf: BTreeMap<(usize, usize), u32> = BTreeMap::new();
    for (i, &g) in gold.iter().enumerate() {
        let ranks = &ranked[i];
        let pred = ranks.first().copied().unwrap_or(usize::MAX);
        *conf.entry((g, pred)).or_insert(0) += 1;
        if ranks.first() == Some(&g) {
            top1_hits += 1;
        }
        if ranks.iter().take(2).any(|&r| r == g) {
            c2 += 1;
        }
        if let Some(pos) = ranks.iter().position(|&r| r == g) {
            mrr_sum += 1.0 / (pos as f64 + 1.0);
        }
    }
    let nf = n as f64;
    let mut confusion = Vec::new();
    for ((g, p), c) in conf {
        let gs = class_names.get(g).copied().unwrap_or("?");
        let ps = class_names.get(p).copied().unwrap_or("?");
        confusion.push(ConfusionCell {
            gold: gs.into(),
            pred: ps.into(),
            count: c,
        });
    }
    EvalMetrics {
        n,
        top1: top1_hits as f64 / nf,
        mrr: mrr_sum / nf,
        correct_at_2: c2 as f64 / nf,
        confusion,
    }
}

/// Percentile bootstrap of top-1 (deterministic FNV salt).
pub fn bootstrap_top1_ci(
    gold: &[usize],
    ranked: &[Vec<usize>],
    iterations: u32,
    salt: u64,
) -> (f64, f64, f64) {
    let n = gold.len();
    if n == 0 {
        return (0.0, 0.0, 0.0);
    }
    let mut scores = Vec::with_capacity(iterations as usize);
    for it in 0..iterations {
        let mut hits = 0u32;
        for i in 0..n {
            let j = fnv_index(salt, it, i as u64, n);
            let g = gold[j];
            if ranked[j].first() == Some(&g) {
                hits += 1;
            }
        }
        scores.push(hits as f64 / n as f64);
    }
    scores.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let lo = scores[(iterations as f64 * 0.025) as usize];
    let hi = scores[((iterations as f64 * 0.975) as usize).min(scores.len() - 1)];
    let mid = scores[scores.len() / 2];
    (lo, mid, hi)
}

fn fnv_index(salt: u64, it: u32, i: u64, n: usize) -> usize {
    let mut h = 0xcbf29ce484222325u64 ^ salt;
    h ^= it as u64;
    h = h.wrapping_mul(0x100000001b3);
    h ^= i;
    h = h.wrapping_mul(0x100000001b3);
    (h as usize) % n
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn perfect_ranking_metrics() {
        let gold = vec![0, 1, 2];
        let ranked = vec![vec![0, 1], vec![1, 0], vec![2, 1]];
        let m = metrics_from_ranked(&gold, &ranked, &["a", "b", "c"]);
        assert!((m.top1 - 1.0).abs() < 1e-9);
        assert!((m.mrr - 1.0).abs() < 1e-9);
        assert!((m.correct_at_2 - 1.0).abs() < 1e-9);
    }
}
