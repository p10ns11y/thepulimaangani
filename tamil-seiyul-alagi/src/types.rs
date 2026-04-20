use serde::{Deserialize, Serialize};
use crate::{Foot, Syllable, Talai, MetreType};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParseOptions {
    pub only_prosody: bool,
    pub no_detect: bool,
    pub alt_scansion: bool,
    pub uyir_u: bool,
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
    pub lines: Vec<Line>,
    pub metre_type: Option<MetreType>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Line {
    pub feet: Vec<Foot>,
    pub line_class: String,
}
