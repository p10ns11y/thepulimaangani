//! Scene line and wallpaper filename helpers.

use crate::jaamam::{jaamam_detail_for, JaamamDetail};
use crate::labels::tinai_meta;
use crate::types::{Perum, Siru, Tinai, NAZHIGAI_MINUTES};
use crate::TamilTimeError;

/// 1-based Nazhigai ordinal for UI (storage index 0 → 1 … index 9 → 10).
///
/// API/storage stays 0-based; humans read ordinals. Index 1 at ≈24 min elapsed
/// means *Running Nazhigai 2*, not “first nazhigai”.
pub fn nazhigai_ordinal(index: i32) -> Result<i32, TamilTimeError> {
    if !(0..=9).contains(&index) {
        return Err(TamilTimeError::InvalidNazhigai(index));
    }
    Ok(index + 1)
}

/// Plain-language `Running Nazhigai N (…)` for tooltips and scene lines.
pub fn nazhigai_running_copy(index: i32) -> Result<String, TamilTimeError> {
    let ordinal = nazhigai_ordinal(index)?;
    let into_min = index * NAZHIGAI_MINUTES;
    Ok(match ordinal {
        1 => format!("Running Nazhigai 1 (first {NAZHIGAI_MINUTES} minutes of this Siru)"),
        2 => format!("Running Nazhigai 2 (after {into_min} minutes, first nazhigai over)"),
        n => format!(
            "Running Nazhigai {n} (after {into_min} minutes, first {} nazhigai over)",
            n - 1
        ),
    })
}

/// Filename hint for Karu Porul wallpaper sets.
///
/// Soft micro-variation: step 0–4 → `a`, 5–9 → `b`.
pub fn wallpaper_hint(tinai: Tinai, siru: Siru, nazhigai: i32) -> String {
    let variant = if nazhigai < 5 { "a" } else { "b" };
    format!("{tinai}-{siru}-{variant}.jpg")
}

/// Resolve order: exact → `-b`→`-a` → tinai×characteristic siru a/b → tinai-default.
pub fn wallpaper_fallback_names(hint: &str) -> Vec<String> {
    let mut names = Vec::new();
    let mut seen = std::collections::HashSet::new();

    let mut add = |name: String| {
        if !name.is_empty() && seen.insert(name.clone()) {
            names.push(name);
        }
    };

    add(hint.to_string());
    if let Some(stem) = hint.strip_suffix("-b.jpg") {
        add(format!("{stem}-a.jpg"));
    }

    // {tinai}-{siru}-{a|b}.jpg
    let without_ext = hint.rsplit_once('.').map(|(s, _)| s).unwrap_or(hint);
    let parts: Vec<&str> = without_ext.split('-').collect();
    if parts.len() >= 3 && matches!(parts[parts.len() - 1], "a" | "b") {
        let tinai_s = parts[0];
        if let Ok(tinai) = crate::parse::parse_tinai(tinai_s) {
            let meta = tinai_meta(tinai);
            let char_siru = meta.siru.as_str();
            add(format!("{tinai_s}-{char_siru}-a.jpg"));
            add(format!("{tinai_s}-{char_siru}-b.jpg"));
            add(format!("{tinai_s}-default.jpg"));
        }
    }

    names
}

/// One-line delight string for CLI / status (never blocks the task).
///
/// `nazhigai` is the 0-based step index; copy uses 1-based ordinals.
/// Jaamam detail is the Siru's derived 3 h-grid split (jaamam ≡ saamam).
pub fn scene_line(
    tinai: Tinai,
    perum: Perum,
    siru: Siru,
    nazhigai: i32,
    jaamam: Option<&JaamamDetail>,
) -> Result<String, crate::TamilTimeError> {
    let meta = tinai_meta(tinai);
    let nazh = nazhigai_running_copy(nazhigai)?;
    let owned;
    let jam = match jaamam {
        Some(j) => j,
        None => {
            owned = jaamam_detail_for(siru, nazhigai)?;
            &owned
        }
    };
    Ok(format!(
        "{} · {} · {} · {} · {} · {}",
        meta.landscape,
        meta.flower,
        siru.as_str(),
        jam.label,
        nazh,
        perum.display_words()
    ))
}
