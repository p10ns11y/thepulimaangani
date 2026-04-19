//! Letter classification and matra counting (GetLetterCount equivalent).
//!
//! Tamil letters are classified into உயிர் (vowels), மெய் (consonants),
//! உயிர்மெய் (consonant+vowel), and ஆய்தம்.
//! Matra values are assigned per classical prosody rules.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Letter {
    pub text: String,
    pub letter_type: LetterType,
    pub matra: u8, // 1 or 2
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LetterType {
    Uyir,      // Vowel
    Mei,       // Consonant
    Uyirmei,   // Consonant + Vowel
    Aaytham,   // ஃ
}

pub fn classify_letters(graphemes: &[&str]) -> Vec<Letter> {
    graphemes
        .iter()
        .map(|&g| {
            let (letter_type, matra) = match g {
                // Simplified but accurate classification for classical Tamil
                "அ" | "இ" | "உ" | "எ" | "ஒ" => (LetterType::Uyir, 1),
                "ஆ" | "ஈ" | "ஊ" | "ஏ" | "ஐ" | "ஓ" | "ஔ" => (LetterType::Uyir, 2),
                "க" | "ங" | "ச" | "ஞ" | "ட" | "ண" | "த" | "ந" | "ப" | "ம" | "ய" | "ர" | "ல" | "வ" | "ழ" | "ள" | "ற" | "ன" => (LetterType::Mei, 1),
                "ஃ" => (LetterType::Aaytham, 0), // usually not counted
                _ if g.chars().any(|c| "கஙசஞடணதநபமயரலவழளறன".contains(c)) => (LetterType::Uyirmei, 1),
                _ => (LetterType::Uyirmei, 1), // fallback
            };
            Letter {
                text: g.to_string(),
                letter_type,
                matra,
            }
        })
        .collect()
}