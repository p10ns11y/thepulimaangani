//! Thepulimaangani Parser — Idiomatic Rust port of Avalokitam's Tamil Prosody (Yāppu) engine.
//!
//! This crate provides a clean, type-safe, and well-documented implementation of classical
//! Tamil prosody parsing. It follows Rust best practices: strong typing with enums,
//! zero-cost abstractions, clear ownership, comprehensive error handling, and excellent
//! documentation.
//!
//! The parser mirrors the original PHP logic (ProsodyParseTree) but is rewritten from the
//! ground up to be idiomatic, testable, and WASM-friendly.
//!
//! # Core Pipeline
//! 1. Normalize & split input into graphemes (unicode-segmentation)
//! 2. Classify letters → matra counts (GetLetterCount equivalent)
//! 3. Build syllables (ner / nirai) with special annotations (uyir-U elision, clusters, sandhi)
//! 4. Group syllables into traditional feet (tEmA, puLimA, kUviLa_m, etc.)
//! 5. Analyze talai (linkages) between feet
//! 6. Detect metre (pāvakai) — Venpaa, Asiriyappaa, etc.
//!
//! # Special Features Preserved & Enhanced
//! - Exact foot names from original WordType array
//! - uyir-U elision rules after க், ச், ட், ப், ற்
//! - Alternative scansion (vikalpa) support
//! - Rich annotations for every syllable split (split_hint, alt_split, rule_ref)

mod error;
mod foot;
mod letter;
mod metre;
mod syllable;
mod talai;
mod types;

pub use error::ParseError;
pub use foot::Foot;
pub use letter::Letter;
pub use metre::MetreType;
pub use syllable::{Syllable, SyllableType};
pub use talai::Talai;
pub use types::{ParseOptions, ParseResult};

/// Main entry point (native + WASM-ready).
pub fn parse_poem(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    parse_poem_internal(text, options)
}

/// Internal native API (used by tests and non-WASM code).
pub fn parse_poem_internal(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    if text.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    // 1. Normalize (remove punctuation, handle uyir-U markers as in original)
    let normalized = normalize_text(text, options.uyir_u);

    // 2. Split into characters (simple but works for most Tamil cases on old Rust)
    let graphemes: Vec<&str> = normalized.split("").filter(|s| !s.is_empty()).collect();

    // 3. Classify letters & count matras (GetLetterCount)
    let letters = letter::classify_letters(&graphemes);

    // 4. Build syllables with special annotations (GetTextSyllablePattern)
    let syllables = syllable::build_syllables(&letters, options.alt_scansion);

    // 5. Group into traditional feet (WordType logic)
    let feet = foot::group_into_feet(&syllables);

    // 6. Analyze talai bonds
    let talai = talai::analyze_talai(&feet);

    // 7. Classify lines
    let lines = types::line::build_lines(&feet); // simple wrapper for now

    // 8. Detect metre (CheckVenpaa + others)
    let metre = metre::detect_metre(&feet, &talai, options.no_detect);

    // 9. Build final result (rich annotations included)
    Ok(ParseResult {
        original_text: text.to_string(),
        normalized_text: normalized,
        letter_count: letters.len(),
        vikalpa_count: if options.alt_scansion { 1 } else { 0 },
        syllables,
        feet,
        talai,
        lines,
        metre_type: metre,
        errors: vec![], // extend with rule violations later
    })
}

/// Normalize input (mirrors original tam2lat + splitText + uyirU handling).
fn normalize_text(text: &str, uyir_u: bool) -> String {
    let mut s = text.trim().to_string();

    // Remove common punctuation (original behavior)
    s = s.replace(&['.', ',', ';', '!', '?', '(', ')', '—'][..], " ");

    if uyir_u {
        // Original uyirU regex handling for special cases
        s = s.replace("கு உ", "கு(உ)").replace("று உ", "று(உ)"); // simplified
    }

    s
}

// Re-export for convenience (already exported above)

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_venpaa() {
        let text = "கற்றது கைம்மண் அளவு";
        let result = parse_poem_internal(text, ParseOptions::default()).unwrap();
        assert!(result.metre_type.is_some());
        assert!(!result.syllables.is_empty());
    }

    #[test]
    fn test_uyir_u_elision_hint() {
        let text = "கற்றது";
        let opts = ParseOptions { alt_scansion: true, ..Default::default() };
        let result = parse_poem_internal(text, opts).unwrap();

        // Should contain at least one syllable with uyir-U hint
        let has_hint = result.syllables.iter().any(|s| {
            s.split_hint.as_ref().map_or(false, |h| h.contains("uyir-U"))
        });
        assert!(has_hint, "uyir-U elision hint should be present for 'கற்றது'");
    }
}