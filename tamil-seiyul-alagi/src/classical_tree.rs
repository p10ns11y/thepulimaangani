//! First-match classical decision tree beside the ML metre verdict.
//!
//! Order: வெண்பா, ஆசிரியப்பா, தரவுகொச்சகக் கலிப்பா, வெண்கலிப்பா, வஞ்சிப்பா,
//! then the four பாவினம் families. A miss falls through. Nothing here writes
//! heuristic scores, the hybrid head, or `metre_ml`.

use unicode_segmentation::UnicodeSegmentation;

use crate::classical_rules::venpaa_ending_seer_name;
use crate::linkage::{cir_class_for_foot, CirAcaiClass, Linkage, LinkageType};
use crate::metre::MetreType;
use crate::syllable::SyllableType;
use crate::types::{ClassicalTreeCheck, ClassicalTreeReport, Line};
use crate::Foot;

/// Avalokitam's "மிகுந்து" cutoff for இயற்சீர், ஆசிரியத்தளை, கலித்தளை, கனிச்சீர், வஞ்சித்தளை.
pub const MAJORITY_PERCENT: usize = 40;
/// வெண்கலிப்பா: கலித்தளை and வெண்டளை together.
pub const VENKALI_COMBINED_TALAI_PERCENT: usize = 50;
/// வெண்கலிப்பா: கலித்தளை alone.
pub const VENKALI_KALI_TALAI_FLOOR_PERCENT: usize = 25;
/// கலிவெண்பா keeps a வெண்டளை mass when one line is not a strict அளவடி.
pub const KALIVENPAA_VEN_TALAI_PERCENT: usize = 90;
/// Site text says மேற்கதுவாய் is seers 1, 2, 3. The classical seats are 1, 3, 4.
pub const MERKATHUVAI_SEER_POSITIONS: [usize; 3] = [1, 3, 4];
/// அளவடி is four seers. The site sometimes uses the word for a line in general.
pub const ALAVADI_SEER_COUNT: usize = 4;
const CINTHADI_SEER_COUNT: usize = 3;
const KURALADI_SEER_COUNT: usize = 2;
const NEDILADI_SEER_COUNT: usize = 5;
const KAZHINEDILADI_MIN_SEERS: usize = 6;
const PAQRODAI_MIN_LINES: usize = 5;
const PAQRODAI_MAX_LINES: usize = 12;
const KALIVENPAA_MIN_LINES: usize = 13;
const VANJI_MIN_ADIS: usize = 3;
const SURITHAGAM_MIN_LINES: usize = 2;
const VENDURAI_MIN_LINES: usize = 3;
const VENDURAI_MAX_LINES: usize = 7;
/// கட்டளைக்கலிப்பா அரையடி: நேர் தொடக்கம் 11, நிரை தொடக்கம் 12, மெய்யொழித்து.
const KATTALAI_KALIPPAA_NER_LETTER_COUNT: usize = 11;
const KATTALAI_KALIPPAA_NIRAI_LETTER_COUNT: usize = 12;
/// கட்டளைக்கலித்துறை அடி: நேர் தொடக்கம் 16, நிரை தொடக்கம் 17, மெய்யொழித்து.
const KATTALAI_KALITHURAI_NER_LETTER_COUNT: usize = 16;
const KATTALAI_KALITHURAI_NIRAI_LETTER_COUNT: usize = 17;

#[derive(Clone, Copy)]
struct Leaf {
    id: &'static str,
    family_ta: &'static str,
    subtype_ta: &'static str,
    paavinam_ta: &'static str,
    label_ta: &'static str,
    ml_family: MlFamily,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum MlFamily {
    Venpaa,
    Aciriyappaa,
    Kalippaa,
    Vanjippaa,
}

struct PoemView<'a> {
    source: &'a str,
    lines: &'a [Line],
    linkage: &'a [Linkage],
}

/// Classify one poem. `source` is the normalized text (dashes kept, punctuation spaced).
pub fn evaluate_classical_tree(
    source: &str,
    lines: &[Line],
    linkage: &[Linkage],
    ml_verdict: Option<&MetreType>,
) -> ClassicalTreeReport {
    let view = PoemView {
        source,
        lines,
        linkage,
    };
    let mut path = Vec::new();
    let leaf = try_venpaa(&view, &mut path)
        .or_else(|| try_aciriyapaa(&view, &mut path))
        .or_else(|| try_tharavu_kochaga(&view, &mut path))
        .or_else(|| try_venkalippaa(&view, &mut path))
        .or_else(|| try_vanjippaa(&view, &mut path))
        .or_else(|| try_venpaavinam(&view, &mut path))
        .or_else(|| try_aciriya_paavinam(&view, &mut path))
        .or_else(|| try_kali_paavinam(&view, &mut path))
        .or_else(|| try_vanji_paavinam(&view, &mut path));
    if leaf.is_none() {
        path.push(check(
            "no_rule_fitted",
            false,
            "எந்த விதியும் பொருந்தவில்லை.",
        ));
    } else if let Some(note) = merkathuvai_note(view.lines) {
        path.push(check("thodai_merkathuvai", true, &note));
    }
    report_for(leaf, path, ml_verdict)
}

fn try_venpaa(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if kalivenpaa_long_osai(view, &counts) && !strict_venpaa(view, &counts) {
        path.push(check(
            "kalivenpaa_long_ven_osai",
            true,
            "பன்னிரண்டு அடிக்கு மேல்; ஈற்றடி சிந்தடி; வெண்டளை 90%க்கு மேல்; கனிச்சீர் இல்லை.",
        ));
        return Some(leaf_venpaa(
            "kalivenpaa",
            "கலிவெண்பா",
            "கலிவெண்பா",
        ));
    }
    let shape_ok = venpaa_shape(&counts);
    let seers_ok = allowed_body_seers(view.lines);
    let talai_ok = all_bonds_ven(view.linkage);
    let ending_ok = poem_ending_seer(view.lines).is_some();
    let strict = shape_ok && seers_ok && talai_ok && ending_ok;
    if !strict {
        path.push(check(
            "venpaa_core",
            false,
            &format!(
                "வெண்பா பொருந்தவில்லை (அடி வடிவம் {shape_ok}, அனுமதி சீர் {seers_ok}, வெண்டளை {talai_ok}, ஈற்றுச்சீர் {ending_ok})."
            ),
        ));
        return None;
    }
    path.push(check(
        "venpaa_core",
        true,
        "ஈரசை மா/விளம் மற்றும் காய், வெண்டளை, ஈற்றடி சிந்தடி, ஈற்றுச்சீர் நாள்/மலர்/காசு/பிறப்பு.",
    ));
    let vikarpam = vikarpam_run_count(view.lines);
    let has_tanichol = etukai_tanichol(view.source, view.lines).is_some();
    path.push(check(
        "venpaa_vikarpam",
        true,
        &format!("விகற்பம் {vikarpam}."),
    ));
    path.push(check(
        "venpaa_tanichol",
        true,
        if has_tanichol {
            "எதுகை அமைந்த தனிச்சொல் உள்ளது."
        } else {
            "எதுகை அமைந்த தனிச்சொல் இல்லை."
        },
    ));
    let subtype = match counts.len() {
        2 if vikarpam <= 1 => ("oru_vikarpa_kural_venpaa", "ஒரு விகற்ப குறள் வெண்பா"),
        2 => ("iru_vikarpa_kural_venpaa", "இரு விகற்ப குறள் வெண்பா"),
        3 if has_tanichol && vikarpam <= 2 => ("nerisai_sinthiyal_venpaa", "நேரிசை சிந்தியல் வெண்பா"),
        3 => ("inisai_sinthiyal_venpaa", "இன்னிசை சிந்தியல் வெண்பா"),
        4 if has_tanichol && vikarpam <= 1 => {
            ("oru_vikarpa_nerisai_venpaa", "ஒரு விகற்ப நேரிசை வெண்பா")
        }
        4 if has_tanichol && vikarpam == 2 => {
            ("iru_vikarpa_nerisai_venpaa", "இரு விகற்ப நேரிசை வெண்பா")
        }
        4 if vikarpam <= 1 => ("oru_vikarpa_inisai_venpaa", "ஒரு விகற்ப இன்னிசை வெண்பா"),
        4 => ("pala_vikarpa_inisai_venpaa", "பல விகற்ப இன்னிசை வெண்பா"),
        line_count if (PAQRODAI_MIN_LINES..=PAQRODAI_MAX_LINES).contains(&line_count) => {
            ("paqrodai_venpaa", "பஃறொடை வெண்பா")
        }
        _ => ("kalivenpaa", "கலிவெண்பா"),
    };
    path.push(check(
        "venpaa_line_count",
        true,
        &format!("{} அடி; {}.", counts.len(), subtype.1),
    ));
    Some(leaf_venpaa(subtype.0, subtype.1, subtype.1))
}

fn try_aciriyapaa(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if counts.len() < 3 {
        path.push(check(
            "aciriya_min_lines",
            false,
            "ஆசிரியப்பாவுக்கு குறைந்தபட்சம் மூன்று அடி வேண்டும்.",
        ));
        return None;
    }
    let feet = content_feet(view.lines);
    let iyar = feet
        .iter()
        .filter(|foot| matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Maa | CirAcaiClass::Vilam)))
        .count();
    if !share_above(iyar, feet.len(), MAJORITY_PERCENT) {
        path.push(check(
            "aciriya_iyar_cir",
            false,
            "இயற்சீர் 40%க்கு மேல் இல்லை.",
        ));
        return None;
    }
    let aciriya_bonds = count_bonds(view.linkage, LinkageType::AciriyaTalai);
    if !share_above(aciriya_bonds, view.linkage.len(), MAJORITY_PERCENT) {
        path.push(check(
            "aciriya_talai",
            false,
            "ஆசிரியத்தளை 40%க்கு மேல் இல்லை.",
        ));
        return None;
    }
    let ending_text = last_syllable_text(view.lines);
    if !aciriya_ending(&ending_text) {
        path.push(check(
            "aciriya_ending",
            false,
            "ஈற்றசை ஏ, ஓ, ஈ, ஆய், ஐ அல்லது என் என்று முடியவில்லை.",
        ));
        return None;
    }
    if feet.iter().any(|foot| is_forbidden_aciriya_foot(foot)) {
        path.push(check(
            "aciriya_forbidden_feet",
            false,
            "கருவிளங்கனி அல்லது கூவிளங்கனி வந்துள்ளது.",
        ));
        return None;
    }
    if counts.iter().any(|count| *count > ALAVADI_SEER_COUNT) {
        path.push(check(
            "aciriya_max_seers",
            false,
            "அளவடியை விட நீண்ட அடி உள்ளது.",
        ));
        return None;
    }
    let first = counts[0];
    let last = *counts.last().unwrap_or(&0);
    if first < ALAVADI_SEER_COUNT || last < ALAVADI_SEER_COUNT {
        path.push(check(
            "aciriya_edge_lines",
            false,
            "முதலடியும் ஈற்றடியும் அளவடியாக இல்லை.",
        ));
        return None;
    }
    if counts.iter().skip(1).take(counts.len().saturating_sub(2)).any(|count| {
        *count < ALAVADI_SEER_COUNT && *count != CINTHADI_SEER_COUNT && *count != KURALADI_SEER_COUNT
    }) {
        path.push(check(
            "aciriya_short_middles",
            false,
            "இடையே குறளடி அல்லது சிந்தடி அல்லாத குறுகிய அடி உள்ளது.",
        ));
        return None;
    }
    let short_indexes: Vec<usize> = counts
        .iter()
        .enumerate()
        .filter(|(_, count)| **count < ALAVADI_SEER_COUNT)
        .map(|(index, _)| index)
        .collect();
    let penultimate = counts.len() - 2;
    let (id, label) = if short_indexes.is_empty() {
        ("nilaimandila_aciriyappaa", "நிலைமண்டில ஆசிரியப்பா")
    } else if short_indexes.as_slice() == [penultimate] {
        ("nerisai_aciriyappaa", "நேரிசை ஆசிரியப்பா")
    } else {
        ("inaikkural_aciriyappaa", "இணைக்குறள் ஆசிரியப்பா")
    };
    path.push(check(
        "aciriya_core",
        true,
        "இயற்சீர் 40%க்கு மேல், ஆசிரியத்தளை 40%க்கு மேல், ஈற்றசை, அளவடி வரம்பு.",
    ));
    path.push(check("aciriya_subtype", true, label));
    Some(Leaf {
        id,
        family_ta: "ஆசிரியப்பா",
        subtype_ta: label,
        paavinam_ta: "",
        label_ta: label,
        ml_family: MlFamily::Aciriyappaa,
    })
}

fn try_tharavu_kochaga(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    let alavadi_only = counts.len() >= ALAVADI_SEER_COUNT
        && counts.iter().all(|count| *count == ALAVADI_SEER_COUNT);
    let feet = content_feet(view.lines);
    let no_maa_or_vilangani = feet.iter().all(|foot| !is_maa_or_vilangani(foot));
    let kali = count_bonds(view.linkage, LinkageType::KaliTalai);
    let kali_ok = share_above(kali, view.linkage.len(), MAJORITY_PERCENT);
    if alavadi_only && no_maa_or_vilangani && kali_ok {
        path.push(check(
            "tharavu_kochaga",
            true,
            "நான்கு அளவடிக்கு மேல்; மாச்சீரும் விளங்கனியும் இல்லை; கலித்தளை 40%க்கு மேல்.",
        ));
        return Some(Leaf {
            id: "tharavukocha_kalippaa",
            family_ta: "தரவுகொச்சகக் கலிப்பா",
            subtype_ta: "",
            paavinam_ta: "",
            label_ta: "தரவுகொச்சகக் கலிப்பா",
            ml_family: MlFamily::Kalippaa,
        });
    }
    path.push(check(
        "tharavu_kochaga",
        false,
        "தரவுகொச்சகக் கலிப்பா பொருந்தவில்லை.",
    ));
    None
}

fn try_venkalippaa(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    let shape_ok = counts.len() >= ALAVADI_SEER_COUNT
        && counts.last() == Some(&CINTHADI_SEER_COUNT)
        && counts[..counts.len() - 1]
            .iter()
            .all(|count| *count == ALAVADI_SEER_COUNT);
    let body_ok = non_last_lines_lack_maa_and_vilangani(view.lines);
    let kali = count_bonds(view.linkage, LinkageType::KaliTalai);
    let ven = count_bonds(view.linkage, LinkageType::VenTalai);
    let mix_ok = share_above(kali + ven, view.linkage.len(), VENKALI_COMBINED_TALAI_PERCENT)
        && share_above(kali, view.linkage.len(), VENKALI_KALI_TALAI_FLOOR_PERCENT);
    if shape_ok && body_ok && mix_ok {
        path.push(check(
            "venkalippaa",
            true,
            "ஈற்றடி சிந்தடி, பிற அளவடி; மா/விளங்கனி ஈற்றடியில் மட்டும்; கலி+வெண் 50%க்கு மேல், கலி 25%க்கு மேல்.",
        ));
        return Some(Leaf {
            id: "venkalippaa",
            family_ta: "வெண்கலிப்பா",
            subtype_ta: "",
            paavinam_ta: "",
            label_ta: "வெண்கலிப்பா",
            ml_family: MlFamily::Kalippaa,
        });
    }
    path.push(check("venkalippaa", false, "வெண்கலிப்பா பொருந்தவில்லை."));
    None
}

fn try_vanjippaa(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let Some(split) = vanji_split(view.lines) else {
        path.push(check(
            "vanji_skeleton",
            false,
            "வஞ்சி அடி, தனிச்சொல், சுரிதகம் என்ற அமைப்பு இல்லை.",
        ));
        return None;
    };
    let vanji_feet = feet_in_global_range(view.lines, split.vanji_start, split.vanji_end);
    let kani = vanji_feet
        .iter()
        .filter(|foot| matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Kani)))
        .count();
    let vanji_bonds = bonds_inside(view.linkage, split.vanji_start, split.vanji_end);
    let vanji_talai = vanji_bonds
        .iter()
        .filter(|bond| matches!(bond.linkage_type, LinkageType::VanjiTalai))
        .count();
    let suri_bonds = bonds_inside(view.linkage, split.surithagam_start, split.surithagam_end);
    let suri_aciriya = suri_bonds
        .iter()
        .filter(|bond| matches!(bond.linkage_type, LinkageType::AciriyaTalai))
        .count();
    // The published சிந்தடி வஞ்சி example is 7/18 கனி. Avalokitam still
    // accepts that share: rounded to one tenth it is 0.4. 6/18 rounds to 0.3
    // and the site rejects it. The other percent gates are strict above.
    let kani_ok = share_rounds_to_tenth(kani, vanji_feet.len(), MAJORITY_PERCENT);
    let talai_ok = share_above(vanji_talai, vanji_bonds.len(), MAJORITY_PERCENT);
    let suri_ok = split.surithagam_lines >= SURITHAGAM_MIN_LINES
        && share_above(suri_aciriya, suri_bonds.len(), MAJORITY_PERCENT);
    if !(kani_ok && talai_ok && suri_ok) {
        path.push(check(
            "vanji_osai",
            false,
            &format!(
                "வஞ்சி அடியின் கனி {kani}/{} வஞ்சித்தளை {vanji_talai}/{} சுரிதகம் {suri_aciriya}/{} 40%க்கு மேல் இல்லை.",
                vanji_feet.len(),
                vanji_bonds.len(),
                suri_bonds.len()
            ),
        ));
        return None;
    }
    let (id, label) = if split.vanji_seer_count == KURALADI_SEER_COUNT {
        ("kuraladi_vanjippaa", "குறளடி வஞ்சிப்பா")
    } else {
        ("sinthadi_vanjippaa", "சிந்தடி வஞ்சிப்பா")
    };
    path.push(check("vanji_core", true, label));
    Some(Leaf {
        id,
        family_ta: "வஞ்சிப்பா",
        subtype_ta: label,
        paavinam_ta: "",
        label_ta: label,
        ml_family: MlFamily::Vanjippaa,
    })
}

struct VanjiSplit {
    vanji_start: usize,
    vanji_end: usize,
    vanji_seer_count: usize,
    surithagam_start: usize,
    surithagam_end: usize,
    surithagam_lines: usize,
}

fn vanji_split(lines: &[Line]) -> Option<VanjiSplit> {
    let content: Vec<(usize, usize)> = content_spans(lines);
    let tanichol_pos = content.iter().position(|(start, count)| {
        *count == 1 && *start > 0
    })?;
    if tanichol_pos < VANJI_MIN_ADIS {
        return None;
    }
    let vanji = &content[..tanichol_pos];
    let vanji_seer_count = vanji.first()?.1;
    if vanji_seer_count != KURALADI_SEER_COUNT && vanji_seer_count != CINTHADI_SEER_COUNT {
        return None;
    }
    if vanji.iter().any(|(_, count)| *count != vanji_seer_count) {
        return None;
    }
    let surithagam = &content[tanichol_pos + 1..];
    if surithagam.len() < SURITHAGAM_MIN_LINES {
        return None;
    }
    Some(VanjiSplit {
        vanji_start: vanji.first()?.0,
        vanji_end: content[tanichol_pos].0,
        vanji_seer_count,
        surithagam_start: surithagam.first()?.0,
        surithagam_end: surithagam.last()?.0 + surithagam.last()?.1,
        surithagam_lines: surithagam.len(),
    })
}

fn try_venpaavinam(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if is_vellathazhisai(&counts) {
        path.push(check(
            "vellathazhisai",
            true,
            "சிந்தடி வெண்பா மூன்று அடுக்காக வந்துள்ளது.",
        ));
        return Some(paavinam(
            "vellathazhisai",
            "வெண்பாவினம்",
            "வெள்ளொத்தாழிசை",
            MlFamily::Venpaa,
        ));
    }
    if is_velivirutham(view) {
        path.push(check(
            "velivirutham",
            true,
            "மூன்று அல்லது நான்கு நெடிலடி; ஒவ்வொன்றிலும் ஒரே தனிச்சொல்.",
        ));
        return Some(paavinam(
            "velivirutham",
            "வெண்பாவினம்",
            "வெளிவிருத்தம்",
            MlFamily::Venpaa,
        ));
    }
    if counts.as_slice() == [ALAVADI_SEER_COUNT, ALAVADI_SEER_COUNT, CINTHADI_SEER_COUNT] {
        path.push(check(
            "ventazhisai",
            true,
            "முதல் இரு அடி அளவடி; ஈற்றடி சிந்தடி.",
        ));
        return Some(paavinam(
            "ventazhisai",
            "வெண்பாவினம்",
            "வெண்டாழிசை",
            MlFamily::Venpaa,
        ));
    }
    if is_single_step_down(&counts) {
        path.push(check(
            "vendurai",
            true,
            "முன் அடிகள் ஒரே அளவு; பின் அடிகள் நிலையாகக் குறைந்து ஒரே அளவு.",
        ));
        return Some(paavinam(
            "vendurai",
            "வெண்பாவினம்",
            "வெண்டுறை",
            MlFamily::Venpaa,
        ));
    }
    if counts.len() == 2 && counts[0] == counts[1] {
        path.push(check(
            "kural_vensenthurai",
            true,
            "இரு அடிகளும் ஒரே அளவு.",
        ));
        return Some(paavinam(
            "kural_vensenthurai",
            "வெண்பாவினம்",
            "குறள் வெண்செந்துறை",
            MlFamily::Venpaa,
        ));
    }
    if counts.len() == 2 && counts[0] >= ALAVADI_SEER_COUNT && counts[1] < counts[0] {
        path.push(check(
            "kurattazhisai",
            true,
            "முதலடி குறைந்தபட்சம் நான்கு சீர்; இரண்டாம் அடி குறைவு.",
        ));
        return Some(paavinam(
            "kurattazhisai",
            "வெண்பாவினம்",
            "குறட்டாழிசை",
            MlFamily::Venpaa,
        ));
    }
    path.push(check("venpaavinam", false, "வெண்பாவினம் பொருந்தவில்லை."));
    None
}

fn try_aciriya_paavinam(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if counts.len() == 4
        && counts.iter().all(|count| *count >= KAZHINEDILADI_MIN_SEERS)
        && counts.iter().all(|count| *count == counts[0])
        && lines_share_etukai(view.lines)
    {
        let (id, label) = match counts[0] {
            6 => (
                "arucir_kazhinediladi_aciriya_virutham",
                "அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ),
            7 => (
                "elucir_kazhinediladi_aciriya_virutham",
                "எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ),
            8 => (
                "encir_kazhinediladi_aciriya_virutham",
                "எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ),
            _ => {
                path.push(check(
                    "aciriya_virutham",
                    false,
                    "கழிநெடிலடி நான்கு உள்ளன; சீர் எண்ணிக்கை அறு, எழு, எண் அல்ல.",
                ));
                return None;
            }
        };
        path.push(check("aciriya_virutham", true, label));
        return Some(paavinam(id, "ஆசிரியப்பாவினம்", label, MlFamily::Aciriyappaa));
    }
    if counts.len() == 3 && counts.iter().all(|count| *count == counts[0] && *count >= KURALADI_SEER_COUNT)
    {
        path.push(check(
            "aciriya_thazhisai",
            true,
            "ஒரே அளவு கொண்ட மூன்று அடி.",
        ));
        return Some(paavinam(
            "aciriya_thazhisai",
            "ஆசிரியப்பாவினம்",
            "ஆசிரியத் தாழிசை",
            MlFamily::Aciriyappaa,
        ));
    }
    if is_aciriya_thurai(&counts) {
        path.push(check(
            "aciriya_thurai",
            true,
            "நான்கு அடி; ஒரு அடி ஈற்றடியை விடக் குறைவு; நீண்ட அடி இல்லை; குறையாத அடி ஈற்றடியின் அளவு.",
        ));
        return Some(paavinam(
            "aciriya_thurai",
            "ஆசிரியப்பாவினம்",
            "ஆசிரியத் துறை",
            MlFamily::Aciriyappaa,
        ));
    }
    path.push(check(
        "aciriya_paavinam",
        false,
        "ஆசிரியப்பாவினம் பொருந்தவில்லை.",
    ));
    None
}

fn try_kali_paavinam(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if is_kattalai_kalippaa(view, &counts) {
        path.push(check(
            "kattalai_kalippaa",
            true,
            "அரையடி எட்டு; மெய்யொழித்து 11/12 எழுத்து; முதல் தளை ஆசிரியம், பின் தளை வெண்.",
        ));
        return Some(paavinam(
            "kattalai_kalippaa",
            "கலிப்பாவினம்",
            "கட்டளை கலிப்பா",
            MlFamily::Kalippaa,
        ));
    }
    if is_kattalai_kalithurai(view, &counts) {
        path.push(check(
            "kattalai_kalithurai",
            true,
            "நெடிலடி நான்கு; அடிக்குள் வெண்டளை; ஐந்தாம் சீர் விளங்காய்; மெய்யொழித்து 16/17; ஈறு ஏ; ஒரே எதுகை.",
        ));
        return Some(paavinam(
            "kattalai_kalithurai",
            "கலிப்பாவினம்",
            "கட்டளை கலித்துறை",
            MlFamily::Kalippaa,
        ));
    }
    if counts.len() == 4
        && counts.iter().all(|count| *count == NEDILADI_SEER_COUNT)
        && lines_share_etukai(view.lines)
    {
        path.push(check(
            "kalithurai",
            true,
            "நெடிலடி நான்கு; ஒரே அடி எதுகை.",
        ));
        return Some(paavinam(
            "kalithurai",
            "கலிப்பாவினம்",
            "கலித்துறை",
            MlFamily::Kalippaa,
        ));
    }
    if counts.len() == 4
        && counts.iter().all(|count| *count == ALAVADI_SEER_COUNT)
        && lines_share_etukai(view.lines)
    {
        path.push(check(
            "kalivirutham",
            true,
            "அளவடி நான்கு; ஒரே அடி எதுகை.",
        ));
        return Some(paavinam(
            "kalivirutham",
            "கலிப்பாவினம்",
            "கலிவிருத்தம்",
            MlFamily::Kalippaa,
        ));
    }
    if counts.len() > 1 && counts.last().is_some_and(|last| counts[..counts.len() - 1].iter().all(|count| count < last))
    {
        path.push(check(
            "kalithazhisai",
            true,
            "ஈற்றடி பிற அடிகளை விட நீளம்.",
        ));
        return Some(paavinam(
            "kalithazhisai",
            "கலிப்பாவினம்",
            "கலித்தாழிசை",
            MlFamily::Kalippaa,
        ));
    }
    path.push(check("kali_paavinam", false, "கலிப்பாவினம் பொருந்தவில்லை."));
    None
}

fn try_vanji_paavinam(view: &PoemView<'_>, path: &mut Vec<ClassicalTreeCheck>) -> Option<Leaf> {
    let counts = content_seer_counts(view.lines);
    if counts.len() == 12 && counts.iter().all(|count| *count == KURALADI_SEER_COUNT) {
        path.push(check(
            "vanjithazhisai",
            true,
            "குறளடி பன்னிரண்டு, தலா நான்கடி கொண்ட மூன்று அடுக்கு.",
        ));
        return Some(paavinam(
            "vanjithazhisai",
            "வஞ்சிப்பாவினம்",
            "வஞ்சித்தாழிசை",
            MlFamily::Vanjippaa,
        ));
    }
    if counts.len() == 4 && counts.iter().all(|count| *count == KURALADI_SEER_COUNT) {
        path.push(check("vanjithurai", true, "குறளடி நான்கு."));
        return Some(paavinam(
            "vanjithurai",
            "வஞ்சிப்பாவினம்",
            "வஞ்சித்துறை",
            MlFamily::Vanjippaa,
        ));
    }
    if counts.len() == 4
        && counts.iter().all(|count| *count == CINTHADI_SEER_COUNT)
        && lines_share_etukai(view.lines)
    {
        path.push(check(
            "vanjivirutham",
            true,
            "சிந்தடி நான்கு; ஒரே அடி எதுகை.",
        ));
        return Some(paavinam(
            "vanjivirutham",
            "வஞ்சிப்பாவினம்",
            "வஞ்சி விருத்தம்",
            MlFamily::Vanjippaa,
        ));
    }
    path.push(check(
        "vanji_paavinam",
        false,
        "வஞ்சிப்பாவினம் பொருந்தவில்லை.",
    ));
    None
}

fn strict_venpaa(view: &PoemView<'_>, counts: &[usize]) -> bool {
    venpaa_shape(counts)
        && allowed_body_seers(view.lines)
        && all_bonds_ven(view.linkage)
        && poem_ending_seer(view.lines).is_some()
}

fn venpaa_shape(counts: &[usize]) -> bool {
    counts.len() >= 2
        && counts.last() == Some(&CINTHADI_SEER_COUNT)
        && counts[..counts.len() - 1]
            .iter()
            .all(|count| *count == ALAVADI_SEER_COUNT)
}

fn kalivenpaa_long_osai(view: &PoemView<'_>, counts: &[usize]) -> bool {
    counts.len() >= KALIVENPAA_MIN_LINES
        && counts.last() == Some(&CINTHADI_SEER_COUNT)
        && share_above(
            count_bonds(view.linkage, LinkageType::VenTalai),
            view.linkage.len(),
            KALIVENPAA_VEN_TALAI_PERCENT,
        )
        && content_feet(view.lines)
            .iter()
            .all(|foot| !matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Kani)))
}

fn allowed_body_seers(lines: &[Line]) -> bool {
    let mut seers: Vec<&Foot> = content_feet(lines);
    seers.pop();
    seers.iter().all(|foot| is_allowed_body_seer(foot))
}

fn is_allowed_body_seer(foot: &Foot) -> bool {
    let last = foot.syllables.last().map(|syllable| syllable.syllable_type);
    match (foot.syllables.len(), last) {
        (2, Some(SyllableType::Ner | SyllableType::Nirai)) => true,
        (3, Some(SyllableType::Ner)) => true,
        _ => false,
    }
}

fn all_bonds_ven(linkage: &[Linkage]) -> bool {
    !linkage.is_empty()
        && linkage
            .iter()
            .all(|bond| matches!(bond.linkage_type, LinkageType::VenTalai))
}

fn poem_ending_seer(lines: &[Line]) -> Option<&'static str> {
    content_lines(lines)
        .last()
        .and_then(|line| line.feet.last())
        .and_then(venpaa_ending_seer_name)
}

fn non_last_lines_lack_maa_and_vilangani(lines: &[Line]) -> bool {
    let content = content_lines(lines);
    content
        .iter()
        .take(content.len().saturating_sub(1))
        .flat_map(|line| line.feet.iter())
        .all(|foot| !is_maa_or_vilangani(foot))
}

fn is_maa_or_vilangani(foot: &Foot) -> bool {
    matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Maa)) || is_forbidden_aciriya_foot(foot)
}

fn is_forbidden_aciriya_foot(foot: &Foot) -> bool {
    let pattern: Vec<SyllableType> = foot
        .syllables
        .iter()
        .map(|syllable| syllable.syllable_type)
        .collect();
    matches!(
        pattern.as_slice(),
        [SyllableType::Nirai, SyllableType::Nirai, SyllableType::Nirai]
            | [SyllableType::Ner, SyllableType::Nirai, SyllableType::Nirai]
    )
}

fn aciriya_ending(text: &str) -> bool {
    let Some(last) = text.chars().last() else {
        return false;
    };
    matches!(last, 'ஏ' | 'ஓ' | 'ஈ' | 'ஐ' | 'ே' | 'ோ' | 'ீ' | 'ை')
        || text.ends_with("ஆய்")
        || text.ends_with("ாய்")
        || text.ends_with("என்")
        || text.ends_with("ென்")
}

fn is_vellathazhisai(counts: &[usize]) -> bool {
    counts.len() == 9 && counts.chunks(3).all(|chunk| chunk == [ALAVADI_SEER_COUNT, ALAVADI_SEER_COUNT, CINTHADI_SEER_COUNT])
}

fn is_velivirutham(view: &PoemView<'_>) -> bool {
    let counts = content_seer_counts(view.lines);
    if !(counts.len() == 3 || counts.len() == 4) {
        return false;
    }
    if counts.iter().any(|count| *count != NEDILADI_SEER_COUNT) {
        return false;
    }
    let tokens = tanichol_tokens(view.source);
    tokens.len() == counts.len() && tokens.iter().all(|token| token == &tokens[0])
}

fn is_single_step_down(counts: &[usize]) -> bool {
    if !(VENDURAI_MIN_LINES..=VENDURAI_MAX_LINES).contains(&counts.len()) {
        return false;
    }
    let Some(head) = counts.first().copied() else {
        return false;
    };
    let Some(split) = counts.iter().position(|count| *count != head) else {
        return false;
    };
    if split == 0 {
        return false;
    }
    let shorter = counts[split];
    shorter < head
        && counts[..split].iter().all(|count| *count == head)
        && counts[split..].iter().all(|count| *count == shorter)
}

fn is_aciriya_thurai(counts: &[usize]) -> bool {
    if counts.len() != 4 {
        return false;
    }
    let Some(last) = counts.last().copied() else {
        return false;
    };
    let earlier = &counts[..counts.len() - 1];
    let shorter = earlier.iter().any(|count| *count < last);
    let none_longer = earlier.iter().all(|count| *count <= last);
    let peer = earlier.iter().any(|count| *count == last);
    shorter && none_longer && peer
}

fn is_kattalai_kalippaa(view: &PoemView<'_>, counts: &[usize]) -> bool {
    if counts.len() != 8 || counts.iter().any(|count| *count != ALAVADI_SEER_COUNT) {
        return false;
    }
    let lines = content_lines(view.lines);
    lines.len() == 8
        && lines.iter().all(|line| {
            kattalai_letter_count_matches(
                line,
                KATTALAI_KALIPPAA_NER_LETTER_COUNT,
                KATTALAI_KALIPPAA_NIRAI_LETTER_COUNT,
            )
        })
        && arai_adi_talai_pattern(view)
}

/// First bond inside the அரையடி is ஆசிரியத்தளை; the later bonds are வெண்டளை.
fn arai_adi_talai_pattern(view: &PoemView<'_>) -> bool {
    content_spans(view.lines).iter().all(|(start, count)| {
        *count == ALAVADI_SEER_COUNT
            && bond_is_kind(view.linkage, *start, LinkageType::AciriyaTalai)
            && bond_is_kind(view.linkage, start + 1, LinkageType::VenTalai)
            && bond_is_kind(view.linkage, start + 2, LinkageType::VenTalai)
    })
}

fn is_kattalai_kalithurai(view: &PoemView<'_>, counts: &[usize]) -> bool {
    if counts.len() != 4 || counts.iter().any(|count| *count != NEDILADI_SEER_COUNT) {
        return false;
    }
    if !lines_share_etukai(view.lines) {
        return false;
    }
    if !ends_on_ekaram(view.lines) {
        return false;
    }
    let lines = content_lines(view.lines);
    if !lines.iter().all(|line| {
        kattalai_letter_count_matches(
            line,
            KATTALAI_KALITHURAI_NER_LETTER_COUNT,
            KATTALAI_KALITHURAI_NIRAI_LETTER_COUNT,
        ) && kalithurai_fifth_seer(line)
    }) {
        return false;
    }
    content_spans(view.lines).iter().all(|(start, count)| {
        (0..count.saturating_sub(1)).all(|offset| {
            bond_is_kind(view.linkage, start + offset, LinkageType::VenTalai)
        })
    })
}

fn kalithurai_fifth_seer(line: &Line) -> bool {
    let Some(fifth_seer) = line.feet.get(NEDILADI_SEER_COUNT - 1) else {
        return false;
    };
    is_kattalai_fifth_seer(fifth_seer)
        && line
            .feet
            .iter()
            .take(NEDILADI_SEER_COUNT - 1)
            .all(|foot| !is_vilangaay(foot))
}

/// விளங்காய், or the site's rare stand-ins மாங்கனி and மாந்தண்பூ.
fn is_kattalai_fifth_seer(foot: &Foot) -> bool {
    is_vilangaay(foot) || is_maangani(foot) || is_maanthanpuu(foot)
}

fn is_vilangaay(foot: &Foot) -> bool {
    syllable_pattern_is(foot, &[SyllableType::Ner, SyllableType::Nirai, SyllableType::Ner])
        || syllable_pattern_is(
            foot,
            &[SyllableType::Nirai, SyllableType::Nirai, SyllableType::Ner],
        )
}

fn is_maangani(foot: &Foot) -> bool {
    syllable_pattern_is(foot, &[SyllableType::Ner, SyllableType::Ner, SyllableType::Nirai])
        || syllable_pattern_is(
            foot,
            &[SyllableType::Nirai, SyllableType::Ner, SyllableType::Nirai],
        )
}

fn is_maanthanpuu(foot: &Foot) -> bool {
    syllable_pattern_is(
        foot,
        &[
            SyllableType::Ner,
            SyllableType::Ner,
            SyllableType::Ner,
            SyllableType::Ner,
        ],
    ) || syllable_pattern_is(
        foot,
        &[
            SyllableType::Nirai,
            SyllableType::Ner,
            SyllableType::Ner,
            SyllableType::Ner,
        ],
    )
}

fn syllable_pattern_is(foot: &Foot, pattern: &[SyllableType]) -> bool {
    foot.syllables.len() == pattern.len()
        && foot
            .syllables
            .iter()
            .zip(pattern.iter())
            .all(|(syllable, expected)| syllable.syllable_type == *expected)
}

fn ends_on_ekaram(lines: &[Line]) -> bool {
    let text = last_syllable_text(lines);
    text.ends_with('ஏ') || text.ends_with('ே')
}

fn kattalai_letter_count_matches(line: &Line, ner_letters: usize, nirai_letters: usize) -> bool {
    let Some(first_syllable) = line.feet.first().and_then(|foot| foot.syllables.first()) else {
        return false;
    };
    let expected = match first_syllable.syllable_type {
        SyllableType::Ner => ner_letters,
        SyllableType::Nirai => nirai_letters,
    };
    line_letters_excluding_mei(line) == expected
}

fn line_letters_excluding_mei(line: &Line) -> usize {
    let text: String = line
        .feet
        .iter()
        .flat_map(|foot| foot.syllables.iter().map(|syllable| syllable.text.as_str()))
        .collect();
    letters_excluding_mei(&text)
}

/// எழுத்து count with மெய் (consonant + pulli) left out.
fn letters_excluding_mei(text: &str) -> usize {
    text.graphemes(true)
        .filter(|grapheme| {
            grapheme
                .chars()
                .any(|character| ('\u{0B80}'..='\u{0BFF}').contains(&character))
        })
        .filter(|grapheme| !grapheme.chars().any(|character| character == '\u{0BCD}'))
        .count()
}

fn bond_is_kind(linkage: &[Linkage], index: usize, kind: LinkageType) -> bool {
    linkage
        .get(index)
        .is_some_and(|bond| bond.linkage_type == kind)
}

fn content_lines(lines: &[Line]) -> Vec<&Line> {
    lines.iter().filter(|line| !line.feet.is_empty()).collect()
}

fn content_seer_counts(lines: &[Line]) -> Vec<usize> {
    content_lines(lines).iter().map(|line| line.feet.len()).collect()
}

fn content_feet(lines: &[Line]) -> Vec<&Foot> {
    content_lines(lines)
        .into_iter()
        .flat_map(|line| line.feet.iter())
        .collect()
}

fn content_spans(lines: &[Line]) -> Vec<(usize, usize)> {
    let mut cursor = 0usize;
    let mut spans = Vec::new();
    for line in lines {
        if !line.feet.is_empty() {
            spans.push((cursor, line.feet.len()));
        }
        cursor += line.feet.len();
    }
    spans
}

fn feet_in_global_range<'a>(lines: &'a [Line], start: usize, end: usize) -> Vec<&'a Foot> {
    let mut cursor = 0usize;
    let mut feet = Vec::new();
    for line in lines {
        for foot in &line.feet {
            if cursor >= start && cursor < end {
                feet.push(foot);
            }
            cursor += 1;
        }
    }
    feet
}

fn bonds_inside(linkage: &[Linkage], start: usize, end: usize) -> Vec<&Linkage> {
    if end <= start + 1 {
        return Vec::new();
    }
    linkage
        .iter()
        .enumerate()
        .filter(|(index, _)| *index >= start && *index + 1 < end)
        .map(|(_, bond)| bond)
        .collect()
}

fn count_bonds(linkage: &[Linkage], kind: LinkageType) -> usize {
    linkage
        .iter()
        .filter(|bond| bond.linkage_type == kind)
        .count()
}

/// Site wording is "above" the percent, so an exact share does not pass.
fn share_above(part: usize, whole: usize, percent: usize) -> bool {
    whole > 0 && part.saturating_mul(100) > whole.saturating_mul(percent)
}

/// Round `part / whole` to one tenth, then compare with `percent`.
fn share_rounds_to_tenth(part: usize, whole: usize, percent: usize) -> bool {
    if whole == 0 {
        return false;
    }
    let tenths = part
        .saturating_mul(10)
        .saturating_add(whole / 2)
        / whole;
    tenths.saturating_mul(10) >= percent
}

fn vikarpam_run_count(lines: &[Line]) -> usize {
    let keys: Vec<String> = content_lines(lines)
        .iter()
        .filter_map(|line| line.feet.first())
        .map(etukai_key)
        .collect();
    if keys.is_empty() {
        return 0;
    }
    let mut runs = 1usize;
    for pair in keys.windows(2) {
        if pair[0] != pair[1] {
            runs += 1;
        }
    }
    runs
}

fn lines_share_etukai(lines: &[Line]) -> bool {
    let keys: Vec<String> = content_lines(lines)
        .iter()
        .filter_map(|line| line.feet.first())
        .map(etukai_key)
        .filter(|key| key != "-")
        .collect();
    !keys.is_empty() && keys.iter().all(|key| key == &keys[0])
}

fn etukai_key(foot: &Foot) -> String {
    let text: String = foot.syllables.iter().map(|syllable| syllable.text.as_str()).collect();
    second_consonant(&text)
}

fn second_consonant(text: &str) -> String {
    let graphemes: Vec<&str> = text.graphemes(true).collect();
    let Some(second) = graphemes.get(1) else {
        return "-".to_string();
    };
    let consonant: String = second
        .chars()
        .filter(|character| ('\u{0B95}'..='\u{0BB9}').contains(character))
        .collect();
    if consonant.is_empty() {
        (*second).to_string()
    } else {
        consonant
    }
}

fn etukai_tanichol(source: &str, lines: &[Line]) -> Option<String> {
    let line_keys: Vec<String> = content_lines(lines)
        .iter()
        .filter_map(|line| line.feet.first())
        .map(etukai_key)
        .collect();
    tanichol_tokens(source).into_iter().find(|token| {
        let key = second_consonant(token);
        line_keys.iter().any(|line_key| line_key == &key)
    })
}

fn tanichol_tokens(source: &str) -> Vec<String> {
    source
        .lines()
        .filter_map(|line| {
            let (_, after_dash) = line.split_once(" - ")?;
            let token = after_dash.split_whitespace().next()?;
            let cleaned: String = token
                .chars()
                .filter(|character| {
                    ('\u{0B80}'..='\u{0BFF}').contains(character) || *character == '\u{0BCD}'
                })
                .collect();
            if cleaned.is_empty() {
                None
            } else {
                Some(cleaned)
            }
        })
        .collect()
}

fn last_syllable_text(lines: &[Line]) -> String {
    content_lines(lines)
        .last()
        .and_then(|line| line.feet.last())
        .and_then(|foot| foot.syllables.last())
        .map(|syllable| syllable.text.clone())
        .unwrap_or_default()
}

/// Seer offsets (0-based) for மேற்கதுவாய்: positions 1, 3, and 4.
pub fn merkathuvai_seer_indexes(seer_count: usize) -> Vec<usize> {
    MERKATHUVAI_SEER_POSITIONS
        .into_iter()
        .filter(|position| *position >= 1 && *position <= seer_count)
        .map(|position| position - 1)
        .collect()
}

fn merkathuvai_note(lines: &[Line]) -> Option<String> {
    let long_lines: Vec<&Line> = content_lines(lines)
        .into_iter()
        .filter(|line| line.feet.len() >= ALAVADI_SEER_COUNT)
        .collect();
    if long_lines.is_empty() {
        return None;
    }
    let shares = long_lines.iter().all(|line| {
        let indexes = merkathuvai_seer_indexes(line.feet.len());
        let keys: Vec<String> = indexes
            .iter()
            .filter_map(|index| line.feet.get(*index))
            .map(etukai_key)
            .collect();
        !keys.is_empty() && keys.iter().all(|key| key == &keys[0] && key != "-")
    });
    if shares {
        Some("மேற்கதுவாய் சீர்கள் 1, 3, 4 ஒரே எதுகை.".to_string())
    } else {
        None
    }
}

fn leaf_venpaa(id: &'static str, subtype_ta: &'static str, label_ta: &'static str) -> Leaf {
    Leaf {
        id,
        family_ta: "வெண்பா",
        subtype_ta,
        paavinam_ta: "",
        label_ta,
        ml_family: MlFamily::Venpaa,
    }
}

fn paavinam(
    id: &'static str,
    family_ta: &'static str,
    label_ta: &'static str,
    ml_family: MlFamily,
) -> Leaf {
    Leaf {
        id,
        family_ta,
        subtype_ta: "",
        paavinam_ta: label_ta,
        label_ta,
        ml_family,
    }
}

fn check(rule_id: &str, passed: bool, message_ta: &str) -> ClassicalTreeCheck {
    ClassicalTreeCheck {
        rule_id: rule_id.to_string(),
        passed,
        message_ta: message_ta.to_string(),
    }
}

fn report_for(
    leaf: Option<Leaf>,
    path: Vec<ClassicalTreeCheck>,
    ml_verdict: Option<&MetreType>,
) -> ClassicalTreeReport {
    match leaf {
        Some(leaf) => ClassicalTreeReport {
            leaf_id: leaf.id.to_string(),
            family_ta: leaf.family_ta.to_string(),
            subtype_ta: leaf.subtype_ta.to_string(),
            paavinam_ta: leaf.paavinam_ta.to_string(),
            label_ta: leaf.label_ta.to_string(),
            fitted: true,
            path,
            tree_agrees_with_ml: agreement(Some(leaf.ml_family), ml_verdict),
        },
        None => ClassicalTreeReport {
            leaf_id: "no_rule_fitted".to_string(),
            family_ta: String::new(),
            subtype_ta: String::new(),
            paavinam_ta: String::new(),
            label_ta: "no rule fitted".to_string(),
            fitted: false,
            path,
            tree_agrees_with_ml: agreement(None, ml_verdict),
        },
    }
}

fn agreement(family: Option<MlFamily>, ml_verdict: Option<&MetreType>) -> Option<bool> {
    let ml_family = match ml_verdict {
        Some(MetreType::Venpaa) => MlFamily::Venpaa,
        Some(MetreType::Aciriyappaa) => MlFamily::Aciriyappaa,
        Some(MetreType::Kalippaa) => MlFamily::Kalippaa,
        Some(MetreType::Vanjippaa) => MlFamily::Vanjippaa,
        Some(MetreType::Other(_)) => return Some(false),
        None => return None,
    };
    Some(family == Some(ml_family))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::poem_variations::{poem_variations_blocks, SINTHADI_ACIRIYAPPAA};
    use crate::{parse_poem, ParseOptions};

    fn options_without_ml() -> ParseOptions {
        let mut options = ParseOptions::default();
        options.uyir_u = true;
        options.no_detect = true;
        options
    }

    fn options_with_ml() -> ParseOptions {
        let mut options = ParseOptions::default();
        options.uyir_u = true;
        options
    }

    #[test]
    fn sinthadi_vanji_kani_share_follows_the_site_tenth() {
        assert!(share_rounds_to_tenth(7, 18, MAJORITY_PERCENT));
        assert!(!share_rounds_to_tenth(6, 18, MAJORITY_PERCENT));
        assert!(!share_above(7, 18, MAJORITY_PERCENT));
    }

    #[test]
    fn exact_percent_is_not_above_the_gate() {
        assert!(!share_above(2, 5, MAJORITY_PERCENT));
        assert!(!share_above(1, 2, VENKALI_COMBINED_TALAI_PERCENT));
        assert!(!share_above(1, 4, VENKALI_KALI_TALAI_FLOOR_PERCENT));
        assert!(share_above(3, 5, MAJORITY_PERCENT));
    }

    #[test]
    fn merkathuvai_positions_are_seers_one_three_four() {
        assert_eq!(merkathuvai_seer_indexes(4), vec![0, 2, 3]);
        assert_eq!(MERKATHUVAI_SEER_POSITIONS, [1, 3, 4]);
        assert_eq!(ALAVADI_SEER_COUNT, 4);
    }

    #[test]
    fn each_types_example_lands_on_its_leaf() {
        for block in poem_variations_blocks() {
            for row in block.special_types.iter().chain(block.variations.iter()) {
                let result = parse_poem(row.example, options_without_ml()).expect("parse");
                assert!(
                    result.classical_tree.fitted,
                    "{} did not fit: {}",
                    row.ta,
                    result
                        .classical_tree
                        .path
                        .iter()
                        .map(|step| format!("{}:{}:{}", step.rule_id, step.passed, step.message_ta))
                        .collect::<Vec<_>>()
                        .join(" | ")
                );
                assert_eq!(
                    result.classical_tree.label_ta,
                    row.ta,
                    "leaf {} path {}",
                    row.en,
                    result
                        .classical_tree
                        .path
                        .iter()
                        .map(|step| format!("{}={}:{}", step.rule_id, step.passed, step.message_ta))
                        .collect::<Vec<_>>()
                        .join(",")
                );
                assert!(!result.classical_tree.path.is_empty(), "{}", row.en);
                if row.en == SINTHADI_ACIRIYAPPAA {
                    assert_eq!(result.classical_tree.leaf_id, "sinthadi_vanjippaa");
                }
            }
        }
    }

    #[test]
    fn ulakame_is_not_a_kural_venpaa() {
        let poem = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகமே";
        let result = parse_poem(poem, options_with_ml()).expect("parse");
        assert_ne!(result.classical_tree.leaf_id, "oru_vikarpa_kural_venpaa");
        assert_ne!(result.classical_tree.leaf_id, "iru_vikarpa_kural_venpaa");
        assert!(result
            .classical_tree
            .path
            .iter()
            .any(|step| step.rule_id == "venpaa_core" && !step.passed));
        assert_eq!(result.classical_tree.leaf_id, "kurattazhisai");
        assert_eq!(result.classical_tree.label_ta, "குறட்டாழிசை");
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
    }

    #[test]
    fn one_line_poem_fits_no_rule() {
        let result = parse_poem("பகவன் முதற்றே உலகு", options_with_ml()).expect("parse");
        assert!(!result.classical_tree.fitted);
        assert_eq!(result.classical_tree.leaf_id, "no_rule_fitted");
        assert_eq!(result.classical_tree.label_ta, "no rule fitted");
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
        assert_ne!(result.classical_tree.tree_agrees_with_ml, Some(true));
    }

    #[test]
    fn thirukkural_tree_is_oru_vikarpa_and_agrees() {
        let poem = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு";
        let result = parse_poem(poem, options_with_ml()).expect("parse");
        assert_eq!(result.classical_tree.leaf_id, "oru_vikarpa_kural_venpaa");
        assert_eq!(result.classical_tree.label_ta, "ஒரு விகற்ப குறள் வெண்பா");
        assert_eq!(result.metre_type, Some(MetreType::Venpaa));
        assert_eq!(result.classical_tree.tree_agrees_with_ml, Some(true));
        assert!(result.classical_rules.rules.iter().all(|rule| rule.passed));
    }

    #[test]
    fn eight_koovilam_lines_are_not_kattalai_kalippaa() {
        let line = "யெத்தனை யெத்தனை யெத்தனை யெத்தனை";
        let poem = [line; 8].join("\n");
        let result = parse_poem(&poem, options_without_ml()).expect("parse");
        assert_eq!(content_seer_counts(&result.lines), vec![4, 4, 4, 4, 4, 4, 4, 4]);
        assert_ne!(result.classical_tree.leaf_id, "kattalai_kalippaa");
        assert_ne!(result.classical_tree.label_ta, "கட்டளை கலிப்பா");
    }

    #[test]
    fn kattalai_kalithurai_ending_koovilamo_fails() {
        let poem = "தனந்தரும் கல்வி தருமொரு நாளும் தளர்வறியா\nமனந்தரும் தெய்வ வடிவும் தரும்நெஞ்சில் வஞ்சமில்லா\nஇனந்தரும் நல்லன எல்லாம் தருமன்பர் என்பவர்க்கே\nகனந்தரும் பூங்குழ லாளபி ராமி கடைக்கண்களோ";
        let result = parse_poem(poem, options_without_ml()).expect("parse");
        assert_ne!(result.classical_tree.leaf_id, "kattalai_kalithurai");
        assert_ne!(result.classical_tree.label_ta, "கட்டளை கலித்துறை");
    }

    #[test]
    fn pulimaangani_line_is_tharavu_not_kalivirutham() {
        let line = "தரும்நெஞ்சில் தரும்நெஞ்சில் தரும்நெஞ்சில் கடைக்கண்களே";
        let poem = [line; 4].join("\n");
        let result = parse_poem(&poem, options_without_ml()).expect("parse");
        assert_eq!(content_seer_counts(&result.lines), vec![4, 4, 4, 4]);
        assert_eq!(result.classical_tree.leaf_id, "tharavukocha_kalippaa");
        assert_eq!(result.classical_tree.label_ta, "தரவுகொச்சகக் கலிப்பா");
        assert_ne!(result.classical_tree.leaf_id, "kalivirutham");
    }

    #[test]
    fn aciriya_thurai_rejects_a_line_longer_than_the_last() {
        assert!(!is_aciriya_thurai(&[5, 2, 4, 4]));
        assert!(is_aciriya_thurai(&[4, 5, 4, 5]));
        assert!(!is_aciriya_thurai(&[4, 4, 4, 5]));
    }

    #[test]
    fn agreement_is_null_when_metre_detection_is_off() {
        let poem = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு";
        let result = parse_poem(poem, options_without_ml()).expect("parse");
        assert_eq!(result.classical_tree.tree_agrees_with_ml, None);
        assert_eq!(result.metre_type, None);
    }
}
