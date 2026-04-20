use serde::{Deserialize, Serialize};

use crate::foot::Foot;
use crate::talai::Talai;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum MetreType {
    Venpaa,
    Asiriyappaa,
    Kalippaa,
    Vanjippaa,
    Other(String),
}

pub fn detect_metre(feet: &[Foot], _talai: &[Talai], no_detect: bool) -> Option<MetreType> {
    if no_detect {
        return None;
    }

    if feet.len() >= 4 {
        Some(MetreType::Venpaa)
    } else {
        Some(MetreType::Asiriyappaa)
    }
}