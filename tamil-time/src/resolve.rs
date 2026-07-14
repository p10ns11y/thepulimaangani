//! Resolve calendar state from clock / overrides.

use chrono::{Datelike, Local, NaiveDate, Timelike};

use crate::display::{scene_line, wallpaper_hint};
use crate::error::TamilTimeError;
use crate::infer::infer_tinai;
use crate::jaamam::{jaamam_detail_for, jaamam_index_at, JaamamDetail};
use crate::parse::{parse_perum, parse_siru, parse_tinai};
use crate::types::{
    CircadianPhase, Perum, Siru, Tinai, TinaiSource, NAZHIGAIS_PER_SIRU, NAZHIGAI_MINUTES,
};

/// Default theme package prefix (eye-comfort host convention; override via input).
pub const DEFAULT_THEME_PREFIX: &str = "eye-comfort-tn";

/// Resolved Tamil cultural state for theme / status hosts.
#[derive(Debug, Clone, PartialEq)]
pub struct TamilState {
    /// Landscape package identity.
    pub tinai: Tinai,
    /// Seasonal Perum.
    pub perum: Perum,
    /// Current Siru / Pozhuthu.
    pub siru: Siru,
    /// Soft Nazhigai step 0–9 within Siru.
    pub nazhigai: i32,
    /// Host theme id, e.g. `eye-comfort-tn-neythal`.
    pub theme: String,
    /// Circadian luminance family.
    pub phase: CircadianPhase,
    /// Wall-clock hour used for resolution.
    pub hour: i32,
    /// Wall-clock minute used for resolution.
    pub minute: i32,
    /// Optional latitude.
    pub latitude: Option<f64>,
    /// Optional longitude.
    pub longitude: Option<f64>,
    /// Wallpaper filename hint.
    pub wallpaper_hint: String,
    /// Human scene line.
    pub scene: String,
    /// `"auto"` or `"forced"` when any override was set.
    pub source: &'static str,
    /// How tinai was chosen.
    pub tinai_source: TinaiSource,
    /// Jaamam split + current.
    pub jaamam: JaamamDetail,
}

impl TamilState {
    /// Absolute Nazhigai index 0–59 from local midnight.
    pub fn nazhigai_of_day(&self) -> i32 {
        nazhigai_of_day(self.hour, self.minute)
    }

    /// Jaamam 1–8 at the wall clock (not Siru-step sample).
    pub fn jaamam_of_clock(&self) -> Result<i32, TamilTimeError> {
        jaamam_index_at(self.hour, self.minute)
    }
}

/// Optional overrides for [`resolve_tamil`] / [`resolve_tamil_at`].
#[derive(Debug, Clone, Default)]
pub struct ResolveInput {
    /// Forced tinai name.
    pub tinai: Option<String>,
    /// Forced perum name.
    pub perum: Option<String>,
    /// Forced siru name.
    pub siru: Option<String>,
    /// Forced nazhigai 0–9.
    pub nazhigai: Option<i32>,
    /// Override hour (else from `now`).
    pub hour: Option<i32>,
    /// Minute (used with hour; default 0 when hour set).
    pub minute: i32,
    /// Latitude for geo tinai.
    pub latitude: Option<f64>,
    /// Longitude for geo tinai.
    pub longitude: Option<f64>,
    /// Theme package prefix (default [`DEFAULT_THEME_PREFIX`]).
    pub theme_prefix: Option<String>,
}

/// Approximate Gregorian windows for the six Perum Pozhuthugal (~mid-month).
pub fn perum_for_date(on: NaiveDate) -> Perum {
    let m = on.month();
    let day = on.day();
    if (m == 4 && day >= 15) || m == 5 || (m == 6 && day < 15) {
        return Perum::IlaVenil;
    }
    if (m == 6 && day >= 15) || m == 7 || (m == 8 && day < 15) {
        return Perum::MudhuVenil;
    }
    if (m == 8 && day >= 15) || m == 9 || (m == 10 && day < 15) {
        return Perum::Kar;
    }
    if (m == 10 && day >= 15) || m == 11 || (m == 12 && day < 15) {
        return Perum::Kulir;
    }
    if (m == 12 && day >= 15) || m == 1 || (m == 2 && day < 15) {
        return Perum::Munpani;
    }
    Perum::Pinpani
}

/// Siru for wall-clock hour/minute.
pub fn siru_for_hour(hour: i32, minute: i32) -> Result<Siru, TamilTimeError> {
    if !(0..=23).contains(&hour) {
        return Err(TamilTimeError::InvalidHour(hour));
    }
    if !(0..=59).contains(&minute) {
        return Err(TamilTimeError::InvalidMinute(minute));
    }
    let t = f64::from(hour) + f64::from(minute) / 60.0;
    for siru in crate::types::SIRU {
        let (start, end) = siru.window_hours();
        let start = f64::from(start);
        let end = f64::from(end);
        if start < end {
            if start <= t && t < end {
                return Ok(siru);
            }
        } else if t >= start || t < end {
            return Ok(siru);
        }
    }
    Ok(Siru::Yaamam)
}

/// Soft Nazhigai step 0–9 within the current (or given) Siru.
pub fn nazhigai_in_siru(
    hour: i32,
    minute: i32,
    siru: Option<Siru>,
) -> Result<i32, TamilTimeError> {
    let s = match siru {
        Some(s) => s,
        None => siru_for_hour(hour, minute)?,
    };
    let (start, end) = s.window_hours();
    let t_min = hour * 60 + minute;
    let into = if start < end {
        t_min - start * 60
    } else {
        let start_min = 22 * 60;
        if t_min >= start_min {
            t_min - start_min
        } else {
            (24 * 60 - start_min) + t_min
        }
    };
    let step = (into / NAZHIGAI_MINUTES).clamp(0, NAZHIGAIS_PER_SIRU - 1);
    Ok(step)
}

/// Absolute Nazhigai index 0–59 from local midnight (informational).
pub fn nazhigai_of_day(hour: i32, minute: i32) -> i32 {
    let total = (hour * 60 + minute) / NAZHIGAI_MINUTES;
    total.clamp(0, 59)
}

/// Resolve using the local system clock for any missing time fields.
pub fn resolve_tamil(input: &ResolveInput) -> Result<TamilState, TamilTimeError> {
    let now = Local::now();
    resolve_tamil_at(
        input,
        now.date_naive(),
        now.hour() as i32,
        now.minute() as i32,
    )
}

/// Resolve with an explicit civil date and wall time (testable).
pub fn resolve_tamil_at(
    input: &ResolveInput,
    on: NaiveDate,
    default_hour: i32,
    default_minute: i32,
) -> Result<TamilState, TamilTimeError> {
    let hour = input.hour.unwrap_or(default_hour);
    let minute = if input.hour.is_some() {
        input.minute
    } else {
        default_minute
    };

    if !(0..=23).contains(&hour) {
        return Err(TamilTimeError::InvalidHour(hour));
    }
    if !(0..=59).contains(&minute) {
        return Err(TamilTimeError::InvalidMinute(minute));
    }
    if let Some(lat) = input.latitude {
        if !(-90.0..=90.0).contains(&lat) {
            return Err(TamilTimeError::InvalidLatitude(lat.to_string()));
        }
    }
    if let Some(lon) = input.longitude {
        if !(-180.0..=180.0).contains(&lon) {
            return Err(TamilTimeError::InvalidLongitude(lon.to_string()));
        }
    }

    let forced = input.tinai.is_some()
        || input.perum.is_some()
        || input.siru.is_some()
        || input.nazhigai.is_some();

    let perum_v = match &input.perum {
        Some(p) => parse_perum(p)?,
        None => perum_for_date(on),
    };

    let siru_v = match &input.siru {
        Some(s) => parse_siru(s)?,
        None => siru_for_hour(hour, minute)?,
    };

    let naz_v = match input.nazhigai {
        Some(n) => {
            if !(0..=9).contains(&n) {
                return Err(TamilTimeError::InvalidNazhigai(n));
            }
            n
        }
        None => nazhigai_in_siru(hour, minute, Some(siru_v))?,
    };

    let (tinai_v, tinai_source) = match &input.tinai {
        Some(t) => (parse_tinai(t)?, TinaiSource::Flag),
        None => infer_tinai(input.latitude, input.longitude, Some(perum_v))?,
    };

    let prefix = input
        .theme_prefix
        .as_deref()
        .unwrap_or(DEFAULT_THEME_PREFIX);
    let theme = format!("{prefix}-{tinai_v}");
    let phase = siru_v.phase();
    let jam = jaamam_detail_for(siru_v, naz_v)?;
    let scene = scene_line(tinai_v, perum_v, siru_v, naz_v, Some(&jam))?;

    Ok(TamilState {
        tinai: tinai_v,
        perum: perum_v,
        siru: siru_v,
        nazhigai: naz_v,
        theme,
        phase,
        hour,
        minute,
        latitude: input.latitude,
        longitude: input.longitude,
        wallpaper_hint: wallpaper_hint(tinai_v, siru_v, naz_v),
        scene,
        source: if forced { "forced" } else { "auto" },
        tinai_source,
        jaamam: jam,
    })
}
