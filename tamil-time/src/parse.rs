//! Parse romanized / alias names into enums.

use crate::error::TamilTimeError;
use crate::types::{Perum, Siru, Tinai};

fn normalize(name: &str) -> String {
    name.trim()
        .to_lowercase()
        .replace('-', "_")
        .replace(' ', "_")
}

/// Parse a tinai name (aliases: neytal, kurinci, paalai, …).
pub fn parse_tinai(name: &str) -> Result<Tinai, TamilTimeError> {
    let n = normalize(name);
    let n = match n.as_str() {
        "kurinci" | "kurinji" => "kurinji",
        "mullai" => "mullai",
        "marutam" | "marutham" => "marutham",
        "neytal" | "neythal" => "neythal",
        "paalai" | "palai" => "palai",
        other => other,
    };
    match n {
        "kurinji" => Ok(Tinai::Kurinji),
        "mullai" => Ok(Tinai::Mullai),
        "marutham" => Ok(Tinai::Marutham),
        "neythal" => Ok(Tinai::Neythal),
        "palai" => Ok(Tinai::Palai),
        _ => Err(TamilTimeError::UnknownTinai {
            name: name.to_string(),
        }),
    }
}

/// Parse a perum name (aliases: ilavenil, monsoon, autumn, …).
pub fn parse_perum(name: &str) -> Result<Perum, TamilTimeError> {
    let n = normalize(name);
    let n = match n.as_str() {
        "ila_venil" | "ilavenil" | "early_summer" => "ila_venil",
        "mudhu_venil" | "mudhuvenil" | "late_summer" => "mudhu_venil",
        "kar" | "kaar" | "monsoon" => "kar",
        "kulir" | "koodhir" | "kudir" | "autumn" => "kulir",
        "munpani" | "early_winter" => "munpani",
        "pinpani" | "late_winter" => "pinpani",
        other => other,
    };
    match n {
        "ila_venil" => Ok(Perum::IlaVenil),
        "mudhu_venil" => Ok(Perum::MudhuVenil),
        "kar" => Ok(Perum::Kar),
        "kulir" => Ok(Perum::Kulir),
        "munpani" => Ok(Perum::Munpani),
        "pinpani" => Ok(Perum::Pinpani),
        _ => Err(TamilTimeError::UnknownPerum {
            name: name.to_string(),
        }),
    }
}

/// Parse a siru name (aliases: dawn, yamam, nan_pagal, …).
pub fn parse_siru(name: &str) -> Result<Siru, TamilTimeError> {
    let n = normalize(name);
    let n = match n.as_str() {
        "vidiyal" | "vaikarai" | "dawn" => "vidiyal",
        "kaalai" | "kalai" | "morning" => "kaalai",
        "nanpagal" | "nan_pagal" | "midday" => "nanpagal",
        "erpaadu" | "erpadu" | "afternoon" => "erpaadu",
        "maalai" | "malai" | "evening" => "maalai",
        "yaamam" | "yamam" | "night" => "yaamam",
        other => other,
    };
    match n {
        "vidiyal" => Ok(Siru::Vidiyal),
        "kaalai" => Ok(Siru::Kaalai),
        "nanpagal" => Ok(Siru::Nanpagal),
        "erpaadu" => Ok(Siru::Erpaadu),
        "maalai" => Ok(Siru::Maalai),
        "yaamam" => Ok(Siru::Yaamam),
        _ => Err(TamilTimeError::UnknownSiru {
            name: name.to_string(),
        }),
    }
}
