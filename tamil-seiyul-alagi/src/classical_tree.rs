//! Strict-first classical decision tree beside the ML metre verdict.
//!
//! Each leaf is one AND-gate. Gates run from the most combined conditions to
//! the fewest. Equal counts keep Avalokitam's order. Nothing here writes
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
///
/// Gates run strict-first: more combined conditions first. Equal counts keep
/// Avalokitam's order. A gate matches only when every condition passes.
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
    let mut fitted: Option<Leaf> = None;
    for gate in gates_sorted(true) {
        let conditions = assess(gate.id, &view);
        debug_assert_eq!(conditions.len(), gate.condition_count as usize, "{}", gate.id);
        let gate_passed = conditions.iter().all(|condition| condition.passed);
        for condition in conditions {
            path.push(check(
                &format!("{}.{}", gate.id, condition.id),
                condition.passed,
                &condition.message_ta,
            ));
        }
        if gate_passed {
            fitted = Some(gate.leaf);
            break;
        }
    }
    if fitted.is_none() {
        path.push(check(
            "no_rule_fitted",
            false,
            "எந்த விதியும் பொருந்தவில்லை.",
        ));
    } else if let Some(note) = merkathuvai_note(view.lines) {
        path.push(check("thodai_merkathuvai", true, &note));
    }
    report_for(fitted, path, ml_verdict)
}

struct Condition {
    id: &'static str,
    passed: bool,
    message_ta: String,
}

#[derive(Clone, Copy)]
struct GateSpec {
    id: &'static str,
    avalokitam_rank: u16,
    condition_count: u8,
    leaf: Leaf,
}

fn requirement(id: &'static str, passed: bool, text: &str) -> Condition {
    let message_ta = if passed {
        text.to_string()
    } else {
        format!("{text} இல்லை.")
    };
    Condition {
        id,
        passed,
        message_ta,
    }
}

fn gates_sorted(strict_first: bool) -> Vec<GateSpec> {
    let mut gates = GATES.to_vec();
    if strict_first {
        gates.sort_by(|left, right| {
            right
                .condition_count
                .cmp(&left.condition_count)
                .then(left.avalokitam_rank.cmp(&right.avalokitam_rank))
        });
    } else {
        gates.sort_by(|left, right| left.avalokitam_rank.cmp(&right.avalokitam_rank));
    }
    gates
}

#[cfg(test)]
fn matching_leaf(view: &PoemView<'_>, strict_first: bool) -> Option<Leaf> {
    gates_sorted(strict_first).into_iter().find_map(|gate| {
        let passed = assess(gate.id, view)
            .iter()
            .all(|condition| condition.passed);
        if passed { Some(gate.leaf) } else { None }
    })
}

const GATES: [GateSpec; 37] = [
    GateSpec {
        id: "kalivenpaa_long_osai",
        avalokitam_rank: 0,
        condition_count: 4,
        leaf: Leaf {
            id: "kalivenpaa",
            family_ta: "வெண்பா",
            subtype_ta: "கலிவெண்பா",
            paavinam_ta: "",
            label_ta: "கலிவெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "oru_vikarpa_kural_venpaa",
        avalokitam_rank: 1,
        condition_count: 6,
        leaf: Leaf {
            id: "oru_vikarpa_kural_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "ஒரு விகற்ப குறள் வெண்பா",
            paavinam_ta: "",
            label_ta: "ஒரு விகற்ப குறள் வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "iru_vikarpa_kural_venpaa",
        avalokitam_rank: 2,
        condition_count: 6,
        leaf: Leaf {
            id: "iru_vikarpa_kural_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "இரு விகற்ப குறள் வெண்பா",
            paavinam_ta: "",
            label_ta: "இரு விகற்ப குறள் வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "nerisai_sinthiyal_venpaa",
        avalokitam_rank: 3,
        condition_count: 7,
        leaf: Leaf {
            id: "nerisai_sinthiyal_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "நேரிசை சிந்தியல் வெண்பா",
            paavinam_ta: "",
            label_ta: "நேரிசை சிந்தியல் வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "inisai_sinthiyal_venpaa",
        avalokitam_rank: 4,
        condition_count: 5,
        leaf: Leaf {
            id: "inisai_sinthiyal_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "இன்னிசை சிந்தியல் வெண்பா",
            paavinam_ta: "",
            label_ta: "இன்னிசை சிந்தியல் வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "oru_vikarpa_nerisai_venpaa",
        avalokitam_rank: 5,
        condition_count: 7,
        leaf: Leaf {
            id: "oru_vikarpa_nerisai_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "ஒரு விகற்ப நேரிசை வெண்பா",
            paavinam_ta: "",
            label_ta: "ஒரு விகற்ப நேரிசை வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "iru_vikarpa_nerisai_venpaa",
        avalokitam_rank: 6,
        condition_count: 7,
        leaf: Leaf {
            id: "iru_vikarpa_nerisai_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "இரு விகற்ப நேரிசை வெண்பா",
            paavinam_ta: "",
            label_ta: "இரு விகற்ப நேரிசை வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "oru_vikarpa_inisai_venpaa",
        avalokitam_rank: 7,
        condition_count: 6,
        leaf: Leaf {
            id: "oru_vikarpa_inisai_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "ஒரு விகற்ப இன்னிசை வெண்பா",
            paavinam_ta: "",
            label_ta: "ஒரு விகற்ப இன்னிசை வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "pala_vikarpa_inisai_venpaa",
        avalokitam_rank: 8,
        condition_count: 5,
        leaf: Leaf {
            id: "pala_vikarpa_inisai_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "பல விகற்ப இன்னிசை வெண்பா",
            paavinam_ta: "",
            label_ta: "பல விகற்ப இன்னிசை வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "paqrodai_venpaa",
        avalokitam_rank: 9,
        condition_count: 5,
        leaf: Leaf {
            id: "paqrodai_venpaa",
            family_ta: "வெண்பா",
            subtype_ta: "பஃறொடை வெண்பா",
            paavinam_ta: "",
            label_ta: "பஃறொடை வெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "kalivenpaa_strict",
        avalokitam_rank: 10,
        condition_count: 5,
        leaf: Leaf {
            id: "kalivenpaa",
            family_ta: "வெண்பா",
            subtype_ta: "கலிவெண்பா",
            paavinam_ta: "",
            label_ta: "கலிவெண்பா",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "nilaimandila_aciriyappaa",
        avalokitam_rank: 11,
        condition_count: 9,
        leaf: Leaf {
            id: "nilaimandila_aciriyappaa",
            family_ta: "ஆசிரியப்பா",
            subtype_ta: "நிலைமண்டில ஆசிரியப்பா",
            paavinam_ta: "",
            label_ta: "நிலைமண்டில ஆசிரியப்பா",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "nerisai_aciriyappaa",
        avalokitam_rank: 12,
        condition_count: 9,
        leaf: Leaf {
            id: "nerisai_aciriyappaa",
            family_ta: "ஆசிரியப்பா",
            subtype_ta: "நேரிசை ஆசிரியப்பா",
            paavinam_ta: "",
            label_ta: "நேரிசை ஆசிரியப்பா",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "inaikkural_aciriyappaa",
        avalokitam_rank: 13,
        condition_count: 9,
        leaf: Leaf {
            id: "inaikkural_aciriyappaa",
            family_ta: "ஆசிரியப்பா",
            subtype_ta: "இணைக்குறள் ஆசிரியப்பா",
            paavinam_ta: "",
            label_ta: "இணைக்குறள் ஆசிரியப்பா",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "tharavukocha_kalippaa",
        avalokitam_rank: 14,
        condition_count: 4,
        leaf: Leaf {
            id: "tharavukocha_kalippaa",
            family_ta: "தரவுகொச்சகக் கலிப்பா",
            subtype_ta: "",
            paavinam_ta: "",
            label_ta: "தரவுகொச்சகக் கலிப்பா",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "venkalippaa",
        avalokitam_rank: 15,
        condition_count: 4,
        leaf: Leaf {
            id: "venkalippaa",
            family_ta: "வெண்கலிப்பா",
            subtype_ta: "",
            paavinam_ta: "",
            label_ta: "வெண்கலிப்பா",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "kuraladi_vanjippaa",
        avalokitam_rank: 16,
        condition_count: 5,
        leaf: Leaf {
            id: "kuraladi_vanjippaa",
            family_ta: "வஞ்சிப்பா",
            subtype_ta: "குறளடி வஞ்சிப்பா",
            paavinam_ta: "",
            label_ta: "குறளடி வஞ்சிப்பா",
            ml_family: MlFamily::Vanjippaa,
        },
    },
    GateSpec {
        id: "sinthadi_vanjippaa",
        avalokitam_rank: 17,
        condition_count: 5,
        leaf: Leaf {
            id: "sinthadi_vanjippaa",
            family_ta: "வஞ்சிப்பா",
            subtype_ta: "சிந்தடி வஞ்சிப்பா",
            paavinam_ta: "",
            label_ta: "சிந்தடி வஞ்சிப்பா",
            ml_family: MlFamily::Vanjippaa,
        },
    },
    GateSpec {
        id: "vellathazhisai",
        avalokitam_rank: 18,
        condition_count: 2,
        leaf: Leaf {
            id: "vellathazhisai",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வெள்ளொத்தாழிசை",
            label_ta: "வெள்ளொத்தாழிசை",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "velivirutham",
        avalokitam_rank: 19,
        condition_count: 4,
        leaf: Leaf {
            id: "velivirutham",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வெளிவிருத்தம்",
            label_ta: "வெளிவிருத்தம்",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "ventazhisai",
        avalokitam_rank: 20,
        condition_count: 4,
        leaf: Leaf {
            id: "ventazhisai",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வெண்டாழிசை",
            label_ta: "வெண்டாழிசை",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "vendurai",
        avalokitam_rank: 21,
        condition_count: 2,
        leaf: Leaf {
            id: "vendurai",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வெண்டுறை",
            label_ta: "வெண்டுறை",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "kural_vensenthurai",
        avalokitam_rank: 22,
        condition_count: 2,
        leaf: Leaf {
            id: "kural_vensenthurai",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "குறள் வெண்செந்துறை",
            label_ta: "குறள் வெண்செந்துறை",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "kurattazhisai",
        avalokitam_rank: 23,
        condition_count: 3,
        leaf: Leaf {
            id: "kurattazhisai",
            family_ta: "வெண்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "குறட்டாழிசை",
            label_ta: "குறட்டாழிசை",
            ml_family: MlFamily::Venpaa,
        },
    },
    GateSpec {
        id: "arucir_kazhinediladi_aciriya_virutham",
        avalokitam_rank: 24,
        condition_count: 5,
        leaf: Leaf {
            id: "arucir_kazhinediladi_aciriya_virutham",
            family_ta: "ஆசிரியப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            label_ta: "அறுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "elucir_kazhinediladi_aciriya_virutham",
        avalokitam_rank: 25,
        condition_count: 5,
        leaf: Leaf {
            id: "elucir_kazhinediladi_aciriya_virutham",
            family_ta: "ஆசிரியப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            label_ta: "எழுசீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "encir_kazhinediladi_aciriya_virutham",
        avalokitam_rank: 26,
        condition_count: 5,
        leaf: Leaf {
            id: "encir_kazhinediladi_aciriya_virutham",
            family_ta: "ஆசிரியப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            label_ta: "எண்சீர் கழிநெடிலடி ஆசிரிய விருத்தம்",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "aciriya_thazhisai",
        avalokitam_rank: 27,
        condition_count: 3,
        leaf: Leaf {
            id: "aciriya_thazhisai",
            family_ta: "ஆசிரியப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "ஆசிரியத் தாழிசை",
            label_ta: "ஆசிரியத் தாழிசை",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "aciriya_thurai",
        avalokitam_rank: 28,
        condition_count: 4,
        leaf: Leaf {
            id: "aciriya_thurai",
            family_ta: "ஆசிரியப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "ஆசிரியத் துறை",
            label_ta: "ஆசிரியத் துறை",
            ml_family: MlFamily::Aciriyappaa,
        },
    },
    GateSpec {
        id: "kattalai_kalippaa",
        avalokitam_rank: 29,
        condition_count: 5,
        leaf: Leaf {
            id: "kattalai_kalippaa",
            family_ta: "கலிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "கட்டளை கலிப்பா",
            label_ta: "கட்டளை கலிப்பா",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "kattalai_kalithurai",
        avalokitam_rank: 30,
        condition_count: 8,
        leaf: Leaf {
            id: "kattalai_kalithurai",
            family_ta: "கலிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "கட்டளை கலித்துறை",
            label_ta: "கட்டளை கலித்துறை",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "kalithurai",
        avalokitam_rank: 31,
        condition_count: 3,
        leaf: Leaf {
            id: "kalithurai",
            family_ta: "கலிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "கலித்துறை",
            label_ta: "கலித்துறை",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "kalivirutham",
        avalokitam_rank: 32,
        condition_count: 3,
        leaf: Leaf {
            id: "kalivirutham",
            family_ta: "கலிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "கலிவிருத்தம்",
            label_ta: "கலிவிருத்தம்",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "kalithazhisai",
        avalokitam_rank: 33,
        condition_count: 2,
        leaf: Leaf {
            id: "kalithazhisai",
            family_ta: "கலிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "கலித்தாழிசை",
            label_ta: "கலித்தாழிசை",
            ml_family: MlFamily::Kalippaa,
        },
    },
    GateSpec {
        id: "vanjithazhisai",
        avalokitam_rank: 34,
        condition_count: 2,
        leaf: Leaf {
            id: "vanjithazhisai",
            family_ta: "வஞ்சிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வஞ்சித்தாழிசை",
            label_ta: "வஞ்சித்தாழிசை",
            ml_family: MlFamily::Vanjippaa,
        },
    },
    GateSpec {
        id: "vanjithurai",
        avalokitam_rank: 35,
        condition_count: 2,
        leaf: Leaf {
            id: "vanjithurai",
            family_ta: "வஞ்சிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வஞ்சித்துறை",
            label_ta: "வஞ்சித்துறை",
            ml_family: MlFamily::Vanjippaa,
        },
    },
    GateSpec {
        id: "vanjivirutham",
        avalokitam_rank: 36,
        condition_count: 3,
        leaf: Leaf {
            id: "vanjivirutham",
            family_ta: "வஞ்சிப்பாவினம்",
            subtype_ta: "",
            paavinam_ta: "வஞ்சி விருத்தம்",
            label_ta: "வஞ்சி விருத்தம்",
            ml_family: MlFamily::Vanjippaa,
        },
    },
];

fn assess(gate_id: &str, view: &PoemView<'_>) -> Vec<Condition> {
    match gate_id {
        "kalivenpaa_long_osai" => assess_kalivenpaa_long_osai(view),
        "oru_vikarpa_kural_venpaa" => assess_kural_venpaa(view, true),
        "iru_vikarpa_kural_venpaa" => assess_kural_venpaa(view, false),
        "nerisai_sinthiyal_venpaa" => assess_sinthiyal(view, true),
        "inisai_sinthiyal_venpaa" => assess_sinthiyal(view, false),
        "oru_vikarpa_nerisai_venpaa" => assess_nerisai_venpaa(view, true),
        "iru_vikarpa_nerisai_venpaa" => assess_nerisai_venpaa(view, false),
        "oru_vikarpa_inisai_venpaa" => assess_inisai_venpaa(view, true),
        "pala_vikarpa_inisai_venpaa" => assess_inisai_venpaa(view, false),
        "paqrodai_venpaa" => assess_paqrodai(view),
        "kalivenpaa_strict" => assess_kalivenpaa_strict(view),
        "nilaimandila_aciriyappaa" => assess_aciriya(view, AciriyaPattern::Nilaimandila),
        "nerisai_aciriyappaa" => assess_aciriya(view, AciriyaPattern::Nerisai),
        "inaikkural_aciriyappaa" => assess_aciriya(view, AciriyaPattern::Inaikkural),
        "tharavukocha_kalippaa" => assess_tharavu(view),
        "venkalippaa" => assess_venkali(view),
        "kuraladi_vanjippaa" => assess_vanji(view, KURALADI_SEER_COUNT, "குறளடி"),
        "sinthadi_vanjippaa" => assess_vanji(view, CINTHADI_SEER_COUNT, "சிந்தடி"),
        "vellathazhisai" => assess_vellathazhisai(view),
        "velivirutham" => assess_velivirutham(view),
        "ventazhisai" => assess_ventazhisai(view),
        "vendurai" => assess_vendurai(view),
        "kural_vensenthurai" => assess_kural_vensenthurai(view),
        "kurattazhisai" => assess_kurattazhisai(view),
        "arucir_kazhinediladi_aciriya_virutham" => assess_aciriya_virutham(view, 6, "அறுசீர்"),
        "elucir_kazhinediladi_aciriya_virutham" => assess_aciriya_virutham(view, 7, "எழுசீர்"),
        "encir_kazhinediladi_aciriya_virutham" => assess_aciriya_virutham(view, 8, "எண்சீர்"),
        "aciriya_thazhisai" => assess_aciriya_thazhisai(view),
        "aciriya_thurai" => assess_aciriya_thurai(view),
        "kattalai_kalippaa" => assess_kattalai_kalippaa(view),
        "kattalai_kalithurai" => assess_kattalai_kalithurai(view),
        "kalithurai" => assess_kalithurai(view),
        "kalivirutham" => assess_kalivirutham(view),
        "kalithazhisai" => assess_kalithazhisai(view),
        "vanjithazhisai" => assess_vanjithazhisai(view),
        "vanjithurai" => assess_vanjithurai(view),
        "vanjivirutham" => assess_vanjivirutham(view),
        _ => unreachable!("unknown classical gate {gate_id}"),
    }
}

fn venpaa_core_conditions(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement(
            "venpaa_shape",
            venpaa_shape(&counts),
            "ஈற்றடி சிந்தடி; ஏனைய அடி அளவடி",
        ),
        requirement(
            "allowed_seers",
            allowed_body_seers(view.lines),
            "உடல் சீர் ஈரசை மா/விளம் அல்லது காய்",
        ),
        requirement(
            "ven_talai",
            all_bonds_ven(view.linkage),
            "தளை அனைத்தும் வெண்டளை",
        ),
        requirement(
            "ending_seer",
            poem_ending_seer(view.lines).is_some(),
            "ஈற்றுச்சீர் நாள், மலர், காசு அல்லது பிறப்பு",
        ),
    ]
}

fn assess_kural_venpaa(view: &PoemView<'_>, one_vikarpam: bool) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let vikarpam = vikarpam_run_count(view.lines);
    let mut conditions = vec![requirement("two_lines", counts.len() == 2, "இரண்டு அடி")];
    conditions.extend(venpaa_core_conditions(view));
    if one_vikarpam {
        conditions.push(requirement("one_vikarpam", vikarpam <= 1, "விகற்பம் ஒன்று"));
    } else {
        conditions.push(requirement(
            "two_vikarpam",
            vikarpam >= 2,
            "விகற்பம் இரண்டு அல்லது மேல்",
        ));
    }
    conditions
}

fn assess_sinthiyal(view: &PoemView<'_>, nerisai: bool) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let mut conditions = vec![requirement("three_lines", counts.len() == 3, "மூன்று அடி")];
    conditions.extend(venpaa_core_conditions(view));
    if nerisai {
        conditions.push(requirement(
            "etukai_tanichol",
            etukai_tanichol(view.source, view.lines).is_some(),
            "எதுகை அமைந்த தனிச்சொல்",
        ));
        conditions.push(requirement(
            "vikarpam_at_most_two",
            vikarpam_run_count(view.lines) <= 2,
            "விகற்பம் இரண்டுக்கு மிகாது",
        ));
    }
    conditions
}

fn assess_nerisai_venpaa(view: &PoemView<'_>, one_vikarpam: bool) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let vikarpam = vikarpam_run_count(view.lines);
    let mut conditions = vec![requirement("four_lines", counts.len() == 4, "நான்கு அடி")];
    conditions.extend(venpaa_core_conditions(view));
    conditions.push(requirement(
        "etukai_tanichol",
        etukai_tanichol(view.source, view.lines).is_some(),
        "எதுகை அமைந்த தனிச்சொல்",
    ));
    if one_vikarpam {
        conditions.push(requirement("one_vikarpam", vikarpam <= 1, "விகற்பம் ஒன்று"));
    } else {
        conditions.push(requirement("two_vikarpam", vikarpam == 2, "விகற்பம் இரண்டு"));
    }
    conditions
}

fn assess_inisai_venpaa(view: &PoemView<'_>, one_vikarpam: bool) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let mut conditions = vec![requirement("four_lines", counts.len() == 4, "நான்கு அடி")];
    conditions.extend(venpaa_core_conditions(view));
    if one_vikarpam {
        conditions.push(requirement(
            "one_vikarpam",
            vikarpam_run_count(view.lines) <= 1,
            "விகற்பம் ஒன்று",
        ));
    }
    conditions
}

fn assess_paqrodai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let mut conditions = vec![requirement(
        "line_span",
        (PAQRODAI_MIN_LINES..=PAQRODAI_MAX_LINES).contains(&counts.len()),
        "ஐந்து முதல் பன்னிரண்டு அடி",
    )];
    conditions.extend(venpaa_core_conditions(view));
    conditions
}

fn assess_kalivenpaa_strict(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let mut conditions = vec![requirement(
        "thirteen_lines",
        counts.len() >= KALIVENPAA_MIN_LINES,
        "பதிமூன்று அடி அல்லது மேல்",
    )];
    conditions.extend(venpaa_core_conditions(view));
    conditions
}

fn assess_kalivenpaa_long_osai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let ven_bonds = count_bonds(view.linkage, LinkageType::VenTalai);
    let feet = content_feet(view.lines);
    let no_kani = !feet.is_empty()
        && feet
            .iter()
            .all(|foot| !matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Kani)));
    vec![
        requirement(
            "thirteen_lines",
            counts.len() >= KALIVENPAA_MIN_LINES,
            "பன்னிரண்டு அடிக்கு மேல்",
        ),
        requirement(
            "last_cinthadi",
            counts.last() == Some(&CINTHADI_SEER_COUNT),
            "ஈற்றடி சிந்தடி",
        ),
        requirement(
            "ven_above_ninety",
            share_above(ven_bonds, view.linkage.len(), KALIVENPAA_VEN_TALAI_PERCENT),
            "வெண்டளை 90%க்கு மேல்",
        ),
        requirement("no_kani", no_kani, "கனிச்சீர் தவிர்க்கப்பட்டுள்ளது"),
    ]
}

#[derive(Clone, Copy)]
enum AciriyaPattern {
    Nilaimandila,
    Nerisai,
    Inaikkural,
}

fn assess_aciriya(view: &PoemView<'_>, pattern: AciriyaPattern) -> Vec<Condition> {
    let mut conditions = aciriya_core_conditions(view);
    let counts = content_seer_counts(view.lines);
    let pattern_passed = match pattern {
        AciriyaPattern::Nilaimandila => short_line_indexes(&counts).is_empty(),
        AciriyaPattern::Nerisai => only_penultimate_is_short(&counts),
        AciriyaPattern::Inaikkural => short_line_elsewhere(&counts),
    };
    let pattern_text = match pattern {
        AciriyaPattern::Nilaimandila => "குறுகிய அடி இல்லாமல்",
        AciriyaPattern::Nerisai => "குறுகிய அடி ஈற்றயலடி மட்டும்",
        AciriyaPattern::Inaikkural => "குறுகிய அடி ஈற்றயலடி அல்லாமலும்",
    };
    conditions.push(requirement("adi_pattern", pattern_passed, pattern_text));
    conditions
}

fn aciriya_core_conditions(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let feet = content_feet(view.lines);
    let iyar = feet
        .iter()
        .filter(|foot| matches!(cir_class_for_foot(foot), Some(CirAcaiClass::Maa | CirAcaiClass::Vilam)))
        .count();
    let aciriya_bonds = count_bonds(view.linkage, LinkageType::AciriyaTalai);
    let ending_text = last_syllable_text(view.lines);
    let no_forbidden = !feet.is_empty() && feet.iter().all(|foot| !is_forbidden_aciriya_foot(foot));
    let no_long = !counts.is_empty() && counts.iter().all(|count| *count <= ALAVADI_SEER_COUNT);
    let first = counts.first().copied().unwrap_or(0);
    let last = counts.last().copied().unwrap_or(0);
    let edges = counts.len() >= 2 && first >= ALAVADI_SEER_COUNT && last >= ALAVADI_SEER_COUNT;
    let middles_ok = counts.len() >= 3
        && !counts
            .iter()
            .skip(1)
            .take(counts.len().saturating_sub(2))
            .any(|count| {
                *count < ALAVADI_SEER_COUNT
                    && *count != CINTHADI_SEER_COUNT
                    && *count != KURALADI_SEER_COUNT
            });
    vec![
        requirement("three_lines", counts.len() >= 3, "குறைந்தபட்சம் மூன்று அடி"),
        requirement(
            "iyar_cir",
            share_above(iyar, feet.len(), MAJORITY_PERCENT),
            "இயற்சீர் 40%க்கு மேல்",
        ),
        requirement(
            "aciriya_talai",
            share_above(aciriya_bonds, view.linkage.len(), MAJORITY_PERCENT),
            "ஆசிரியத்தளை 40%க்கு மேல்",
        ),
        requirement(
            "aciriya_ending",
            aciriya_ending(&ending_text),
            "ஈற்றசை ஏ, ஓ, ஈ, ஆய், ஐ அல்லது என்",
        ),
        requirement(
            "no_vilangani",
            no_forbidden,
            "கருவிளங்கனியும் கூவிளங்கனியும் இல்லாமல்",
        ),
        requirement("no_long_line", no_long, "அளவடிக்கு மேல் நீளாத அடி"),
        requirement("edge_alavadi", edges, "முதலடியும் ஈற்றடியும் அளவடி"),
        requirement(
            "middle_adi",
            middles_ok,
            "இடை அடி குறளடி, சிந்தடி அல்லது அளவடி",
        ),
    ]
}

fn short_line_indexes(counts: &[usize]) -> Vec<usize> {
    counts
        .iter()
        .enumerate()
        .filter(|(_, count)| **count < ALAVADI_SEER_COUNT)
        .map(|(index, _)| index)
        .collect()
}

fn only_penultimate_is_short(counts: &[usize]) -> bool {
    if counts.len() < 2 {
        return false;
    }
    let penultimate = counts.len() - 2;
    short_line_indexes(counts).as_slice() == [penultimate]
}

fn short_line_elsewhere(counts: &[usize]) -> bool {
    let shorts = short_line_indexes(counts);
    !shorts.is_empty() && !only_penultimate_is_short(counts)
}

fn assess_tharavu(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let feet = content_feet(view.lines);
    let alavadi_only = counts.len() >= ALAVADI_SEER_COUNT
        && counts.iter().all(|count| *count == ALAVADI_SEER_COUNT);
    let no_maa = !feet.is_empty() && feet.iter().all(|foot| !is_maa_or_vilangani(foot));
    let kali = count_bonds(view.linkage, LinkageType::KaliTalai);
    vec![
        requirement(
            "four_lines",
            counts.len() >= ALAVADI_SEER_COUNT,
            "நான்கு அடி அல்லது மேல்",
        ),
        requirement("alavadi_only", alavadi_only, "அடிதோறும் அளவடி"),
        requirement(
            "no_maa_or_vilangani",
            no_maa,
            "மாச்சீரும் விளங்கனியும் இல்லாமல்",
        ),
        requirement(
            "kali_talai",
            share_above(kali, view.linkage.len(), MAJORITY_PERCENT),
            "கலித்தளை 40%க்கு மேல்",
        ),
    ]
}

fn assess_venkali(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let kali = count_bonds(view.linkage, LinkageType::KaliTalai);
    let ven = count_bonds(view.linkage, LinkageType::VenTalai);
    let body_ok = counts.len() >= ALAVADI_SEER_COUNT && non_last_lines_lack_maa_and_vilangani(view.lines);
    vec![
        requirement(
            "venkali_shape",
            venkali_shape(&counts),
            "ஈற்றடி சிந்தடி; ஏனைய அடி அளவடி; நான்கு அடி அல்லது மேல்",
        ),
        requirement(
            "body_seers",
            body_ok,
            "ஈற்றடி அல்லாத அடியில் மாச்சீரும் விளங்கனியும் இல்லாமல்",
        ),
        requirement(
            "kali_and_ven",
            share_above(kali + ven, view.linkage.len(), VENKALI_COMBINED_TALAI_PERCENT),
            "கலித்தளை மற்றும் வெண்டளை 50%க்கு மேல்",
        ),
        requirement(
            "kali_floor",
            share_above(kali, view.linkage.len(), VENKALI_KALI_TALAI_FLOOR_PERCENT),
            "கலித்தளை 25%க்கு மேல்",
        ),
    ]
}

fn venkali_shape(counts: &[usize]) -> bool {
    counts.len() >= ALAVADI_SEER_COUNT
        && counts.last() == Some(&CINTHADI_SEER_COUNT)
        && counts[..counts.len() - 1]
            .iter()
            .all(|count| *count == ALAVADI_SEER_COUNT)
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
    let tanichol_pos = content
        .iter()
        .position(|(start, count)| *count == 1 && *start > 0)?;
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
    let surithagam_end = surithagam.last()?.0 + surithagam.last()?.1;
    Some(VanjiSplit {
        vanji_start: vanji.first()?.0,
        vanji_end: content[tanichol_pos].0,
        vanji_seer_count,
        surithagam_start: surithagam.first()?.0,
        surithagam_end,
        surithagam_lines: surithagam.len(),
    })
}

fn assess_vanji(view: &PoemView<'_>, expected_seers: usize, seer_name: &str) -> Vec<Condition> {
    let Some(split) = vanji_split(view.lines) else {
        return vec![
            requirement("skeleton", false, "வஞ்சி அடி, தனிச்சொல், சுரிதகம்"),
            requirement("kani_tenth", false, "கனிச்சீர் பத்தில் 40"),
            requirement("vanji_talai", false, "வஞ்சித்தளை 40%க்கு மேல்"),
            requirement("surithagam", false, "சுரிதக ஆசிரியத்தளை 40%க்கு மேல்"),
            requirement("seer_count", false, seer_name),
        ];
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
    vec![
        requirement("skeleton", true, "வஞ்சி அடி, தனிச்சொல், சுரிதகம்"),
        requirement(
            "kani_tenth",
            share_rounds_to_tenth(kani, vanji_feet.len(), MAJORITY_PERCENT),
            &format!("கனிச்சீர் {kani}/{} பத்தில் 40", vanji_feet.len()),
        ),
        requirement(
            "vanji_talai",
            share_above(vanji_talai, vanji_bonds.len(), MAJORITY_PERCENT),
            "வஞ்சித்தளை 40%க்கு மேல்",
        ),
        requirement(
            "surithagam",
            split.surithagam_lines >= SURITHAGAM_MIN_LINES
                && share_above(suri_aciriya, suri_bonds.len(), MAJORITY_PERCENT),
            "சுரிதக ஆசிரியத்தளை 40%க்கு மேல்",
        ),
        requirement(
            "seer_count",
            split.vanji_seer_count == expected_seers,
            seer_name,
        ),
    ]
}

fn assess_vellathazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let stacks = counts.len() == 9
        && counts
            .chunks(3)
            .all(|chunk| chunk == [ALAVADI_SEER_COUNT, ALAVADI_SEER_COUNT, CINTHADI_SEER_COUNT]);
    vec![
        requirement("nine_lines", counts.len() == 9, "ஒன்பது அடி"),
        requirement(
            "venpaa_stacks",
            stacks,
            "ஒவ்வொரு அடுக்கும் அளவடி, அளவடி, சிந்தடி",
        ),
    ]
}

fn assess_velivirutham(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let tokens = tanichol_tokens(view.source);
    let same_tanichol = (counts.len() == 3 || counts.len() == 4)
        && tokens.len() == counts.len()
        && tokens.iter().all(|token| token == &tokens[0]);
    vec![
        requirement(
            "three_or_four",
            counts.len() == 3 || counts.len() == 4,
            "மூன்று அல்லது நான்கு அடி",
        ),
        requirement(
            "nediladi",
            !counts.is_empty() && counts.iter().all(|count| *count == NEDILADI_SEER_COUNT),
            "அடிதோறும் நெடிலடி",
        ),
        requirement("one_tanichol", same_tanichol, "அடியிறுதி ஒரே தனிச்சொல்"),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
    ]
}

fn assess_ventazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("three_lines", counts.len() == 3, "மூன்று அடி"),
        requirement(
            "first_alavadi",
            counts.first() == Some(&ALAVADI_SEER_COUNT),
            "முதல் அடி அளவடி",
        ),
        requirement(
            "second_alavadi",
            counts.get(1) == Some(&ALAVADI_SEER_COUNT),
            "இரண்டாம் அடி அளவடி",
        ),
        requirement(
            "last_cinthadi",
            counts.get(2) == Some(&CINTHADI_SEER_COUNT),
            "ஈற்றடி சிந்தடி",
        ),
    ]
}

fn assess_vendurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement(
            "three_to_seven",
            (VENDURAI_MIN_LINES..=VENDURAI_MAX_LINES).contains(&counts.len()),
            "மூன்று முதல் ஏழு அடி",
        ),
        requirement(
            "single_step",
            is_single_step_down(&counts),
            "ஒரே படியாகக் குறையும் அடி",
        ),
    ]
}

fn assess_kural_vensenthurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let equal = counts.len() == 2 && counts[0] == counts[1];
    vec![
        requirement("two_lines", counts.len() == 2, "இரண்டு அடி"),
        requirement("equal_length", equal, "இரண்டு அடியும் ஒரே அளவு"),
    ]
}

fn assess_kurattazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let two = counts.len() == 2;
    vec![
        requirement("two_lines", two, "இரண்டு அடி"),
        requirement(
            "first_alavadi",
            two && counts[0] >= ALAVADI_SEER_COUNT,
            "முதலடி குறைந்தபட்சம் நான்கு சீர்",
        ),
        requirement(
            "second_shorter",
            two && counts[1] < counts[0],
            "இரண்டாம் அடி குறைவு",
        ),
    ]
}

fn assess_aciriya_virutham(view: &PoemView<'_>, expected_seers: usize, seer_name: &str) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let four = counts.len() == 4;
    let equal = four && counts.iter().all(|count| *count == counts[0]);
    let long_enough = four && counts.iter().all(|count| *count >= KAZHINEDILADI_MIN_SEERS);
    vec![
        requirement("four_lines", four, "நான்கு அடி"),
        requirement("equal_lines", equal, "நான்கு அடியும் ஒரே அளவு"),
        requirement("kazhinediladi", long_enough, "கழிநெடிலடி"),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
        requirement(
            "seer_count",
            equal && counts.first() == Some(&expected_seers),
            seer_name,
        ),
    ]
}

fn assess_aciriya_thazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let three = counts.len() == 3;
    vec![
        requirement("three_lines", three, "மூன்று அடி"),
        requirement(
            "equal_lines",
            three && counts.iter().all(|count| *count == counts[0]),
            "மூன்று அடியும் ஒரே அளவு",
        ),
        requirement(
            "at_least_kuraladi",
            three && counts.iter().all(|count| *count >= KURALADI_SEER_COUNT),
            "ஒவ்வொரு அடியும் குறளடி அல்லது மேல்",
        ),
    ]
}

fn assess_aciriya_thurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let (shorter, none_longer, peer) = thurai_parts(&counts);
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement("one_shorter", shorter, "ஒரு அடி ஈற்றடியை விடக் குறைவு"),
        requirement("none_longer", none_longer, "ஈற்றடியை விட நீண்ட அடி இல்லாமல்"),
        requirement("peer", peer, "குறையாத அடி ஈற்றடியின் அளவு"),
    ]
}

fn thurai_parts(counts: &[usize]) -> (bool, bool, bool) {
    if counts.len() != 4 {
        return (false, false, false);
    }
    let last = counts[3];
    let earlier = &counts[..3];
    (
        earlier.iter().any(|count| *count < last),
        earlier.iter().all(|count| *count <= last),
        earlier.iter().any(|count| *count == last),
    )
}

fn assess_kattalai_kalippaa(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let lines = content_lines(view.lines);
    let letters = lines.len() == 8
        && lines.iter().all(|line| {
            kattalai_letter_count_matches(
                line,
                KATTALAI_KALIPPAA_NER_LETTER_COUNT,
                KATTALAI_KALIPPAA_NIRAI_LETTER_COUNT,
            )
        });
    vec![
        requirement("eight_lines", counts.len() == 8, "எட்டு அரையடி"),
        requirement(
            "alavadi",
            counts.len() == 8 && counts.iter().all(|count| *count == ALAVADI_SEER_COUNT),
            "அரையடிதோறும் நான்கு சீர்",
        ),
        requirement(
            "letter_count",
            letters,
            "மெய்யொழித்து நேர் 11, நிரை 12 எழுத்து",
        ),
        requirement(
            "opening_aciriya",
            arai_openings_are_aciriya(view),
            "அரையடியின் முதல் தளை ஆசிரியத்தளை",
        ),
        requirement(
            "later_ven",
            arai_later_bonds_are_ven(view),
            "அரையடியின் பின் தளை வெண்டளை",
        ),
    ]
}

fn arai_openings_are_aciriya(view: &PoemView<'_>) -> bool {
    let spans = content_spans(view.lines);
    spans.len() == 8
        && spans.iter().all(|(start, count)| {
            *count == ALAVADI_SEER_COUNT
                && bond_is_kind(view.linkage, *start, LinkageType::AciriyaTalai)
        })
}

fn arai_later_bonds_are_ven(view: &PoemView<'_>) -> bool {
    let spans = content_spans(view.lines);
    spans.len() == 8
        && spans.iter().all(|(start, count)| {
            *count == ALAVADI_SEER_COUNT
                && bond_is_kind(view.linkage, start + 1, LinkageType::VenTalai)
                && bond_is_kind(view.linkage, start + 2, LinkageType::VenTalai)
        })
}

fn assess_kattalai_kalithurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let lines = content_lines(view.lines);
    let four_nedil = counts.len() == 4 && counts.iter().all(|count| *count == NEDILADI_SEER_COUNT);
    let letters = four_nedil
        && lines.iter().all(|line| {
            kattalai_letter_count_matches(
                line,
                KATTALAI_KALITHURAI_NER_LETTER_COUNT,
                KATTALAI_KALITHURAI_NIRAI_LETTER_COUNT,
            )
        });
    let fifth = four_nedil
        && lines.iter().all(|line| {
            line.feet
                .get(NEDILADI_SEER_COUNT - 1)
                .is_some_and(is_kattalai_fifth_seer)
        });
    let others = four_nedil
        && lines.iter().all(|line| {
            line.feet
                .iter()
                .take(NEDILADI_SEER_COUNT - 1)
                .all(|foot| !is_vilangaay(foot))
        });
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement("nediladi", four_nedil, "அடிதோறும் நெடிலடி"),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
        requirement(
            "letter_count",
            letters,
            "மெய்யொழித்து நேர் 16, நிரை 17 எழுத்து",
        ),
        requirement(
            "internal_ven",
            kalithurai_internal_ven(view),
            "அடிக்குள் வெண்டளை",
        ),
        requirement(
            "fifth_seer",
            fifth,
            "ஐந்தாம் சீர் விளங்காய், மாங்கனி அல்லது மாந்தண்பூ",
        ),
        requirement("other_seers", others, "ஏனைய சீர் விளங்காய் அல்ல"),
        requirement("ekaram", ends_on_ekaram(view.lines), "ஈறு ஏ"),
    ]
}

fn kalithurai_internal_ven(view: &PoemView<'_>) -> bool {
    let spans = content_spans(view.lines);
    spans.len() == 4
        && spans.iter().all(|(start, count)| {
            *count == NEDILADI_SEER_COUNT
                && (0..NEDILADI_SEER_COUNT - 1).all(|offset| {
                    bond_is_kind(view.linkage, start + offset, LinkageType::VenTalai)
                })
        })
}

fn assess_kalithurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement(
            "nediladi",
            counts.len() == 4 && counts.iter().all(|count| *count == NEDILADI_SEER_COUNT),
            "அடிதோறும் நெடிலடி",
        ),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
    ]
}

fn assess_kalivirutham(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement(
            "alavadi",
            counts.len() == 4 && counts.iter().all(|count| *count == ALAVADI_SEER_COUNT),
            "அடிதோறும் அளவடி",
        ),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
    ]
}

fn assess_kalithazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    let last_longest = if counts.len() > 1 {
        let last = counts[counts.len() - 1];
        counts[..counts.len() - 1].iter().all(|count| *count < last)
    } else {
        false
    };
    vec![
        requirement("several_lines", counts.len() > 1, "ஒன்றுக்கு மேற்பட்ட அடி"),
        requirement("last_longest", last_longest, "ஈற்றடி பிற அடிகளை விட நீளம்"),
    ]
}

fn assess_vanjithazhisai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("twelve_lines", counts.len() == 12, "பன்னிரண்டு அடி"),
        requirement(
            "kuraladi",
            counts.len() == 12 && counts.iter().all(|count| *count == KURALADI_SEER_COUNT),
            "அடிதோறும் குறளடி",
        ),
    ]
}

fn assess_vanjithurai(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement(
            "kuraladi",
            counts.len() == 4 && counts.iter().all(|count| *count == KURALADI_SEER_COUNT),
            "அடிதோறும் குறளடி",
        ),
    ]
}

fn assess_vanjivirutham(view: &PoemView<'_>) -> Vec<Condition> {
    let counts = content_seer_counts(view.lines);
    vec![
        requirement("four_lines", counts.len() == 4, "நான்கு அடி"),
        requirement(
            "cinthadi",
            counts.len() == 4 && counts.iter().all(|count| *count == CINTHADI_SEER_COUNT),
            "அடிதோறும் சிந்தடி",
        ),
        requirement(
            "shared_etukai",
            lines_share_etukai(view.lines),
            "ஒரே அடி எதுகை",
        ),
    ]
}

fn venpaa_shape(counts: &[usize]) -> bool {
    counts.len() >= 2
        && counts.last() == Some(&CINTHADI_SEER_COUNT)
        && counts[..counts.len() - 1]
            .iter()
            .all(|count| *count == ALAVADI_SEER_COUNT)
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

#[cfg(test)]
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

    fn poem_view<'a>(
        source: &'a str,
        lines: &'a [Line],
        linkage: &'a [crate::linkage::Linkage],
    ) -> PoemView<'a> {
        PoemView {
            source,
            lines,
            linkage,
        }
    }

    #[test]
    fn each_gate_reports_its_full_condition_list() {
        let view = PoemView {
            source: "",
            lines: &[],
            linkage: &[],
        };
        for gate in GATES {
            assert_eq!(
                assess(gate.id, &view).len(),
                gate.condition_count as usize,
                "{}",
                gate.id
            );
        }
    }

    #[test]
    fn strict_order_checks_heavier_gates_first() {
        let order = gates_sorted(true);
        for pair in order.windows(2) {
            let left = &pair[0];
            let right = &pair[1];
            let heavier_or_avalokitam_tie = left.condition_count > right.condition_count
                || (left.condition_count == right.condition_count
                    && left.avalokitam_rank <= right.avalokitam_rank);
            assert!(
                heavier_or_avalokitam_tie,
                "{} ({}) before {} ({})",
                left.id, left.condition_count, right.id, right.condition_count
            );
        }
    }

    #[test]
    fn mermaid_lists_gates_in_strict_first_order() {
        let diagram = include_str!("../../docs/classical-tree.mmd");
        let mut seen = Vec::new();
        for line in diagram.lines() {
            let Some(bracket_at) = line.find('[') else {
                continue;
            };
            let gate_id = line[..bracket_at].trim();
            if !GATES.iter().any(|gate| gate.id == gate_id) {
                continue;
            }
            seen.push(gate_id);
        }
        let expected: Vec<&str> = gates_sorted(true).into_iter().map(|gate| gate.id).collect();
        assert_eq!(seen, expected);
    }

    #[test]
    fn published_examples_keep_the_avalokitam_leaf() {
        for block in poem_variations_blocks() {
            for row in block.special_types.iter().chain(block.variations.iter()) {
                let result = parse_poem(row.example, options_without_ml()).expect("parse");
                let view = poem_view(&result.normalized_text, &result.lines, &result.linkage);
                let avalokitam = matching_leaf(&view, false).expect(row.en);
                let strict = matching_leaf(&view, true).expect(row.en);
                assert_eq!(strict.id, result.classical_tree.leaf_id, "{}", row.en);
                assert_eq!(
                    avalokitam.id, strict.id,
                    "{} would change from {} under Avalokitam order",
                    row.en, avalokitam.id
                );
            }
        }
    }

    #[test]
    fn trace_names_every_condition_of_each_failed_stricter_gate() {
        for block in poem_variations_blocks() {
            for row in block.special_types.iter().chain(block.variations.iter()) {
                let result = parse_poem(row.example, options_without_ml()).expect("parse");
                let mut groups: Vec<(String, Vec<&ClassicalTreeCheck>)> = Vec::new();
                for step in &result.classical_tree.path {
                    if step.rule_id == "thodai_merkathuvai" {
                        continue;
                    }
                    let Some((gate_id, _)) = step.rule_id.split_once('.') else {
                        panic!("{} bare rule {}", row.en, step.rule_id);
                    };
                    if groups.last().is_some_and(|(id, _)| id == gate_id) {
                        groups.last_mut().expect("group").1.push(step);
                    } else {
                        groups.push((gate_id.to_string(), vec![step]));
                    }
                }
                let (winner_id, winner_steps) = groups.last().expect(row.en);
                assert!(
                    winner_steps.iter().all(|step| step.passed),
                    "{} winner {}",
                    row.en,
                    winner_id
                );
                let winner = GATES.iter().find(|gate| gate.id == winner_id).expect(winner_id);
                assert_eq!(winner_steps.len(), winner.condition_count as usize, "{}", row.en);
                assert_eq!(winner.leaf.id, result.classical_tree.leaf_id, "{}", row.en);
                for (gate_id, steps) in &groups[..groups.len() - 1] {
                    let gate = GATES.iter().find(|candidate| candidate.id == gate_id).expect(gate_id);
                    assert_eq!(steps.len(), gate.condition_count as usize, "{gate_id}");
                    assert!(
                        steps.iter().any(|step| !step.passed),
                        "{gate_id} on {}",
                        row.en
                    );
                }
            }
        }
    }

    #[test]
    fn kattalai_kalithurai_wins_when_velivirutham_also_matches() {
        let line = "கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே";
        let poem = [line; 4].join("\n");
        let result = parse_poem(&poem, options_without_ml()).expect("parse");
        assert_eq!(content_seer_counts(&result.lines), vec![5, 5, 5, 5]);
        let view = poem_view(&result.normalized_text, &result.lines, &result.linkage);
        assert!(assess("kattalai_kalithurai", &view).iter().all(|condition| condition.passed));
        assert!(assess("velivirutham", &view).iter().all(|condition| condition.passed));
        assert_eq!(matching_leaf(&view, false).expect("avalokitam").id, "velivirutham");
        assert_eq!(matching_leaf(&view, true).expect("strict").id, "kattalai_kalithurai");
        assert_eq!(result.classical_tree.leaf_id, "kattalai_kalithurai");
        assert_eq!(result.classical_tree.label_ta, "கட்டளை கலித்துறை");
    }

    fn variation_row(sample_id: &str) -> crate::poem_variations::PoemVariationRow {
        poem_variations_blocks()
            .into_iter()
            .flat_map(|block| block.special_types.iter().chain(block.variations.iter()).copied())
            .find(|row| row.en == sample_id)
            .unwrap_or_else(|| panic!("missing {sample_id}"))
    }

    #[test]
    fn kattalai_kalippaa_stays_ahead_of_tharavu_without_a_verdict_change() {
        let row = variation_row("kattalai_kalippaa");
        let result = parse_poem(row.example, options_without_ml()).expect("parse");
        let view = poem_view(&result.normalized_text, &result.lines, &result.linkage);
        let tharavu = assess("tharavukocha_kalippaa", &view);
        assert!(tharavu.iter().any(|condition| condition.id == "kali_talai" && !condition.passed));
        assert_eq!(matching_leaf(&view, false).expect("avalokitam").id, "kattalai_kalippaa");
        assert_eq!(matching_leaf(&view, true).expect("strict").id, "kattalai_kalippaa");
    }

    #[test]
    fn aciriya_before_venpaa_does_not_steal_a_kural() {
        let poem = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு";
        let result = parse_poem(poem, options_without_ml()).expect("parse");
        let view = poem_view(&result.normalized_text, &result.lines, &result.linkage);
        let aciriya = assess("nilaimandila_aciriyappaa", &view);
        assert!(aciriya.iter().any(|condition| !condition.passed));
        assert_eq!(matching_leaf(&view, false).expect("avalokitam").id, "oru_vikarpa_kural_venpaa");
        assert_eq!(matching_leaf(&view, true).expect("strict").id, "oru_vikarpa_kural_venpaa");
    }

    #[test]
    fn vanji_before_long_kalivenpaa_does_not_move_the_published_example() {
        let row = variation_row("kalivenpaa");
        let result = parse_poem(row.example, options_without_ml()).expect("parse");
        let view = poem_view(&result.normalized_text, &result.lines, &result.linkage);
        assert!(assess("kuraladi_vanjippaa", &view).iter().any(|condition| !condition.passed));
        assert!(assess("sinthadi_vanjippaa", &view).iter().any(|condition| !condition.passed));
        assert_eq!(matching_leaf(&view, false).expect("avalokitam").id, "kalivenpaa");
        assert_eq!(matching_leaf(&view, true).expect("strict").id, "kalivenpaa");
    }

    #[test]
    fn kattalai_kalithurai_is_checked_before_velivirutham() {
        let strict = gates_sorted(true);
        let avalokitam = gates_sorted(false);
        let strict_kattalai = strict
            .iter()
            .position(|gate| gate.id == "kattalai_kalithurai")
            .expect("kattalai");
        let strict_veli = strict
            .iter()
            .position(|gate| gate.id == "velivirutham")
            .expect("veli");
        let avalokitam_kattalai = avalokitam
            .iter()
            .position(|gate| gate.id == "kattalai_kalithurai")
            .expect("kattalai");
        let avalokitam_veli = avalokitam
            .iter()
            .position(|gate| gate.id == "velivirutham")
            .expect("veli");
        assert!(strict_kattalai < strict_veli);
        assert!(avalokitam_veli < avalokitam_kattalai);
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
        assert!(result.classical_tree.path.iter().any(|step| {
            step.rule_id == "oru_vikarpa_kural_venpaa.ending_seer" && !step.passed
        }));
        assert!(result.classical_tree.path.iter().any(|step| {
            step.rule_id == "iru_vikarpa_kural_venpaa.ending_seer" && !step.passed
        }));
        let kurattazhisai: Vec<_> = result
            .classical_tree
            .path
            .iter()
            .filter(|step| step.rule_id.starts_with("kurattazhisai."))
            .collect();
        assert_eq!(kurattazhisai.len(), 3);
        assert!(kurattazhisai.iter().all(|step| step.passed));
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
    fn velivirutham_rejects_lines_without_shared_etukai() {
        let poem = "மருள்அறுத்த பெரும்போதி மாதவரைக் கண்டிலனால்! - என்செய்கோயான்!\nஅகழ்இருந்த திருமொழியால் அறவழக்கங் கேட்டிலனால்! - என்செய்கோயான்!\nபொருள்அறியும் அருந்தவத்துப் புரவலரைக் கண்டிலனால்! - என்செய்கோயான்!";
        let result = parse_poem(poem, options_without_ml()).expect("parse");
        assert_eq!(content_seer_counts(&result.lines), vec![5, 5, 5]);
        assert_ne!(result.classical_tree.leaf_id, "velivirutham");
        assert_ne!(result.classical_tree.label_ta, "வெளிவிருத்தம்");
    }

    #[test]
    fn agreement_is_null_when_metre_detection_is_off() {
        let poem = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு";
        let result = parse_poem(poem, options_without_ml()).expect("parse");
        assert_eq!(result.classical_tree.tree_agrees_with_ml, None);
        assert_eq!(result.metre_type, None);
    }
}
