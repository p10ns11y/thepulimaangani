use crate::{Foot, Linkage, MetreType, Syllable, Talai};
use serde::{Deserialize, Serialize};

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
    pub syllables: Vec<Syllable>,
    pub feet: Vec<Foot>,
    pub linkage: Vec<Linkage>,
    #[serde(default)]
    pub talai: Vec<Talai>,
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
