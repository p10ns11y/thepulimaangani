//! Venpaa special-type (subtype) classifier — machine-first spike.
//!
//! Tamil catalogue prose is **not** translated line-by-line into code. Sensors are
//! defined first; a decision DAG maps sensor tuples → anthology `sample_id` labels.
//!
//! # Sensors (strict definitions)
//!
//! | Sensor | Machine definition |
//! |--------|-------------------|
//! | `line_count` | Non-empty physical lines after trim |
//! | `thanichol_on_second_line` | Second line contains an orthographic thanichol separator (` - ` / en-dash) with a non-empty trailing token (anthology encoding of தனிச்சொல்) |
//! | `ethukai_key(line)` | Prosodic **consonant class** (or vowel/aaytham fallback) of the **second letter** of the first whitespace token of that line (எதுகை) |
//! | `vikarpa_family_count` | Number of distinct `ethukai_key` values across lines |
//!
//! # Decision DAG (narrowing order)
//!
//! 1. **Length class** from `line_count` (குறள் / சிந்தியல் / 4-அடி / பஃறொடை / கலி)
//! 2. **Osai gate** via thanichol (நேரிசை vs இன்னிசை) where the catalogue requires it
//! 3. **விகற்பம்** via `vikarpa_family_count` (ஒரு / இரு / பல — label vocabulary matches anthology ids)
//!
//! Soft Venpaa plant checks (4-சீர் body / 3-சீர் ஈற்றடி, வெண்டளை, ஈற்றுச்சீர் நாள்|மலர்|காசு|பிறப்பு)
//! are recorded as diagnostics; they do **not** yet veto the label in this spike.
//!
//! SoT for expected labels: `.grok/study-materials/tamil-ilaganam/VENPA_POEM_CLASSIFICATIONS.md`
//! Cross-check: Tamil Virtual University diploma notes on வெண்பா விகற்பம் / தனிச்சொல்.

use std::collections::HashSet;

use unicode_segmentation::UnicodeSegmentation;

use crate::letter::to_prosodic_units;
use crate::poem_variations::{
    INISAI_SINTHIYAL_VENPAA, IRU_VIKARPA_KURAL_VENPAA, IRU_VIKARPA_NERISAI_VENPAA, KALIVENPAA,
    NERISAI_SINTHIYAL_VENPAA, ORU_VIKARPA_INISAI_VENPAA, ORU_VIKARPA_KURAL_VENPAA,
    ORU_VIKARPA_NERISAI_VENPAA, PALA_VIKARPA_INISAI_VENPAA, PAQRODAI_VENPAA,
};
use crate::prosodic_unit::{Consonant, ProsodicUnit, Vowel};

/// Measurable inputs for the subtype DAG (and debug / future classical plant checks).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VenpaaSubtypeSensors {
    pub line_count: usize,
    pub thanichol_on_second_line: bool,
    pub thanichol_token: Option<String>,
    /// One ethukai key per non-empty line (may be shorter if a line has no usable first cheer).
    pub ethukai_keys: Vec<EthukaiKey>,
    pub vikarpa_family_count: usize,
    /// Whitespace tokens per line after stripping orthographic thanichol from line 2.
    pub body_token_counts: Vec<usize>,
    pub looks_like_venpaa_line_shape: bool,
}

/// Stable ethukai identity for விகற்பம் counting.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum EthukaiKey {
    Consonant(Consonant),
    Vowel(Vowel),
    Aaytham,
    /// Second letter could not be mapped through the official matrix.
    Raw(String),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VenpaaSubtypeDecision {
    /// Anthology `sample_id` when the DAG reaches a leaf; `None` if sensors are incomplete.
    pub sample_id: Option<&'static str>,
    pub sensors: VenpaaSubtypeSensors,
    /// Path tags for debugging (e.g. `length:kural`, `osai:nerisai`, `vikarpa:oru`).
    pub path: Vec<&'static str>,
}

/// Split poem text into non-empty physical lines.
pub fn physical_poem_lines(text: &str) -> Vec<&str> {
    text.lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .collect()
}

/// Orthographic thanichol: anthology marks தனிச்சொல் after ` - ` / ` – ` on the second line.
pub fn extract_thanichol_from_second_line(lines: &[&str]) -> Option<String> {
    let second = *lines.get(1)?;
    for separator in [" - ", " – ", " — ", "−"] {
        if let Some((body, thanichol)) = second.split_once(separator) {
            let token = thanichol.split_whitespace().next().unwrap_or("").trim();
            if !token.is_empty() && !body.trim().is_empty() {
                return Some(token.to_string());
            }
        }
    }
    None
}

fn first_cheer_token(line: &str) -> Option<&str> {
    // Drop leading thanichol junk; ethukai is always on the first cheer of the line body.
    let body = line
        .split(" - ")
        .next()
        .unwrap_or(line)
        .split(" – ")
        .next()
        .unwrap_or(line)
        .trim();
    body.split_whitespace().next()
}

/// எதுகை key = second letter of the first cheer, reduced to consonant class when possible.
pub fn ethukai_key_for_cheer(first_cheer: &str) -> Option<EthukaiKey> {
    let graphemes: Vec<&str> = first_cheer.graphemes(true).collect();
    if graphemes.len() < 2 {
        return None;
    }
    let second = graphemes[1];
    let units = to_prosodic_units(&[second]);
    match units.first() {
        Some(ProsodicUnit::VowelConsonant { consonant, .. }) => {
            Some(EthukaiKey::Consonant(*consonant))
        }
        Some(ProsodicUnit::Consonant(consonant)) => Some(EthukaiKey::Consonant(*consonant)),
        Some(ProsodicUnit::Vowel(vowel)) => Some(EthukaiKey::Vowel(*vowel)),
        Some(ProsodicUnit::Aaytham) => Some(EthukaiKey::Aaytham),
        Some(ProsodicUnit::ConsonantCluster(_)) | None => Some(EthukaiKey::Raw(second.to_string())),
    }
}

fn token_count_without_thanichol(line: &str, strip_thanichol: bool) -> usize {
    let body = if strip_thanichol {
        line.split(" - ")
            .next()
            .unwrap_or(line)
            .split(" – ")
            .next()
            .unwrap_or(line)
    } else {
        line
    };
    body.split_whitespace().filter(|token| !token.is_empty()).count()
}

/// Build sensors from poem text (line-oriented; does not require a full parse).
pub fn measure_venpaa_subtype_sensors(text: &str) -> VenpaaSubtypeSensors {
    let lines = physical_poem_lines(text);
    let thanichol_token = extract_thanichol_from_second_line(&lines);
    let thanichol_on_second_line = thanichol_token.is_some();

    let mut ethukai_keys = Vec::with_capacity(lines.len());
    for line in &lines {
        if let Some(cheer) = first_cheer_token(line) {
            if let Some(key) = ethukai_key_for_cheer(cheer) {
                ethukai_keys.push(key);
            }
        }
    }
    let vikarpa_family_count = ethukai_keys.iter().collect::<HashSet<_>>().len();

    let body_token_counts: Vec<usize> = lines
        .iter()
        .enumerate()
        .map(|(line_index, line)| token_count_without_thanichol(line, line_index == 1 && thanichol_on_second_line))
        .collect();

    let looks_like_venpaa_line_shape = match body_token_counts.as_slice() {
        [] => false,
        counts => {
            let last = *counts.last().unwrap_or(&0);
            let body_ok = counts[..counts.len().saturating_sub(1)]
                .iter()
                .all(|&count| count == 4);
            body_ok && last == 3
        }
    };

    VenpaaSubtypeSensors {
        line_count: lines.len(),
        thanichol_on_second_line,
        thanichol_token,
        ethukai_keys,
        vikarpa_family_count,
        body_token_counts,
        looks_like_venpaa_line_shape,
    }
}

/// Classify Venpaa special-type `sample_id` from sensors (decision DAG).
pub fn classify_venpaa_special_type_from_sensors(
    sensors: &VenpaaSubtypeSensors,
) -> VenpaaSubtypeDecision {
    let mut path = Vec::new();
    let line_count = sensors.line_count;
    let vikarpa_family_count = sensors.vikarpa_family_count;
    let thanichol = sensors.thanichol_on_second_line;

    let sample_id = match line_count {
        0 => {
            path.push("length:empty");
            None
        }
        2 => {
            path.push("length:kural");
            if vikarpa_family_count <= 1 {
                path.push("vikarpa:oru");
                Some(ORU_VIKARPA_KURAL_VENPAA)
            } else {
                path.push("vikarpa:iru");
                Some(IRU_VIKARPA_KURAL_VENPAA)
            }
        }
        3 => {
            path.push("length:sinthiyal");
            if thanichol {
                path.push("osai:nerisai");
                // Anthology only has ஒரு விகற்ப நேரிசை சிந்தியல்; keep V for path honesty.
                if vikarpa_family_count <= 1 {
                    path.push("vikarpa:oru");
                } else {
                    path.push("vikarpa:non_oru");
                }
                Some(NERISAI_SINTHIYAL_VENPAA)
            } else {
                path.push("osai:inisai");
                path.push("vikarpa:pala_or_any");
                Some(INISAI_SINTHIYAL_VENPAA)
            }
        }
        4 => {
            path.push("length:four_adi");
            if thanichol {
                path.push("osai:nerisai");
                // Classical: நேரிசை allows only ஒரு/இரு விகற்பம்; >2 with thanichol → not nerisai.
                if vikarpa_family_count > 2 {
                    path.push("vikarpa:gt2_fallback_inisai");
                    Some(PALA_VIKARPA_INISAI_VENPAA)
                } else if vikarpa_family_count <= 1 {
                    path.push("vikarpa:oru");
                    Some(ORU_VIKARPA_NERISAI_VENPAA)
                } else {
                    path.push("vikarpa:iru");
                    Some(IRU_VIKARPA_NERISAI_VENPAA)
                }
            } else {
                path.push("osai:inisai");
                if vikarpa_family_count <= 1 {
                    path.push("vikarpa:oru");
                    Some(ORU_VIKARPA_INISAI_VENPAA)
                } else {
                    path.push("vikarpa:pala");
                    Some(PALA_VIKARPA_INISAI_VENPAA)
                }
            }
        }
        5..=12 => {
            path.push("length:paqrodai");
            Some(PAQRODAI_VENPAA)
        }
        _ => {
            path.push("length:kalivenpaa");
            Some(KALIVENPAA)
        }
    };

    VenpaaSubtypeDecision {
        sample_id,
        sensors: sensors.clone(),
        path,
    }
}

/// Measure + classify in one call.
pub fn classify_venpaa_special_type(text: &str) -> VenpaaSubtypeDecision {
    let sensors = measure_venpaa_subtype_sensors(text);
    classify_venpaa_special_type_from_sensors(&sensors)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::poem_variations::{poem_variations_blocks, VENPAA};

    #[test]
    fn ethukai_oru_kural_shares_rr_class() {
        let sensors = measure_venpaa_subtype_sensors(
            "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்",
        );
        assert_eq!(sensors.vikarpa_family_count, 1);
        assert_eq!(
            sensors.ethukai_keys[0],
            EthukaiKey::Consonant(Consonant::Rr)
        );
    }

    #[test]
    fn thanichol_detected_on_nerisai_samples() {
        let sensors = measure_venpaa_subtype_sensors(
            "கூற்றங் குமைத்த குரைகழற்காற் கும்பிட்டுத்\nதோற்றந் துடைத்தேந் துடைத்தேமாற் - சீற்றஞ்செய்\nயேற்றினான் றில்லை யிடத்தினா னென்னினியாம்\nபோற்றினா னல்கும் பொருள்",
        );
        assert!(sensors.thanichol_on_second_line);
        assert_eq!(sensors.thanichol_token.as_deref(), Some("சீற்றஞ்செய்"));
    }

    #[test]
    fn all_ten_venpaa_special_types_classify_to_gold_ids() {
        let venpaa = poem_variations_blocks()
            .into_iter()
            .find(|block| block.metre_key == VENPAA)
            .expect("venpaa block");
        assert_eq!(venpaa.special_types.len(), 10);

        let mut failures = Vec::new();
        for row in venpaa.special_types {
            let decision = classify_venpaa_special_type(row.example);
            let predicted = decision.sample_id.unwrap_or("<none>");
            if predicted != row.en {
                failures.push(format!(
                    "{}: predicted={} path={:?} vikarpa={} thanichol={} keys={:?} shape={}",
                    row.en,
                    predicted,
                    decision.path,
                    decision.sensors.vikarpa_family_count,
                    decision.sensors.thanichol_on_second_line,
                    decision.sensors.ethukai_keys,
                    decision.sensors.looks_like_venpaa_line_shape
                ));
            }
        }
        assert!(
            failures.is_empty(),
            "Venpaa subtype spike mismatches:\n{}",
            failures.join("\n")
        );
    }
}
