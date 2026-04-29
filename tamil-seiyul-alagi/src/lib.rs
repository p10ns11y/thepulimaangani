mod error;
mod foot;
mod letter;
mod line_scope;
mod linkage;
mod metre;
mod presentation;
mod prosodic_sequence;
mod prosodic_unit;
mod syllable;
mod syllable_builder;
mod tamil_chars;
mod types;

pub use prosodic_sequence::ProsodicSequence;

use wasm_bindgen::prelude::*;

pub use error::ParseError;
pub use foot::{Foot, FootPlacement};
pub use letter::Letter;
pub use linkage::{FootPosition, Linkage, LinkageType, Talai, TalaiType};
pub use metre::MetreType;
pub use prosodic_unit::{Consonant, ProsodicUnit, Vowel};
pub use syllable::{Syllable, SyllableType};
pub use syllable_builder::SyllableBuilder;
pub use types::{MetreHypothesis, ParseOptions, ParseResult, RuleId};

use unicode_segmentation::UnicodeSegmentation;

pub fn parse_poem(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    if text.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let normalized = normalize_text(text, options.uyir_u);

    //  read: https://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
    let graphemes: Vec<&str> = normalized.graphemes(true).collect();
    let normalized_clone = normalized.clone();

    let units = letter::to_prosodic_units(&graphemes);
    let syllables = SyllableBuilder::new(options.alt_scansion).build(&units);
    let syllable_lines = line_scope::syllable_line_indices(&normalized_clone, &syllables)
        .unwrap_or_else(|| vec![0; syllables.len()]);
    let foot_placements = foot::group_into_feet_with_ranges(&syllables);
    let feet: Vec<Foot> = foot_placements.iter().map(|p| p.foot.clone()).collect();
    let foot_positions = linkage::foot_positions_for_poem(&foot_placements, &syllable_lines);
    let linkage = linkage::analyze_linkage(&foot_positions);
    let metre_hypotheses = metre::detect_metre_hypotheses(&feet, &linkage, options.no_detect);
    let metre = metre_hypotheses.first().map(|h| h.metre_type.clone());

    Ok(ParseResult {
        original_text: text.to_string(),
        normalized_text: normalized_clone,
        letter_count: graphemes.len(),
        vikalpa_count: if options.alt_scansion { 1 } else { 0 },
        syllables,
        feet,
        talai: linkage.clone(),
        linkage,
        lines: vec![],
        metre_type: metre,
        confidence: metre_hypotheses.first().map_or(0, |h| h.aggregate_score),
        provenance: metre_hypotheses
            .first()
            .map_or_else(Vec::new, |h| h.rule_ids.clone()),
        top_k_metre_hypotheses: metre_hypotheses,
        errors: vec![],
    })
}

#[wasm_bindgen]
pub fn parse_poem_wasm(text: &str) -> String {
    let mut options = ParseOptions::default();
    options.uyir_u = true;
    match parse_poem(text, options) {
        Ok(result) => {
            serde_json::to_string(&result).unwrap_or_else(|_| "Serialization error".to_string())
        }
        Err(e) => format!("Error: {}", e),
    }
}

fn normalize_text(text: &str, uyir_u: bool) -> String {
    let mut s = text.trim().to_string();
    s = s.replace(&['.', ',', ';', '!', '?', '(', ')', '—'][..], " ");
    if uyir_u {
        s = s.replace("கு உ", "கு(உ)").replace("று உ", "று(உ)");
    }
    s
}

#[cfg(test)]
mod tests {
    use super::*;
    use unicode_segmentation::UnicodeSegmentation;

    #[test]
    fn multiline_poem_pipeline_produces_stable_core_fields_and_structure() {
        let mut options = ParseOptions::default();
        options.alt_scansion = true;
        options.no_detect = true;

        let poem = "கற்றது! மொழிந்தது.\nஅறிந்தவர் சொல்லும் வழி;";
        let result = parse_poem(poem, options).expect("pipeline should parse");

        // Focus on the pipeline section: normalized -> graphemes -> units -> syllables.
        assert_eq!(result.normalized_text, "கற்றது  மொழிந்தது \nஅறிந்தவர் சொல்லும் வழி ");
        let expected_graphemes = result.normalized_text.graphemes(true).count();
        assert_eq!(result.letter_count, expected_graphemes);
        assert!(!result.syllables.is_empty());
        assert!(!result.feet.is_empty());
        assert_eq!(result.linkage.len(), result.feet.len().saturating_sub(1));
        assert_eq!(result.vikalpa_count, 1);

        // Visualize and validate actual transformed values for units and syllables.
        let graphemes: Vec<&str> = result.normalized_text.graphemes(true).collect();
        let units = letter::to_prosodic_units(&graphemes);
        let unit_texts: Vec<String> = units.iter().map(|u| u.text()).collect();
        let syllable_texts: Vec<String> = result.syllables.iter().map(|s| s.text.clone()).collect();
        let syllable_types: Vec<String> = result
            .syllables
            .iter()
            .map(|s| format!("{:?}", s.syllable_type))
            .collect();

        assert_eq!(graphemes.len(), 28);
        assert_eq!(&graphemes[..5], ["க", "ற்", "ற", "து", " "]);
        assert_eq!(unit_texts.len(), 21);
        assert_eq!(
            &unit_texts[..6],
            vec!["க", "ற்", "ற", "து", "மொ", "ழி"]
                .into_iter()
                .map(String::from)
                .collect::<Vec<_>>()
        );
        assert_eq!(
            syllable_texts,
            vec!["கற்", "றது", "மொழிந்", "தது", "அறிந்", "தவர்", "சொல்", "லும்", "வழி"]
                .into_iter()
                .map(String::from)
                .collect::<Vec<_>>()
        );
        assert!(
            syllable_types
                .iter()
                .all(|t| t == "Ner" || t == "Nirai"),
            "Only Ner/Nirai syllable types expected in current pipeline"
        );

        // Structural assertions on serialized result shape.
        let json = serde_json::to_value(&result).expect("result should serialize");
        assert!(json.get("normalized_text").is_some());
        assert!(json.get("syllables").and_then(|v| v.as_array()).is_some());
        assert!(json.get("feet").and_then(|v| v.as_array()).is_some());
        assert!(json.get("linkage").and_then(|v| v.as_array()).is_some());
    }

    #[test]
    fn linkage_carries_line_and_word_position_across_lines() {
        let mut options = ParseOptions::default();
        options.alt_scansion = true;
        options.no_detect = true;
        let poem = "கற்றது! மொழிந்தது.\nஅறிந்தவர் சொல்லும் வழி;";
        let result = parse_poem(poem, options).expect("parse");

        assert!(
            result.feet.len() >= 3,
            "sample should yield multiple feet; got {}",
            result.feet.len()
        );
        let boundary = result
            .linkage
            .iter()
            .find(|l| l.from.line_index != l.to.line_index);
        assert!(
            boundary.is_some(),
            "expected at least one linkage crossing lines; got {:?}",
            result.linkage
        );
        let b = boundary.unwrap();
        assert!(b.from.line_index < b.to.line_index);
        // Destination foot is the first word on its physical line (starts after prior line text).
        assert_eq!(b.to.word_index_in_line, 0);
        let first = serde_json::to_value(&result.linkage[0]).expect("json");
        assert!(json_has_foot_position_fields(&first));
    }

    fn json_has_foot_position_fields(linkage_json: &serde_json::Value) -> bool {
        linkage_json.get("from").map_or(false, |from| {
            from.get("line_index").is_some()
                && from.get("word_index_in_line").is_some()
                && from.get("foot_index").is_some()
        })
    }

    #[test]
    fn empty_input_returns_expected_error() {
        let err = parse_poem("   ", ParseOptions::default()).expect_err("must reject empty input");
        assert!(matches!(err, ParseError::EmptyInput));
    }
}
