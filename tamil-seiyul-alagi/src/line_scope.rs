//! Map syllables to physical line indices using normalized poem text (whitespace stripped).

use crate::syllable::Syllable;

/// One byte range `[start, end)` in the compact (whitespace-free) character stream per logical line.
#[derive(Debug, Clone)]
struct LineByteSpan {
    line_index: usize,
    start: usize,
    end: usize,
}

/// Build compact text (no whitespace) and per-line byte spans within it.
fn compact_text_and_line_spans(normalized_text: &str) -> (String, Vec<LineByteSpan>) {
    let compact_full: String = normalized_text.chars().filter(|c| !c.is_whitespace()).collect();
    let mut spans = Vec::new();
    let mut offset = 0usize;
    for (line_index, line) in normalized_text.lines().enumerate() {
        let compact_line: String = line.chars().filter(|c| !c.is_whitespace()).collect();
        let len = compact_line.len();
        spans.push(LineByteSpan {
            line_index,
            start: offset,
            end: offset + len,
        });
        offset += len;
    }
    debug_assert_eq!(offset, compact_full.len());
    (compact_full, spans)
}

fn line_index_for_compact_byte(pos: usize, spans: &[LineByteSpan]) -> usize {
    for span in spans {
        if pos >= span.start && pos < span.end {
            return span.line_index;
        }
    }
    // Fallback: last line if we landed exactly at end (should not happen for valid pos)
    spans.last().map(|s| s.line_index).unwrap_or(0)
}

/// Returns `syllable_line_indices[i]` = physical line index (0-based) for `syllables[i]`.
/// `normalized_text` must be the same string used to derive `syllables` (after normalization).
pub fn syllable_line_indices(normalized_text: &str, syllables: &[Syllable]) -> Option<Vec<usize>> {
    let (compact_full, spans) = compact_text_and_line_spans(normalized_text);
    if syllables.is_empty() {
        return Some(vec![]);
    }
    let mut out = Vec::with_capacity(syllables.len());
    let mut pos = 0usize;
    for syllable in syllables {
        let t = syllable.text.as_str();
        if pos + t.len() > compact_full.len() {
            return None;
        }
        if compact_full.get(pos..pos + t.len()) != Some(t) {
            return None;
        }
        out.push(line_index_for_compact_byte(pos, &spans));
        pos += t.len();
    }
    if pos != compact_full.len() {
        return None;
    }
    Some(out)
}

/// Line index for a foot from its syllables: uses the **first** syllable's line (poetry feet should
/// not span lines; if they did, this anchors to the foot's starting line).
pub fn foot_line_index(syllable_lines: &[usize], foot_syllable_range: std::ops::Range<usize>) -> usize {
    syllable_lines
        .get(foot_syllable_range.start)
        .copied()
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syllable::{Syllable, SyllableType};

    #[test]
    fn syllable_lines_match_multiline_compact_stream() {
        let normalized = "கற்றது  மொழிந்தது \nஅறிந்தவர் சொல்லும் வழி ";
        let syllables = vec![
            Syllable {
                text: "கற்".into(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: 0,
            },
            Syllable {
                text: "றது".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: 0,
            },
            Syllable {
                text: "மொழிந்".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: 1,
            },
            Syllable {
                text: "தது".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: 1,
            },
            Syllable {
                text: "அறிந்".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 1,
                word_index_in_line: 0,
            },
            Syllable {
                text: "தவர்".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 1,
                word_index_in_line: 0,
            },
            Syllable {
                text: "சொல்".into(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 1,
                word_index_in_line: 1,
            },
            Syllable {
                text: "லும்".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 1,
                word_index_in_line: 1,
            },
            Syllable {
                text: "வழி".into(),
                syllable_type: SyllableType::Nirai,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 1,
                word_index_in_line: 2,
            },
        ];
        let lines = syllable_line_indices(normalized, &syllables).expect("mapping");
        assert_eq!(lines, vec![0, 0, 0, 0, 1, 1, 1, 1, 1]);
    }
}
