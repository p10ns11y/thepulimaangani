//! Complementary வெண்பா checks beside the ML metre verdict.
//!
//! The four core rules (allowed seers, வெண்டளை, adi shape, ending seer) explain a poem.
//! They never change heuristic scores, the hybrid head, or `metre_ml`.

use crate::linkage::{Linkage, LinkageSpecialType, LinkageType};
use crate::metre::MetreType;
use crate::syllable::SyllableType;
use crate::types::{ClassicalRuleFinding, ClassicalRulesReport, Line};
use crate::Foot;

const KURIL_U_SIGN: char = '\u{0BC1}';

/// Venpaa rule findings plus whether they agree with the ML verdict.
pub fn evaluate_venpaa_rules(
    lines: &[Line],
    linkage: &[Linkage],
    ml_verdict: Option<&MetreType>,
) -> ClassicalRulesReport {
    let rules = vec![
        allowed_seers_rule(lines),
        ven_talai_rule(lines, linkage),
        adi_shape_rule(lines),
        last_seer_rule(lines),
    ];
    let all_passed = rules.iter().all(|finding| finding.passed);
    ClassicalRulesReport {
        rules,
        rules_agree_with_ml: rules_agree_with_ml(all_passed, ml_verdict),
    }
}

fn rules_agree_with_ml(all_passed: bool, ml_verdict: Option<&MetreType>) -> Option<bool> {
    match ml_verdict {
        Some(metre) => Some(all_passed == matches!(metre, MetreType::Venpaa)),
        None => None,
    }
}

fn finding(
    rule_id: &str,
    passed: bool,
    position: String,
    message_ta: &str,
) -> ClassicalRuleFinding {
    ClassicalRuleFinding {
        rule_id: rule_id.to_string(),
        passed,
        position,
        message_ta: message_ta.to_string(),
    }
}

fn indexed_seers(lines: &[Line]) -> Vec<(usize, usize, &Foot)> {
    let mut seers = Vec::new();
    for (line_index, line) in lines.iter().enumerate() {
        for (seer_index, foot) in line.feet.iter().enumerate() {
            seers.push((line_index, seer_index, foot));
        }
    }
    seers
}

/// ஈற்றுச்சீரைத் தவிர: ஈரசை மா/விளம், or காய் (three acai ending Ner). கனி is rejected.
fn is_allowed_body_seer(foot: &Foot) -> bool {
    let acai_count = foot.syllables.len();
    let last_acai = foot.syllables.last().map(|syllable| syllable.syllable_type);
    match (acai_count, last_acai) {
        (2, Some(SyllableType::Ner | SyllableType::Nirai)) => true,
        (3, Some(SyllableType::Ner)) => true,
        _ => false,
    }
}

fn allowed_seers_rule(lines: &[Line]) -> ClassicalRuleFinding {
    let seers = indexed_seers(lines);
    let body_len = seers.len().saturating_sub(1);
    for (line_index, seer_index, foot) in seers.into_iter().take(body_len) {
        if !is_allowed_body_seer(foot) {
            return finding(
                "venpaa_allowed_seers",
                false,
                format!("line:{line_index}/seer:{seer_index}"),
                "அனுமதி இல்லாத சீர்: ஈரசை மா/விளம் அல்லது காய் மட்டும்; கனி கூடாது.",
            );
        }
    }
    finding(
        "venpaa_allowed_seers",
        true,
        "poem".into(),
        "ஈற்றுச்சீரைத் தவிர ஈரசை மா/விளம் மற்றும் காய் மட்டும் உள்ளன.",
    )
}

fn is_ven_cir_bond(bond: &Linkage) -> bool {
    matches!(bond.linkage_type, LinkageType::VenTalai)
        && matches!(
            bond.linkage_special_type,
            LinkageSpecialType::IyarcirVenthalai | LinkageSpecialType::VencirVenthalai
        )
}

fn ven_talai_rule(lines: &[Line], linkage: &[Linkage]) -> ClassicalRuleFinding {
    let seer_total = lines.iter().map(|line| line.feet.len()).sum::<usize>();
    let expected_bonds = seer_total.saturating_sub(1);
    if linkage.len() != expected_bonds {
        return finding(
            "venpaa_ven_talai",
            false,
            "poem".into(),
            "வெண்டளை அல்லாத தளை உள்ளது. இயற்சீர் வெண்டளை அல்லது வெண்சீர் வெண்டளை வேண்டும்.",
        );
    }
    for (bond_index, bond) in linkage.iter().enumerate() {
        if !is_ven_cir_bond(bond) {
            return finding(
                "venpaa_ven_talai",
                false,
                format!("bond:{bond_index}"),
                "வெண்டளை அல்லாத தளை உள்ளது. இயற்சீர் வெண்டளை அல்லது வெண்சீர் வெண்டளை வேண்டும்.",
            );
        }
    }
    finding(
        "venpaa_ven_talai",
        true,
        "poem".into(),
        "எல்லாத் தளைகளும் வெண்டளை (இயற்சீர் / வெண்சீர்).",
    )
}

fn adi_shape_rule(lines: &[Line]) -> ClassicalRuleFinding {
    if lines.len() < 2 {
        return finding(
            "venpaa_adi_shape",
            false,
            "poem".into(),
            "ஈற்றடி சிந்தடியாகவும் ஏனைய அடி அளவடியாகவும் இல்லை.",
        );
    }
    let last_line_index = lines.len() - 1;
    for (line_index, line) in lines.iter().enumerate() {
        let expected_seers = if line_index == last_line_index { 3 } else { 4 };
        if line.feet.len() != expected_seers {
            return finding(
                "venpaa_adi_shape",
                false,
                format!("line:{line_index}"),
                "ஈற்றடி சிந்தடியாகவும் ஏனைய அடி அளவடியாகவும் இல்லை.",
            );
        }
    }
    finding(
        "venpaa_adi_shape",
        true,
        "poem".into(),
        "ஈற்றடி சிந்தடி; ஏனைய அடி அளவடி.",
    )
}

/// Exactly two characters: one Tamil consonant plus the short-உ sign (ு).
fn is_single_consonant_kuril_u(text: &str) -> bool {
    let mut chars = text.chars();
    match (chars.next(), chars.next(), chars.next()) {
        (Some(consonant), Some(vowel_sign), None) => {
            vowel_sign == KURIL_U_SIGN && ('\u{0B95}'..='\u{0BB9}').contains(&consonant)
        }
        _ => false,
    }
}

/// நாள் / மலர் are a single asai. காசு (நேர்பு) and பிறப்பு (நிரைபு) need exactly two asai,
/// with the last asai நேர் whose text is one consonant plus ு. Any other shape fails.
pub fn venpaa_ending_seer_name(foot: &Foot) -> Option<&'static str> {
    match foot.syllables.as_slice() {
        [only] => match only.syllable_type {
            SyllableType::Ner => Some("நாள்"),
            SyllableType::Nirai => Some("மலர்"),
        },
        [first, last]
            if last.syllable_type == SyllableType::Ner && is_single_consonant_kuril_u(&last.text) =>
        {
            match first.syllable_type {
                SyllableType::Ner => Some("காசு"),
                SyllableType::Nirai => Some("பிறப்பு"),
            }
        }
        _ => None,
    }
}

fn ending_handle(name: &str) -> &'static str {
    match name {
        "காசு" => "நேர்பு",
        "பிறப்பு" => "நிரைபு",
        "நாள்" => "நேர்",
        "மலர்" => "நிரை",
        _ => "",
    }
}

fn last_seer_rule(lines: &[Line]) -> ClassicalRuleFinding {
    let Some((line_index, seer_index, foot)) = indexed_seers(lines).into_iter().last() else {
        return finding(
            "venpaa_last_seer",
            false,
            "poem".into(),
            "ஈற்றுச்சீர் நாள், மலர், காசு, பிறப்பு ஆகியவற்றுள் இல்லை.",
        );
    };
    let position = format!("line:{line_index}/seer:{seer_index}");
    match venpaa_ending_seer_name(foot) {
        Some(name) => finding(
            "venpaa_last_seer",
            true,
            position,
            &format!("ஈற்றுச்சீர் {name} ({}).", ending_handle(name)),
        ),
        None => finding(
            "venpaa_last_seer",
            false,
            position,
            "ஈற்றுச்சீர் நாள், மலர், காசு, பிறப்பு ஆகியவற்றுள் இல்லை.",
        ),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::metre::MetreType;
    use crate::parse_poem;
    use crate::syllable::{Syllable, SyllableType};
    use crate::types::ParseOptions;
    use crate::Foot;

    const THIRUKKURAL_1: &str = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு";
    const THIRUKKURAL_1_ULAKAME: &str = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகமே";

    fn product_options() -> ParseOptions {
        let mut options = ParseOptions::default();
        options.uyir_u = true;
        options
    }

    fn syllable(text: &str, syllable_type: SyllableType) -> Syllable {
        Syllable {
            text: text.into(),
            syllable_type,
            split_hint: None,
            alt_split: false,
            rule_ref: None,
            line_index: 0,
            word_index_in_line: 0,
        }
    }

    fn foot_of(syllables: Vec<Syllable>) -> Foot {
        Foot {
            syllables,
            foot_type: String::new(),
            foot_index_global: None,
        }
    }

    fn rule<'a>(report: &'a ClassicalRulesReport, rule_id: &str) -> &'a ClassicalRuleFinding {
        report
            .rules
            .iter()
            .find(|finding| finding.rule_id == rule_id)
            .unwrap_or_else(|| panic!("missing rule {rule_id}"))
    }

    #[test]
    fn ending_seer_names_cover_naal_malar_kaasu_pirappu() {
        assert_eq!(
            venpaa_ending_seer_name(&foot_of(vec![syllable("கல்", SyllableType::Ner)])),
            Some("நாள்")
        );
        assert_eq!(
            venpaa_ending_seer_name(&foot_of(vec![syllable("மலர்", SyllableType::Nirai)])),
            Some("மலர்")
        );
        assert_eq!(
            venpaa_ending_seer_name(&foot_of(vec![
                syllable("ஆ", SyllableType::Ner),
                syllable("கு", SyllableType::Ner),
            ])),
            Some("காசு")
        );
        assert_eq!(
            venpaa_ending_seer_name(&foot_of(vec![
                syllable("உல", SyllableType::Nirai),
                syllable("கு", SyllableType::Ner),
            ])),
            Some("பிறப்பு")
        );
        assert_eq!(
            venpaa_ending_seer_name(&foot_of(vec![
                syllable("உல", SyllableType::Nirai),
                syllable("கமே", SyllableType::Nirai),
            ])),
            None
        );
    }

    fn ending_name_of_single_word(word: &str) -> Option<&'static str> {
        let mut options = product_options();
        options.no_detect = true;
        let result = parse_poem(word, options).expect("parse");
        let foot = result
            .lines
            .first()
            .and_then(|line| line.feet.first())
            .expect("one seer");
        venpaa_ending_seer_name(foot)
    }

    #[test]
    fn nerpu_niraipu_only_when_two_asai_and_last_is_single_consonant_u() {
        assert_eq!(ending_name_of_single_word("உலகு"), Some("பிறப்பு"));
        assert_eq!(ending_name_of_single_word("பசு"), Some("மலர்"));
        assert_eq!(ending_name_of_single_word("தேமாங்கு"), None);
        assert_eq!(ending_name_of_single_word("கருவிளங்கு"), None);
        assert_eq!(ending_name_of_single_word("மலர்படு"), None);
    }

    #[test]
    fn one_adi_fails_line_shape_and_agreement_is_not_true() {
        let result = parse_poem("பகவன் முதற்றே உலகு", product_options()).expect("parse");
        assert_eq!(result.lines.len(), 1);
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
        assert!(!rule(&result.classical_rules, "venpaa_adi_shape").passed);
        assert_ne!(result.classical_rules.rules_agree_with_ml, Some(true));
    }

    #[test]
    fn thirukkural_1_rules_pass_last_seer_pirappu_and_agree_with_ml() {
        let result = parse_poem(THIRUKKURAL_1, product_options()).expect("parse");
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
        assert_eq!(result.lines[0].line_class, "Alavadi");
        assert_eq!(result.lines[1].line_class, "Cinthadi");
        assert_eq!(result.poem.lines[0].line_class, "Alavadi");
        assert_eq!(result.poem.lines[1].line_class, "Cinthadi");

        let report = &result.classical_rules;
        assert_eq!(
            report
                .rules
                .iter()
                .map(|finding| finding.rule_id.as_str())
                .collect::<Vec<_>>(),
            vec![
                "venpaa_allowed_seers",
                "venpaa_ven_talai",
                "venpaa_adi_shape",
                "venpaa_last_seer",
            ]
        );
        assert!(report.rules.iter().all(|finding| finding.passed));
        let last_seer = rule(report, "venpaa_last_seer");
        assert!(last_seer.message_ta.contains("பிறப்பு"));
        assert!(last_seer.message_ta.contains("நிரைபு"));
        assert_eq!(last_seer.position, "line:1/seer:2");
        assert_eq!(report.rules_agree_with_ml, Some(true));

        let ml = result.metre_ml.as_ref().expect("ml surface");
        assert_eq!(ml.dual_truth.ml_metre_type.as_deref(), Some("Venpaa"));
        assert_eq!(result.confidence, 100);
    }

    #[test]
    fn ulakame_fails_last_seer_and_disagrees_while_ml_stays_venpaa() {
        let result = parse_poem(THIRUKKURAL_1_ULAKAME, product_options()).expect("parse");
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
        assert_eq!(result.confidence, 100);
        let ml = result.metre_ml.as_ref().expect("ml surface");
        assert_eq!(ml.dual_truth.ml_metre_type.as_deref(), Some("Venpaa"));
        assert_eq!(ml.dual_truth.classical_ok_for_ml_top, Some(true));
        assert!(ml.dual_truth.classical_violations.is_empty());
        assert_eq!(
            result
                .top_k_metre_hypotheses
                .first()
                .map(|hypothesis| &hypothesis.metre_type),
            Some(&MetreType::Venpaa)
        );

        let report = &result.classical_rules;
        assert!(!rule(report, "venpaa_last_seer").passed);
        assert_eq!(rule(report, "venpaa_last_seer").position, "line:1/seer:2");
        assert!(rule(report, "venpaa_allowed_seers").passed);
        assert!(rule(report, "venpaa_ven_talai").passed);
        assert!(rule(report, "venpaa_adi_shape").passed);
        assert_eq!(report.rules_agree_with_ml, Some(false));
    }

    #[test]
    fn agreement_is_null_when_metre_detection_is_off() {
        let mut options = product_options();
        options.no_detect = true;
        let result = parse_poem(THIRUKKURAL_1, options).expect("parse");
        assert_eq!(result.metre_type, None);
        assert!(result.metre_ml.is_none());
        assert!(result
            .classical_rules
            .rules
            .iter()
            .all(|finding| finding.passed));
        assert_eq!(result.classical_rules.rules_agree_with_ml, None);
    }
}
