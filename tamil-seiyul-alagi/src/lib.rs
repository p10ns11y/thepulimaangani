mod error;
mod foot;
mod foot_pattern;
mod letter;
mod line_scope;
mod linkage;
pub mod metre;
/// S00 ontology map — public catalog + exhaustiveness (see `data/training/reports/ontology_map.md`).
pub mod ontology_map;
mod parse_features;
/// S01 semantics contract — dense glossary / gold / score pins (see `data/training/reports/semantics_contract.md`).
pub mod semantics_contract;
/// S02 anthology inventory — corpus counts / split / export pins (see `data/training/reports/anthology_inventory.md`).
pub mod anthology_inventory;
/// S03 SOA ledger — composite ontology + semantics + anthology fingerprint (see `data/training/reports/soa_ledger.md`).
pub mod soa_ledger;
mod poem_variations;
mod poem_variations_training;
mod poem_tree;
mod presentation;
mod prosodic_sequence;
mod prosodic_unit;
mod syllable;
mod syllable_builder;
mod tamil_chars;
pub mod types;
mod word_scope;

pub use prosodic_sequence::ProsodicSequence;

use wasm_bindgen::prelude::*;

pub use error::ParseError;
pub use foot::{Foot, FootPlacement};
pub use foot_pattern::foot_pattern;
pub use letter::Letter;
pub use linkage::{
    CirAcaiClass, FootPosition, Linkage, LinkageSpecialType, LinkageType, Talai, TalaiType,
};
pub use metre::{
    boost_metre_hypotheses_with_dense, classical_violations_for_metre, detect_metre_hypotheses,
    linkage_coarse_fractions, ml_head, sort_metre_hypotheses_by_score, MetreType,
};
pub use ontology_map::{
    ontology_cir_class_ids, ontology_dual_truth_channel_ids, ontology_issue36_bond_table_len,
    ontology_linkage_special_ids, ontology_linkage_type_fixed_ids, ontology_metre_type_fixed_ids,
    ontology_structural_entity_ids, ontology_syllable_type_ids, ONTOLOGY_MAP_VERSION,
};
pub use parse_features::{
    fnv1a_u32, ParseFeatureSource, ParseFeatureVector, FOOT_PATTERN_BIN_DIM, FOOT_PATTERN_BIN_OFFSET,
    GLOBAL_FEATURE_DIM, GLOBAL_FEATURE_OFFSET, LINE_FOOT_HIST_FEATURE_DIM, LINE_FOOT_HIST_OFFSET,
    LINKAGE_TYPE_FEATURE_DIM, LINKAGE_TYPE_FEATURE_OFFSET, LINK_SPECIAL_FEATURE_DIM,
    LINK_SPECIAL_FEATURE_OFFSET, PARSE_FEATURE_DENSE_LEN, PARSE_FEATURE_SCHEMA_VERSION,
};
pub use semantics_contract::{
    dense_block_lengths_v1, dense_global_feature_ids, dense_linkage_special_slot_ids,
    dense_linkage_type_slot_ids, gold_parent_metre_slugs, score_scale_ids, SEMANTICS_CONTRACT_VERSION,
};
pub use anthology_inventory::{
    anthology_block_counts, anthology_class_balance_special_type, anthology_export_csv_path,
    anthology_export_jsonl_path, anthology_forbidden_training_use_ids, anthology_js_mirror_path,
    anthology_kural_fixture_role, anthology_kural_golden_fixture_path,
    anthology_mc_special_type_eval_count, anthology_primary_gold_row_kind,
    anthology_sample_parent_metre, anthology_special_type_count, anthology_stress_only_row_kind,
    anthology_total_row_count, anthology_variation_count, ANTHOLOGY_INVENTORY_VERSION,
};
pub use soa_ledger::{
    soa_classical_checker_active, soa_corpus_fingerprints, soa_dual_truth_channel_ids,
    soa_primary_gold_row_kind, soa_report_paths, soa_schema_fingerprint_string, soa_schema_ids,
    soa_stress_only_row_kind, SOA_LEDGER_VERSION,
};
pub use poem_variations::{
    poem_variation_example, poem_variations_blocks, poem_variations_for_metre, tamil_label_for_sample,
    variation_row, PoemVariationRow, PoemVariationsBlock, ACIRIYAPPA, KALIPPAA, VANJIPPAA, VENPAA,
};
pub use presentation::{
    foot_pattern_display, foot_pattern_labels, DisplayFoot, DisplayResult, DisplaySyllable, DisplayTalai,
};
pub use poem_variations_training::{
    aggregate_metre_monte_carlo, build_training_rows, gold_metre_label_for_parent,
    gold_metre_type_for_parent, parse_label_row_for_eval, poem_variation_label_rows,
    poem_variation_rows_by_kinds, poem_variation_special_type_rows, shuffle_labels_for_iteration,
    write_poem_variations_training_csv, MetreMonteCarloAggregate, PoemVariationLabelRow,
    PoemVariationTrainingRow,
};
pub use poem_tree::{
    LetterLayer, LetterNode, LinguisticWordNode, LineLayer, PoemLayer, PoemLineNode, PoemNode,
    SyllableLayer, SyllableNode, WordLayer, WordNode,
};
pub use prosodic_unit::{Consonant, ProsodicUnit, Vowel};
pub use syllable::{Syllable, SyllableType};
pub use syllable_builder::SyllableBuilder;
pub use types::{
    flat_lines_from_poem, MetreHypothesis, ParseFeatureSnapshot, ParseOptions, ParseResult,
    RuleId, PARSE_RESULT_SCHEMA_VERSION,
};

use unicode_segmentation::UnicodeSegmentation;

pub fn parse_poem(text: &str, options: ParseOptions) -> Result<ParseResult, ParseError> {
    if text.trim().is_empty() {
        return Err(ParseError::EmptyInput);
    }

    let normalized = normalize_text(text, options.uyir_u);

    //  read: https://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundaries
    let graphemes: Vec<&str> = normalized.graphemes(true).collect();
    let normalized_clone = normalized.clone();

    let syllables = word_scope::segment_syllables_from_normalized(&normalized_clone, options.alt_scansion);
    let syllable_lines = line_scope::syllable_line_indices(&normalized_clone, &syllables)
        .unwrap_or_else(|| vec![0; syllables.len()]);
    let foot_placements = foot::group_into_feet_with_ranges(&syllables);
    let mut feet: Vec<Foot> = foot_placements.iter().map(|p| p.foot.clone()).collect();
    for (i, f) in feet.iter_mut().enumerate() {
        f.foot_index_global = Some(i);
    }
    let foot_positions = linkage::foot_positions_for_poem(&foot_placements, &syllable_lines);
    let linkage = linkage::analyze_linkage(&foot_positions, &feet);
    let poem = poem_tree::build_poem_tree(
        normalized_clone.clone(),
        &syllables,
        &foot_positions,
        &foot_placements,
        linkage.clone(),
    );
    let lines = types::flat_lines_from_poem(&poem);
    let mut metre_hypotheses = metre::detect_metre_hypotheses(&feet, &linkage, options.no_detect);

    let mut metre_entropy_bits = None;
    let mut metre_epistemic_margin = None;
    let parse_features = if !options.no_detect {
        let fv = ParseFeatureVector::from_pipeline(ParseFeatureSource {
            letter_count: graphemes.len(),
            vikalpa_count: if options.alt_scansion { 1 } else { 0 },
            lines: &lines,
            syllables: &syllables,
            feet: &feet,
            linkage: &linkage,
        });
        if !metre_hypotheses.is_empty() {
            metre::boost_metre_hypotheses_with_dense(&mut metre_hypotheses, &fv.dense);
            metre::sort_metre_hypotheses_by_score(&mut metre_hypotheses);
            if !options.skip_ml_metre && metre::ml_head::hybrid_head_is_active(metre::ml_head::shipped_hybrid_metre_head())
            {
                if let Some((_, ent, mar)) = metre::ml_head::apply_hybrid_metre_head(
                    metre::ml_head::shipped_hybrid_metre_head(),
                    &fv.dense,
                    &mut metre_hypotheses,
                    15.0,
                ) {
                    metre::sort_metre_hypotheses_by_score(&mut metre_hypotheses);
                    metre_entropy_bits = Some(ent);
                    metre_epistemic_margin = Some(mar);
                    for h in &mut metre_hypotheses {
                        if h.metre_rank == Some(1) {
                            let mut ids = h.rule_ids.clone();
                            if !ids
                                .iter()
                                .any(|r| matches!(r, RuleId::Other(s) if s == "MetreHybridLogit01"))
                            {
                                ids.push(RuleId::Other("MetreHybridLogit01".into()));
                            }
                            h.rule_ids = ids;
                        }
                    }
                }
            }
        }
        Some(fv.into_snapshot())
    } else {
        None
    };

    let metre = metre_hypotheses.first().map(|h| h.metre_type.clone());

    Ok(ParseResult {
        parse_result_schema_version: types::PARSE_RESULT_SCHEMA_VERSION,
        original_text: text.to_string(),
        normalized_text: normalized_clone,
        letter_count: graphemes.len(),
        vikalpa_count: if options.alt_scansion { 1 } else { 0 },
        poem,
        syllables: syllables.clone(),
        feet: feet.clone(),
        talai: linkage.clone(),
        linkage: linkage.clone(),
        lines,
        metre_type: metre.clone(),
        confidence: metre_hypotheses.first().map_or(0, |h| h.aggregate_score),
        metre_entropy_bits,
        metre_epistemic_margin,
        provenance: metre_hypotheses
            .first()
            .map_or_else(Vec::new, |h| h.rule_ids.clone()),
        top_k_metre_hypotheses: metre_hypotheses,
        parse_features,
        presentation: presentation::to_display(text, &metre, &syllables, &feet, &linkage),
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
    fn metre_detection_applies_parse_feature_boost_for_sample_kural_venpaa() {
        let text = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";
        let mut o = ParseOptions::default();
        o.skip_ml_metre = true;
        let r = parse_poem(text, o).expect("parse");
        assert_eq!(r.metre_type, Some(MetreType::Venpaa));
        let h = &r.top_k_metre_hypotheses[0];
        assert!(
            h.aggregate_score > 75,
            "expected linkage feature boost above rule prior 75, got {}",
            h.aggregate_score
        );
        assert!(
            h.rule_ids.iter().any(|rid| {
                matches!(rid, RuleId::Other(s) if s == "MetreParseFeatures01")
            }),
            "expected MetreParseFeatures01 in rule_ids, got {:?}",
            h.rule_ids
        );
    }

    #[test]
    fn parse_result_sets_schema_version_and_global_foot_indices() {
        let r = parse_poem("கற்றது", ParseOptions::default()).expect("parse");
        assert_eq!(r.parse_result_schema_version, types::PARSE_RESULT_SCHEMA_VERSION);
        assert!(!r.feet.is_empty());
        assert!(r
            .feet
            .iter()
            .enumerate()
            .all(|(i, f)| f.foot_index_global == Some(i)));
    }

    #[test]
    fn parse_result_includes_parse_features_when_metre_on() {
        let r = parse_poem("கற்றது", ParseOptions::default()).expect("parse");
        let pf = r.parse_features.as_ref().expect("parse_features");
        assert_eq!(pf.schema_version, PARSE_FEATURE_SCHEMA_VERSION);
        assert_eq!(pf.dense.len(), PARSE_FEATURE_DENSE_LEN);
        let json = serde_json::to_value(&r).expect("json");
        assert!(json.get("parse_features").is_some());
    }

    #[test]
    fn parse_result_omits_parse_features_when_no_detect() {
        let mut o = ParseOptions::default();
        o.no_detect = true;
        let r = parse_poem("கற்றது", o).expect("parse");
        assert!(r.parse_features.is_none());
    }

    #[test]
    fn metre_hypotheses_list_has_four_sorted_entries() {
        let text = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";
        let r = parse_poem(text, ParseOptions::default()).expect("parse");
        assert_eq!(r.top_k_metre_hypotheses.len(), 4);
        for i in 0..r.top_k_metre_hypotheses.len().saturating_sub(1) {
            assert!(
                r.top_k_metre_hypotheses[i].aggregate_score
                    >= r.top_k_metre_hypotheses[i + 1].aggregate_score
            );
        }
    }

    /// `skip_ml_metre` must suppress hybrid-only fields and ML-tagged provenance while keeping heuristics.
    #[test]
    fn skip_ml_metre_skips_hybrid_outputs_but_keeps_metre_detection() {
        let text = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";
        let mut skip = ParseOptions::default();
        skip.skip_ml_metre = true;
        skip.uyir_u = true;
        let r_skip = parse_poem(text, skip).expect("parse");
        assert!(r_skip.metre_type.is_some());
        assert!(r_skip.metre_entropy_bits.is_none());
        assert!(r_skip.metre_epistemic_margin.is_none());
        for h in &r_skip.top_k_metre_hypotheses {
            assert!(h.metre_probability.is_none());
            assert!(h.metre_rank.is_none());
        }
        assert!(
            !r_skip
                .provenance
                .iter()
                .any(|rid| matches!(rid, RuleId::Other(s) if s == "MetreHybridLogit01")),
            "skip_ml_metre should not add MetreHybridLogit01"
        );

        let mut full = ParseOptions::default();
        full.uyir_u = true;
        let r_full = parse_poem(text, full).expect("parse");
        assert!(
            metre::ml_head::hybrid_head_is_active(metre::ml_head::shipped_hybrid_metre_head()),
            "CI expects fitted hybrid weights"
        );
        assert!(
            r_full.metre_entropy_bits.is_some(),
            "with hybrid active, entropy should be set"
        );
        assert!(r_full.metre_epistemic_margin.is_some());
        assert!(
            r_full.top_k_metre_hypotheses.iter().all(|h| {
                h.metre_probability.is_some() && h.metre_rank.is_some()
            }),
            "each hypothesis should carry hybrid probability and rank"
        );
    }

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
        assert!(json.get("presentation").is_some());
        assert!(json.get("poem").is_some());
        assert!(json.get("parse_features").is_none());

        let poem = &result.poem;
        assert!(!poem.lines.is_empty(), "hierarchical poem should have at least one line");
        let tree_syllable_count: usize = poem
            .lines
            .iter()
            .flat_map(|ln| ln.words.iter())
            .flat_map(|w| w.syllables.iter())
            .count();
        assert_eq!(tree_syllable_count, result.syllables.len());
        assert_eq!(result.lines.len(), poem.lines.len());

        let lw0 = &poem.lines[0].linguistic_words;
        assert!(
            lw0.len() >= 2,
            "first line should have multiple linguistic words from spaces"
        );
        assert!(
            lw0.iter().all(|w| !w.syllables.is_empty()),
            "each linguistic word should have syllables"
        );
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
    fn legacy_flat_lines_include_feet_on_every_physical_line_when_tree_words_sparse() {
        let mut options = ParseOptions::default();
        options.alt_scansion = true;
        options.no_detect = true;
        options.uyir_u = true;

        let poem = "சுடர்த்தொடீஇ கேளாய் தெருவில்நாம்\nமணற்சிற்றில் காலில் சிதையா அடை\nகோதை பரிந்து வரிப்பந்து கொண்டோ\n";
        let result = parse_poem(poem, options).expect("parse");

        assert_eq!(result.lines.len(), result.poem.lines.len());
        for (i, ln) in result.lines.iter().enumerate() {
            assert!(
                !ln.feet.is_empty(),
                "legacy Line {} must carry feet (was collapsing entire poem into line 0 when poem.lines[].words was empty)",
                i
            );
        }
        let syllables_line0: usize = result.lines[0].feet.iter().map(|f| f.syllables.len()).sum();
        let total_in_lines: usize = result
            .lines
            .iter()
            .map(|ln| ln.feet.iter().map(|f| f.syllables.len()).sum::<usize>())
            .sum();
        assert_eq!(
            total_in_lines,
            result.syllables.len(),
            "legacy lines should account for all syllables once"
        );
        assert!(
            syllables_line0 < result.syllables.len(),
            "first line must not contain every syllable in the poem (line0={} total={})",
            syllables_line0,
            result.syllables.len()
        );
    }

    #[test]
    fn empty_input_returns_expected_error() {
        let err = parse_poem("   ", ParseOptions::default()).expect_err("must reject empty input");
        assert!(matches!(err, ParseError::EmptyInput));
    }
}
