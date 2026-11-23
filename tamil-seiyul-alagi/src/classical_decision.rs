//! Named routes for the classical-tree inconsistencies.
//!
//! Each route records the source that won: the treatise seat or count, or the
//! Avalokitam site wording. `classical_tree` calls these functions, and the
//! trace records the route that ran. The leaf machine is `family_walk_gate`.

use crate::syllable::SyllableType;

/// Where a chosen route comes from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DecisionSource {
    /// A classical seat, seer count, or treatise pattern.
    Treatise,
    /// Avalokitam wording, a site percent, or a site stand-in.
    Site,
}

impl DecisionSource {
    pub const fn label(self) -> &'static str {
        match self {
            DecisionSource::Treatise => "treatise",
            DecisionSource::Site => "site",
        }
    }
}

/// How a percent gate decides.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ShareRoute {
    /// `part * 100 > whole * percent`. An exact share fails.
    StrictAbove {
        percent: usize,
        source: DecisionSource,
    },
    /// Round `part / whole` to one tenth, then compare with `percent`.
    RoundToTenth {
        percent: usize,
        source: DecisionSource,
    },
}

/// Avalokitam "மிகுந்து" / "க்கு மேல்" cutoff. Exact 40 fails.
pub const MAJORITY_PERCENT: usize = 40;
/// வெண்கலிப்பா: கலித்தளை and வெண்டளை together. Exact 50 fails.
pub const VENKALI_COMBINED_TALAI_PERCENT: usize = 50;
/// வெண்கலிப்பா: கலித்தளை alone. Exact 25 fails.
pub const VENKALI_KALI_TALAI_FLOOR_PERCENT: usize = 25;
/// கலிவெண்பா long ஓசை. Exact 90 fails.
pub const KALIVENPAA_VEN_TALAI_PERCENT: usize = 90;
/// அளவடி is four seers. The site sometimes uses the word for a line.
pub const ALAVADI_SEER_COUNT: usize = 4;

pub const SHARE_STRICT_40: ShareRoute = ShareRoute::StrictAbove {
    percent: MAJORITY_PERCENT,
    source: DecisionSource::Site,
};
pub const SHARE_STRICT_50: ShareRoute = ShareRoute::StrictAbove {
    percent: VENKALI_COMBINED_TALAI_PERCENT,
    source: DecisionSource::Site,
};
pub const SHARE_STRICT_25: ShareRoute = ShareRoute::StrictAbove {
    percent: VENKALI_KALI_TALAI_FLOOR_PERCENT,
    source: DecisionSource::Site,
};
pub const SHARE_STRICT_90: ShareRoute = ShareRoute::StrictAbove {
    percent: KALIVENPAA_VEN_TALAI_PERCENT,
    source: DecisionSource::Site,
};
/// சிந்தடி வஞ்சி கனி. 7/18 rounds to one tenth and passes. 6/18 rounds to 0.3 and fails.
pub const KANI_TENTH_40: ShareRoute = ShareRoute::RoundToTenth {
    percent: MAJORITY_PERCENT,
    source: DecisionSource::Site,
};

/// One share comparison and the route that owns it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ShareDecision {
    pub condition_id: &'static str,
    pub route: ShareRoute,
}

/// Decision table: which condition uses which percent route.
pub const SHARE_DECISIONS: [ShareDecision; 9] = [
    ShareDecision {
        condition_id: "iyar_cir",
        route: SHARE_STRICT_40,
    },
    ShareDecision {
        condition_id: "aciriya_talai",
        route: SHARE_STRICT_40,
    },
    ShareDecision {
        condition_id: "kali_talai",
        route: SHARE_STRICT_40,
    },
    ShareDecision {
        condition_id: "vanji_talai",
        route: SHARE_STRICT_40,
    },
    ShareDecision {
        condition_id: "surithagam",
        route: SHARE_STRICT_40,
    },
    ShareDecision {
        condition_id: "kali_and_ven",
        route: SHARE_STRICT_50,
    },
    ShareDecision {
        condition_id: "kali_floor",
        route: SHARE_STRICT_25,
    },
    ShareDecision {
        condition_id: "ven_above_ninety",
        route: SHARE_STRICT_90,
    },
    ShareDecision {
        condition_id: "kani_tenth",
        route: KANI_TENTH_40,
    },
];

/// Documented சிந்தடி வஞ்சி கனி cases: `(part, whole, passes)`.
pub const KANI_TENTH_CASES: [(usize, usize, bool); 2] = [(7, 18, true), (6, 18, false)];

pub fn share_route_message(route: ShareRoute) -> &'static str {
    match route {
        ShareRoute::StrictAbove {
            percent: 40,
            source: DecisionSource::Site,
        } => "strict_above_40; மூலம் site",
        ShareRoute::StrictAbove {
            percent: 50,
            source: DecisionSource::Site,
        } => "strict_above_50; மூலம் site",
        ShareRoute::StrictAbove {
            percent: 25,
            source: DecisionSource::Site,
        } => "strict_above_25; மூலம் site",
        ShareRoute::StrictAbove {
            percent: 90,
            source: DecisionSource::Site,
        } => "strict_above_90; மூலம் site",
        ShareRoute::RoundToTenth {
            percent: 40,
            source: DecisionSource::Site,
        } => "round_to_tenth_40; மூலம் site; 7/18 passes; 6/18 fails",
        _ => "unnamed share route",
    }
}

/// Site wording is "above" the percent, so an exact share does not pass.
pub fn strict_above(part: usize, whole: usize, percent: usize) -> bool {
    whole > 0 && part.saturating_mul(100) > whole.saturating_mul(percent)
}

/// Round `part / whole` to one tenth, then compare with `percent`.
pub fn round_to_tenth(part: usize, whole: usize, percent: usize) -> bool {
    if whole == 0 {
        return false;
    }
    let tenths = part.saturating_mul(10).saturating_add(whole / 2) / whole;
    tenths.saturating_mul(10) >= percent
}

pub fn share_passes(route: ShareRoute, part: usize, whole: usize) -> bool {
    match route {
        ShareRoute::StrictAbove { percent, .. } => strict_above(part, whole, percent),
        ShareRoute::RoundToTenth { percent, .. } => round_to_tenth(part, whole, percent),
    }
}

/// மேற்கதுவாய் seats. The note is not a gate.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MerkathuvaiSeatRoute {
    /// Classical seats 1, 3, and 4. Chosen.
    TreatiseOneThreeFour,
    /// Site text 1, 2, and 3. Not chosen.
    #[allow(dead_code)]
    SiteOneTwoThree,
}

pub const MERKATHUVAI_SEAT_ROUTE: MerkathuvaiSeatRoute = MerkathuvaiSeatRoute::TreatiseOneThreeFour;
pub const MERKATHUVAI_SEER_POSITIONS: [usize; 3] = [1, 3, 4];

pub fn merkathuvai_seat_positions(route: MerkathuvaiSeatRoute) -> [usize; 3] {
    match route {
        MerkathuvaiSeatRoute::TreatiseOneThreeFour => MERKATHUVAI_SEER_POSITIONS,
        MerkathuvaiSeatRoute::SiteOneTwoThree => [1, 2, 3],
    }
}

/// What அளவடி counts as.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AlavadiWordRoute {
    /// Four seers. Chosen.
    FourSeers { source: DecisionSource },
    /// The site sometimes uses the word for a line. Not chosen for the count.
    #[allow(dead_code)]
    SiteLineInGeneral { source: DecisionSource },
}

pub const ALAVADI_WORD_ROUTE: AlavadiWordRoute = AlavadiWordRoute::FourSeers {
    source: DecisionSource::Treatise,
};

/// தரவுகொச்சகக் கலிப்பா line count.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TharavuAlavadiRoute {
    /// Four or more அளவடி. Chosen. A four-line poem still fits.
    FourOrMore { source: DecisionSource },
    /// The success-line reading "நான்கு அளவடிக்கு மேல்". Not chosen.
    #[allow(dead_code)]
    SiteWordingAboveFour { source: DecisionSource },
}

pub const THARAVU_ALAVADI_ROUTE: TharavuAlavadiRoute = TharavuAlavadiRoute::FourOrMore {
    source: DecisionSource::Treatise,
};

pub fn tharavu_line_count_passes(route: TharavuAlavadiRoute, line_count: usize) -> bool {
    match route {
        TharavuAlavadiRoute::FourOrMore { .. } => line_count >= ALAVADI_SEER_COUNT,
        TharavuAlavadiRoute::SiteWordingAboveFour { .. } => line_count > ALAVADI_SEER_COUNT,
    }
}

/// நேரிசை தனிச்சொல் and விகற்பம்.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum NerisaiTieRoute {
    /// One combined mark. The three நேரிசை leaves stay at 6 and tie with குறள்.
    /// Avalokitam rank still tries குறள் first.
    CombinedMarkAvalokitamRank { source: DecisionSource },
    /// A split mark would add a condition and put நேரிசை ahead of குறள். Not chosen.
    #[allow(dead_code)]
    SplitMarkWouldOutrankKural { source: DecisionSource },
}

pub const NERISAI_TIE_ROUTE: NerisaiTieRoute = NerisaiTieRoute::CombinedMarkAvalokitamRank {
    source: DecisionSource::Site,
};

/// Product walk versus Avalokitam first match.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum WalkOrderRoute {
    /// More combined conditions first. Equal counts keep Avalokitam rank.
    StrictFirstAvalokitamTie { tie_source: DecisionSource },
    /// Avalokitam rank only.
    AvalokitamFirstMatch { source: DecisionSource },
}

pub const WALK_ORDER_ROUTE: WalkOrderRoute = WalkOrderRoute::StrictFirstAvalokitamTie {
    tie_source: DecisionSource::Site,
};

pub const AVALOKITAM_WALK_ORDER: WalkOrderRoute = WalkOrderRoute::AvalokitamFirstMatch {
    source: DecisionSource::Site,
};

/// A pair where strict-first and Avalokitam first-match pick different gates
/// when both pass and nothing else does.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct OrderOverlap {
    pub id: &'static str,
    pub strict_gate: &'static str,
    pub avalokitam_gate: &'static str,
}

/// The four order differences called out on the tree. The product walk keeps
/// the strict gate when both pass. Only `kattalai_kalithurai_velivirutham`
/// is reached by a real poem; see `REPEATED_TANICHOL_ROUTE`.
pub const NAMED_ORDER_OVERLAPS: [OrderOverlap; 4] = [
    OrderOverlap {
        id: "kattalai_kalithurai_velivirutham",
        strict_gate: "kattalai_kalithurai",
        avalokitam_gate: "velivirutham",
    },
    OrderOverlap {
        id: "aciriyappaa_kural_venpaa",
        strict_gate: "nilaimandila_aciriyappaa",
        avalokitam_gate: "oru_vikarpa_kural_venpaa",
    },
    OrderOverlap {
        id: "kattalai_kalippaa_tharavu",
        strict_gate: "kattalai_kalippaa",
        avalokitam_gate: "tharavukocha_kalippaa",
    },
    OrderOverlap {
        id: "vanjippaa_kalivenpaa_osai",
        strict_gate: "kuraladi_vanjippaa",
        avalokitam_gate: "kalivenpaa_long_osai",
    },
];

/// Four நெடிலடி lines, shared எதுகை, and the same line-final தனிச்சொல்.
/// The probe is four copies of
/// `கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே`.
/// Strict-first returns கட்டளைக்கலித்துறை. Avalokitam returns வெளிவிருத்தம்.
/// The constant is the owner decision. The leaf stays கட்டளைக்கலித்துறை.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RepeatedTanicholRoute {
    /// Product walk. The probe stays கட்டளைக்கலித்துறை.
    KeepStrictFirstKattalai { source: DecisionSource },
    /// கட்டளை would fail when the line-final தனிச்சொல் repeats.
    /// The probe would fall through to வெளிவிருத்தம். Not chosen.
    #[allow(dead_code)]
    RejectRepeatedLineFinalTanichol { source: DecisionSource },
    /// வெண்பாவினம் would be tried before கலிப்பாவினம் for this pair.
    /// The probe would land on வெளிவிருத்தம். Not chosen.
    #[allow(dead_code)]
    VenpaaVinamBeforeKalippaaVinam { source: DecisionSource },
}

pub const REPEATED_TANICHOL_ROUTE: RepeatedTanicholRoute =
    RepeatedTanicholRoute::KeepStrictFirstKattalai {
        source: DecisionSource::Site,
    };

pub const REPEATED_TANICHOL_PROBE_LINE: &str = "கனந்தரும் பூங்குழ லாளபி ராமி - கடைக்கண்களே";

/// `true` keeps the strict-first leaf. The two unchosen routes return `false`
/// and the probe would become வெளிவிருத்தம்.
pub fn repeated_tanichol_keeps_kattalai(route: RepeatedTanicholRoute) -> bool {
    match route {
        RepeatedTanicholRoute::KeepStrictFirstKattalai { .. } => true,
        RepeatedTanicholRoute::RejectRepeatedLineFinalTanichol { .. }
        | RepeatedTanicholRoute::VenpaaVinamBeforeKalippaaVinam { .. } => false,
    }
}

pub fn repeated_tanichol_message() -> String {
    match REPEATED_TANICHOL_ROUTE {
        RepeatedTanicholRoute::KeepStrictFirstKattalai { source } => format!(
            "keep_strict_first; probe kattalai_kalithurai vs velivirutham; reject_repeated_tanichol not chosen; venpaa_vinam_before_kalippaa_vinam not chosen; மூலம் {}",
            source.label()
        ),
        RepeatedTanicholRoute::RejectRepeatedLineFinalTanichol { source } => format!(
            "reject_repeated_tanichol; probe would be velivirutham; மூலம் {}",
            source.label()
        ),
        RepeatedTanicholRoute::VenpaaVinamBeforeKalippaaVinam { source } => format!(
            "venpaa_vinam_before_kalippaa_vinam; probe would be velivirutham; மூலம் {}",
            source.label()
        ),
    }
}

/// பா shadows its பாவினம். Both orders return the பா, so the pair is not an
/// order counterexample. The shadow is the classical reading.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct AllowedPaaShadow {
    pub id: &'static str,
    pub paa_gate: &'static str,
    pub paavinam_gate: &'static str,
}

pub const ALLOWED_PAA_SHADOWS: [AllowedPaaShadow; 13] = [
    AllowedPaaShadow {
        id: "oru_kural_kurattazhisai",
        paa_gate: "oru_vikarpa_kural_venpaa",
        paavinam_gate: "kurattazhisai",
    },
    AllowedPaaShadow {
        id: "iru_kural_kurattazhisai",
        paa_gate: "iru_vikarpa_kural_venpaa",
        paavinam_gate: "kurattazhisai",
    },
    AllowedPaaShadow {
        id: "nerisai_sinthiyal_ventazhisai",
        paa_gate: "nerisai_sinthiyal_venpaa",
        paavinam_gate: "ventazhisai",
    },
    AllowedPaaShadow {
        id: "nerisai_sinthiyal_vendurai",
        paa_gate: "nerisai_sinthiyal_venpaa",
        paavinam_gate: "vendurai",
    },
    AllowedPaaShadow {
        id: "inisai_sinthiyal_ventazhisai",
        paa_gate: "inisai_sinthiyal_venpaa",
        paavinam_gate: "ventazhisai",
    },
    AllowedPaaShadow {
        id: "inisai_sinthiyal_vendurai",
        paa_gate: "inisai_sinthiyal_venpaa",
        paavinam_gate: "vendurai",
    },
    AllowedPaaShadow {
        id: "tharavu_kalivirutham",
        paa_gate: "tharavukocha_kalippaa",
        paavinam_gate: "kalivirutham",
    },
    AllowedPaaShadow {
        id: "nilaimandila_aciriya_thurai",
        paa_gate: "nilaimandila_aciriyappaa",
        paavinam_gate: "aciriya_thurai",
    },
    AllowedPaaShadow {
        id: "nilaimandila_aciriya_thazhisai",
        paa_gate: "nilaimandila_aciriyappaa",
        paavinam_gate: "aciriya_thazhisai",
    },
    AllowedPaaShadow {
        id: "nerisai_aciriya_thurai",
        paa_gate: "nerisai_aciriyappaa",
        paavinam_gate: "aciriya_thurai",
    },
    AllowedPaaShadow {
        id: "nerisai_aciriya_thazhisai",
        paa_gate: "nerisai_aciriyappaa",
        paavinam_gate: "aciriya_thazhisai",
    },
    AllowedPaaShadow {
        id: "inaikkural_aciriya_thurai",
        paa_gate: "inaikkural_aciriyappaa",
        paavinam_gate: "aciriya_thurai",
    },
    AllowedPaaShadow {
        id: "inaikkural_aciriya_thazhisai",
        paa_gate: "inaikkural_aciriyappaa",
        paavinam_gate: "aciriya_thazhisai",
    },
];

/// The two கலிவெண்பா gates share `leaf_id` `kalivenpaa`. The trace names the gate.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum KalivenpaaRoute {
    StrictLineCount { source: DecisionSource },
    LongOsai { source: DecisionSource },
}

pub fn kalivenpaa_route_for_gate(gate_id: &str) -> Option<KalivenpaaRoute> {
    match gate_id {
        "kalivenpaa_strict" => Some(KalivenpaaRoute::StrictLineCount {
            source: DecisionSource::Site,
        }),
        "kalivenpaa_long_osai" => Some(KalivenpaaRoute::LongOsai {
            source: DecisionSource::Site,
        }),
        _ => None,
    }
}

pub fn kalivenpaa_route_message(route: KalivenpaaRoute) -> String {
    match route {
        KalivenpaaRoute::StrictLineCount { source } => format!(
            "gate kalivenpaa_strict; leaf_id kalivenpaa; மூலம் {}",
            source.label()
        ),
        KalivenpaaRoute::LongOsai { source } => format!(
            "gate kalivenpaa_long_osai; leaf_id kalivenpaa; மூலம் {}",
            source.label()
        ),
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct FifthSeerPattern {
    pub name: &'static str,
    pub source: DecisionSource,
    pub syllables: &'static [SyllableType],
}

const VILANGAAY_NER: [SyllableType; 3] =
    [SyllableType::Ner, SyllableType::Nirai, SyllableType::Ner];
const VILANGAAY_NIRAI: [SyllableType; 3] =
    [SyllableType::Nirai, SyllableType::Nirai, SyllableType::Ner];
const MAANGANI_NER: [SyllableType; 3] = [SyllableType::Ner, SyllableType::Ner, SyllableType::Nirai];
const MAANGANI_NIRAI: [SyllableType; 3] =
    [SyllableType::Nirai, SyllableType::Ner, SyllableType::Nirai];
const MAANTHANPUU_NER: [SyllableType; 4] = [
    SyllableType::Ner,
    SyllableType::Ner,
    SyllableType::Ner,
    SyllableType::Ner,
];
const MAANTHANPUU_NIRAI: [SyllableType; 4] = [
    SyllableType::Nirai,
    SyllableType::Ner,
    SyllableType::Ner,
    SyllableType::Ner,
];

/// விளங்காய் is the treatise fifth seer. மாங்கனி and மாந்தண்பூ are the site's rare stand-ins.
pub const FIFTH_SEER_PATTERNS: [FifthSeerPattern; 6] = [
    FifthSeerPattern {
        name: "vilangaay_ner",
        source: DecisionSource::Treatise,
        syllables: &VILANGAAY_NER,
    },
    FifthSeerPattern {
        name: "vilangaay_nirai",
        source: DecisionSource::Treatise,
        syllables: &VILANGAAY_NIRAI,
    },
    FifthSeerPattern {
        name: "maangani_ner",
        source: DecisionSource::Site,
        syllables: &MAANGANI_NER,
    },
    FifthSeerPattern {
        name: "maangani_nirai",
        source: DecisionSource::Site,
        syllables: &MAANGANI_NIRAI,
    },
    FifthSeerPattern {
        name: "maanthanpuu_ner",
        source: DecisionSource::Site,
        syllables: &MAANTHANPUU_NER,
    },
    FifthSeerPattern {
        name: "maanthanpuu_nirai",
        source: DecisionSource::Site,
        syllables: &MAANTHANPUU_NIRAI,
    },
];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum FifthSeerRoute {
    /// விளங்காய் only.
    TreatiseVilangaay,
    /// விளங்காய் plus the site stand-ins. Chosen.
    TreatisePlusSiteStandIns,
}

pub const KATTALAI_FIFTH_SEER_ROUTE: FifthSeerRoute = FifthSeerRoute::TreatisePlusSiteStandIns;

fn pattern_allowed(route: FifthSeerRoute, pattern: &FifthSeerPattern) -> bool {
    match route {
        FifthSeerRoute::TreatiseVilangaay => pattern.source == DecisionSource::Treatise,
        FifthSeerRoute::TreatisePlusSiteStandIns => true,
    }
}

pub fn fifth_seer_pattern_allowed(route: FifthSeerRoute, syllables: &[SyllableType]) -> bool {
    FIFTH_SEER_PATTERNS
        .iter()
        .any(|pattern| pattern_allowed(route, pattern) && pattern.syllables == syllables)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct GateFact {
    pub id: &'static str,
    pub family: &'static str,
    pub avalokitam_rank: u16,
    pub condition_count: u8,
}

pub const GATE_COUNT: usize = 37;

/// One row per leaf gate, in Avalokitam rank order.
pub const GATE_FACTS: [GateFact; GATE_COUNT] = [
    GateFact {
        id: "kalivenpaa_long_osai",
        family: "kalivenpaa_long_osai",
        avalokitam_rank: 0,
        condition_count: 4,
    },
    GateFact {
        id: "oru_vikarpa_kural_venpaa",
        family: "venpaa",
        avalokitam_rank: 1,
        condition_count: 6,
    },
    GateFact {
        id: "iru_vikarpa_kural_venpaa",
        family: "venpaa",
        avalokitam_rank: 2,
        condition_count: 6,
    },
    GateFact {
        id: "nerisai_sinthiyal_venpaa",
        family: "venpaa",
        avalokitam_rank: 3,
        condition_count: 6,
    },
    GateFact {
        id: "inisai_sinthiyal_venpaa",
        family: "venpaa",
        avalokitam_rank: 4,
        condition_count: 5,
    },
    GateFact {
        id: "oru_vikarpa_nerisai_venpaa",
        family: "venpaa",
        avalokitam_rank: 5,
        condition_count: 6,
    },
    GateFact {
        id: "iru_vikarpa_nerisai_venpaa",
        family: "venpaa",
        avalokitam_rank: 6,
        condition_count: 6,
    },
    GateFact {
        id: "oru_vikarpa_inisai_venpaa",
        family: "venpaa",
        avalokitam_rank: 7,
        condition_count: 6,
    },
    GateFact {
        id: "pala_vikarpa_inisai_venpaa",
        family: "venpaa",
        avalokitam_rank: 8,
        condition_count: 5,
    },
    GateFact {
        id: "paqrodai_venpaa",
        family: "venpaa",
        avalokitam_rank: 9,
        condition_count: 5,
    },
    GateFact {
        id: "kalivenpaa_strict",
        family: "venpaa",
        avalokitam_rank: 10,
        condition_count: 5,
    },
    GateFact {
        id: "nilaimandila_aciriyappaa",
        family: "aciriyappaa",
        avalokitam_rank: 11,
        condition_count: 9,
    },
    GateFact {
        id: "nerisai_aciriyappaa",
        family: "aciriyappaa",
        avalokitam_rank: 12,
        condition_count: 9,
    },
    GateFact {
        id: "inaikkural_aciriyappaa",
        family: "aciriyappaa",
        avalokitam_rank: 13,
        condition_count: 9,
    },
    GateFact {
        id: "tharavukocha_kalippaa",
        family: "tharavukocha_kalippaa",
        avalokitam_rank: 14,
        condition_count: 4,
    },
    GateFact {
        id: "venkalippaa",
        family: "venkalippaa",
        avalokitam_rank: 15,
        condition_count: 4,
    },
    GateFact {
        id: "kuraladi_vanjippaa",
        family: "vanjippaa",
        avalokitam_rank: 16,
        condition_count: 5,
    },
    GateFact {
        id: "sinthadi_vanjippaa",
        family: "vanjippaa",
        avalokitam_rank: 17,
        condition_count: 5,
    },
    GateFact {
        id: "vellathazhisai",
        family: "vellathazhisai",
        avalokitam_rank: 18,
        condition_count: 2,
    },
    GateFact {
        id: "velivirutham",
        family: "velivirutham",
        avalokitam_rank: 19,
        condition_count: 4,
    },
    GateFact {
        id: "ventazhisai",
        family: "ventazhisai",
        avalokitam_rank: 20,
        condition_count: 4,
    },
    GateFact {
        id: "vendurai",
        family: "vendurai",
        avalokitam_rank: 21,
        condition_count: 2,
    },
    GateFact {
        id: "kural_vensenthurai",
        family: "kural_vensenthurai",
        avalokitam_rank: 22,
        condition_count: 2,
    },
    GateFact {
        id: "kurattazhisai",
        family: "kurattazhisai",
        avalokitam_rank: 23,
        condition_count: 3,
    },
    GateFact {
        id: "arucir_kazhinediladi_aciriya_virutham",
        family: "aciriya_virutham",
        avalokitam_rank: 24,
        condition_count: 5,
    },
    GateFact {
        id: "elucir_kazhinediladi_aciriya_virutham",
        family: "aciriya_virutham",
        avalokitam_rank: 25,
        condition_count: 5,
    },
    GateFact {
        id: "encir_kazhinediladi_aciriya_virutham",
        family: "aciriya_virutham",
        avalokitam_rank: 26,
        condition_count: 5,
    },
    GateFact {
        id: "aciriya_thazhisai",
        family: "aciriya_thazhisai",
        avalokitam_rank: 27,
        condition_count: 3,
    },
    GateFact {
        id: "aciriya_thurai",
        family: "aciriya_thurai",
        avalokitam_rank: 28,
        condition_count: 4,
    },
    GateFact {
        id: "kattalai_kalippaa",
        family: "kattalai_kalippaa",
        avalokitam_rank: 29,
        condition_count: 5,
    },
    GateFact {
        id: "kattalai_kalithurai",
        family: "kattalai_kalithurai",
        avalokitam_rank: 30,
        condition_count: 8,
    },
    GateFact {
        id: "kalithurai",
        family: "kalithurai",
        avalokitam_rank: 31,
        condition_count: 3,
    },
    GateFact {
        id: "kalivirutham",
        family: "kalivirutham",
        avalokitam_rank: 32,
        condition_count: 3,
    },
    GateFact {
        id: "kalithazhisai",
        family: "kalithazhisai",
        avalokitam_rank: 33,
        condition_count: 2,
    },
    GateFact {
        id: "vanjithazhisai",
        family: "vanjithazhisai",
        avalokitam_rank: 34,
        condition_count: 2,
    },
    GateFact {
        id: "vanjithurai",
        family: "vanjithurai",
        avalokitam_rank: 35,
        condition_count: 2,
    },
    GateFact {
        id: "vanjivirutham",
        family: "vanjivirutham",
        avalokitam_rank: 36,
        condition_count: 3,
    },
];

const fn nerisai_tie_rank(rank: u16) -> bool {
    rank == 3 || rank == 5 || rank == 6
}

/// Condition count the walk sorts on. The chosen நேரிசை route keeps the table count.
/// Ranks 3, 5, and 6 are the three நேரிசை leaves. `gate_facts_match_the_leaf_table` locks those ids.
pub const fn effective_condition_count(gate: &GateFact) -> u8 {
    match NERISAI_TIE_ROUTE {
        NerisaiTieRoute::CombinedMarkAvalokitamRank { .. } => gate.condition_count,
        NerisaiTieRoute::SplitMarkWouldOutrankKural { .. } => {
            if nerisai_tie_rank(gate.avalokitam_rank) {
                gate.condition_count.saturating_add(1)
            } else {
                gate.condition_count
            }
        }
    }
}

const fn comes_before(order: WalkOrderRoute, left: usize, right: usize) -> bool {
    let left_gate = &GATE_FACTS[left];
    let right_gate = &GATE_FACTS[right];
    match order {
        WalkOrderRoute::StrictFirstAvalokitamTie { .. } => {
            let left_count = effective_condition_count(left_gate);
            let right_count = effective_condition_count(right_gate);
            left_count > right_count
                || (left_count == right_count
                    && left_gate.avalokitam_rank < right_gate.avalokitam_rank)
        }
        WalkOrderRoute::AvalokitamFirstMatch { .. } => {
            left_gate.avalokitam_rank < right_gate.avalokitam_rank
        }
    }
}

/// Insertion sort over the 37 gates. The bound is the table length, so the
/// proof does not have to unwind the standard library sort.
pub const fn ordered_gate_indexes(order: WalkOrderRoute) -> [usize; GATE_COUNT] {
    let mut indexes = [0usize; GATE_COUNT];
    let mut slot = 0;
    while slot < GATE_COUNT {
        indexes[slot] = slot;
        slot += 1;
    }
    let mut insert_at = 1;
    while insert_at < GATE_COUNT {
        let mut cursor = insert_at;
        while cursor > 0 && comes_before(order, indexes[cursor], indexes[cursor - 1]) {
            indexes.swap(cursor, cursor - 1);
            cursor -= 1;
        }
        insert_at += 1;
    }
    indexes
}

/// Strict-first order, computed once from the gate table.
pub const STRICT_GATE_ORDER: [usize; GATE_COUNT] = ordered_gate_indexes(WALK_ORDER_ROUTE);
pub const AVALOKITAM_GATE_ORDER: [usize; GATE_COUNT] = ordered_gate_indexes(AVALOKITAM_WALK_ORDER);

pub fn first_in_fixed_order(
    passes: &[bool; GATE_COUNT],
    order: &[usize; GATE_COUNT],
) -> Option<usize> {
    let mut cursor = 0;
    while cursor < GATE_COUNT {
        let index = order[cursor];
        if passes[index] {
            return Some(index);
        }
        cursor += 1;
    }
    None
}

pub fn family_scan_fixed_order(
    passes: &[bool; GATE_COUNT],
    order: &[usize; GATE_COUNT],
) -> Option<usize> {
    let mut family_cursor = 0usize;
    while family_cursor < GATE_COUNT {
        let family_name = GATE_FACTS[order[family_cursor]].family;
        let family_start = family_cursor;
        let mut family_end = family_cursor;
        while family_end < GATE_COUNT && GATE_FACTS[order[family_end]].family == family_name {
            family_end += 1;
        }
        let mut member_cursor = family_start;
        while member_cursor < family_end {
            if passes[order[member_cursor]] {
                return Some(order[member_cursor]);
            }
            member_cursor += 1;
        }
        family_cursor = family_end;
    }
    None
}

pub fn first_matching_gate(passes: &[bool; GATE_COUNT], order: WalkOrderRoute) -> Option<usize> {
    let indexes = ordered_gate_indexes(order);
    first_in_fixed_order(passes, &indexes)
}

/// Family walk: scan each contiguous family and return the first passing gate.
/// A failed family cannot hide a later passing gate inside it, because the scan
/// still sees that gate's bit. The product trace stops early only when the
/// shared prefix already failed, which clears every gate in the family.
pub fn family_walk_gate(passes: &[bool; GATE_COUNT], order: WalkOrderRoute) -> Option<usize> {
    let indexes = ordered_gate_indexes(order);
    family_scan_fixed_order(passes, &indexes)
}

fn passes_for_pair(left: usize, right: usize) -> [bool; GATE_COUNT] {
    let mut passes = [false; GATE_COUNT];
    passes[left] = true;
    passes[right] = true;
    passes
}

/// Doubletons where the two orders pick different gates.
pub fn minimal_overlap_pairs() -> Vec<(usize, usize)> {
    let mut pairs = Vec::new();
    for left in 0..GATE_COUNT {
        for right in 0..GATE_COUNT {
            if left == right {
                continue;
            }
            let passes = passes_for_pair(left, right);
            let strict_gate = first_matching_gate(&passes, WALK_ORDER_ROUTE);
            let avalokitam_gate = first_matching_gate(&passes, AVALOKITAM_WALK_ORDER);
            if strict_gate == Some(left) && avalokitam_gate == Some(right) {
                pairs.push((left, right));
            }
        }
    }
    pairs
}

pub fn gate_index(gate_id: &str) -> Option<usize> {
    GATE_FACTS.iter().position(|gate| gate.id == gate_id)
}

pub fn walk_order_message() -> String {
    match WALK_ORDER_ROUTE {
        WalkOrderRoute::StrictFirstAvalokitamTie { tie_source } => {
            format!("strict_first; tie avalokitam; மூலம் {}", tie_source.label())
        }
        WalkOrderRoute::AvalokitamFirstMatch { source } => {
            format!("avalokitam_first; மூலம் {}", source.label())
        }
    }
}

pub fn nerisai_tie_message() -> String {
    match NERISAI_TIE_ROUTE {
        NerisaiTieRoute::CombinedMarkAvalokitamRank { source } => {
            format!("combined_mark; குறள் முதலில்; மூலம் {}", source.label())
        }
        NerisaiTieRoute::SplitMarkWouldOutrankKural { source } => {
            format!("split_mark; மூலம் {}", source.label())
        }
    }
}

pub fn alavadi_word_message() -> String {
    match ALAVADI_WORD_ROUTE {
        AlavadiWordRoute::FourSeers { source } => {
            format!("four_seers; மூலம் {}", source.label())
        }
        AlavadiWordRoute::SiteLineInGeneral { source } => {
            format!("site_line; மூலம் {}", source.label())
        }
    }
}

pub fn merkathuvai_seat_message() -> String {
    match MERKATHUVAI_SEAT_ROUTE {
        MerkathuvaiSeatRoute::TreatiseOneThreeFour => format!(
            "seers_1_3_4; மூலம் {}; site_1_2_3 தவிர்க்கப்பட்டது",
            DecisionSource::Treatise.label()
        ),
        MerkathuvaiSeatRoute::SiteOneTwoThree => {
            format!("seers_1_2_3; மூலம் {}", DecisionSource::Site.label())
        }
    }
}

pub fn tharavu_alavadi_message() -> String {
    match THARAVU_ALAVADI_ROUTE {
        TharavuAlavadiRoute::FourOrMore { source } => format!(
            "four_or_more; மூலம் {}; site_wording_above_four தவிர்க்கப்பட்டது",
            source.label()
        ),
        TharavuAlavadiRoute::SiteWordingAboveFour { source } => {
            format!("above_four; மூலம் {}", source.label())
        }
    }
}

pub fn fifth_seer_message() -> String {
    match KATTALAI_FIFTH_SEER_ROUTE {
        FifthSeerRoute::TreatiseVilangaay => {
            format!("vilangaay; மூலம் {}", DecisionSource::Treatise.label())
        }
        FifthSeerRoute::TreatisePlusSiteStandIns => format!(
            "vilangaay {}; மாங்கனி மாந்தண்பூ {}",
            DecisionSource::Treatise.label(),
            DecisionSource::Site.label()
        ),
    }
}

#[cfg(kani)]
mod kani_proofs {
    use super::{
        round_to_tenth, share_passes, strict_above, GATE_COUNT, KANI_TENTH_40, SHARE_STRICT_25,
        SHARE_STRICT_40, SHARE_STRICT_50, SHARE_STRICT_90,
    };

    #[kani::proof]
    fn strict_share_matches_the_integer_comparison() {
        let part: u8 = kani::any();
        let whole: u8 = kani::any();
        let percent: u8 = kani::any();
        let passed = strict_above(part as usize, whole as usize, percent as usize);
        if whole == 0 {
            assert!(!passed);
        } else {
            let part_wide = part as u16;
            let whole_wide = whole as u16;
            let percent_wide = percent as u16;
            assert_eq!(passed, part_wide * 100 > whole_wide * percent_wide);
        }
    }

    #[kani::proof]
    fn tenth_rounding_matches_the_formula_and_the_documented_cases() {
        let part: u8 = kani::any();
        let whole: u8 = kani::any();
        let passed = round_to_tenth(part as usize, whole as usize, 40);
        if whole == 0 {
            assert!(!passed);
        } else {
            let tenths = (part as u16 * 10 + (whole as u16 / 2)) / whole as u16;
            assert_eq!(passed, tenths * 10 >= 40);
        }
        assert!(round_to_tenth(7, 18, 40));
        assert!(!round_to_tenth(6, 18, 40));
        assert!(!strict_above(7, 18, 40));
        assert!(!strict_above(6, 18, 40));
    }

    #[kani::proof]
    fn named_share_routes_reject_an_exact_percent() {
        let part: u8 = kani::any();
        let whole: u8 = kani::any();
        let _ = share_passes(SHARE_STRICT_40, part as usize, whole as usize);
        let _ = share_passes(SHARE_STRICT_50, part as usize, whole as usize);
        let _ = share_passes(SHARE_STRICT_25, part as usize, whole as usize);
        let _ = share_passes(SHARE_STRICT_90, part as usize, whole as usize);
        let _ = share_passes(KANI_TENTH_40, part as usize, whole as usize);
        assert!(!share_passes(SHARE_STRICT_40, 2, 5));
        assert!(!share_passes(SHARE_STRICT_50, 1, 2));
        assert!(!share_passes(SHARE_STRICT_25, 1, 4));
        assert!(!share_passes(SHARE_STRICT_90, 9, 10));
        assert!(share_passes(KANI_TENTH_40, 7, 18));
        assert!(!share_passes(KANI_TENTH_40, 6, 18));
    }

    fn scan_is_one_leaf(passes: &[bool; GATE_COUNT], order: &[usize; GATE_COUNT]) {
        let first = super::first_in_fixed_order(passes, order);
        let again = super::first_in_fixed_order(passes, order);
        assert_eq!(first, again);
        assert_eq!(first, super::family_scan_fixed_order(passes, order));
        if let Some(chosen) = first {
            assert!(passes[chosen]);
            let mut cursor = 0;
            while cursor < GATE_COUNT {
                let index = order[cursor];
                if index == chosen {
                    break;
                }
                assert!(!passes[index]);
                cursor += 1;
            }
        }
    }

    #[kani::proof]
    #[kani::unwind(40)]
    fn walk_is_deterministic_and_returns_at_most_one_leaf() {
        let passes: [bool; GATE_COUNT] = kani::any();
        scan_is_one_leaf(&passes, &super::STRICT_GATE_ORDER);
        scan_is_one_leaf(&passes, &super::AVALOKITAM_GATE_ORDER);
    }
}
