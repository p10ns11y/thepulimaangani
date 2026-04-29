use serde::{Deserialize, Serialize};

use crate::foot::FootPlacement;
use crate::line_scope::foot_line_index;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum LinkageType {
    VenTalai,
    AsiriyaTalai,
    Other(String),
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

/// Linkage between each consecutive pair of feet in poem order (may cross line boundaries).
pub fn analyze_linkage(foot_positions: &[FootPosition]) -> Vec<Linkage> {
    foot_positions
        .windows(2)
        .map(|w| {
            let from = w[0].clone();
            let to = w[1].clone();
            Linkage {
                from_foot: from.foot_index,
                to_foot: to.foot_index,
                from,
                to,
                linkage_type: LinkageType::VenTalai,
                is_valid: true,
            }
        })
        .collect()
}

// Compatibility aliases during migration to machine-first terminology.
pub type Talai = Linkage;
pub type TalaiType = LinkageType;

pub fn analyze_talai(foot_positions: &[FootPosition]) -> Vec<Talai> {
    analyze_linkage(foot_positions)
}
