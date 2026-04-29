//! Syllable types (minimal for now)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
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
    /// Physical line in normalized poem (0-based); linguistic word boundary used during segmentation.
    #[serde(default)]
    pub line_index: usize,
    /// Index of the linguistic word within `line_index` (whitespace-separated).
    #[serde(default)]
    pub word_index_in_line: usize,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_syllable_with_expected_fields() {
        let s = Syllable {
            text: "கா".to_string(),
            syllable_type: SyllableType::Ner,
            split_hint: Some("hint".to_string()),
            alt_split: true,
            rule_ref: Some("SYL-TEST-01".to_string()),
            line_index: 0,
            word_index_in_line: 0,
        };

        assert_eq!(s.text, "கா");
        assert_eq!(s.syllable_type, SyllableType::Ner);
        assert_eq!(s.split_hint.as_deref(), Some("hint"));
        assert!(s.alt_split);
        assert_eq!(s.rule_ref.as_deref(), Some("SYL-TEST-01"));
    }
}
