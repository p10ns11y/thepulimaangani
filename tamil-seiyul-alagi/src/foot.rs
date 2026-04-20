use serde::{Deserialize, Serialize};

use crate::syllable::Syllable;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String,
}

pub fn group_into_feet(syllables: &[Syllable]) -> Vec<Foot> {
    // Simplified version - improve with full WordType map later
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
