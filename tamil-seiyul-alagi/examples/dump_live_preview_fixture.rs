//! Regenerate `src/lib/__tests__/fixtures/samplePoemThreeLines.parseResult.json`.
//!
//! Mirrors `parse_poem_wasm` defaults (`uyir_u = true`, other options default).
//! Run from repo root:
//! `cd tamil-seiyul-alagi && cargo run --example dump_live_preview_fixture`

use std::fs;
use std::path::Path;

use serde_json;
use thepulimaangani_parser::{parse_poem, ParseOptions};

const SAMPLE: &str = "சுடர்த்தொடீஇ கேளாய் தெருவில்நாம்\nமணற்சிற்றில் காலில் சிதையா அடை\nகோதை பரிந்து வரிப்பந்து கொண்டோ\n";

fn main() {
    let mut options = ParseOptions::default();
    options.uyir_u = true;
    let result = parse_poem(SAMPLE, options).expect("sample poem must parse");

    let json = serde_json::to_string_pretty(&result).expect("serialize");
    let out = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../src/lib/__tests__/fixtures/samplePoemThreeLines.parseResult.json");
    if let Some(parent) = out.parent() {
        fs::create_dir_all(parent).unwrap_or_else(|e| panic!("mkdir {}: {e}", parent.display()));
    }
    fs::write(&out, json).unwrap_or_else(|e| panic!("write {}: {e}", out.display()));
    eprintln!("Wrote {}", out.display());
}
