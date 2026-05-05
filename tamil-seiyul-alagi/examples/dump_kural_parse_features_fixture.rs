//! Regenerate `tests/test_data/kural_venpaa_parse_features.json` used by
//! `parse_features::tests::golden_kural_venpaa_parse_features_match_fixture`.
//!
//! Must match that test: same text and [`ParseOptions`] (`no_detect = true`).
//! Run from repo root:
//! `cd tamil-seiyul-alagi && cargo run --example dump_kural_parse_features_fixture`

use std::fs;
use std::path::Path;

use thepulimaangani_parser::{parse_poem, ParseFeatureSnapshot, ParseOptions};

const KURAL_TEXT: &str =
    "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";

fn main() {
    let mut opts = ParseOptions::default();
    opts.no_detect = true;
    let result = parse_poem(KURAL_TEXT, opts).expect("kural sample must parse");

    let snap = ParseFeatureSnapshot::from(&result);
    let json = serde_json::to_string_pretty(&snap).expect("serialize");
    let content = format!("{json}\n");

    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/test_data/kural_venpaa_parse_features.json");
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap_or_else(|e| panic!("mkdir {}: {e}", parent.display()));
    }
    fs::write(&path, content).unwrap_or_else(|e| panic!("write {}: {e}", path.display()));
    eprintln!("Wrote {}", path.display());
}
