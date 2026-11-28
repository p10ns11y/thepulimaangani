//! Core enumerations and constants.

use std::fmt;

/// 1 Nazhigai ≈ 24 minutes.
pub const NAZHIGAI_MINUTES: i32 = 24;
/// Soft Nazhigai steps per Siru (~4 h).
pub const NAZHIGAIS_PER_SIRU: i32 = 10;
/// Jaamam duration in hours (design grid).
pub const JAAMAM_HOURS: i32 = 3;
/// Eight jaamams per civil day.
pub const JAAMAMS_PER_DAY: i32 = 8;
/// Epoch hour aligning jaamam 1 with vidiyal start.
pub const JAAMAM_EPOCH_HOUR: i32 = 2;
/// Nazhigais in one full jaamam (3 h / 24 min = 7.5).
pub const NAZHIGAIS_PER_JAAMAM: f64 = (JAAMAM_HOURS as f64) * 60.0 / (NAZHIGAI_MINUTES as f64);

/// Five classical tinai landscapes (package identity).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Tinai {
    /// Mountains — Kurinji.
    Kurinji,
    /// Forest — Mullai.
    Mullai,
    /// Fertile plains — Marutham.
    Marutham,
    /// Seashore — Neythal.
    Neythal,
    /// Wasteland / dry — Palai.
    Palai,
}

/// Ordered tinai list (canonical order).
pub const TINAI: [Tinai; 5] = [
    Tinai::Kurinji,
    Tinai::Mullai,
    Tinai::Marutham,
    Tinai::Neythal,
    Tinai::Palai,
];

impl Tinai {
    /// Snake_case id used in filenames and theme suffixes.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Kurinji => "kurinji",
            Self::Mullai => "mullai",
            Self::Marutham => "marutham",
            Self::Neythal => "neythal",
            Self::Palai => "palai",
        }
    }
}

impl fmt::Display for Tinai {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Six Perum Pozhuthugal (approx Gregorian mid-month windows).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Perum {
    /// Early / light summer.
    IlaVenil,
    /// Late / harsh summer.
    MudhuVenil,
    /// Rainy / monsoon (Kār).
    Kar,
    /// Cool / autumn (Kulir / Kūthir).
    Kulir,
    /// Early dew / winter.
    Munpani,
    /// Late dew / late winter.
    Pinpani,
}

/// Ordered perum list.
pub const PERUM: [Perum; 6] = [
    Perum::IlaVenil,
    Perum::MudhuVenil,
    Perum::Kar,
    Perum::Kulir,
    Perum::Munpani,
    Perum::Pinpani,
];

impl Perum {
    /// Snake_case id.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::IlaVenil => "ila_venil",
            Self::MudhuVenil => "mudhu_venil",
            Self::Kar => "kar",
            Self::Kulir => "kulir",
            Self::Munpani => "munpani",
            Self::Pinpani => "pinpani",
        }
    }

    /// Display fragment with spaces instead of underscores.
    pub fn display_words(self) -> String {
        self.as_str().replace('_', " ")
    }
}

impl fmt::Display for Perum {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Six Siru / Pozhuthu (~4 h fixed windows; yaamam wraps midnight).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Siru {
    /// Dawn ~02–06.
    Vidiyal,
    /// Morning ~06–10.
    Kaalai,
    /// Midday ~10–14.
    Nanpagal,
    /// Afternoon→dusk ~14–18.
    Erpaadu,
    /// Evening ~18–22.
    Maalai,
    /// Night ~22–02 (wraps). Distinct from jaamam/saamam.
    Yaamam,
}

/// Ordered siru list.
pub const SIRU: [Siru; 6] = [
    Siru::Vidiyal,
    Siru::Kaalai,
    Siru::Nanpagal,
    Siru::Erpaadu,
    Siru::Maalai,
    Siru::Yaamam,
];

impl Siru {
    /// Snake_case id.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Vidiyal => "vidiyal",
            Self::Kaalai => "kaalai",
            Self::Nanpagal => "nanpagal",
            Self::Erpaadu => "erpaadu",
            Self::Maalai => "maalai",
            Self::Yaamam => "yaamam",
        }
    }

    /// Half-open `[start_hour, end_hour)` wall-clock window (`end` may be &lt; start for wrap).
    pub fn window_hours(self) -> (i32, i32) {
        match self {
            Self::Vidiyal => (2, 6),
            Self::Kaalai => (6, 10),
            Self::Nanpagal => (10, 14),
            Self::Erpaadu => (14, 18),
            Self::Maalai => (18, 22),
            Self::Yaamam => (22, 2),
        }
    }

    /// Circadian phase mirror for hosts/render.
    pub fn phase(self) -> CircadianPhase {
        match self {
            Self::Vidiyal => CircadianPhase::Dawn,
            Self::Kaalai => CircadianPhase::Morning,
            Self::Nanpagal => CircadianPhase::Midday,
            Self::Erpaadu => CircadianPhase::Afternoon,
            Self::Maalai => CircadianPhase::Dusk,
            Self::Yaamam => CircadianPhase::Night,
        }
    }
}

impl fmt::Display for Siru {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// Eye-comfort / host luminance family mapped from Siru.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CircadianPhase {
    /// Pre-sunrise family.
    Dawn,
    /// Morning family.
    Morning,
    /// Midday family.
    Midday,
    /// Afternoon family.
    Afternoon,
    /// Dusk family.
    Dusk,
    /// Night family.
    Night,
}

impl CircadianPhase {
    /// Snake_case id matching Python `SIRU_TO_PHASE`.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Dawn => "dawn",
            Self::Morning => "morning",
            Self::Midday => "midday",
            Self::Afternoon => "afternoon",
            Self::Dusk => "dusk",
            Self::Night => "night",
        }
    }
}

impl fmt::Display for CircadianPhase {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

/// How tinai was chosen.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum TinaiSource {
    /// Explicit flag / API override.
    Flag,
    /// Geo heuristic.
    Geo,
    /// Missing coords → default plains.
    Default,
}

impl TinaiSource {
    /// Snake_case id.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Flag => "flag",
            Self::Geo => "geo",
            Self::Default => "default",
        }
    }
}

impl fmt::Display for TinaiSource {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}
