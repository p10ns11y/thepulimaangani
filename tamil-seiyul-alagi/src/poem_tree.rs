//! Hierarchical poem model: Poem → Line → Word (foot) → Syllable → Letter (acai).
//!
//! Trait contracts describe what each layer exposes upward for traversal and batch tooling.

use serde::{Deserialize, Serialize};

use crate::letter::{letters_from_syllable_text, Letter};
use crate::linkage::Linkage;
use crate::syllable::{Syllable, SyllableType};

/// Reference index within the flattened poem-wide syllable array (`PoemNode.syllables_flat`).
pub type SyllableGlobalIndex = usize;

/// Leaf: one grapheme cluster under a syllable (எழுத்து / prosodic surface segment).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LetterNode {
    pub inner: Letter,
}

impl LetterLayer for LetterNode {}

/// Syllable node with nested letters.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyllableNode {
    pub inner: Syllable,
    pub letters: Vec<LetterNode>,
    /// Poem-wide syllable index (matches `ParseResult.syllables` order).
    pub global_index: SyllableGlobalIndex,
}

impl SyllableLayer for SyllableNode {
    fn syllable_text(&self) -> &str {
        self.inner.text.as_str()
    }

    fn syllable_type(&self) -> SyllableType {
        self.inner.syllable_type
    }

    fn letters(&self) -> &[LetterNode] {
        &self.letters
    }

    fn global_syllable_index(&self) -> SyllableGlobalIndex {
        self.global_index
    }
}

/// Syllables belonging to one **linguistic** word (whitespace-separated token).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinguisticWordNode {
    pub word_index_in_line: usize,
    pub syllables: Vec<SyllableNode>,
}

/// Word (foot / seer): syllables grouped by foot rule.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WordNode {
    pub foot_type: String,
    pub syllables: Vec<SyllableNode>,
    /// Index among feet on this physical line (0-based).
    pub word_index_in_line: usize,
    /// Poem-wide foot index (matches `ParseResult.feet` order).
    pub foot_index_global: usize,
}

impl WordLayer for WordNode {
    fn syllables(&self) -> &[SyllableNode] {
        &self.syllables
    }

    fn foot_type(&self) -> &str {
        self.foot_type.as_str()
    }

    fn word_index_in_line(&self) -> usize {
        self.word_index_in_line
    }

    fn foot_index_global(&self) -> usize {
        self.foot_index_global
    }
}

/// One physical line of the normalized poem.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoemLineNode {
    pub line_index: usize,
    pub line_class: String,
    /// Linguistic words on this line (Ner/Nirai per word; does not merge across spaces).
    pub linguistic_words: Vec<LinguisticWordNode>,
    pub words: Vec<WordNode>,
}

impl LineLayer for PoemLineNode {
    fn line_index(&self) -> usize {
        self.line_index
    }

    fn words(&self) -> &[WordNode] {
        &self.words
    }

    fn line_class(&self) -> &str {
        self.line_class.as_str()
    }
}

/// Root aggregate: input text, tree lines, flat syllables (parallel legacy surface), linkages.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PoemNode {
    pub normalized_text: String,
    pub lines: Vec<PoemLineNode>,
    pub syllables_flat: Vec<Syllable>,
    pub linkage: Vec<Linkage>,
}

impl PoemLayer for PoemNode {
    fn lines(&self) -> &[PoemLineNode] {
        &self.lines
    }

    fn syllables_linear(&self) -> &[Syllable] {
        &self.syllables_flat
    }

    fn linkage(&self) -> &[Linkage] {
        &self.linkage
    }

    fn normalized_source(&self) -> &str {
        self.normalized_text.as_str()
    }
}

// --- Trait contracts (what upper layers need from lower layers) ---

pub trait LetterLayer {}

pub trait SyllableLayer {
    fn syllable_text(&self) -> &str;
    fn syllable_type(&self) -> SyllableType;
    fn letters(&self) -> &[LetterNode];
    fn global_syllable_index(&self) -> SyllableGlobalIndex;
}

pub trait WordLayer {
    fn syllables(&self) -> &[SyllableNode];
    fn foot_type(&self) -> &str;
    fn word_index_in_line(&self) -> usize;
    fn foot_index_global(&self) -> usize;
}

pub trait LineLayer {
    fn line_index(&self) -> usize;
    fn words(&self) -> &[WordNode];
    fn line_class(&self) -> &str;
}

pub trait PoemLayer {
    fn lines(&self) -> &[PoemLineNode];
    fn syllables_linear(&self) -> &[Syllable];
    fn linkage(&self) -> &[Linkage];
    fn normalized_source(&self) -> &str;
}

fn linguistic_words_per_line(syllables: &[Syllable]) -> Vec<Vec<LinguisticWordNode>> {
    if syllables.is_empty() {
        return vec![];
    }
    let max_li = syllables.iter().map(|s| s.line_index).max().unwrap_or(0);
    let mut per_line: Vec<std::collections::BTreeMap<usize, Vec<(usize, Syllable)>>> =
        vec![std::collections::BTreeMap::new(); max_li.saturating_add(1)];
    for (gi, s) in syllables.iter().enumerate() {
        let li = s.line_index;
        if li >= per_line.len() {
            per_line.resize(li + 1, std::collections::BTreeMap::new());
        }
        per_line[li]
            .entry(s.word_index_in_line)
            .or_default()
            .push((gi, s.clone()));
    }
    let mut out: Vec<Vec<LinguisticWordNode>> = Vec::with_capacity(per_line.len());
    for line_map in per_line {
        let mut words: Vec<LinguisticWordNode> = Vec::new();
        for (wi, pairs) in line_map {
            let syllables: Vec<SyllableNode> = pairs
                .into_iter()
                .map(|(global_index, syl)| SyllableNode {
                    inner: syl.clone(),
                    letters: letters_from_syllable_text(&syl.text)
                        .into_iter()
                        .map(|inner| LetterNode { inner })
                        .collect(),
                    global_index,
                })
                .collect();
            words.push(LinguisticWordNode {
                word_index_in_line: wi,
                syllables,
            });
        }
        out.push(words);
    }
    out
}

/// Build the hierarchical tree from poem-wide syllables, foot placements, positions, and linkage.
pub fn build_poem_tree(
    normalized_text: String,
    syllables: &[Syllable],
    foot_positions: &[crate::linkage::FootPosition],
    placements: &[crate::foot::FootPlacement],
    linkage: Vec<Linkage>,
) -> PoemNode {
    let syllables_flat: Vec<Syllable> = syllables.to_vec();
    let linguistic_by_line = linguistic_words_per_line(&syllables_flat);

    let mut lines_map: std::collections::BTreeMap<usize, Vec<WordNode>> =
        std::collections::BTreeMap::new();

    for (placement, pos) in placements.iter().zip(foot_positions.iter()) {
        let foot_index_global = pos.foot_index;
        let line_index = pos.line_index;
        let word_index_in_line = pos.word_index_in_line;

        let mut word_syllables: Vec<SyllableNode> = Vec::new();
        for (local_i, syl) in placement.foot.syllables.iter().enumerate() {
            let global_index = placement.syllable_range.start + local_i;
            let letters: Vec<LetterNode> = letters_from_syllable_text(&syl.text)
                .into_iter()
                .map(|inner| LetterNode { inner })
                .collect();
            word_syllables.push(SyllableNode {
                inner: syl.clone(),
                letters,
                global_index,
            });
        }

        let word = WordNode {
            foot_type: placement.foot.foot_type.clone(),
            syllables: word_syllables,
            word_index_in_line,
            foot_index_global,
        };

        lines_map.entry(line_index).or_default().push(word);
    }

    let max_line = lines_map
        .keys()
        .next_back()
        .copied()
        .unwrap_or(0)
        .max(linguistic_by_line.len().saturating_sub(1));
    let mut lines: Vec<PoemLineNode> = Vec::with_capacity(max_line + 1);
    for li in 0..=max_line {
        let words = lines_map.remove(&li).unwrap_or_default();
        let linguistic_words = linguistic_by_line
            .get(li)
            .cloned()
            .unwrap_or_default();
        lines.push(PoemLineNode {
            line_index: li,
            line_class: "—".to_string(),
            linguistic_words,
            words,
        });
    }

    PoemNode {
        normalized_text,
        lines,
        syllables_flat,
        linkage,
    }
}
