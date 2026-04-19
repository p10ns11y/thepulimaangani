//! Metre (பாவகை) detection.

use serde::{Deserialize, Serialize};
use super::foot::Foot;
use super::talai::Talai;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
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

    // Very simplified detection (real version would use CheckVenpaa etc.)
    if feet.len() >= 4 {
        Some(MetreType::Venpaa)
    } else {
        Some(MetreType::Asiriyappaa)
    }
}