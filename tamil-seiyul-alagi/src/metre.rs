use serde::{Deserialize, Serialize};

use crate::foot::Foot;
use crate::linkage::Linkage;
use crate::parse_features::{LINK_SPECIAL_FEATURE_OFFSET, LINKAGE_TYPE_FEATURE_OFFSET, PARSE_FEATURE_DENSE_LEN};
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

/// Nudge [`MetreHypothesis::aggregate_score`] using linkage-heavy slices of
/// [`crate::parse_features::ParseFeatureVector::dense`] (schema v1). Intended when rule-based
/// metre is uncertain: stronger boost when no single `LinkageType` dominates.
///
/// Does not change `metre_type`; re-sort the slice after calling if order should follow scores.
pub fn boost_metre_hypotheses_with_dense(hypotheses: &mut [MetreHypothesis], dense: &[f32]) {
    if dense.len() != PARSE_FEATURE_DENSE_LEN || hypotheses.is_empty() {
        return;
    }

    let lt = LINKAGE_TYPE_FEATURE_OFFSET;
    let vent = dense[lt];
    let aasi = dense[lt + 1];
    let kal = dense[lt + 2];
    let vanj = dense[lt + 3];
    let max_four = vent.max(aasi).max(kal).max(vanj);
    // When one family strongly dominates, scale the boost down (rule-based metre is already clearer).
    let soft_uncertainty = if max_four < 0.48 {
        1.0f32
    } else {
        ((0.68 - max_four).max(0.0) / 0.35).min(1.0)
    };
    // Floor keeps a modest linkage signal even for "clean" profiles (fast filter / tie help).
    let uncertainty = soft_uncertainty.max(0.42);

    let sp = LINK_SPECIAL_FEATURE_OFFSET;
    let vanj_special = dense[sp + 5] + dense[sp + 6];
    let kal_special = dense[sp + 4];

    const SCALE: f32 = 5.0;
    const MAX_DELTA: i32 = 14;

    for h in hypotheses.iter_mut() {
        let raw = match &h.metre_type {
            MetreType::Venpaa => vent * 9.0 + vanj_special * 3.5,
            MetreType::Asiriyappaa => aasi * 9.0,
            MetreType::Kalippaa => kal * 11.0 + kal_special * 5.0,
            MetreType::Vanjippaa => vanj * 11.0 + vanj_special * 5.0,
            MetreType::Other(_) => 0.0,
        };
        let delta = (raw * uncertainty * SCALE).round() as i32;
        let delta = delta.clamp(0, MAX_DELTA);
        if delta > 0 {
            h.aggregate_score = (h.aggregate_score + delta).min(100);
            let has_tag = h.rule_ids.iter().any(|r| {
                matches!(r, RuleId::Other(s) if s == "MetreParseFeatures01")
            });
            if !has_tag {
                h.rule_ids
                    .push(RuleId::Other("MetreParseFeatures01".into()));
            }
        }
    }
}

#[cfg(test)]
mod boost_tests {
    use super::*;
    use crate::parse_features::{
        LINK_SPECIAL_FEATURE_OFFSET, LINKAGE_TYPE_FEATURE_OFFSET, PARSE_FEATURE_DENSE_LEN,
    };

    fn dense_venthalai_favourable_for_boost() -> Vec<f32> {
        let mut d = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        // Mixed talai so uncertainty factor stays high (no single family > ~0.48).
        d[LINKAGE_TYPE_FEATURE_OFFSET] = 0.40;
        d[LINKAGE_TYPE_FEATURE_OFFSET + 1] = 0.35;
        d[LINKAGE_TYPE_FEATURE_OFFSET + 2] = 0.25;
        d
    }

    #[test]
    fn boost_increases_venpaa_score_when_venthalai_leans_venpaa() {
        let mut hyps = vec![MetreHypothesis {
            metre_type: MetreType::Venpaa,
            aggregate_score: 70,
            violations: vec![],
            rule_ids: vec![RuleId::MetreLength01],
        }];
        boost_metre_hypotheses_with_dense(&mut hyps, &dense_venthalai_favourable_for_boost());
        assert!(hyps[0].aggregate_score > 70, "expected positive feature boost");
        assert!(
            hyps[0].rule_ids.iter().any(|r| matches!(r, RuleId::Other(s) if s == "MetreParseFeatures01")),
            "expected feature boost provenance"
        );
    }

    #[test]
    fn boost_skips_wrong_dense_len() {
        let mut hyps = vec![MetreHypothesis {
            metre_type: MetreType::Venpaa,
            aggregate_score: 70,
            violations: vec![],
            rule_ids: vec![],
        }];
        boost_metre_hypotheses_with_dense(&mut hyps, &[0.0f32; 3]);
        assert_eq!(hyps[0].aggregate_score, 70);
    }

    #[test]
    fn kalippaa_gets_boost_from_kalithalai_special_slice() {
        let mut d = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        d[LINKAGE_TYPE_FEATURE_OFFSET + 2] = 0.55;
        d[LINK_SPECIAL_FEATURE_OFFSET + 4] = 0.9;
        let mut hyps = vec![MetreHypothesis {
            metre_type: MetreType::Kalippaa,
            aggregate_score: 50,
            violations: vec![],
            rule_ids: vec![],
        }];
        boost_metre_hypotheses_with_dense(&mut hyps, &d);
        assert!(hyps[0].aggregate_score > 50);
    }
}
