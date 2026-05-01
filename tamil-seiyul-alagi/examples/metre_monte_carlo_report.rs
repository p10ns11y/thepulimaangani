//! Print aggregated metre confusion over deterministic shuffles of `special_type` samples.
//!
//! Default: **20** iterations. Override with `MC_ITERATIONS` (e.g. `MC_ITERATIONS=50`).
//!
//! ```text
//! cargo run --example metre_monte_carlo_report
//! ```

use std::path::Path;

use thepulimaangani_parser::{
    aggregate_metre_monte_carlo, poem_variation_label_rows, poem_variation_special_type_rows,
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let js = std::fs::read_to_string(
        Path::new(env!("CARGO_MANIFEST_DIR")).join("../data/poem_variations.js"),
    )?;
    let labels = poem_variation_special_type_rows(&poem_variation_label_rows(&js));
    let iterations: u32 = std::env::var("MC_ITERATIONS")
        .ok()
        .and_then(|s| s.parse().ok())
        .filter(|&n| n > 0)
        .unwrap_or(20);
    let agg = aggregate_metre_monte_carlo(&labels, iterations);
    println!("{}", serde_json::to_string_pretty(&agg)?);
    Ok(())
}
