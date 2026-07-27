//! Soft classical metre sketches (line–foot–தளை heuristics).
//!
//! These are **not** full classical proof. They annotate `ParseResult.metre_ml` dual-truth only
//! and never subtract from hybrid/heuristic aggregate scores. Gated by A12 freeze
//! (`ml_eval::classical_path_allowed`).

use crate::foot::Foot;
use crate::linkage::{Linkage, LinkageType};
use crate::ml_eval::classical_path_allowed;

use super::MetreType;

/// Classical constraint violations for a fixed candidate metre.
/// Empty when classical path is gated off, or when no soft structural issues found.
pub fn classical_violations_for_metre(
    metre: &MetreType,
    feet: &[Foot],
    linkage: &[Linkage],
) -> Vec<String> {
    if !classical_path_allowed() {
        return vec![];
    }
    let mut v = Vec::new();
    if feet.is_empty() {
        v.push("classical:empty_feet".into());
        return v;
    }
    let n_feet = feet.len();
    let ven_edges = linkage
        .iter()
        .filter(|l| matches!(l.linkage_type, LinkageType::VenTalai))
        .count();
    let aci_edges = linkage
        .iter()
        .filter(|l| matches!(l.linkage_type, LinkageType::AciriyaTalai))
        .count();
    let edges = linkage.len().max(1);

    match metre {
        MetreType::Venpaa => {
            // Soft classical sketch: Venpaa-like lines often compact with VenTalai mass.
            if n_feet > 16 {
                v.push(format!("classical:venpaa_too_many_feet:{n_feet}"));
            }
            if ven_edges * 2 < edges && n_feet >= 2 {
                v.push("classical:venpaa_low_ventalai_mass".into());
            }
            // Last foot often shorter in venpaa catalogues (soft hint).
            if let Some(last) = feet.last() {
                if last.syllables.len() > 3 {
                    v.push("classical:venpaa_last_foot_long".into());
                }
            }
        }
        MetreType::Aciriyappaa => {
            if aci_edges == 0 && n_feet >= 3 && edges > 0 {
                v.push("classical:aciriyappaa_missing_aciriya_talai".into());
            }
        }
        MetreType::Kalippaa => {
            let kali = linkage
                .iter()
                .filter(|l| matches!(l.linkage_type, LinkageType::KaliTalai))
                .count();
            if kali == 0 && n_feet >= 3 {
                v.push("classical:kalippaa_missing_kali_talai".into());
            }
        }
        MetreType::Vanjippaa => {
            let van = linkage
                .iter()
                .filter(|l| matches!(l.linkage_type, LinkageType::VanjiTalai))
                .count();
            if van == 0 && n_feet >= 2 {
                v.push("classical:vanjippaa_missing_vanji_talai".into());
            }
        }
        MetreType::Other(s) => {
            v.push(format!("classical:unclassified_metre:{s}"));
        }
    }
    v
}

/// D03 dual compare: agree / ml_only / classical_only labels for reporting.
pub fn dual_compare_label(ml: &str, classical_ok: bool, classical_metre: Option<&str>) -> String {
    match (classical_ok, classical_metre) {
        (true, Some(c)) if c == ml => "agree".into(),
        (true, Some(_)) => "classical_alt".into(),
        (false, _) => "ml_only_classical_flags".into(),
        (true, None) => "classical_empty".into(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::linkage::{
        FootPosition, Linkage, LinkageSpecialType, LinkageType,
    };
    use crate::syllable::{Syllable, SyllableType};

    fn foot(n_syl: usize) -> Foot {
        let syllables = (0..n_syl)
            .map(|i| Syllable {
                text: "க".into(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: i,
            })
            .collect();
        Foot {
            syllables,
            foot_type: "நேர்".into(),
            foot_index_global: Some(0),
        }
    }

    #[test]
    fn venpaa_flags_when_no_ventalai() {
        let feet = vec![foot(2), foot(2), foot(2)];
        let from = FootPosition {
            foot_index: 0,
            line_index: 0,
            word_index_in_line: 0,
        };
        let to = FootPosition {
            foot_index: 1,
            line_index: 0,
            word_index_in_line: 1,
        };
        let link = vec![Linkage {
            from_foot: 0,
            to_foot: 1,
            from,
            to,
            linkage_type: LinkageType::AciriyaTalai,
            linkage_special_type: LinkageSpecialType::Unknown,
            is_valid: true,
        }];
        let v = classical_violations_for_metre(&MetreType::Venpaa, &feet, &link);
        assert!(
            v.iter().any(|s| s.contains("ventalai") || s.contains("Ven")),
            "got {v:?}"
        );
    }

    #[test]
    fn dual_compare_agree() {
        assert_eq!(dual_compare_label("Venpaa", true, Some("Venpaa")), "agree");
    }
}
