//! Presentation Layer — Converts machine data into human-friendly form.
//!
//! This module is responsible for:
//! - Mapping internal types to traditional Tamil names
//! - Formatting results for UI display
//! - Generating educational explanations
//!
//! IMPORTANT: This layer should NEVER be used inside the core calculation logic.
//!
//! Logic layer uses readable foot **patterns** like `Ner-Ner`, `Nirai-Nirai-Nirai`.
//! Here we map those to Tamil mnemonics (தேமா, …) plus simple Latin (thema, …).
//!
//! Much of this module is unused in the WASM path today; suppress `dead_code` until a UI consumer wires it in.

#![allow(dead_code)]

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
    /// Tamil mnemonic · simple Latin when known; otherwise raw `Ner-Nirai` pattern from logic.
    pub foot_type: String,
}

pub struct DisplayTalai {
    pub from: usize,
    pub to: usize,
    pub from_line: usize,
    pub to_line: usize,
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
        foot_type: foot_pattern_display(&f.foot_type),
    }
}

/// Tamil + simple Latin for classical feet; unknown patterns pass through as-is.
pub fn foot_pattern_display(pattern: &str) -> String {
    match pattern {
        // 1 acai
        "Ner" => "மா (ma)".to_string(),
        "Nirai" => "விளம் (vilam)".to_string(),
        // 2 acai
        "Ner-Ner" => "தேமா (thema)".to_string(),
        "Ner-Nirai" => "கூவிளம் (ku vilam)".to_string(),
        "Nirai-Ner" => "புளிமா (pulima)".to_string(),
        "Nirai-Nirai" => "கருவிளம் (karuvilam)".to_string(),
        // 3 acai — kayak / kavi (order MSB = first syllable)
        "Ner-Ner-Ner" => "தேமாங்காய் (thema kangay)".to_string(),
        "Ner-Ner-Nirai" => "தேமாகவி (thema kavi)".to_string(),
        "Ner-Nirai-Ner" => "கூவிளங்காய் (ku vilam kangay)".to_string(),
        "Ner-Nirai-Nirai" => "கூவிளகவி (ku vilam kavi)".to_string(),
        "Nirai-Ner-Ner" => "புளிமாங்காய் (pulima kangay)".to_string(),
        "Nirai-Ner-Nirai" => "புளிமாகவி (pulima kavi)".to_string(),
        "Nirai-Nirai-Ner" => "கருவிளங்காய் (karuvilam kangay)".to_string(),
        "Nirai-Nirai-Nirai" => "கருவிளகவி (karuvilam kavi)".to_string(),
        // 4 acai — classical catalogue (same bit order as logic / prototype)
        "Ner-Ner-Ner-Ner" => "தேமாந்தப்பூ (thema thanthapuu)".to_string(),
        "Ner-Ner-Ner-Nirai" => "தேமாந்தநிழல் (thema thanth nizhal)".to_string(),
        "Ner-Ner-Nirai-Ner" => "தேமாரும்பூ (thema arumpuu)".to_string(),
        "Ner-Ner-Nirai-Nirai" => "தேமாருநிழல் (thema aru nizhal)".to_string(),
        "Ner-Nirai-Ner-Ner" => "கூவிளந்தப்பூ (ku vilam thanthapuu)".to_string(),
        "Ner-Nirai-Ner-Nirai" => "கூவிளந்தநிழல் (ku vilam thanth nizhal)".to_string(),
        "Ner-Nirai-Nirai-Ner" => "கூவிளரும்பூ (ku vilam arumpuu)".to_string(),
        "Ner-Nirai-Nirai-Nirai" => "கூவிளருநிழல் (ku vilam aru nizhal)".to_string(),
        "Nirai-Ner-Ner-Ner" => "புளிமாந்தப்பூ (pulima thanthapuu)".to_string(),
        "Nirai-Ner-Ner-Nirai" => "புளிமாந்தநிழல் (pulima thanth nizhal)".to_string(),
        "Nirai-Ner-Nirai-Ner" => "புளிமாரும்பூ (pulima arumpuu)".to_string(),
        "Nirai-Ner-Nirai-Nirai" => "புளிமாருநிழல் (pulima aru nizhal)".to_string(),
        "Nirai-Nirai-Ner-Ner" => "கருவிளந்தப்பூ (karuvilam thanthapuu)".to_string(),
        "Nirai-Nirai-Ner-Nirai" => "கருவிளந்தநிழல் (karuvilam thanth nizhal)".to_string(),
        "Nirai-Nirai-Nirai-Ner" => "கருவிளரும்பூ (karuvilam arumpuu)".to_string(),
        "Nirai-Nirai-Nirai-Nirai" => "கருவிளருநிழல் (karuvilam aru nizhal)".to_string(),
        "" => "—".to_string(),
        other => other.to_string(),
    }
}

fn to_display_talai(t: &Linkage) -> DisplayTalai {
    DisplayTalai {
        from: t.from_foot,
        to: t.to_foot,
        from_line: t.from.line_index,
        to_line: t.to.line_index,
        talai_type: match t.linkage_type {
            crate::linkage::LinkageType::VenTalai => "வெண்டளை".to_string(),
            crate::linkage::LinkageType::AsiriyaTalai => "ஆசிரியத்தளை".to_string(),
            crate::linkage::LinkageType::Other(ref s) => s.clone(),
        },
        is_valid: t.is_valid,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn foot_pattern_display_maps_known_pattern() {
        assert_eq!(foot_pattern_display("Ner-Ner"), "தேமா (thema)".to_string());
    }
}
