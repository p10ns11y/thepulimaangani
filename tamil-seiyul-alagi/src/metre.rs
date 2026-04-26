use serde::{Deserialize, Serialize};

use crate::foot::Foot;
use crate::linkage::Linkage;
use crate::types::{MetreHypothesis, RuleId};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum MetreType {
    Venpaa,
    Asiriyappaa,
    Kalippaa,
    Vanjippaa,
    Other(String),
}

pub fn detect_metre(feet: &[Foot], _linkage: &[Linkage], no_detect: bool) -> Option<MetreType> {
    if no_detect {
        return None;
    }

    if feet.len() >= 4 {
        Some(MetreType::Venpaa)
    } else {
        Some(MetreType::Asiriyappaa)
    }
}

pub fn detect_metre_hypotheses(
    feet: &[Foot],
    linkage: &[Linkage],
    no_detect: bool,
) -> Vec<MetreHypothesis> {
    let Some(metre) = detect_metre(feet, linkage, no_detect) else {
        return vec![];
    };

    let score = if matches!(metre, MetreType::Venpaa) { 70 } else { 65 };
    vec![MetreHypothesis {
        metre_type: metre,
        aggregate_score: score,
        violations: vec![],
        rule_ids: vec![RuleId::MetreLength01, RuleId::LinkageAdjacency01],
    }]
}
