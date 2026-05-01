//! Emit one JSON line per row from `data/poem_variations.js` (labels + dense + linkage).
//!
//! Linkage uses the same `linkage_type` / `linkage_special_type` strings as WASM JSON
//! (e.g. `VenTalai`, `IyarcirVenTalai`).
//!
//! ```text
//! cargo run --example export_poem_variations_training_jsonl
//! ```
//!
//! Writes `data/training/poem_variations_training.jsonl` (UTF-8, one object per line).

use std::io::Write;
use std::path::Path;

use thepulimaangani_parser::{build_training_rows, poem_variation_label_rows};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    let js_path = manifest.join("../data/poem_variations.js");
    let out_dir = manifest.join("../data/training");
    std::fs::create_dir_all(&out_dir)?;
    let out_path = out_dir.join("poem_variations_training.jsonl");

    let js = std::fs::read_to_string(&js_path)?;
    let labels = poem_variation_label_rows(&js);
    let rows = build_training_rows(&labels);

    let mut file = std::fs::File::create(&out_path)?;
    for row in &rows {
        let line = serde_json::json!({
            "sample_id": row.label.sample_id,
            "parent_metre": row.label.parent_metre,
            "row_kind": row.label.row_kind,
            "label_ta": row.label.label_ta,
            "text": row.label.text,
            "parse_ok": row.parse_ok,
            "parse_error": row.parse_error,
            "predicted_metre": row.predicted_metre,
            "top_score": row.top_score,
            "pred_matches_parent": row.parse_ok && row.predicted_metre.as_ref().map(|p| p.eq_ignore_ascii_case(&row.label.parent_metre)).unwrap_or(false),
            "parse_features": row.features,
            "linkage": row.linkage,
        });
        writeln!(file, "{}", serde_json::to_string(&line)?)?;
    }
    eprintln!("Wrote {} ({} lines)", out_path.display(), rows.len());
    Ok(())
}
