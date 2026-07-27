//! A06 — mutual information (feature↔metre) and chi-square (discrete linkage×metre).

use crate::metre::ml_head::METRE_ML_NUM_CLASSES;
use crate::parse_features::PARSE_FEATURE_DENSE_LEN;

/// Discretize a continuous feature into `bins` equal-width bins over [min,max].
fn discretize(values: &[f32], bins: usize) -> Vec<usize> {
    let bins = bins.max(2);
    let mut lo = f32::INFINITY;
    let mut hi = f32::NEG_INFINITY;
    for &v in values {
        lo = lo.min(v);
        hi = hi.max(v);
    }
    if !lo.is_finite() || (hi - lo).abs() < 1e-12 {
        return vec![0; values.len()];
    }
    values
        .iter()
        .map(|&v| {
            let t = ((v - lo) / (hi - lo) * (bins as f32 - 1e-6)).floor() as usize;
            t.min(bins - 1)
        })
        .collect()
}

fn entropy_from_counts(counts: &[u32]) -> f64 {
    let n: u32 = counts.iter().sum();
    if n == 0 {
        return 0.0;
    }
    let nf = n as f64;
    let mut h = 0.0f64;
    for &c in counts {
        if c == 0 {
            continue;
        }
        let p = c as f64 / nf;
        h -= p * p.ln();
    }
    h
}

/// Mutual information I(feature_j ; class) after equal-width binning of dense_j.
pub fn mutual_information_feature_class(
    denses: &[Vec<f32>],
    ys: &[usize],
    feature_index: usize,
    bins: usize,
) -> f64 {
    let vals: Vec<f32> = denses
        .iter()
        .map(|d| d.get(feature_index).copied().unwrap_or(0.0))
        .collect();
    let xb = discretize(&vals, bins);
    let mut joint = vec![0u32; bins * METRE_ML_NUM_CLASSES];
    let mut x_counts = vec![0u32; bins];
    let mut y_counts = [0u32; METRE_ML_NUM_CLASSES];
    for (xi, &y) in xb.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        joint[xi * METRE_ML_NUM_CLASSES + y] += 1;
        x_counts[*xi] += 1;
        y_counts[y] += 1;
    }
    let hx = entropy_from_counts(&x_counts);
    let hy = entropy_from_counts(&y_counts);
    let mut hxy = 0.0f64;
    let n: u32 = x_counts.iter().sum();
    if n == 0 {
        return 0.0;
    }
    let nf = n as f64;
    for c in joint {
        if c == 0 {
            continue;
        }
        let p = c as f64 / nf;
        hxy -= p * p.ln();
    }
    (hx + hy - hxy).max(0.0)
}

/// MI for every dense index.
pub fn mutual_information_all_features(
    denses: &[Vec<f32>],
    ys: &[usize],
    bins: usize,
) -> Vec<f64> {
    (0..PARSE_FEATURE_DENSE_LEN)
        .map(|j| mutual_information_feature_class(denses, ys, j, bins))
        .collect()
}

/// Chi-square independence statistic on a contingency table (rows × cols).
pub fn chi_square_contingency(table: &[Vec<u32>]) -> f64 {
    if table.is_empty() {
        return 0.0;
    }
    let cols = table[0].len();
    let mut row_sum = vec![0.0f64; table.len()];
    let mut col_sum = vec![0.0f64; cols];
    let mut n = 0.0f64;
    for (i, row) in table.iter().enumerate() {
        for (j, &v) in row.iter().enumerate() {
            let vf = v as f64;
            row_sum[i] += vf;
            col_sum[j] += vf;
            n += vf;
        }
    }
    if n <= 0.0 {
        return 0.0;
    }
    let mut chi = 0.0f64;
    for (i, row) in table.iter().enumerate() {
        for (j, &v) in row.iter().enumerate() {
            let exp = row_sum[i] * col_sum[j] / n;
            if exp > 0.0 {
                let o = v as f64;
                chi += (o - exp).powi(2) / exp;
            }
        }
    }
    chi
}

/// Chi-square for dominant linkage bin (dense 12..19 argmax) vs metre class.
pub fn chi_square_linkage_bin_vs_metre(denses: &[Vec<f32>], ys: &[usize]) -> f64 {
    // 7 linkage type bins × 4 classes
    let mut table = vec![vec![0u32; METRE_ML_NUM_CLASSES]; 7];
    for (d, &y) in denses.iter().zip(ys.iter()) {
        if y >= METRE_ML_NUM_CLASSES {
            continue;
        }
        let mut best = 0usize;
        let mut best_v = f32::NEG_INFINITY;
        for j in 0..7 {
            let v = d.get(12 + j).copied().unwrap_or(0.0);
            if v > best_v {
                best_v = v;
                best = j;
            }
        }
        table[best][y] += 1;
    }
    chi_square_contingency(&table)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mi_higher_when_feature_aligns_with_class() {
        let mut d0 = vec![0.0f32; 51];
        let mut d1 = vec![0.0f32; 51];
        d0[0] = 0.0;
        d1[0] = 10.0;
        let xs = vec![d0.clone(), d0, d1.clone(), d1];
        let ys = vec![0, 0, 1, 1];
        let mi0 = mutual_information_feature_class(&xs, &ys, 0, 4);
        let mi5 = mutual_information_feature_class(&xs, &ys, 5, 4);
        assert!(mi0 > mi5);
    }

    #[test]
    fn chi_square_independent_near_zero() {
        // balanced table → small chi2
        let t = vec![vec![5, 5], vec![5, 5]];
        let c = chi_square_contingency(&t);
        assert!(c < 1e-6, "chi={c}");
    }

    #[test]
    fn chi_square_dependent_large() {
        let t = vec![vec![10, 0], vec![0, 10]];
        let c = chi_square_contingency(&t);
        assert!(c > 10.0);
    }
}
