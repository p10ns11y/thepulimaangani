use serde::{Deserialize, Serialize};

use crate::foot_pattern::foot_pattern;
use crate::poem_tree::{LinguisticWordNode, PoemNode};
use crate::presentation::DisplayResult;
use crate::{Foot, Linkage, MetreType, Syllable, Talai};

/// Serializable 51-float prosody vector (same layout as [`crate::parse_features`](crate::parse_features)).
/// Present on [`ParseResult`] for WASM/JSON consumers and training export.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
pub struct ParseFeatureSnapshot {
    pub schema_version: u32,
    pub dense: Vec<f32>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub struct ParseOptions {
    pub only_prosody: bool,
    pub no_detect: bool,
    pub alt_scansion: bool,
    pub uyir_u: bool,
    /// When true, skip hybrid logit re-ranking (heuristic + dense boost only). Default false.
    #[serde(default)]
    pub skip_ml_metre: bool,
}

impl ParseOptions {
    /// Matches [`crate::poem_variations_training::build_training_rows`] (`uyir_u` elision hints on).
    pub fn poem_variations_training() -> Self {
        Self {
            only_prosody: false,
            no_detect: false,
            alt_scansion: false,
            uyir_u: true,
            skip_ml_metre: true,
        }
    }
}

/// Top-level `ParseResult` JSON shape version (WASM and serde consumers). Increment when the
/// wire contract or cross-field invariants change. Missing field on deserialize means legacy (`0`).
pub const PARSE_RESULT_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    #[serde(default)]
    pub parse_result_schema_version: u32,
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
    /// Dense parse features (`schema_version` + 51 floats); omitted from JSON when metre detection is off.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parse_features: Option<ParseFeatureSnapshot>,
    #[serde(default)]
    pub confidence: i32,
    /// Shannon entropy (bits) of the hybrid coarse-metre distribution; lower is more decisive.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metre_entropy_bits: Option<f32>,
    /// Top softmax minus second (hybrid head); larger means clearer top class on held-out geometry.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metre_epistemic_margin: Option<f32>,
    #[serde(default)]
    pub provenance: Vec<RuleId>,
    pub errors: Vec<String>,
    /// Human-facing labels (Tamil metre name, foot mnemonics, தளை strings). Same for all WASM clients.
    #[serde(default)]
    pub presentation: DisplayResult,
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
    /// Calibrated softmax probability for this coarse class (hybrid ML head), when present.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metre_probability: Option<f32>,
    /// 1-based rank after hybrid reorder (1 = most probable).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metre_rank: Option<u8>,
}

fn feet_from_linguistic_words(lws: &[LinguisticWordNode], next_global: &mut usize) -> Vec<Foot> {
    let mut out = Vec::new();
    for lw in lws {
        let syllables: Vec<Syllable> = lw.syllables.iter().map(|s| s.inner.clone()).collect();
        if syllables.is_empty() {
            continue;
        }
        let foot_type = foot_pattern(&syllables);
        let g = *next_global;
        *next_global += 1;
        out.push(Foot {
            syllables,
            foot_type,
            foot_index_global: Some(g),
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
///
/// Each [`Foot`] includes **`foot_index_global`** aligned with [`ParseResult::feet`] / linkage indices.
pub fn flat_lines_from_poem(poem: &PoemNode) -> Vec<Line> {
    let mut next_global = 0usize;
    poem.lines
        .iter()
        .map(|ln| {
            let feet = if !ln.linguistic_words.is_empty() {
                feet_from_linguistic_words(&ln.linguistic_words, &mut next_global)
            } else if !ln.words.is_empty() {
                ln.words
                    .iter()
                    .map(|w| Foot {
                        syllables: w.syllables.iter().map(|s| s.inner.clone()).collect(),
                        foot_type: w.foot_type.clone(),
                        foot_index_global: Some(w.foot_index_global),
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

#[cfg(test)]
mod flat_lines_from_poem_tests {
    use super::*;
    use crate::poem_tree::{LinguisticWordNode, PoemLineNode, PoemNode, SyllableNode, WordNode};
    use crate::syllable::{Syllable, SyllableType};

    fn ner(text: &str, line_index: usize, word_index_in_line: usize) -> Syllable {
        Syllable {
            text: text.into(),
            syllable_type: SyllableType::Ner,
            split_hint: None,
            alt_split: false,
            rule_ref: None,
            line_index,
            word_index_in_line,
        }
    }

    fn syllable_node(inner: Syllable, global_index: usize) -> SyllableNode {
        SyllableNode {
            inner,
            letters: vec![],
            global_index,
        }
    }

    fn poem_line(
        line_index: usize,
        linguistic_words: Vec<LinguisticWordNode>,
        words: Vec<WordNode>,
    ) -> PoemLineNode {
        PoemLineNode {
            line_index,
            line_class: "—".into(),
            linguistic_words,
            words,
        }
    }

    #[test]
    fn prefers_linguistic_words_and_ignores_misplaced_words() {
        let s_a = ner("a", 0, 0);
        let s_b = ner("b", 1, 0);
        let poem = PoemNode {
            normalized_text: "a\nb".into(),
            syllables_flat: vec![s_a.clone(), s_b.clone()],
            linkage: vec![],
            lines: vec![
                poem_line(
                    0,
                    vec![LinguisticWordNode {
                        word_index_in_line: 0,
                        syllables: vec![syllable_node(s_a, 0)],
                    }],
                    vec![WordNode {
                        foot_type: "WRONG".into(),
                        syllables: vec![],
                        word_index_in_line: 0,
                        foot_index_global: 99,
                    }],
                ),
                poem_line(
                    1,
                    vec![LinguisticWordNode {
                        word_index_in_line: 0,
                        syllables: vec![syllable_node(s_b, 1)],
                    }],
                    vec![],
                ),
            ],
        };

        let lines = flat_lines_from_poem(&poem);
        assert_eq!(lines.len(), 2);
        assert_eq!(lines[0].feet.len(), 1);
        assert_eq!(lines[0].feet[0].foot_index_global, Some(0));
        assert_eq!(lines[0].feet[0].foot_type, "Ner");
        assert_eq!(lines[0].feet[0].syllables[0].text, "a");
        assert_eq!(lines[1].feet[0].foot_index_global, Some(1));
    }

    #[test]
    fn uses_words_when_linguistic_words_empty() {
        let s0 = ner("x", 0, 0);
        let poem = PoemNode {
            normalized_text: "x".into(),
            syllables_flat: vec![s0.clone()],
            linkage: vec![],
            lines: vec![poem_line(
                0,
                vec![],
                vec![WordNode {
                    foot_type: "custom".into(),
                    syllables: vec![syllable_node(s0, 0)],
                    word_index_in_line: 0,
                    foot_index_global: 0,
                }],
            )],
        };

        let lines = flat_lines_from_poem(&poem);
        assert_eq!(lines[0].feet.len(), 1);
        assert_eq!(lines[0].feet[0].foot_index_global, Some(0));
        assert_eq!(lines[0].feet[0].syllables[0].text, "x");
    }

    #[test]
    fn empty_both_layers_yields_no_feet_on_line() {
        let poem = PoemNode {
            normalized_text: "\n".into(),
            syllables_flat: vec![],
            linkage: vec![],
            lines: vec![poem_line(0, vec![], vec![])],
        };

        let lines = flat_lines_from_poem(&poem);
        assert_eq!(lines.len(), 1);
        assert!(lines[0].feet.is_empty());
    }
}
