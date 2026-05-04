//! Fit hybrid metre logit on `special_type` rows from the canonical Rust `poem_variations` tables
//! (same corpus as `data/poem_variations.js`) and write
//! `src/metre/metre_hybrid_weights.inc.rs` (weights + feature mean/std + dense RBF prototypes).
//!
//! ```text
//! cargo run --example fit_metre_hybrid_weights --manifest-path tamil-seiyul-alagi/Cargo.toml
//! ```

use std::path::Path;

use thepulimaangani_parser::metre::ml_head::{
    accuracy_on, build_hybrid_feature_vector_with_proto, class_index_for_metre,
    compute_dense_prototypes_excluding, fit_hybrid_metre_head, hybrid_head_is_active, HybridMetreHead,
    METRE_ML_FEATURE_DIM, METRE_ML_NUM_CLASSES,
};
use thepulimaangani_parser::metre::{boost_metre_hypotheses_with_dense, detect_metre_hypotheses};
use thepulimaangani_parser::PARSE_FEATURE_DENSE_LEN;
use thepulimaangani_parser::types::{MetreHypothesis, ParseOptions};
use thepulimaangani_parser::MetreType;
use thepulimaangani_parser::{
    gold_metre_type_for_parent, parse_poem, poem_variation_label_rows, poem_variation_special_type_rows,
};

fn logit_row(head: &HybridMetreHead, class: usize, x: &[f32; METRE_ML_FEATURE_DIM]) -> f32 {
    let base = class * METRE_ML_FEATURE_DIM;
    let mut z = head.bias[class];
    for j in 0..METRE_ML_FEATURE_DIM {
        z += head.weights[base + j] * x[j];
    }
    z
}

fn softmax4(logits: [f32; METRE_ML_NUM_CLASSES]) -> [f32; METRE_ML_NUM_CLASSES] {
    let m = logits.iter().copied().fold(f32::NEG_INFINITY, f32::max);
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

fn column_stats(rows: &[[f32; METRE_ML_FEATURE_DIM]]) -> ([f32; METRE_ML_FEATURE_DIM], [f32; METRE_ML_FEATURE_DIM]) {
    let n = rows.len().max(1) as f32;
    let mut mean = [0.0f32; METRE_ML_FEATURE_DIM];
    for r in rows {
        for j in 0..METRE_ML_FEATURE_DIM {
            mean[j] += r[j];
        }
    }
    for m in &mut mean {
        *m /= n;
    }
    let mut var = [0.0f32; METRE_ML_FEATURE_DIM];
    for r in rows {
        for j in 0..METRE_ML_FEATURE_DIM {
            let d = r[j] - mean[j];
            var[j] += d * d;
        }
    }
    let mut inv_std = [1.0f32; METRE_ML_FEATURE_DIM];
    for j in 0..METRE_ML_FEATURE_DIM {
        let sd = (var[j] / n).sqrt().max(1e-4);
        inv_std[j] = 1.0 / sd;
    }
    (mean, inv_std)
}

fn normalize_row(
    raw: &[f32; METRE_ML_FEATURE_DIM],
    mean: &[f32; METRE_ML_FEATURE_DIM],
    inv_std: &[f32; METRE_ML_FEATURE_DIM],
) -> [f32; METRE_ML_FEATURE_DIM] {
    let mut out = [0.0f32; METRE_ML_FEATURE_DIM];
    for j in 0..METRE_ML_FEATURE_DIM {
        out[j] = (raw[j] - mean[j]) * inv_std[j];
    }
    out
}

fn normalize_dataset(
    raw: &[[f32; METRE_ML_FEATURE_DIM]],
    mean: &[f32; METRE_ML_FEATURE_DIM],
    inv_std: &[f32; METRE_ML_FEATURE_DIM],
) -> Vec<[f32; METRE_ML_FEATURE_DIM]> {
    raw.iter().map(|r| normalize_row(r, mean, inv_std)).collect()
}

fn build_raw_matrix(
    denses: &[Vec<f32>],
    heur: &[[MetreHypothesis; 4]],
    proto: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
    tau: f32,
) -> Vec<[f32; METRE_ML_FEATURE_DIM]> {
    (0..denses.len())
        .map(|i| build_hybrid_feature_vector_with_proto(&denses[i], &heur[i], tau, proto))
        .collect()
}

fn loocv_accuracy(
    denses: &[Vec<f32>],
    heur: &[[MetreHypothesis; 4]],
    ys: &[usize],
    tau: f32,
    l2: f32,
    lr: f32,
    steps: usize,
) -> f64 {
    let n = denses.len();
    if n == 0 {
        return 0.0;
    }
    let mut correct = 0usize;
    for hold in 0..n {
        let proto_loo = compute_dense_prototypes_excluding(denses, ys, Some(hold));
        let mut fold_raw: Vec<[f32; METRE_ML_FEATURE_DIM]> = Vec::with_capacity(n - 1);
        let mut fold_y: Vec<usize> = Vec::with_capacity(n - 1);
        for i in 0..n {
            if i == hold {
                continue;
            }
            fold_raw.push(build_hybrid_feature_vector_with_proto(
                &denses[i],
                &heur[i],
                tau,
                &proto_loo,
            ));
            fold_y.push(ys[i]);
        }
        let (m, inv) = column_stats(&fold_raw);
        let xs_tr = normalize_dataset(&fold_raw, &m, &inv);
        let head = fit_hybrid_metre_head(&xs_tr, &fold_y, l2, lr, steps);
        let x_hold_raw = build_hybrid_feature_vector_with_proto(&denses[hold], &heur[hold], tau, &proto_loo);
        let x_hold = normalize_row(&x_hold_raw, &m, &inv);
        let mut logits = [0.0f32; METRE_ML_NUM_CLASSES];
        for k in 0..METRE_ML_NUM_CLASSES {
            logits[k] = logit_row(&head, k, &x_hold);
        }
        let p = softmax4(logits);
        let pred = (0..METRE_ML_NUM_CLASSES)
            .max_by(|&a, &b| p[a].partial_cmp(&p[b]).unwrap())
            .unwrap();
        if pred == ys[hold] {
            correct += 1;
        }
    }
    correct as f64 / n as f64
}

fn emit_arrays(name: &str, vals: &[f32; METRE_ML_FEATURE_DIM]) -> String {
    let mut s = format!("static {name}: [f32; METRE_ML_FEATURE_DIM] = [\n");
    for (idx, v) in vals.iter().enumerate() {
        if idx % 6 == 0 {
            s.push_str("    ");
        }
        s.push_str(&format!("{:.8}_f32", v));
        if idx + 1 < METRE_ML_FEATURE_DIM {
            s.push_str(", ");
        }
        if idx % 6 == 5 {
            s.push('\n');
        }
    }
    if METRE_ML_FEATURE_DIM % 6 != 0 {
        s.push('\n');
    }
    s.push_str("];\n");
    s
}

fn emit_proto(proto: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES]) -> String {
    let mut s = String::from(
        "static SHIPPED_RBF_PROTO: [[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES] = [\n",
    );
    for c in 0..METRE_ML_NUM_CLASSES {
        s.push_str("    [\n        ");
        for j in 0..PARSE_FEATURE_DENSE_LEN {
            if j > 0 && j % 6 == 0 {
                s.push('\n');
                s.push_str("        ");
            }
            if j > 0 {
                s.push_str(", ");
            }
            s.push_str(&format!("{:.8}_f32", proto[c][j]));
        }
        s.push_str("\n    ],\n");
    }
    s.push_str("];\n");
    s
}

fn emit_rust(
    head: &HybridMetreHead,
    mean: &[f32; METRE_ML_FEATURE_DIM],
    inv_std: &[f32; METRE_ML_FEATURE_DIM],
    proto: &[[f32; PARSE_FEATURE_DENSE_LEN]; METRE_ML_NUM_CLASSES],
) -> String {
    let mut s = String::from(
        "// Generated by `cargo run --example fit_metre_hybrid_weights` (Rust poem_variations tables) — do not hand-edit.\n",
    );
    s.push_str(&emit_proto(proto));
    s.push_str(&emit_arrays("SHIPPED_FEATURE_MEAN", mean));
    s.push_str(&emit_arrays("SHIPPED_FEATURE_INV_STD", inv_std));
    s.push_str("static SHIPPED_HYBRID_METRE_HEAD: HybridMetreHead = HybridMetreHead {\n");
    s.push_str("    schema: METRE_ML_WEIGHT_SCHEMA,\n");
    s.push_str("    bias: [\n        ");
    for (i, b) in head.bias.iter().enumerate() {
        if i > 0 {
            s.push_str(", ");
        }
        s.push_str(&format!("{:.8}_f32", b));
    }
    s.push_str("\n    ],\n");
    s.push_str("    weights: [\n");
    for (idx, w) in head.weights.iter().enumerate() {
        if idx % 8 == 0 {
            s.push_str("        ");
        }
        s.push_str(&format!("{:.8}_f32", w));
        if idx + 1 < head.weights.len() {
            s.push_str(", ");
        }
        if idx % 8 == 7 {
            s.push('\n');
        }
    }
    if head.weights.len() % 8 != 0 {
        s.push('\n');
    }
    s.push_str("    ],\n};\n");
    s
}

fn main() {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    let out_path = manifest.join("src/metre/metre_hybrid_weights.inc.rs");
    let all = poem_variation_label_rows();
    let labels = poem_variation_special_type_rows(&all);
    let tau = 15.0_f32;
    let mut denses: Vec<Vec<f32>> = Vec::new();
    let mut heur: Vec<[MetreHypothesis; 4]> = Vec::new();
    let mut ys: Vec<usize> = Vec::new();
    let mut opts = ParseOptions::default();
    opts.skip_ml_metre = true;
    for label in &labels {
        let gold = gold_metre_type_for_parent(label.parent_metre.as_str()).expect("gold");
        let y = class_index_for_metre(&gold).expect("class");
        let r = parse_poem(label.text.trim(), opts).expect("parse");
        let feet = r.feet.clone();
        let linkage = r.linkage.clone();
        let pf = r.parse_features.as_ref().expect("features");
        let mut hyps = detect_metre_hypotheses(&feet, &linkage, false);
        boost_metre_hypotheses_with_dense(&mut hyps, &pf.dense);
        let mut arr: [MetreHypothesis; 4] = std::array::from_fn(|_| MetreHypothesis {
            metre_type: MetreType::Venpaa,
            aggregate_score: 0,
            violations: vec![],
            rule_ids: vec![],
            metre_probability: None,
            metre_rank: None,
        });
        for h in hyps.iter() {
            let i = class_index_for_metre(&h.metre_type).expect("idx");
            arr[i] = h.clone();
        }
        denses.push(pf.dense.clone());
        heur.push(arr);
        ys.push(y);
    }
    let proto_full = compute_dense_prototypes_excluding(&denses, &ys, None);
    let raw: Vec<[f32; METRE_ML_FEATURE_DIM]> = build_raw_matrix(&denses, &heur, &proto_full, tau);
    let raw_ref: &[[f32; METRE_ML_FEATURE_DIM]] = &raw;
    let (g_mean, g_inv) = column_stats(raw_ref);
    let xs_full = normalize_dataset(raw_ref, &g_mean, &g_inv);

    let mut best_train = 0.0_f64;
    let mut best_l2 = 0.08_f32;
    let mut best_lr = 0.4_f32;
    let mut best_steps = 5000_usize;
    for &l2 in &[0.04_f32, 0.1, 0.22] {
        for &lr in &[0.3_f32, 0.55] {
            for &steps in &[3000_usize, 7000] {
                let head = fit_hybrid_metre_head(&xs_full, &ys, l2, lr, steps);
                let train = accuracy_on(&xs_full, &ys, &head);
                if train > best_train {
                    best_train = train;
                    best_l2 = l2;
                    best_lr = lr;
                    best_steps = steps;
                }
            }
        }
    }
    let final_steps = best_steps.saturating_mul(2).min(14_000);
    let mut final_head = fit_hybrid_metre_head(&xs_full, &ys, best_l2, best_lr, final_steps);
    let mut train_acc = accuracy_on(&xs_full, &ys, &final_head);
    let mut loocv = loocv_accuracy(&denses, &heur, &ys, tau, best_l2, best_lr, final_steps);
    eprintln!(
        "full-data best train {:.4} (initial final train {:.4} LOOCV {:.4}) l2={} lr={} steps={}",
        best_train, train_acc, loocv, best_l2, best_lr, final_steps,
    );
    if loocv < 0.96 {
        eprintln!("refinement pass for LOOCV …");
        let mut best_loo = loocv;
        let mut best_tr = train_acc;
        let mut cand_head = final_head.clone();
        let mut cand_l2 = best_l2;
        let mut cand_lr = best_lr;
        for &l2 in &[0.0005_f32, 0.004, 0.015, 0.05] {
            for &lr in &[0.5_f32, 1.0, 1.5] {
                let fs = 18_000;
                let head = fit_hybrid_metre_head(&xs_full, &ys, l2, lr, fs);
                let tr = accuracy_on(&xs_full, &ys, &head);
                let lv = loocv_accuracy(&denses, &heur, &ys, tau, l2, lr, fs);
                if lv > best_loo || (lv == best_loo && tr > best_tr) {
                    best_loo = lv;
                    best_tr = tr;
                    cand_head = head;
                    cand_l2 = l2;
                    cand_lr = lr;
                }
            }
        }
        loocv = best_loo;
        train_acc = best_tr;
        final_head = cand_head;
        best_l2 = cand_l2;
        best_lr = cand_lr;
        eprintln!(
            "after refine: train {:.4} LOOCV {:.4} l2={} lr={}",
            train_acc, loocv, best_l2, best_lr
        );
    }
    eprintln!("hybrid_active={}", hybrid_head_is_active(&final_head));
    if loocv < 0.96 {
        eprintln!("note: LOOCV {:.4} on n={} special_type (honest small-sample CV)", loocv, ys.len());
    }
    let body = emit_rust(&final_head, &g_mean, &g_inv, &proto_full);
    std::fs::write(&out_path, &body).unwrap_or_else(|e| panic!("write {:?}: {}", out_path, e));
    eprintln!("wrote {}", out_path.display());
}
