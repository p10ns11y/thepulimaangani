//! A09 — frequent Ner/Nirai sequence motifs.

use std::collections::BTreeMap;

use crate::syllable::{Syllable, SyllableType};

/// Encode syllable stream as N/R string.
pub fn acai_string(syllables: &[Syllable]) -> String {
    syllables
        .iter()
        .map(|s| match s.syllable_type {
            SyllableType::Ner => 'N',
            SyllableType::Nirai => 'R',
        })
        .collect()
}

/// Count contiguous motifs of length `k`.
pub fn count_motifs(streams: &[String], k: usize) -> BTreeMap<String, u32> {
    let k = k.max(1);
    let mut m = BTreeMap::new();
    for s in streams {
        let chars: Vec<char> = s.chars().collect();
        if chars.len() < k {
            continue;
        }
        for i in 0..=chars.len() - k {
            let mot: String = chars[i..i + k].iter().collect();
            *m.entry(mot).or_insert(0) += 1;
        }
    }
    m
}

/// Top motifs by frequency.
pub fn top_motifs(streams: &[String], k: usize, top: usize) -> Vec<(String, u32)> {
    let mut v: Vec<_> = count_motifs(streams, k).into_iter().collect();
    v.sort_by(|a, b| b.1.cmp(&a.1).then_with(|| a.0.cmp(&b.0)));
    v.into_iter().take(top).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finds_nn_motif() {
        let streams = vec!["NNR".into(), "NNN".into()];
        let top = top_motifs(&streams, 2, 5);
        assert!(top.iter().any(|(m, _)| m == "NN"));
    }
}
