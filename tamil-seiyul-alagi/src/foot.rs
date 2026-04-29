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

fn foot_type_placeholder(foot_index: usize) -> String {
    match foot_index % 4 {
        0 => "tEmA".to_string(),
        1 => "puLimA".to_string(),
        2 => "kUviLa_m".to_string(),
        _ => "karuviLa_m".to_string(),
    }
}

/// One **foot** per **linguistic word** (same `line_index` + `word_index_in_line` on syllables).
/// Syllables must appear in poem order from [`crate::word_scope::segment_syllables_from_normalized`].
pub fn group_into_feet_with_ranges(syllables: &[Syllable]) -> Vec<FootPlacement> {
    if syllables.is_empty() {
        return vec![];
    }

    let mut placements = Vec::new();
    let mut run_start = 0usize;
    let mut current_key = word_key(&syllables[0]);

    for i in 1..=syllables.len() {
        let flush = i == syllables.len()
            || word_key(&syllables[i]) != current_key;

        if flush {
            let chunk = &syllables[run_start..i];
            let foot_index = placements.len();
            placements.push(FootPlacement {
                foot: Foot {
                    syllables: chunk.to_vec(),
                    foot_type: foot_type_placeholder(foot_index),
                },
                syllable_range: run_start..i,
            });
            if i < syllables.len() {
                current_key = word_key(&syllables[i]);
                run_start = i;
            }
        }
    }

    placements
}

fn word_key(s: &Syllable) -> (usize, usize) {
    (s.line_index, s.word_index_in_line)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syllable::{Syllable, SyllableType};

    fn s(
        text: &str,
        st: SyllableType,
        line_index: usize,
        word_index_in_line: usize,
    ) -> Syllable {
        Syllable {
            text: text.into(),
            syllable_type: st,
            split_hint: None,
            alt_split: false,
            rule_ref: None,
            line_index,
            word_index_in_line,
        }
    }

    #[test]
    fn one_foot_per_linguistic_word_not_chunks_of_three() {
        let syllables = vec![
            s("a", SyllableType::Ner, 0, 0),
            s("b", SyllableType::Ner, 0, 0),
            s("c", SyllableType::Ner, 0, 1),
        ];
        let p = group_into_feet_with_ranges(&syllables);
        assert_eq!(p.len(), 2);
        assert_eq!(p[0].syllable_range, 0..2);
        assert_eq!(p[1].syllable_range, 2..3);
    }
}
