//! Presentation layer — Tamil / Latin labels for machine-first `ParseResult`.
//!
//! Core logic stays free of these strings; this module is the single Rust place
//! for classical foot names and தளை labels so WASM JSON can ship **`presentation`**
//! alongside logic fields for any client (web, CLI, other hosts).

use serde::{Deserialize, Serialize};

use crate::linkage::{Linkage, LinkageSpecialType, LinkageType};
use crate::{Foot, MetreType, Syllable};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayResult {
    pub original_text: String,
    pub metre_type: Option<String>,
    pub syllables: Vec<DisplaySyllable>,
    pub feet: Vec<DisplayFoot>,
    pub talai: Vec<DisplayTalai>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplaySyllable {
    pub text: String,
    pub syllable_type: String,
    pub hint: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayFoot {
    pub text: String,
    /// Tamil mnemonic · simple Latin when known; otherwise raw `Ner-Nirai` pattern from logic.
    pub foot_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayTalai {
    pub from: usize,
    pub to: usize,
    pub from_line: usize,
    pub to_line: usize,
    pub talai_type: String,
    pub is_valid: bool,
}

/// Build display strings from parse outputs (used by `ParseResult` / WASM).
pub fn to_display(
    original_text: &str,
    metre_type: &Option<MetreType>,
    syllables: &[Syllable],
    feet: &[Foot],
    linkage: &[Linkage],
) -> DisplayResult {
    DisplayResult {
        original_text: original_text.to_string(),
        metre_type: metre_type.as_ref().map(format_metre),
        syllables: syllables.iter().map(to_display_syllable).collect(),
        feet: feet.iter().map(to_display_foot).collect(),
        talai: linkage.iter().map(to_display_talai).collect(),
    }
}

fn format_metre(metre: &MetreType) -> String {
    match metre {
        MetreType::Venpaa => "வெண்பா".to_string(),
        MetreType::Aciriyappaa => "ஆசிரியப்பா".to_string(),
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

/// Tamil + Latin gloss for classical feet.
///
/// Tamil compounds follow [feet-calculations.md](https://github.com/p10ns11y/thepulimaangani/blob/malar/.grok/migration-plan/feet-calculations.md)
/// (ஈரசை / மூவசை / நான்கசை). Romanization uses doubled vowels for length (e.g. **themaangkaay**) where helpful.
pub fn foot_pattern_display(pattern: &str) -> String {
    match pattern {
        "Ner" => "மா (ma)".to_string(),
        "Nirai" => "விளம் (vilam)".to_string(),
        "Ner-Ner" => "தேமா (thema)".to_string(),
        "Ner-Nirai" => "கூவிளம் (koovilam)".to_string(),
        "Nirai-Ner" => "புளிமா (pulima)".to_string(),
        "Nirai-Nirai" => "கருவிளம் (karuvilam)".to_string(),
        // 3-acai (மூவசை)
        "Ner-Ner-Ner" => "தேமாங்காய் (themaangkaay)".to_string(),
        "Ner-Ner-Nirai" => "தேமாங்கனி (themaangkani)".to_string(),
        "Ner-Nirai-Ner" => "கூவிளங்காய் (koovilangkaay)".to_string(),
        "Ner-Nirai-Nirai" => "கூவிளங்கனி (koovilangkani)".to_string(),
        "Nirai-Ner-Ner" => "புளிமாங்காய் (pulimaangkaay)".to_string(),
        "Nirai-Ner-Nirai" => "புளிமாங்கனி (pulimaangkani)".to_string(),
        "Nirai-Nirai-Ner" => "கருவிளங்காய் (karuvilangkaay)".to_string(),
        "Nirai-Nirai-Nirai" => "கருவிளங்கனி (karuvilangkani)".to_string(),
        // 4-acai (நான்கசை) — தண் / நறும் spellings per feet-calculations.md
        "Ner-Ner-Ner-Ner" => "தேமாந்தண்பூ (themaanthanpuu)".to_string(),
        "Ner-Ner-Ner-Nirai" => "தேமாந்தண்ணிழல் (themaanthannizhal)".to_string(),
        "Ner-Ner-Nirai-Ner" => "தேமாநறும்பூ (themanarumpuu)".to_string(),
        "Ner-Ner-Nirai-Nirai" => "தேமாநறுநிழல் (themanarunizhal)".to_string(),
        "Ner-Nirai-Ner-Ner" => "கூவிளந்தண்பூ (koovilanthanpuu)".to_string(),
        "Ner-Nirai-Ner-Nirai" => "கூவிளந்தண்ணிழல் (koovilanthannizhal)".to_string(),
        "Ner-Nirai-Nirai-Ner" => "கூவிளநறும்பூ (koovilanarumpuu)".to_string(),
        "Ner-Nirai-Nirai-Nirai" => "கூவிளநறுநிழல் (koovilanarunizhal)".to_string(),
        "Nirai-Ner-Ner-Ner" => "புளிமாந்தண்பூ (pulimaanthanpuu)".to_string(),
        "Nirai-Ner-Ner-Nirai" => "புளிமாந்தண்ணிழல் (pulimaanthannizhal)".to_string(),
        "Nirai-Ner-Nirai-Ner" => "புளிமாநறும்பூ (pulimanarumpuu)".to_string(),
        "Nirai-Ner-Nirai-Nirai" => "புளிமாநறுநிழல் (pulimanarunizhal)".to_string(),
        "Nirai-Nirai-Ner-Ner" => "கருவிளந்தண்பூ (karuvilanthanpuu)".to_string(),
        "Nirai-Nirai-Ner-Nirai" => "கருவிளந்தண்ணிழல் (karuvilanthannizhal)".to_string(),
        "Nirai-Nirai-Nirai-Ner" => "கருவிளநறும்பூ (karuvilanarumpuu)".to_string(),
        "Nirai-Nirai-Nirai-Nirai" => "கருவிளநறுநிழல் (karuvilanarunizhal)".to_string(),
        "" => "—".to_string(),
        other => other.to_string(),
    }
}

fn to_display_talai(t: &Linkage) -> DisplayTalai {
    let talai_type = match t.linkage_special_type {
        LinkageSpecialType::NerondriyaAciriyathalai => "நேரொன்றிய ஆசிரியத்தளை".to_string(),
        LinkageSpecialType::NiraiondriyaAciriyathalai => {
            "நிரையொன்றிய ஆசிரியத்தளை".to_string()
        }
        LinkageSpecialType::IyarcirVenthalai => "இயற்சீர் வெண்டளை".to_string(),
        LinkageSpecialType::VencirVenthalai => "வெண்சீர் வெண்டளை".to_string(),
        LinkageSpecialType::Kalithalai => "கலித்தளை".to_string(),
        LinkageSpecialType::OndriyaVanchithalai => "ஒன்றிய வஞ்சித்தளை".to_string(),
        LinkageSpecialType::OndrathaVanchithalai => "ஒன்றாத வஞ்சித்தளை".to_string(),
        LinkageSpecialType::Unknown => match &t.linkage_type {
            LinkageType::VenTalai => "வெண்டளை".to_string(),
            LinkageType::AciriyaTalai => "ஆசிரியத்தளை".to_string(),
            LinkageType::KaliTalai => "கலித்தளை".to_string(),
            LinkageType::VanjiTalai => "வஞ்சித்தளை".to_string(),
            LinkageType::VenPathTalai => "வெண்டளை".to_string(),
            LinkageType::VenPathAciriyaTalai => "ஆசிரியத்தளை".to_string(),
            LinkageType::Other(s) => s.clone(),
        },
    };
    DisplayTalai {
        from: t.from_foot,
        to: t.to_foot,
        from_line: t.from.line_index,
        to_line: t.to.line_index,
        talai_type,
        is_valid: t.is_valid,
    }
}

impl Default for DisplayResult {
    fn default() -> Self {
        Self {
            original_text: String::new(),
            metre_type: None,
            syllables: Vec::new(),
            feet: Vec::new(),
            talai: Vec::new(),
        }
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
