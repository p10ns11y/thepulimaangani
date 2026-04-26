mod error;
mod foot;
mod letter;
mod linkage;
mod metre;
mod presentation;
mod prosodic_sequence;
mod prosodic_unit;
mod syllable;
mod syllable_builder;
mod tamil_chars;
mod types;

pub use prosodic_sequence::ProsodicSequence;

use wasm_bindgen::prelude::*;

pub use error::ParseError;
pub use foot::Foot;
pub use letter::Letter;
pub use linkage::{Linkage, LinkageType, Talai, TalaiType};
pub use metre::MetreType;
pub use prosodic_unit::{Consonant, ProsodicUnit, Vowel};
pub use syllable::{Syllable, SyllableType};
pub use syllable_builder::SyllableBuilder;
pub use types::{MetreHypothesis, ParseOptions, ParseResult, RuleId};

use unicode_segmentation::UnicodeSegmentation;

pub fn parse_poem(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    if text.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let normalized = normalize_text(text, options.uyir_u);

    //  read: https://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
    let graphemes: Vec<&str> = normalized.graphemes(true).collect();
    let normalized_clone = normalized.clone();

    let units = letter::to_prosodic_units(&graphemes);
    let syllables = SyllableBuilder::new(options.alt_scansion).build(&units);
    let feet = foot::group_into_feet(&syllables);
    let linkage = linkage::analyze_linkage(&feet);
    let metre_hypotheses = metre::detect_metre_hypotheses(&feet, &linkage, options.no_detect);
    let metre = metre_hypotheses.first().map(|h| h.metre_type.clone());

    Ok(ParseResult {
        original_text: text.to_string(),
        normalized_text: normalized_clone,
        letter_count: graphemes.len(),
        vikalpa_count: if options.alt_scansion { 1 } else { 0 },
        syllables,
        feet,
        talai: linkage.clone(),
        linkage,
        lines: vec![],
        metre_type: metre,
        confidence: metre_hypotheses.first().map_or(0, |h| h.aggregate_score),
        provenance: metre_hypotheses
            .first()
            .map_or_else(Vec::new, |h| h.rule_ids.clone()),
        top_k_metre_hypotheses: metre_hypotheses,
        errors: vec![],
    })
}

#[wasm_bindgen]
pub fn parse_poem_wasm(text: &str) -> String {
    let mut options = ParseOptions::default();
    options.uyir_u = true;
    match parse_poem(text, options) {
        Ok(result) => {
            serde_json::to_string(&result).unwrap_or_else(|_| "Serialization error".to_string())
        }
        Err(e) => format!("Error: {}", e),
    }
}

fn normalize_text(text: &str, uyir_u: bool) -> String {
    let mut s = text.trim().to_string();
    s = s.replace(&['.', ',', ';', '!', '?', '(', ')', '—'][..], " ");
    if uyir_u {
        s = s.replace("கு உ", "கு(உ)").replace("று உ", "று(உ)");
    }
    s
}
