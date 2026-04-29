//! Foot pattern as readable Ner/Nirai sequences (logic layer — no transliteration codes).

use crate::syllable::{Syllable, SyllableType};

fn token(st: SyllableType) -> &'static str {
    match st {
        SyllableType::Ner => "Ner",
        SyllableType::Nirai => "Nirai",
    }
}

/// Hyphenated pattern for one linguistic word’s syllables, e.g. `Ner-Ner`, `Nirai-Ner-Nirai`.
/// Empty slice yields empty string; callers may treat that as invalid.
pub fn foot_pattern(syllables: &[Syllable]) -> String {
    syllables
        .iter()
        .map(|s| token(s.syllable_type))
        .collect::<Vec<_>>()
        .join("-")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syllable::SyllableType;

    fn dummy(st: SyllableType) -> Syllable {
        Syllable {
            text: "x".into(),
            syllable_type: st,
            split_hint: None,
            alt_split: false,
            rule_ref: None,
            line_index: 0,
            word_index_in_line: 0,
        }
    }

    #[test]
    fn formats_two_acai() {
        assert_eq!(
            foot_pattern(&[dummy(SyllableType::Ner), dummy(SyllableType::Ner)]),
            "Ner-Ner"
        );
        assert_eq!(
            foot_pattern(&[dummy(SyllableType::Nirai), dummy(SyllableType::Nirai)]),
            "Nirai-Nirai"
        );
    }

    #[test]
    fn formats_three_nirai() {
        assert_eq!(
            foot_pattern(&[
                dummy(SyllableType::Nirai),
                dummy(SyllableType::Nirai),
                dummy(SyllableType::Nirai),
            ]),
            "Nirai-Nirai-Nirai"
        );
    }
}
