//! PCA on `dense_*` columns of `data/training/poem_variations_training.csv` (dev-only).
//!
//! Regenerates the CSV with `cargo run --example export_poem_variations_training_csv` when that
//! example exists; otherwise pass an explicit path:
//!
//! ```text
//! cargo run --example parse_features_pca_metre -- ../data/training/poem_variations_training.csv
//! ```

use std::path::Path;

use nalgebra::{DMatrix, DVector};

const D: usize = 51;

fn metre_index(s: &str) -> Option<usize> {
    let t = s.trim().to_ascii_lowercase();
    match t.as_str() {
        "venpaa" => Some(0),
        "aciriyappa" => Some(1),
        "kalippaa" => Some(2),
        "vanjippaa" => Some(3),
        _ => None,
    }
}

fn read_matrix(path: &Path) -> Result<(DMatrix<f64>, DVector<f64>), Box<dyn std::error::Error>> {
    let mut rdr = csv::Reader::from_path(path)?;
    let headers = rdr.headers()?.clone();
    let mut dense_start: Option<usize> = None;
    for (i, h) in headers.iter().enumerate() {
        if h == "dense_0" {
            dense_start = Some(i);
            break;
        }
    }
    let d0 = dense_start.ok_or("missing dense_0 column (export training CSV first)")?;

    let mut rows: Vec<f64> = Vec::new();
    let mut y: Vec<f64> = Vec::new();
    for rec in rdr.records() {
        let rec = rec?;
        let parent = rec
            .get(
                headers
                    .iter()
                    .position(|h| h == "parent_metre")
                    .ok_or("missing parent_metre")?,
            )
            .unwrap_or("");
        let Some(yi) = metre_index(parent).map(|k| k as f64) else {
            continue;
        };
        let parse_ok = rec
            .get(
                headers
                    .iter()
                    .position(|h| h == "parse_ok")
                    .ok_or("missing parse_ok")?,
            )
            .unwrap_or("0");
        if parse_ok != "1" {
            continue;
        }
        for j in 0..D {
            let v: f64 = rec
                .get(d0 + j)
                .ok_or_else(|| format!("short row at dense_{j}"))?
                .parse()?;
            rows.push(v);
        }
        y.push(yi);
    }
    let n = y.len();
    if n < 5 {
        return Err("need at least 5 parse_ok rows with known parent_metre".into());
    }
    let x = DMatrix::from_row_slice(n, D, &rows);
    let yv = DVector::from_vec(y);
    Ok((x, yv))
}

fn column_means(x: &DMatrix<f64>) -> DVector<f64> {
    let mut m = DVector::zeros(x.ncols());
    for j in 0..x.ncols() {
        let mut s = 0.0;
        for i in 0..x.nrows() {
            s += x[(i, j)];
        }
        m[j] = s / x.nrows() as f64;
    }
    m
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let path = std::env::args()
        .nth(1)
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| {
            Path::new(env!("CARGO_MANIFEST_DIR")).join("../data/training/poem_variations_training.csv")
        });
    if !path.exists() {
        eprintln!(
            "Missing {}. Generate with the training CSV export example if available.",
            path.display()
        );
        return Ok(());
    }

    let (x, y) = read_matrix(&path)?;
    let n = x.nrows();
    let means = column_means(&x);
    let mut xc = x.clone();
    for j in 0..D {
        for i in 0..n {
            xc[(i, j)] -= means[j];
        }
    }

    // Thin SVD: X = U Σ V^T ; V's first column = first PC loadings (feature weights).
    let svd = nalgebra::linalg::SVD::new(xc, true, true);
    let vt = svd.v_t.ok_or("SVD did not return V^T")?;
    let pc1: Vec<f64> = (0..D).map(|j| vt[(0, j)]).collect();

    let y_mean: f64 = y.iter().sum::<f64>() / y.len() as f64;
    let yc: DVector<f64> = y.map(|v| v - y_mean);
    let mut s_xy = vec![0.0f64; D];
    let mut s_xx = vec![0.0f64; D];
    for j in 0..D {
        for i in 0..n {
            let xv = x[(i, j)] - means[j];
            s_xy[j] += xv * yc[i];
            s_xx[j] += xv * xv;
        }
    }
    let mut corr_feat: Vec<(usize, f64)> = (0..D)
        .map(|j| {
            let den = (s_xx[j] * yc.dot(&yc)).sqrt().max(1e-12);
            (j, s_xy[j] / den)
        })
        .collect();
    corr_feat.sort_by(|a, b| b.1.abs().partial_cmp(&a.1.abs()).unwrap());

    let mut pc1_rank: Vec<(usize, f64)> = (0..D).map(|j| (j, pc1[j])).collect();
    pc1_rank.sort_by(|a, b| b.1.abs().partial_cmp(&a.1.abs()).unwrap());

    println!("{{");
    println!("  \"csv\": {:?},", path.to_string_lossy());
    println!("  \"n_rows\": {n},");
    println!("  \"singular_value_0\": {:?},", svd.singular_values.get(0).copied());
    println!("  \"note\": \"PC1 loadings are orthogonal directions in feature space; |corr(dense_j, metre_index)| is a simpler linear association with coarse parent_metre.\",");
    println!("  \"top_pc1_abs_loadings\": [");
    for (j, v) in pc1_rank.iter().take(12) {
        println!("    {{ \"dense_index\": {j}, \"pc1_loading\": {v} }},");
    }
    println!("  ],");
    println!("  \"top_abs_correlation_with_metre_index\": [");
    for (j, v) in corr_feat.iter().take(12) {
        println!("    {{ \"dense_index\": {j}, \"corr\": {v} }},");
    }
    println!("  ]");
    println!("}}");
    Ok(())
}