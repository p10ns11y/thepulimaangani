//! A07 — probability calibration helpers (reliability bins + isotonic-style monotone map).

/// Expected calibration error on equal-width bins.
pub fn expected_calibration_error(probs: &[f32], correct: &[bool], bins: usize) -> f32 {
    let bins = bins.max(1);
    let mut sum_p = vec![0.0f32; bins];
    let mut sum_c = vec![0.0f32; bins];
    let mut cnt = vec![0u32; bins];
    for (p, &ok) in probs.iter().zip(correct.iter()) {
        let b = ((*p * bins as f32) as usize).min(bins - 1);
        sum_p[b] += *p;
        sum_c[b] += if ok { 1.0 } else { 0.0 };
        cnt[b] += 1;
    }
    let n = probs.len().max(1) as f32;
    let mut ece = 0.0f32;
    for b in 0..bins {
        if cnt[b] == 0 {
            continue;
        }
        let conf = sum_p[b] / cnt[b] as f32;
        let acc = sum_c[b] / cnt[b] as f32;
        ece += (cnt[b] as f32 / n) * (conf - acc).abs();
    }
    ece
}

/// Piecewise linear temperature-style calibration: scale logits via single T>0 on prob space.
pub fn temperature_scale(prob: f32, temperature: f32) -> f32 {
    let t = temperature.max(1e-3);
    // map p through logit / T
    let p = prob.clamp(1e-6, 1.0 - 1e-6);
    let logit = (p / (1.0 - p)).ln() / t;
    1.0 / (1.0 + (-logit).exp())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ece_zero_when_perfect() {
        let probs = vec![1.0, 0.0, 1.0];
        let ok = vec![true, false, true];
        let e = expected_calibration_error(&probs, &ok, 5);
        assert!(e < 1e-5, "ece={e}");
    }
}
