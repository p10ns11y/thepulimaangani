//! Per-sample linkage coarse fractions vs gold `parent_metre` from `poem_variations.js`.
//!
//! ```text
//! cargo run --example training_linkage_vs_gold
//! ```
//!
//! Optional: `MC_ROW_KINDS=special_type,variation` or `MC_ROW_KINDS=all` (default: all rows).

use std::collections::BTreeMap;
use std::path::Path;

use serde_json::{json, Value};
use thepulimaangani_parser::{
    gold_metre_type_for_parent, linkage_coarse_fractions, parse_label_row_for_eval,
    poem_variation_label_rows, poem_variation_rows_by_kinds, Linkage,
};

fn linkage_type_json_value(t: &thepulimaangani_parser::LinkageType) -> Value {
    serde_json::to_value(t).unwrap_or(Value::Null)
}

fn type_histogram(linkage: &[Linkage]) -> BTreeMap<String, u64> {
    let mut m = BTreeMap::new();
    for e in linkage {
        let k = linkage_type_json_value(&e.linkage_type)
            .as_str()
            .map(str::to_string)
            .unwrap_or_else(|| format!("{:?}", e.linkage_type));
        *m.entry(k).or_insert(0) += 1;
    }
    m
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let js = std::fs::read_to_string(
        Path::new(env!("CARGO_MANIFEST_DIR")).join("../data/poem_variations.js"),
    )?;
    let all = poem_variation_label_rows(&js);
    let kinds_env = std::env::var("MC_ROW_KINDS").unwrap_or_else(|_| "all".into());
    let labels = if kinds_env.eq_ignore_ascii_case("all") {
        all
    } else if kinds_env.is_empty() {
        all
    } else {
        let kinds: Vec<&str> = kinds_env.split(',').map(str::trim).filter(|s| !s.is_empty()).collect();
        poem_variation_rows_by_kinds(&all, &kinds)
    };

    let mut out = Vec::new();
    for label in &labels {
        let gold = gold_metre_type_for_parent(label.parent_metre.as_str());
        let r = match parse_label_row_for_eval(label) {
            Ok(x) => x,
            Err(e) => {
                out.push(json!({
                    "sample_id": label.sample_id,
                    "row_kind": label.row_kind,
                    "parent_metre": label.parent_metre,
                    "parse_ok": false,
                    "parse_error": e.to_string(),
                }));
                continue;
            }
        };
        let (vent_f, aasi_f, kal_f, vanj_f) = linkage_coarse_fractions(&r.linkage);
        let pred = r
            .top_k_metre_hypotheses
            .first()
            .map(|h| format!("{:?}", h.metre_type));
        let hist = type_histogram(&r.linkage);
        out.push(json!({
            "sample_id": label.sample_id,
            "row_kind": label.row_kind,
            "parent_metre": label.parent_metre,
            "parse_ok": true,
            "gold_metre": gold.map(|m| format!("{m:?}")),
            "predicted_top1": pred,
            "linkage_edges": r.linkage.len(),
            "fraction_vent": vent_f,
            "fraction_aciriya": aasi_f,
            "fraction_kali": kal_f,
            "fraction_vanji": vanj_f,
            "linkage_type_counts": hist,
        }));
    }
    println!("{}", serde_json::to_string_pretty(&out)?);
    Ok(())
}
