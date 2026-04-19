use serde::{Deserialize, Serialize};

// ==================== CORE TYPES (mirrors PHP ProsodyParseTree) ====================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum SyllableType {
    Ner,   // நேர்
    Nirai, // நிரை
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Syllable {
    pub text: String,
    pub syllable_type: SyllableType,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String, // e.g. "tEmA", "puLimA", "mA", etc. (from original WordType)
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Line {
    pub feet: Vec<Foot>,
    pub line_class: String, // kuRaLaTi, ci_ntaTi, etc.
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LetterCount {
    pub vowel: usize,
    pub consonant: usize,
    pub consonant_vowel: usize,
    pub aytham: usize,
    pub short: usize,
    pub long: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ParseResult {
    pub original_text: String,
    pub lines: Vec<Line>,
    pub metre_type: String,
    pub letter_count: LetterCount,
    pub vikalpa_count: usize,
    pub word_bond: String, // talai linkages (will expand later)
    pub errors: Vec<String>,
}
