//! Talai (தளை) linkage analysis.

use serde::{Deserialize, Serialize};
use super::foot::Foot;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TalaiType {
    VenTalai,
    AsiriyaTalai,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Talai {
    pub from_foot: usize,
    pub to_foot: usize,
    pub talai_type: TalaiType,
    pub is_valid: bool,
}

pub fn analyze_talai(feet: &[Foot]) -> Vec<Talai> {
    feet.windows(2)
        .enumerate()
        .map(|(i, _w)| Talai {
            from_foot: i,
            to_foot: i + 1,
            talai_type: TalaiType::VenTalai, // default for demo
            is_valid: true,
        })
        .collect()
}