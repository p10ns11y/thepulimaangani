//! Linguistic word boundaries from normalized text (whitespace-separated tokens per line).

use crate::letter;
use crate::syllable::Syllable;
use crate::syllable_builder::SyllableBuilder;
use unicode_segmentation::UnicodeSegmentation;

/// Syllables in poem order: each **linguistic word** (whitespace-separated run) is segmented separately
/// so Ner/Nirai boundaries never cross words (spaces are dropped in `to_prosodic_units`).
pub fn segment_syllables_from_normalized(normalized: &str, alt_scansion: bool) -> Vec<Syllable> {
    let by_line = linguistic_words_graphemes_by_line(normalized);
    let mut out = Vec::new();
    for (line_index, line_words) in by_line.iter().enumerate() {
        for (word_index_in_line, word_graphemes) in line_words.iter().enumerate() {
            let grapheme_refs: Vec<&str> = word_graphemes.iter().copied().collect();
            let units = letter::to_prosodic_units(&grapheme_refs);
            let mut seg = SyllableBuilder::new(alt_scansion).build_word_segment(
                &units,
                line_index,
                word_index_in_line,
            );
            out.append(&mut seg);
        }
    }
    out
}

/// For each physical line, a list of words; each word is the slice of grapheme clusters (non-whitespace runs).
pub fn linguistic_words_graphemes_by_line<'a>(normalized: &'a str) -> Vec<Vec<Vec<&'a str>>> {
    normalized
        .lines()
        .map(|line| {
            let graphemes: Vec<&str> = line.graphemes(true).collect();
            let mut words: Vec<Vec<&str>> = Vec::new();
            let mut i = 0usize;
            while i < graphemes.len() {
                while i < graphemes.len() && is_word_sep_grapheme(graphemes[i]) {
                    i += 1;
                }
                if i >= graphemes.len() {
                    break;
                }
                let start = i;
                while i < graphemes.len() && !is_word_sep_grapheme(graphemes[i]) {
                    i += 1;
                }
                words.push(graphemes[start..i].to_vec());
            }
            words
        })
        .collect()
}

fn is_word_sep_grapheme(g: &str) -> bool {
    g.chars().all(|c| c.is_whitespace())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn two_linguistic_words_split_on_space() {
        let normalized = "அஃ கு ";
        let by_line = linguistic_words_graphemes_by_line(normalized);
        assert_eq!(by_line.len(), 1);
        assert_eq!(by_line[0].len(), 2);
        assert_eq!(
            by_line[0][0].iter().copied().collect::<String>(),
            "அஃ"
        );
        assert_eq!(
            by_line[0][1].iter().copied().collect::<String>(),
            "கு"
        );
    }

    #[test]
    fn segment_does_not_merge_across_space_two_words_two_syllables() {
        let normalized = "அஃ கு ";
        let syl = segment_syllables_from_normalized(normalized, false);
        assert_eq!(syl.len(), 2, "must not merge அஃ and கு into one Nirai across space");
        assert_eq!(syl[0].word_index_in_line, 0);
        assert_eq!(syl[1].word_index_in_line, 1);
        assert_eq!(syl[0].line_index, 0);
        assert_eq!(syl[1].line_index, 0);
    }
}
