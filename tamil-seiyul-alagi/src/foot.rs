use std::ops::Range;

use serde::{Deserialize, Serialize};

use crate::syllable::Syllable;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String,
}

/// A foot together with the syllable index range it covers in the poem-wide syllable list.
#[derive(Debug, Clone)]
pub struct FootPlacement {
    pub foot: Foot,
    pub syllable_range: Range<usize>,
}

pub fn group_into_feet(syllables: &[Syllable]) -> Vec<Foot> {
    group_into_feet_with_ranges(syllables)
        .into_iter()
        .map(|p| p.foot)
        .collect()
}

pub fn group_into_feet_with_ranges(syllables: &[Syllable]) -> Vec<FootPlacement> {
    syllables
        .chunks(3)
        .enumerate()
        .map(|(i, chunk)| {
            let start = i * 3;
            let end = start + chunk.len();
            FootPlacement {
                foot: Foot {
                    syllables: chunk.to_vec(),
                    foot_type: match i % 4 {
                        0 => "tEmA".to_string(),
                        1 => "puLimA".to_string(),
                        2 => "kUviLa_m".to_string(),
                        _ => "karuviLa_m".to_string(),
                    },
                },
                syllable_range: start..end,
            }
        })
        .collect()
}
