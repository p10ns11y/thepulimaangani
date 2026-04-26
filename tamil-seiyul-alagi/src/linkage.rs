use serde::{Deserialize, Serialize};

use crate::foot::Foot;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LinkageType {
    VenTalai,
    AsiriyaTalai,
    Other(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Linkage {
    pub from_foot: usize,
    pub to_foot: usize,
    pub linkage_type: LinkageType,
    pub is_valid: bool,
}

pub fn analyze_linkage(feet: &[Foot]) -> Vec<Linkage> {
    feet.windows(2)
        .enumerate()
        .map(|(i, _)| Linkage {
            from_foot: i,
            to_foot: i + 1,
            linkage_type: LinkageType::VenTalai,
            is_valid: true,
        })
        .collect()
}

// Compatibility aliases during migration to machine-first terminology.
pub type Talai = Linkage;
pub type TalaiType = LinkageType;

pub fn analyze_talai(feet: &[Foot]) -> Vec<Talai> {
    analyze_linkage(feet)
}
