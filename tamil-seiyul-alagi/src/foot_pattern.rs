//! Foot pattern codes from Ner/Nirai sequences (truth-table bits: Ner=0, Nirai=1, first syllable = MSB).

use crate::syllable::{Syllable, SyllableType};

/// Encode syllables as MSB-first bits (first acai = highest bit).
fn pattern_bits(syllables: &[Syllable]) -> u8 {
    let mut v = 0u8;
    for s in syllables {
        v = (v << 1) | if matches!(s.syllable_type, SyllableType::Nirai) {
            1
        } else {
            0
        };
    }
    v
}

/// Machine-first foot identifier (`tEmA`, `tEmA_GkA_y`, …) from Ner/Nirai syllables in one linguistic word.
pub fn foot_pattern_code(syllables: &[Syllable]) -> Option<&'static str> {
    match syllables.len() {
        0 => None,
        1 => Some(match syllables[0].syllable_type {
            SyllableType::Ner => "mA",
            SyllableType::Nirai => "viLa_m",
        }),
        2 => {
            let idx = pattern_bits(syllables) as usize;
            Some(FOOT_2[idx])
        }
        3 => {
            let idx = pattern_bits(syllables) as usize;
            Some(FOOT_3[idx])
        }
        4 => {
            let idx = pattern_bits(syllables) as usize;
            Some(FOOT_4[idx])
        }
        _ => Some("unknown"),
    }
}

// Index = MSB-first 2-bit value (see rust-parser-prototype/src/chars.rs)
const FOOT_2: [&str; 4] = [
    "tEmA",       // 00 Ner Ner
    "kUviLa_m",   // 01 Ner Nirai
    "puLimA",     // 10 Nirai Ner
    "karuviLa_m", // 11 Nirai Nirai
];

// Index = MSB-first 3-bit value (same order as prototype WordType map)
const FOOT_3: [&str; 8] = [
    "tEmA_GkA_y",
    "tEmA_GkaVi",
    "kUviLa_GkA_y",
    "kUviLa_GkaVi",
    "puLimA_GkA_y",
    "puLimA_GkaVi",
    "karuviLa_GkA_y",
    "karuviLa_GkaVi",
];

// Index = MSB-first 4-bit value (matches rust-parser-prototype/src/chars.rs get_word_type)
const FOOT_4: [&str; 16] = [
    "tEmA_nta_NpU",
    "tEmA_nta_NNiZa_l",
    "tEmAnaRu_mpU",
    "tEmAnaRuniZa_l",
    "kUviLa_nta_NpU",
    "kUviLa_nta_NNiZa_l",
    "kUviLanaRu_mpU",
    "kUviLanaRuniZa_l",
    "puLimA_nta_NpU",
    "puLimA_nta_NNiZa_l",
    "puLimAnaRu_mpU",
    "puLimAnaRuniZa_l",
    "karuviLa_nta_NpU",
    "karuviLa_nta_NNiZa_l",
    "karuviLanaRu_mpU",
    "karuviLanaRuniZa_l",
];

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syllable::SyllableType;

    fn ner() -> SyllableType {
        SyllableType::Ner
    }
    fn nir() -> SyllableType {
        SyllableType::Nirai
    }

    fn two(a: SyllableType, b: SyllableType) -> Vec<Syllable> {
        vec![dummy(a), dummy(b)]
    }
    fn three(a: SyllableType, b: SyllableType, c: SyllableType) -> Vec<Syllable> {
        vec![dummy(a), dummy(b), dummy(c)]
    }
    fn four(a: SyllableType, b: SyllableType, c: SyllableType, d: SyllableType) -> Vec<Syllable> {
        vec![dummy(a), dummy(b), dummy(c), dummy(d)]
    }

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
    fn two_asai_matches_chars_rs() {
        assert_eq!(foot_pattern_code(&two(ner(), ner())), Some("tEmA"));
        assert_eq!(foot_pattern_code(&two(ner(), nir())), Some("kUviLa_m"));
        assert_eq!(foot_pattern_code(&two(nir(), ner())), Some("puLimA"));
        assert_eq!(foot_pattern_code(&two(nir(), nir())), Some("karuviLa_m"));
    }

    #[test]
    fn three_asai_matches_chars_rs() {
        assert_eq!(
            foot_pattern_code(&three(ner(), ner(), ner())),
            Some("tEmA_GkA_y")
        );
        assert_eq!(
            foot_pattern_code(&three(nir(), ner(), ner())),
            Some("puLimA_GkA_y")
        );
        assert_eq!(
            foot_pattern_code(&three(nir(), nir(), nir())),
            Some("karuviLa_GkaVi")
        );
    }

    #[test]
    fn four_asai_sample() {
        assert_eq!(
            foot_pattern_code(&four(ner(), ner(), ner(), ner())),
            Some("tEmA_nta_NpU")
        );
    }
}
