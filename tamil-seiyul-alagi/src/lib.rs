mod error;
mod foot;
mod letter;
mod metre;
mod prosodic_unit;
mod syllable;
mod syllable_builder;
mod talai;
mod types;
mod presentation;
mod tamil_chars;

pub use error::ParseError;
pub use foot::Foot;
pub use letter::Letter;
pub use metre::MetreType;
pub use prosodic_unit::{ProsodicUnit, Vowel, Consonant};
pub use syllable::{Syllable, SyllableType};
pub use syllable_builder::SyllableBuilder;
pub use talai::Talai;
pub use types::{ParseOptions, ParseResult};

use unicode_segmentation::UnicodeSegmentation;

pub fn parse_poem(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    if text.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let normalized = normalize_text(text, options.uyir_u);
    let graphemes: Vec<&str> = normalized.graphemes(true).collect();
    let normalized_clone = normalized.clone(); // Fix borrow

    let units = letter::to_prosodic_units(&graphemes);
    let syllables = SyllableBuilder::new(options.alt_scansion).build(&units);
    let feet = foot::group_into_feet(&syllables);
    let talai = talai::analyze_talai(&feet);
    let metre = metre::detect_metre(&feet, &talai, options.no_detect);

    Ok(ParseResult {
        original_text: text.to_string(),
        normalized_text: normalized_clone,
        letter_count: graphemes.len(),
        vikalpa_count: if options.alt_scansion { 1 } else { 0 },
        syllables,
        feet,
        talai,
        lines: vec![],
        metre_type: metre,
        errors: vec![],
    })
}

fn normalize_text(text: &str, uyir_u: bool) -> String {
    let mut s = text.trim().to_string();
    s = s.replace(&['.', ',', ';', '!', '?', '(', ')', '—'][..], " ");
    if uyir_u {
        s = s.replace("கு உ", "கு(உ)").replace("று உ", "று(உ)");
    }
    s
}