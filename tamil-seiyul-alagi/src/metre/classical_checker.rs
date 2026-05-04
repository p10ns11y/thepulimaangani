//! Strict classical metre verification (line–foot–தளை constraints).
//!
//! Placeholder: the shipped pipeline uses heuristic [`super::prediction`] for coarse
//! `top_k_metre_hypotheses`. Implement classical checks here and wire them from
//! [`crate::parse_poem`] or presentation when ready.

use crate::foot::Foot;
use crate::linkage::Linkage;

use super::MetreType;

/// Classical constraint violations for a fixed candidate metre (empty until implemented).
pub fn classical_violations_for_metre(
    _metre: &MetreType,
    _feet: &[Foot],
    _linkage: &[Linkage],
) -> Vec<String> {
    vec![]
}
