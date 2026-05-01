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

/// Coarse **Talai** (தளை) family for metre-facing logic (Venpaa vs Kalippaa hints, etc.).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LinkageType {
    /// JSON: `VenTalai` (legacy `Venthalai` on deserialize).
    #[serde(rename = "VenTalai", alias = "Venthalai")]
    VenTalai,
    /// Coarse ஆசிரியத்தளை (JSON: `AciriyaTalai`; legacy `Aciriyathalai` / `Aasiriyathalai`).
    #[serde(rename = "AciriyaTalai", alias = "Aciriyathalai", alias = "Aasiriyathalai")]
    AciriyaTalai,
    #[serde(rename = "KaliTalai", alias = "Kalithalai")]
    KaliTalai,
    #[serde(rename = "VanjiTalai", alias = "Vanjithalai")]
    VanjiTalai,
    /// Fallback when the previous foot’s last cir cannot be classified (JSON: `VenPathTalai`).
    #[serde(rename = "VenPathTalai")]
    VenPathTalai,
    /// Ven-class path classified as ஆசிரிய (JSON: `VenPathAciriyaTalai`; legacy `AsiriyaTalai`).
    #[serde(rename = "VenPathAciriyaTalai", alias = "AsiriyaTalai")]
    VenPathAciriyaTalai,
    Other(String),
}

/// Nuanced bond name within a [`LinkageType`] family (issue #36 row names).
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum LinkageSpecialType {
    #[serde(
        rename = "NerondriyaAciriyaTalai",
        alias = "NerondriyaAciriyathalai",
        alias = "NerondriyaAasiriyathalai"
    )]
    NerondriyaAciriyathalai,
    #[serde(
        rename = "NiraiondriyaAciriyaTalai",
        alias = "NiraiondriyaAciriyathalai",
        alias = "NiraiondriyaAasiriyathalai"
    )]
    NiraiondriyaAciriyathalai,
    #[serde(rename = "IyarcirVenTalai", alias = "IyarcirVenthalai")]
    IyarcirVenthalai,
    #[serde(rename = "VencirVenTalai", alias = "VencirVenthalai")]
    VencirVenthalai,
    #[serde(rename = "KaliTalai", alias = "Kalithalai")]
    Kalithalai,
    #[serde(rename = "OndriyaVanjiTalai", alias = "OndriyaVanchithalai")]
    OndriyaVanchithalai,
    #[serde(rename = "OndrathaVanjiTalai", alias = "OndrathaVanchithalai")]
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
            LinkageType::AciriyaTalai,
            LinkageSpecialType::NerondriyaAciriyathalai,
        ),
        (CirAcaiClass::Vilam, SyllableType::Nirai) => (
            LinkageType::AciriyaTalai,
            LinkageSpecialType::NiraiondriyaAciriyathalai,
        ),
        (CirAcaiClass::Maa, SyllableType::Nirai) => (
            LinkageType::VenTalai,
            LinkageSpecialType::IyarcirVenthalai,
        ),
        (CirAcaiClass::Vilam, SyllableType::Ner) => (
            LinkageType::VenTalai,
            LinkageSpecialType::IyarcirVenthalai,
        ),
        (CirAcaiClass::Kaai, SyllableType::Ner) => (
            LinkageType::VenTalai,
            LinkageSpecialType::VencirVenthalai,
        ),
        (CirAcaiClass::Kaai, SyllableType::Nirai) => (
            LinkageType::KaliTalai,
            LinkageSpecialType::Kalithalai,
        ),
        (CirAcaiClass::Kani, SyllableType::Nirai) => (
            LinkageType::VanjiTalai,
            LinkageSpecialType::OndriyaVanchithalai,
        ),
        (CirAcaiClass::Kani, SyllableType::Ner) => (
            LinkageType::VanjiTalai,
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
                            LinkageType::VenPathTalai,
                            LinkageSpecialType::Unknown,
                            false,
                        )
                    }
                }
                _ => (
                    LinkageType::VenPathTalai,
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

/// Traditional name for [`analyze_linkage`] (**Talai** = bond between consecutive feet; Tamil தளை — romanize *Talai*, not *Thalai*, to avoid confusion with தலை “head”).
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
    fn table_maa_ner_is_nerondriya_aciriyathalai() {
        let feet = vec![foot_with(&[SyllableType::Ner]), foot_with(&[SyllableType::Ner])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l.len(), 1);
        assert_eq!(l[0].linkage_type, LinkageType::AciriyaTalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::NerondriyaAciriyathalai
        );
        assert!(l[0].is_valid);
    }

    #[test]
    fn table_vilam_nirai_is_niraiondriya_aciriyathalai() {
        let feet = vec![foot_with(&[SyllableType::Nirai]), foot_with(&[SyllableType::Nirai])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::AciriyaTalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::NiraiondriyaAciriyathalai
        );
    }

    #[test]
    fn table_maa_nirai_is_iyarcir_venthalai() {
        let feet = vec![foot_with(&[SyllableType::Ner]), foot_with(&[SyllableType::Nirai])];
        let pos = positions(2);
        let l = analyze_linkage(&pos, &feet);
        assert_eq!(l[0].linkage_type, LinkageType::VenTalai);
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
        assert_eq!(l[0].linkage_type, LinkageType::VenTalai);
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
        assert_eq!(l[0].linkage_type, LinkageType::VenTalai);
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
        assert_eq!(l[0].linkage_type, LinkageType::KaliTalai);
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
        assert_eq!(l[0].linkage_type, LinkageType::VanjiTalai);
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
        assert_eq!(l[0].linkage_type, LinkageType::VanjiTalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::OndrathaVanchithalai
        );
    }

    #[test]
    fn serde_accepts_legacy_aciriya_spellings_in_json() {
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"Aasiriyathalai\"").unwrap(),
            LinkageType::AciriyaTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"AsiriyaTalai\"").unwrap(),
            LinkageType::VenPathAciriyaTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"VenTalai\"").unwrap(),
            LinkageType::VenTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"VenPathTalai\"").unwrap(),
            LinkageType::VenPathTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"Kalithalai\"").unwrap(),
            LinkageType::KaliTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"Vanjithalai\"").unwrap(),
            LinkageType::VanjiTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageType>("\"Aciriyathalai\"").unwrap(),
            LinkageType::AciriyaTalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageSpecialType>("\"NerondriyaAciriyathalai\"").unwrap(),
            LinkageSpecialType::NerondriyaAciriyathalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageSpecialType>("\"NerondriyaAasiriyathalai\"").unwrap(),
            LinkageSpecialType::NerondriyaAciriyathalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageSpecialType>("\"IyarcirVenthalai\"").unwrap(),
            LinkageSpecialType::IyarcirVenthalai
        );
        assert_eq!(
            serde_json::from_str::<LinkageSpecialType>("\"IyarcirVenTalai\"").unwrap(),
            LinkageSpecialType::IyarcirVenthalai
        );
        assert_eq!(
            serde_json::from_str::<crate::metre::MetreType>("\"Asiriyappaa\"").unwrap(),
            crate::metre::MetreType::Aciriyappaa
        );
    }

    #[test]
    fn linkage_type_serializes_consistent_talai_suffix() {
        assert_eq!(
            serde_json::to_string(&LinkageType::VenTalai).unwrap(),
            "\"VenTalai\""
        );
        assert_eq!(
            serde_json::to_string(&LinkageType::AciriyaTalai).unwrap(),
            "\"AciriyaTalai\""
        );
        assert_eq!(
            serde_json::to_string(&LinkageType::VenPathTalai).unwrap(),
            "\"VenPathTalai\""
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
        assert_eq!(l[0].linkage_type, LinkageType::VenTalai);
        assert_eq!(
            l[0].linkage_special_type,
            LinkageSpecialType::IyarcirVenthalai
        );
    }
}
