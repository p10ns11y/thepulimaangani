//! Presentation Layer — Converts machine data into human-friendly form.
//!
//! This module is responsible for:
//! - Mapping internal types to traditional Tamil names
//! - Formatting results for UI display
//! - Generating educational explanations
//!
//! IMPORTANT: This layer should NEVER be used inside the core calculation logic.

use crate::{Foot, Linkage, MetreType, ParseResult, Syllable};

pub struct DisplayResult {
    pub original_text: String,
    pub metre_type: Option<String>, // Human-readable ("வெண்பா", "ஆசிரியப்பா")
    pub syllables: Vec<DisplaySyllable>,
    pub feet: Vec<DisplayFoot>,
    pub talai: Vec<DisplayTalai>,
}

pub struct DisplaySyllable {
    pub text: String,
    pub syllable_type: String, // "நேர்" / "நிரை"
    pub hint: Option<String>,
}

pub struct DisplayFoot {
    pub text: String,
    pub foot_type: String, // "தேமா", "புளிமா", etc.
}

pub struct DisplayTalai {
    pub from: usize,
    pub to: usize,
    pub talai_type: String, // "வெண்டளை", "ஆசிரியத்தளை"
    pub is_valid: bool,
}

/// Convert internal ParseResult to display-friendly format
pub fn to_display(result: &ParseResult) -> DisplayResult {
    DisplayResult {
        original_text: result.original_text.clone(),
        metre_type: result.metre_type.as_ref().map(|m| format_metre(m)),
        syllables: result.syllables.iter().map(to_display_syllable).collect(),
        feet: result.feet.iter().map(to_display_foot).collect(),
        talai: result.linkage.iter().map(to_display_talai).collect(),
    }
}

fn format_metre(metre: &MetreType) -> String {
    match metre {
        MetreType::Venpaa => "வெண்பா".to_string(),
        MetreType::Asiriyappaa => "ஆசிரியப்பா".to_string(),
        MetreType::Kalippaa => "கலிப்பா".to_string(),
        MetreType::Vanjippaa => "வஞ்சிப்பா".to_string(),
        MetreType::Other(s) => s.clone(),
    }
}

fn to_display_syllable(s: &Syllable) -> DisplaySyllable {
    DisplaySyllable {
        text: s.text.clone(),
        syllable_type: match s.syllable_type {
            crate::syllable::SyllableType::Ner => "நேர்".to_string(),
            crate::syllable::SyllableType::Nirai => "நிரை".to_string(),
        },
        hint: s.split_hint.clone(),
    }
}

fn to_display_foot(f: &Foot) -> DisplayFoot {
    DisplayFoot {
        text: f
            .syllables
            .iter()
            .map(|s| s.text.as_str())
            .collect::<String>(),
        foot_type: f.foot_type.clone(), // Already contains traditional name
    }
}

fn to_display_talai(t: &Linkage) -> DisplayTalai {
    DisplayTalai {
        from: t.from_foot,
        to: t.to_foot,
        talai_type: match t.linkage_type {
            crate::linkage::LinkageType::Ven => "வெண்டளை".to_string(),
            crate::linkage::LinkageType::Asiriya => "ஆசிரியத்தளை".to_string(),
            crate::linkage::LinkageType::Other(ref s) => s.clone(),
        },
        is_valid: t.is_valid,
    }
}
