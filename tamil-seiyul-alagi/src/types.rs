//! Shared types and options.

use serde::{Deserialize, Serialize};
use super::{Foot, Syllable, MetreType};
use crate::talai::Talai;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParseOptions {
    pub only_prosody: bool,
    pub no_detect: bool,
    pub alt_scansion: bool,
    pub uyir_u: bool, // for special uyirU handling
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub original_text: String,
    pub normalized_text: String,
    pub letter_count: usize,
    pub vikalpa_count: usize,
    pub syllables: Vec<Syllable>,
    pub feet: Vec<Foot>,
    pub talai: Vec<Talai>,
    pub lines: Vec<line::Line>, // placeholder
    pub metre_type: Option<MetreType>,
    pub errors: Vec<String>,
}

// Placeholder for Line (expand later)
pub mod line {
    use serde::{Deserialize, Serialize};
    use super::Foot;

    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct Line {
        pub feet: Vec<Foot>,
        pub line_class: String,
    }

    pub fn build_lines(feet: &[Foot]) -> Vec<Line> {
        vec![Line {
            feet: feet.to_vec(),
            line_class: "kuRaLaTi".to_string(),
        }]
    }
}