use serde::{Deserialize, Serialize};

use crate::foot_pattern::foot_pattern;
use crate::poem_tree::{LinguisticWordNode, PoemNode};
use crate::{Foot, Linkage, MetreType, Syllable, Talai};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParseOptions {
    pub only_prosody: bool,
    pub no_detect: bool,
    pub alt_scansion: bool,
    pub uyir_u: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub original_text: String,
    pub normalized_text: String,
    pub letter_count: usize,
    pub vikalpa_count: usize,
    /// Root hierarchical container: Poem → Line → Word → Syllable → Letter.
    pub poem: PoemNode,
    pub syllables: Vec<Syllable>,
    pub feet: Vec<Foot>,
    pub linkage: Vec<Linkage>,
    #[serde(default)]
    pub talai: Vec<Talai>,
    /// Flattened lines for adapters expecting `feet` per line (mirrors `poem.lines`).
    pub lines: Vec<Line>,
    pub metre_type: Option<MetreType>,
    #[serde(default)]
    pub top_k_metre_hypotheses: Vec<MetreHypothesis>,
    #[serde(default)]
    pub confidence: i32,
    #[serde(default)]
    pub provenance: Vec<RuleId>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Line {
    pub feet: Vec<Foot>,
    pub line_class: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuleId {
    MetreLength01,
    LinkageAdjacency01,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetreHypothesis {
    pub metre_type: MetreType,
    pub aggregate_score: i32,
    pub violations: Vec<RuleId>,
    pub rule_ids: Vec<RuleId>,
}

/// Feet for legacy `ParseResult.lines` when `PoemLineNode.words` is empty but
/// `linguistic_words` holds the same syllables (some lines only populate the linguistic layer).
fn feet_from_linguistic_words(lws: &[LinguisticWordNode]) -> Vec<Foot> {
    let mut out = Vec::new();
    for lw in lws {
        let syllables: Vec<Syllable> = lw.syllables.iter().map(|s| s.inner.clone()).collect();
        if syllables.is_empty() {
            continue;
        }
        let foot_type = foot_pattern(&syllables);
        out.push(Foot {
            syllables,
            foot_type,
        });
    }
    out
}

/// Legacy `Line` rows (`feet` per physical line) derived from the hierarchical `PoemNode`.
///
/// Prefer **`linguistic_words`** when present: one foot per whitespace-separated word on that
/// physical line (matches editor rows). `PoemLineNode.words` can still mis-place feet on line 0
/// when linkage placement disagrees with line breaks; using words alone collapsed the whole poem
/// into the first legacy row.
pub fn flat_lines_from_poem(poem: &PoemNode) -> Vec<Line> {
    poem.lines
        .iter()
        .map(|ln| {
            let feet = if !ln.linguistic_words.is_empty() {
                feet_from_linguistic_words(&ln.linguistic_words)
            } else if !ln.words.is_empty() {
                ln.words
                    .iter()
                    .map(|w| Foot {
                        syllables: w.syllables.iter().map(|s| s.inner.clone()).collect(),
                        foot_type: w.foot_type.clone(),
                    })
                    .collect()
            } else {
                Vec::new()
            };
            Line {
                line_class: ln.line_class.clone(),
                feet,
            }
        })
        .collect()
}
