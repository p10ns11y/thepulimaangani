//! Syllable types (minimal for now)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SyllableType {
    Ner,
    Nirai,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Syllable {
    pub text: String,
    pub syllable_type: SyllableType,
    pub split_hint: Option<String>,
    pub alt_split: bool,
    pub rule_ref: Option<String>,
}