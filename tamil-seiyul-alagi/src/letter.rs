//! Letter classification and conversion to ProsodicUnit using the official Tamil character matrix.

use serde::{Deserialize, Serialize};

use crate::prosodic_unit::{ProsodicUnit, Vowel, Consonant};
use crate::tamil_chars::{generate_uyirmei_matrix, VOWELS, PURE_CONSONANTS};

/// Convert graphemes to ProsodicUnit using the official matrix
pub fn to_prosodic_units(graphemes: &[&str]) -> Vec<ProsodicUnit> {
    let uyirmei_matrix = generate_uyirmei_matrix();
    
    graphemes
        .iter()
        .filter_map(|&g| {
            // Pure Vowels (12)
            if VOWELS.contains(&g) {
                let idx = VOWELS.iter().position(|&v| v == g).unwrap();
                let is_long = matches!(idx, 1 | 3 | 5 | 7 | 8 | 10 | 11);
                return Some(ProsodicUnit::Vowel(Vowel::from_index(idx)));
            }
            
            // Pure Consonants (18)
            if PURE_CONSONANTS.contains(&g) {
                let idx = PURE_CONSONANTS.iter().position(|&c| c == g).unwrap();
                return Some(ProsodicUnit::Consonant(Consonant::from_index(idx)));
            }
            
            // Uyirmei (216)
            for (v_idx, row) in uyirmei_matrix.iter().enumerate() {
                if let Some(c_idx) = row.iter().position(|c| c == g) {
                    return Some(ProsodicUnit::VowelConsonant {
                        vowel: Vowel::from_index(v_idx),
                        consonant: Consonant::from_index(c_idx),
                    });
                }
            }
            
            // Aaytham
            if g == "ஃ" {
                return Some(ProsodicUnit::Aaytham);
            }
            
            None
        })
        .collect()
}

// Helper implementations
impl Vowel {
    pub fn from_index(idx: usize) -> Self {
        match idx {
            0 => Vowel::A, 1 => Vowel::Aa, 2 => Vowel::I, 3 => Vowel::Ii,
            4 => Vowel::U, 5 => Vowel::Uu, 6 => Vowel::E, 7 => Vowel::Ee,
            8 => Vowel::Ai, 9 => Vowel::O, 10 => Vowel::Oo, 11 => Vowel::Au,
            _ => Vowel::A,
        }
    }
}

impl Consonant {
    pub fn from_index(idx: usize) -> Self {
        match idx {
            0 => Consonant::K, 1 => Consonant::Ng, 2 => Consonant::Ch, 3 => Consonant::Nj,
            4 => Consonant::Tt, 5 => Consonant::Nn, 6 => Consonant::Th, 7 => Consonant::N,
            8 => Consonant::P, 9 => Consonant::M, 10 => Consonant::Y, 11 => Consonant::R,
            12 => Consonant::L, 13 => Consonant::V, 14 => Consonant::Zh, 15 => Consonant::Lll,
            16 => Consonant::Rr, 17 => Consonant::Nnn,
            _ => Consonant::K,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Letter {
    pub text: String,
    pub letter_type: LetterType,
    pub matra: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LetterType {
    Uyir,
    Mei,
    Uyirmei,
    Aaytham,
}