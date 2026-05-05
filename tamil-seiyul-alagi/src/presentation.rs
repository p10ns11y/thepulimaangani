//! Presentation layer — Tamil / Latin labels for machine-first `ParseResult`.
//!
//! Core logic stays free of these strings; this module is the single Rust place
//! for classical foot names and தளை labels so WASM JSON can ship **`presentation`**
//! alongside logic fields for any client (web, CLI, other hosts).

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::linkage::{Linkage, LinkageSpecialType, LinkageType};
use crate::{Foot, MetreType, Syllable};

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DisplayResult {
    pub original_text: String,
    pub metre_type: Option<String>,
    pub syllables: Vec<DisplaySyllable>,
    pub feet: Vec<DisplayFoot>,
    pub talai: Vec<DisplayTalai>,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DisplaySyllable {
    pub text: String,
    pub syllable_type: String,
    pub hint: Option<String>,
}

/// One foot in `DisplayResult` (WASM `presentation.feet[]`).
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct DisplayFoot {
    pub text: String,
    /// Classical Tamil foot name when the pattern is in the table (e.g. தேமா).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foot_type_tamil: Option<String>,
    /// Simple Latin gloss when known (e.g. thema).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub foot_type_latin: Option<String>,
    /// Stable combined label for older clients: `தமிழ் · latin`, or pattern / em dash when unknown.
    pub foot_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
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
    let (tamil, latin) = foot_pattern_labels(&f.foot_type);
    let foot_type = foot_pattern_display_combined(&f.foot_type, tamil.as_ref(), latin.as_ref());
    DisplayFoot {
        text: f
            .syllables
            .iter()
            .map(|s| s.text.as_str())
            .collect::<String>(),
        foot_type_tamil: tamil,
        foot_type_latin: latin,
        foot_type,
    }
}

/// Tamil + Latin parts for classical feet (logic-layer pattern → classical names).
///
/// Tamil compounds follow [feet-calculations.md](https://github.com/p10ns11y/thepulimaangani/blob/malar/.grok/migration-plan/feet-calculations.md)
/// (ஈரசை / மூவசை / நான்கசை). Romanization uses doubled vowels for length (e.g. **themaangkaay**) where helpful.
pub fn foot_pattern_labels(pattern: &str) -> (Option<String>, Option<String>) {
    match pattern {
        "Ner" => (Some("மா".into()), Some("ma".into())),
        "Nirai" => (Some("விளம்".into()), Some("vilam".into())),
        "Ner-Ner" => (Some("தேமா".into()), Some("thema".into())),
        "Ner-Nirai" => (Some("கூவிளம்".into()), Some("koovilam".into())),
        "Nirai-Ner" => (Some("புளிமா".into()), Some("pulima".into())),
        "Nirai-Nirai" => (Some("கருவிளம்".into()), Some("karuvilam".into())),
        // 3-acai (மூவசை)
        "Ner-Ner-Ner" => (Some("தேமாங்காய்".into()), Some("themaangkaay".into())),
        "Ner-Ner-Nirai" => (Some("தேமாங்கனி".into()), Some("themaangkani".into())),
        "Ner-Nirai-Ner" => (Some("கூவிளங்காய்".into()), Some("koovilangkaay".into())),
        "Ner-Nirai-Nirai" => (Some("கூவிளங்கனி".into()), Some("koovilangkani".into())),
        "Nirai-Ner-Ner" => (Some("புளிமாங்காய்".into()), Some("pulimaangkaay".into())),
        "Nirai-Ner-Nirai" => (Some("புளிமாங்கனி".into()), Some("pulimaangkani".into())),
        "Nirai-Nirai-Ner" => (Some("கருவிளங்காய்".into()), Some("karuvilangkaay".into())),
        "Nirai-Nirai-Nirai" => (Some("கருவிளங்கனி".into()), Some("karuvilangkani".into())),
        // 4-acai (நான்கசை) — தண் / நறும் spellings per feet-calculations.md
        "Ner-Ner-Ner-Ner" => (Some("தேமாந்தண்பூ".into()), Some("themaanthanpuu".into())),
        "Ner-Ner-Ner-Nirai" => (
            Some("தேமாந்தண்ணிழல்".into()),
            Some("themaanthannizhal".into()),
        ),
        "Ner-Ner-Nirai-Ner" => (Some("தேமாநறும்பூ".into()), Some("themanarumpuu".into())),
        "Ner-Ner-Nirai-Nirai" => (Some("தேமாநறுநிழல்".into()), Some("themanarunizhal".into())),
        "Ner-Nirai-Ner-Ner" => (Some("கூவிளந்தண்பூ".into()), Some("koovilanthanpuu".into())),
        "Ner-Nirai-Ner-Nirai" => (
            Some("கூவிளந்தண்ணிழல்".into()),
            Some("koovilanthannizhal".into()),
        ),
        "Ner-Nirai-Nirai-Ner" => (Some("கூவிளநறும்பூ".into()), Some("koovilanarumpuu".into())),
        "Ner-Nirai-Nirai-Nirai" => (Some("கூவிளநறுநிழல்".into()), Some("koovilanarunizhal".into())),
        "Nirai-Ner-Ner-Ner" => (Some("புளிமாந்தண்பூ".into()), Some("pulimaanthanpuu".into())),
        "Nirai-Ner-Ner-Nirai" => (
            Some("புளிமாந்தண்ணிழல்".into()),
            Some("pulimaanthannizhal".into()),
        ),
        "Nirai-Ner-Nirai-Ner" => (Some("புளிமாநறும்பூ".into()), Some("pulimanarumpuu".into())),
        "Nirai-Ner-Nirai-Nirai" => (Some("புளிமாநறுநிழல்".into()), Some("pulimanarunizhal".into())),
        "Nirai-Nirai-Ner-Ner" => (Some("கருவிளந்தண்பூ".into()), Some("karuvilanthanpuu".into())),
        "Nirai-Nirai-Ner-Nirai" => (
            Some("கருவிளந்தண்ணிழல்".into()),
            Some("karuvilanthannizhal".into()),
        ),
        "Nirai-Nirai-Nirai-Ner" => (Some("கருவிளநறும்பூ".into()), Some("karuvilanarumpuu".into())),
        "Nirai-Nirai-Nirai-Nirai" => (Some("கருவிளநறுநிழல்".into()), Some("karuvilanarunizhal".into())),
        "" => (None, None),
        _ => (None, None),
    }
}

/// Combined string for JSON clients that only read `foot_type` (Tamil · Latin, no parentheses).
fn foot_pattern_display_combined(
    pattern: &str,
    tamil: Option<&String>,
    latin: Option<&String>,
) -> String {
    match (tamil, latin) {
        (Some(t), Some(l)) => format!("{t} · {l}"),
        (Some(t), None) => t.clone(),
        (None, Some(l)) => l.clone(),
        (None, None) if pattern.is_empty() => "—".to_string(),
        (None, None) => pattern.to_string(),
    }
}

/// Backward-compatible single line: same as `DisplayFoot.foot_type` for known patterns.
pub fn foot_pattern_display(pattern: &str) -> String {
    let (tamil, latin) = foot_pattern_labels(pattern);
    foot_pattern_display_combined(pattern, tamil.as_ref(), latin.as_ref())
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
        assert_eq!(foot_pattern_display("Ner-Ner"), "தேமா · thema".to_string());
    }

    #[test]
    fn foot_pattern_labels_split_tamil_latin() {
        let (t, l) = foot_pattern_labels("Ner-Ner");
        assert_eq!(t.as_deref(), Some("தேமா"));
        assert_eq!(l.as_deref(), Some("thema"));
    }
}
