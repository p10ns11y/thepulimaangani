//! Build UTF-8 training CSV from `data/poem_variations.js` (repo root).
//!
//! ```text
//! cargo run --example export_poem_variations_training_csv
//! ```
//!
//! Writes `data/training/poem_variations_training.csv` (UTF-8, no BOM).

use std::path::Path;

use thepulimaangani_parser::{
    build_training_rows, poem_variation_label_rows, write_poem_variations_training_csv,
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    let js_path = manifest.join("../data/poem_variations.js");
    let out_dir = manifest.join("../data/training");
    std::fs::create_dir_all(&out_dir)?;
    let out_path = out_dir.join("poem_variations_training.csv");

    let js = std::fs::read_to_string(&js_path)?;
    let labels = poem_variation_label_rows(&js);
    let rows = build_training_rows(&labels);
    write_poem_variations_training_csv(&out_path, &rows)?;
    eprintln!("Wrote {} ({} rows)", out_path.display(), rows.len());
    Ok(())
}
