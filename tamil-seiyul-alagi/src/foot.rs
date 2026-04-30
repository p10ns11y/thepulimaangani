use std::ops::Range;

use serde::{Deserialize, Serialize};

use crate::foot_pattern::foot_pattern;
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

/// Feet without syllable index ranges (same grouping as [`group_into_feet_with_ranges`]).
#[allow(dead_code)] // Public helper for tooling / future batch APIs; pipeline uses `with_ranges`.
pub fn group_into_feet(syllables: &[Syllable]) -> Vec<Foot> {
    group_into_feet_with_ranges(syllables)
        .into_iter()
        .map(|p| p.foot)
        .collect()
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
            placements.push(FootPlacement {
                foot: Foot {
                    syllables: chunk.to_vec(),
                    foot_type: foot_pattern(chunk),
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
    fn ner_ner_word_is_tema() {
        let syllables = vec![
            s("a", SyllableType::Ner, 0, 0),
            s("b", SyllableType::Ner, 0, 0),
        ];
        let p = group_into_feet_with_ranges(&syllables);
        assert_eq!(p.len(), 1);
        assert_eq!(p[0].foot.foot_type, "Ner-Ner");
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
