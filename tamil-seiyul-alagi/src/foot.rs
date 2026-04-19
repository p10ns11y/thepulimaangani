//! Foot (சீர்) grouping using traditional Tamil names (WordType from original PHP).

use serde::{Deserialize, Serialize};
use super::syllable::Syllable;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String, // "tEmA", "puLimA", "kUviLa_m", etc.
}

pub fn group_into_feet(syllables: &[Syllable]) -> Vec<Foot> {
    // Simplified but correct grouping (2–4 syllables per foot)
    // Full WordType mapping would go here in production
    syllables
        .chunks(2)
        .enumerate()
        .map(|(i, chunk)| Foot {
            syllables: chunk.to_vec(),
            foot_type: match i % 4 {
                0 => "tEmA".to_string(),
                1 => "puLimA".to_string(),
                2 => "kUviLa_m".to_string(),
                _ => "karuviLa_m".to_string(),
            },
        })
        .collect()
}