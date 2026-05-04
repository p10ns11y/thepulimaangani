//! Print aggregated metre metrics over deterministic shuffles of poem-variation rows.
//!
//! - **`MC_ITERATIONS`**: default **20** (e.g. `MC_ITERATIONS=50`).
//! - **`MC_ROW_KINDS`**: comma-separated `special_type`, `variation`, or **`all`** (default **`special_type`** to match the regression suite).
//!
//! ```text
//! cargo run --example metre_monte_carlo_report
//! MC_ROW_KINDS=special_type,variation MC_ITERATIONS=20 cargo run --example metre_monte_carlo_report
//! ```

use thepulimaangani_parser::{
    aggregate_metre_monte_carlo, poem_variation_label_rows, poem_variation_rows_by_kinds,
    poem_variation_special_type_rows,
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let all = poem_variation_label_rows();
    let kinds_env = std::env::var("MC_ROW_KINDS").unwrap_or_else(|_| "special_type".into());
    let labels = if kinds_env.eq_ignore_ascii_case("all") {
        all
    } else {
        let kinds: Vec<&str> = kinds_env.split(',').map(str::trim).filter(|s| !s.is_empty()).collect();
        if kinds.is_empty() {
            poem_variation_special_type_rows(&all)
        } else {
            poem_variation_rows_by_kinds(&all, &kinds)
        }
    };
    let iterations: u32 = std::env::var("MC_ITERATIONS")
        .ok()
        .and_then(|s| s.parse().ok())
        .filter(|&n| n > 0)
        .unwrap_or(20);
    let agg = aggregate_metre_monte_carlo(&labels, iterations);
    println!("{}", serde_json::to_string_pretty(&agg)?);
    Ok(())
}
