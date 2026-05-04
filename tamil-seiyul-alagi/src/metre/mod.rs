//! Coarse metre: [`MetreType`], linkage summaries, heuristic [`prediction`], and
//! [`classical_checker`] (strict rules — placeholder until implemented).

mod classical_checker;
mod fractions;
pub mod ml_head;
mod prediction;

pub use classical_checker::classical_violations_for_metre;
pub use fractions::linkage_coarse_fractions;
pub use prediction::{
    boost_metre_hypotheses_with_dense, detect_metre_hypotheses, sort_metre_hypotheses_by_score,
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum MetreType {
    Venpaa,
    /// ஆசிரியப்பா — WASM/JSON key uses Tamil-style romanization (`aciriya`), not Sanskrit-style `asiriya`.
    #[serde(rename = "Aciriyappaa", alias = "Asiriyappaa")]
    Aciriyappaa,
    Kalippaa,
    Vanjippaa,
    Other(String),
}
