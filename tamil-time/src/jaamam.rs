//! Jaamam / saamam — 8 × 3 h design grid from vidiyal epoch.

use crate::error::TamilTimeError;
use crate::types::{
    Siru, JAAMAMS_PER_DAY, JAAMAM_EPOCH_HOUR, JAAMAM_HOURS, NAZHIGAIS_PER_JAAMAM, NAZHIGAI_MINUTES,
};

/// One jaamam segment overlapping the current Siru (nazhigai units).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct JaamamPart {
    /// Index 1–8.
    pub index: i32,
    /// Overlap within this Siru (e.g. 7.5, 5.0, 2.5).
    pub nazhigai: f64,
    /// True when the whole 3 h jaamam sits inside this Siru.
    pub full: bool,
}

/// Siru × jaamam overlap map + which jaamam the current Nazhigai falls in.
#[derive(Debug, Clone, PartialEq)]
pub struct JaamamDetail {
    /// Overlapping parts for the current Siru.
    pub parts: Vec<JaamamPart>,
    /// Jaamam 1–8 at this Siru Nazhigai step.
    pub current: i32,
    /// Scene fragment, e.g. `"jaamam 1 (full) + jaamam 2 (2.5 nazhigai)"`.
    pub label: String,
}

fn expand_hour_window(start: f64, end: f64) -> Vec<(f64, f64)> {
    if start < end {
        vec![(start, end)]
    } else if (start - end).abs() < f64::EPSILON {
        vec![]
    } else {
        vec![(start, 24.0), (0.0, end)]
    }
}

fn overlap_hours(a_start: f64, a_end: f64, b_start: f64, b_end: f64) -> f64 {
    let mut total = 0.0;
    for (a0, a1) in expand_hour_window(a_start, a_end) {
        for (b0, b1) in expand_hour_window(b_start, b_end) {
            let lo = a0.max(b0);
            let hi = a1.min(b1);
            if hi > lo {
                total += hi - lo;
            }
        }
    }
    total
}

/// Half-open `[start, end)` hours for jaamam index 1–8 (may wrap).
pub fn jaamam_window(index: i32) -> Result<(f64, f64), TamilTimeError> {
    if !(1..=JAAMAMS_PER_DAY).contains(&index) {
        return Err(TamilTimeError::InvalidJaamamIndex(index));
    }
    let start = f64::from((JAAMAM_EPOCH_HOUR + (index - 1) * JAAMAM_HOURS).rem_euclid(24));
    let end = (start + f64::from(JAAMAM_HOURS)) % 24.0;
    Ok((start, end))
}

/// Jaamam 1–8 containing local wall time (epoch = vidiyal / hour 2).
pub fn jaamam_index_at(hour: i32, minute: i32) -> Result<i32, TamilTimeError> {
    if !(0..=23).contains(&hour) {
        return Err(TamilTimeError::InvalidHour(hour));
    }
    if !(0..=59).contains(&minute) {
        return Err(TamilTimeError::InvalidMinute(minute));
    }
    let t_min = hour * 60 + minute;
    let epoch_min = JAAMAM_EPOCH_HOUR * 60;
    let into = (t_min - epoch_min).rem_euclid(24 * 60);
    Ok(into / (JAAMAM_HOURS * 60) + 1)
}

fn minutes_at_siru_nazhigai(siru: Siru, nazhigai: i32) -> i32 {
    let (start_h, _) = siru.window_hours();
    (start_h * 60 + nazhigai * NAZHIGAI_MINUTES).rem_euclid(24 * 60)
}

fn fmt_jaamam_nazhigai(amount: f64, full: bool) -> String {
    if full {
        return "full".to_string();
    }
    if (amount - amount.round()).abs() < 1e-9 {
        format!("{} nazhigai", amount.round() as i32)
    } else {
        // Match Python `:g` — trim trailing zeros sensibly
        let s = format!("{amount}");
        format!("{s} nazhigai")
    }
}

/// Derive which jaamams a Siru covers by overlapping 4 h Siru vs 3 h grid.
///
/// Typical patterns (nazhigai): 7.5+2.5, 5+5, 2.5+7.5 — repeating twice per day.
pub fn jaamam_split_for_siru(siru: Siru) -> Vec<JaamamPart> {
    let (s0, s1) = siru.window_hours();
    let s0 = f64::from(s0);
    let s1 = f64::from(s1);
    let mut parts = Vec::new();
    for idx in 1..=JAAMAMS_PER_DAY {
        let (j0, j1) = jaamam_window(idx).expect("index in range");
        let hours = overlap_hours(s0, s1, j0, j1);
        if hours <= 0.0 {
            continue;
        }
        let nazh = hours * 60.0 / f64::from(NAZHIGAI_MINUTES);
        let full = (nazh - NAZHIGAIS_PER_JAAMAM).abs() < 1e-9;
        parts.push(JaamamPart {
            index: idx,
            nazhigai: nazh,
            full,
        });
    }
    debug_assert!(!parts.is_empty(), "no jaamam overlap for siru {siru}");
    parts
}

/// Label for a list of jaamam parts.
pub fn jaamam_label_for_parts(parts: &[JaamamPart]) -> String {
    parts
        .iter()
        .map(|p| {
            format!(
                "jaamam {} ({})",
                p.index,
                fmt_jaamam_nazhigai(p.nazhigai, p.full)
            )
        })
        .collect::<Vec<_>>()
        .join(" + ")
}

/// Structural Siru↔jaamam split plus current jaamam at this Nazhigai step.
pub fn jaamam_detail_for(siru: Siru, nazhigai: i32) -> Result<JaamamDetail, TamilTimeError> {
    if !(0..=9).contains(&nazhigai) {
        return Err(TamilTimeError::InvalidNazhigai(nazhigai));
    }
    let parts = jaamam_split_for_siru(siru);
    let t_min = minutes_at_siru_nazhigai(siru, nazhigai);
    let current = jaamam_index_at(t_min / 60, t_min % 60)?;
    let label = jaamam_label_for_parts(&parts);
    Ok(JaamamDetail {
        parts,
        current,
        label,
    })
}
