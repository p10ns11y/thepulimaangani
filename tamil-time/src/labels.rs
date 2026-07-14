//! Display labels and tinai metadata (Tamil + roman, docs/hints).

use crate::types::{Perum, Siru, Tinai};

/// Characteristic landscape metadata for a tinai.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TinaiMeta {
    /// Landscape keyword (mountains, forest, …).
    pub landscape: &'static str,
    /// Signature flower / plant.
    pub flower: &'static str,
    /// Characteristic siru baked into theme docs.
    pub siru: Siru,
    /// Characteristic perum (or `various` as free text).
    pub perum: &'static str,
    /// Associated deity (literary table).
    pub deity: &'static str,
    /// Uri porul (emotional theme).
    pub uri_porul: &'static str,
}

/// Metadata table matching Python `TINAI_META`.
pub fn tinai_meta(tinai: Tinai) -> TinaiMeta {
    match tinai {
        Tinai::Kurinji => TinaiMeta {
            landscape: "mountains",
            flower: "kurinji",
            siru: Siru::Yaamam,
            perum: "munpani",
            deity: "Murugan",
            uri_porul: "union/joy",
        },
        Tinai::Mullai => TinaiMeta {
            landscape: "forest",
            flower: "jasmine",
            siru: Siru::Maalai,
            perum: "kar",
            deity: "Mayon",
            uri_porul: "waiting",
        },
        Tinai::Marutham => TinaiMeta {
            landscape: "plains",
            flower: "marutham",
            siru: Siru::Vidiyal,
            perum: "various",
            deity: "Indra",
            uri_porul: "quarrel",
        },
        Tinai::Neythal => TinaiMeta {
            landscape: "seashore",
            flower: "water lily",
            siru: Siru::Erpaadu,
            perum: "various",
            deity: "Varuna",
            uri_porul: "pining",
        },
        Tinai::Palai => TinaiMeta {
            landscape: "wasteland",
            flower: "palai",
            siru: Siru::Nanpagal,
            perum: "mudhu_venil",
            deity: "Kotravai",
            uri_porul: "separation/endurance",
        },
    }
}

/// Tamil + roman perum labels (Python `PERUM_LABEL`).
pub const PERUM_LABEL: &[(Perum, &str)] = &[
    (
        Perum::IlaVenil,
        "இளவேனில் Ila Venil — Early/Light Summer",
    ),
    (
        Perum::MudhuVenil,
        "முதுவேனில் Mudhu Venil — Late/Harsh Summer",
    ),
    (Perum::Kar, "கார் Kār — Rainy/Monsoon"),
    (Perum::Kulir, "குளிர்/கூதிர் Kulir — Cool/Autumn"),
    (Perum::Munpani, "முன்பனி Munpani — Early Dew/Winter"),
    (Perum::Pinpani, "பின்பனி Pinpani — Late Dew/Late Winter"),
];

/// Tamil + roman siru labels (Python `SIRU_LABEL`).
pub const SIRU_LABEL: &[(Siru, &str)] = &[
    (Siru::Vidiyal, "வைகறை/விடியல் Vidiyal — Dawn ~2–6"),
    (Siru::Kaalai, "காலை Kaalai — Morning ~6–10"),
    (Siru::Nanpagal, "நண்பகல் Nan Pagal — Midday ~10–14"),
    (
        Siru::Erpaadu,
        "எற்பாடு Erpaadu — Afternoon→Dusk ~14–18",
    ),
    (Siru::Maalai, "மாலை Maalai — Evening ~18–22"),
    (Siru::Yaamam, "யாமம் Yaamam — Night ~22–2"),
];

/// Label for a perum.
pub fn perum_label(perum: Perum) -> &'static str {
    PERUM_LABEL
        .iter()
        .find(|(p, _)| *p == perum)
        .map(|(_, s)| *s)
        .unwrap_or(perum.as_str())
}

/// Label for a siru.
pub fn siru_label(siru: Siru) -> &'static str {
    SIRU_LABEL
        .iter()
        .find(|(s, _)| *s == siru)
        .map(|(_, s)| *s)
        .unwrap_or(siru.as_str())
}
