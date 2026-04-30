use serde::{Deserialize, Serialize};

use crate::foot::{Foot, FootPlacement};
use crate::line_scope::foot_line_index;
use crate::syllable::SyllableType;

/// Classical **cir** class of a foot’s **last acai**, used at a bond with the next foot.
///
/// For 1–2 acai per foot: last acai maps to **Maa** (Ner) / **Vilam** (Nirai, விளம்).  
/// For 3+ acai: last acai maps to **Kaai** (Ner) / **Kani** (Nirai).  
/// Matches the transition table in [GitHub issue #36](https://github.com/p10ns11y/thepulimaangani/issues/36).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CirAcaiClass {
    Maa,
    Vilam,
    Kaai,
    Kani,
}

/// Coarse **talai** family for metre-facing logic (Venpaa vs Kalippaa hints, etc.).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LinkageType {
    Venthalai,
    Aasiriyathalai,
    Kalithalai,
    Vanjithalai,
    /// Reserved when the previous foot’s last cir cannot be classified (e.g. empty foot).
    VenTalai,
    AsiriyaTalai,
    Other(String),
}

/// Nuanced bond name within a [`LinkageType`] family (issue #36 row names).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum LinkageSpecialType {
    NerondriyaAasiriyathalai,
    NiraiondriyaAasiriyathalai,
    IyarcirVenthalai,
    VencirVenthalai,
    Kalithalai,
    OndriyaVanchithalai,
    OndrathaVanchithalai,
    Unknown,
}

impl Default for LinkageSpecialType {
    fn default() -> Self {
        LinkageSpecialType::Unknown
    }
}

/// Where a foot (word) sits in the poem: global index, line, and position within that line.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct FootPosition {
    /// Index of this foot in the poem-wide `feet` list (0-based).
    pub foot_index: usize,
    /// Physical line in the normalized poem (0-based).
    pub line_index: usize,
    /// 0-based index among feet that **start** on `line_index`.
    pub word_index_in_line: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Linkage {
    pub from_foot: usize,
    pub to_foot: usize,
    pub from: FootPosition,
    pub to: FootPosition,
    pub linkage_type: LinkageType,
    #[serde(default)]
    pub linkage_special_type: LinkageSpecialType,
    pub is_valid: bool,
}

/// Assign each foot a physical line and its index among feet on that line (word position).
pub fn foot_positions_for_poem(
    placements: &[FootPlacement],
    syllable_lines: &[usize],
) -> Vec<FootPosition> {
    let mut word_count_per_line: Vec<usize> = Vec::new();
    placements
        .iter()
        .enumerate()
        .map(|(foot_index, placement)| {
            let line_index = foot_line_index(syllable_lines, placement.syllable_range.clone());
            if line_index >= word_count_per_line.len() {
                word_count_per_line.resize(line_index + 1, 0);
            }
            let word_index_in_line = word_count_per_line[line_index];
            word_count_per_line[line_index] += 1;
            FootPosition {
                foot_index,
                line_index,
                word_index_in_line,
            }
        })
        .collect()
}

/// Last **cir** class from a foot’s **last acai** (see [`CirAcaiClass`]).
pub fn cir_class_for_foot(foot: &Foot) -> Option<CirAcaiClass> {
    let syls = foot.syllables.as_slice();
    let last = syls.last()?.syllable_type;
    let n = syls.len();
    Some(if n <= 2 {
        match last {
            SyllableType::Ner => CirAcaiClass::Maa,
            SyllableType::Nirai => CirAcaiClass::Vilam,
        }
    } else {
        match last {
            SyllableType::Ner => CirAcaiClass::Kaai,
            SyllableType::Nirai => CirAcaiClass::Kani,
        }
    })
}

fn classify_edge(
    prev_cir: CirAcaiClass,
    next_first: SyllableType,
) -> (LinkageType, LinkageSpecialType) {
    match (prev_cir, next_first) {
        (CirAcaiClass::Maa, SyllableType::Ner) => (
            LinkageType::Aasiriyathalai,
            LinkageSpecialType::NerondriyaAasiriyathalai,
        ),
        (CirAcaiClass::Vilam, SyllableType::Nirai) => (
            LinkageType::Aasiriyathalai,
            LinkageSpecialType::NiraiondriyaAasiriyathalai,
        ),
        (CirAcaiClass::Maa, SyllableType::Nirai) => (
            LinkageType::Venthalai,
            LinkageSpecialType::IyarcirVenthalai,
        ),
        (CirAcaiClass::Vilam, SyllableType::Ner) => (
            LinkageType::Venthalai,
            LinkageSpecialType::IyarcirVenthalai,
        ),
        (CirAcaiClass::Kaai, SyllableType::Ner) => (
            LinkageType::Venthalai,
            LinkageSpecialType::VencirVenthalai,
        ),
        (CirAcaiClass::Kaai, SyllableType::Nirai) => (
            LinkageType::Kalithalai,
            LinkageSpecialType::Kalithalai,
        ),
        (CirAcaiClass::Kani, SyllableType::Nirai) => (
            LinkageType::Vanjithalai,
            LinkageSpecialType::OndriyaVanchithalai,
        ),
        (CirAcaiClass::Kani, SyllableType::Ner) => (
            LinkageType::Vanjithalai,
            LinkageSpecialType::OndrathaVanchithalai,
        ),
    }
}

/// Linkage between each consecutive pair of feet in poem order (may cross line boundaries).
///
/// `feet` must align with `foot_positions` on `foot_index` (same order as [`crate::foot::group_into_feet_with_ranges`]).
pub fn analyze_linkage(foot_positions: &[FootPosition], feet: &[Foot]) -> Vec<Linkage> {
    foot_positions
        .windows(2)
        .map(|w| {
            let from = w[0].clone();
            let to = w[1].clone();
            let from_foot = feet.get(from.foot_index);
            let to_foot = feet.get(to.foot_index);
            let (linkage_type, linkage_special_type, is_valid) = match (from_foot, to_foot) {
                (Some(a), Some(b)) => {
                    if let (Some(prev_cir), Some(next_first)) =
                        (cir_class_for_foot(a), b.syllables.first().map(|s| s.syllable_type))
                    {
                        let (lt, lst) = classify_edge(prev_cir, next_first);
                        (lt, lst, true)
                    } else {
                        (
                            LinkageType::VenTalai,
                            LinkageSpecialType::Unknown,
                            false,
                        )
                    }
                }
                _ => (
                    LinkageType::VenTalai,
                    LinkageSpecialType::Unknown,
                    false,
                ),
            };
            Linkage {
                from_foot: from.foot_index,
                to_foot: to.foot_index,
                from,
                to,
                linkage_type,
                linkage_special_type,
                is_valid,
            }
        })
        .collect()
}

// Compatibility aliases during migration to machine-first terminology.
pub type Talai = Linkage;
pub type TalaiType = LinkageType;

/// Traditional name for [`analyze_linkage`] (talai = bond between consecutive feet).
#[allow(dead_code)] // Kept for API symmetry with `Talai` / migration call sites.
pub fn analyze_talai(foot_positions: &[FootPosition], feet: &[Foot]) -> Vec<Talai> {
    analyze_linkage(foot_positions, feet)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::syllable::Syllable;

    fn foot_with(syllable_types: &[SyllableType]) -> Foot {
        Foot {
            syllables: syllable_types
                .iter()
                .enumerate()
                .map(|(i, st)| Syllable {
                    text: format!("s{i}"),
                    syllable_type: *st,
                    split_hint: None,
                    alt_split: false,
                    rule_ref: None,
                    line_index: 0,
                    word_index_in_line: 0,
                })
                .collect(),
            foot_type: String::new(),
        }
    }

    fn positions(n: usize) -> Vec<FootPosition> {
        (0..n)
            .map(|i| FootPosition {
                foot_index: i,
                line_index: 0,
                word_index_in_line: i,
            })
            .collect()
    }

    #[test]
    fn table_maa_ner_is_nerondriya_aasiriyathalai() {
        let feet = vec![foot_with(&[SyllableType::Ner]), foot_with(&[SyllableType::Ner])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l.len(), 1);
        assert_eq!(l[0].linkage_type, LinkageType::Aasiriyathalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::NerondriyaAasiriyathalai
        );
        assert!(l[0].is_valid);
    }

    #[test]
    fn table_vilam_nirai_is_niraiondriya_aasiriyathalai() {
        let feet = vec![foot_with(&[SyllableType::Nirai]), foot_with(&[SyllableType::Nirai])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Aasiriyathalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::NiraiondriyaAasiriyathalai
        );
    }

    #[test]
    fn table_maa_nirai_is_iyarcir_venthalai() {
        let feet = vec![foot_with(&[SyllableType::Ner]), foot_with(&[SyllableType::Nirai])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Venthalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::IyarcirVenthalai
        );
    }

    #[test]
    fn table_vilam_ner_is_iyarcir_venthalai() {
        let feet = vec![foot_with(&[SyllableType::Nirai]), foot_with(&[SyllableType::Ner])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Venthalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::IyarcirVenthalai
        );
    }

    #[test]
    fn table_kaai_ner_is_vencir_venthalai() {
        let feet = vec![
            foot_with(&[
                SyllableType::Ner,
                SyllableType::Ner,
                SyllableType::Ner,
            ]),
            foot_with(&[SyllableType::Ner]),
        ];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Venthalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::VencirVenthalai
        );
    }

    #[test]
    fn table_kaai_nirai_is_kalithalai() {
        let feet = vec![
            foot_with(&[
                SyllableType::Ner,
                SyllableType::Ner,
                SyllableType::Ner,
            ]),
            foot_with(&[SyllableType::Nirai]),
        ];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Kalithalai);
        assert_eq!(l[0].linkage_special_type, LinkageSpecialType::Kalithalai);
    }

    #[test]
    fn table_kani_nirai_is_ondriya_vanchithalai() {
        let feet = vec![
            foot_with(&[
                SyllableType::Ner,
                SyllableType::Ner,
                SyllableType::Nirai,
            ]),
            foot_with(&[SyllableType::Nirai]),
        ];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Vanjithalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::OndriyaVanchithalai
        );
    }

    #[test]
    fn table_kani_ner_is_ondratha_vanchithalai() {
        let feet = vec![
            foot_with(&[
                SyllableType::Ner,
                SyllableType::Ner,
                SyllableType::Nirai,
            ]),
            foot_with(&[SyllableType::Ner]),
        ];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Vanjithalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::OndrathaVanchithalai
        );
    }

    #[test]
    fn two_acai_foot_ends_nirai_is_vilam_not_kani() {
        let feet = vec![
            foot_with(&[SyllableType::Ner, SyllableType::Nirai]),
            foot_with(&[SyllableType::Ner]),
        ];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::Venthalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::IyarcirVenthalai
        );
    }
}
