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
        foot_type: tamil_foot_label(&f.foot_type),
    }
}

/// Tamil mnemonic for machine-first foot codes (`tEmA`, `tEmA_GkA_y`, …).
pub fn tamil_foot_label(machine_code: &str) -> String {
    match machine_code {
        "mA" => "மா".to_string(),
        "viLa_m" => "விளம்".to_string(),
        "tEmA" => "தேமா".to_string(),
        "puLimA" => "புளிமா".to_string(),
        "kUviLa_m" => "கூவிளம்".to_string(),
        "karuviLa_m" => "கருவிளம்".to_string(),
        "tEmA_GkA_y" => "தேமாங்காய்".to_string(),
        "puLimA_GkA_y" => "புளிமாங்காய்".to_string(),
        "kUviLa_GkA_y" => "கூவிளங்காய்".to_string(),
        "karuviLa_GkA_y" => "கருவிளங்காய்".to_string(),
        "tEmA_GkaVi" => "தேமாகவி".to_string(),
        "puLimA_GkaVi" => "புளிமாகவி".to_string(),
        "kUviLa_GkaVi" => "கூவிளகவி".to_string(),
        "karuviLa_GkaVi" => "கருவிளகவி".to_string(),
        "tEmA_nta_NpU" => "தேமாந்தப்பூ".to_string(),
        "puLimA_nta_NpU" => "புளிமாந்தப்பூ".to_string(),
        "kUviLa_nta_NpU" => "கூவிளந்தப்பூ".to_string(),
        "karuviLa_nta_NpU" => "கருவிளந்தப்பூ".to_string(),
        "tEmAnaRu_mpU" => "தேமாரும்பூ".to_string(),
        "puLimAnaRu_mpU" => "புளிமாரும்பூ".to_string(),
        "kUviLanaRu_mpU" => "கூவிளரும்பூ".to_string(),
        "karuviLanaRu_mpU" => "கருவிளரும்பூ".to_string(),
        "tEmAnaRuniZa_l" => "தேமாருநிழல்".to_string(),
        "puLimAnaRuniZa_l" => "புளிமாருநிழல்".to_string(),
        "kUviLanaRuniZa_l" => "கூவிளருநிழல்".to_string(),
        "karuviLanaRuniZa_l" => "கருவிளருநிழல்".to_string(),
        "tEmA_nta_NNiZa_l" => "தேமாந்தநிழல்".to_string(),
        "puLimA_nta_NNiZa_l" => "புளிமாந்தநிழல்".to_string(),
        "kUviLa_nta_NNiZa_l" => "கூவிளந்தநிழல்".to_string(),
        "karuviLa_nta_NNiZa_l" => "கருவிளந்தநிழல்".to_string(),
        "unknown" => "அறியப்படாத சீர்".to_string(),
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
