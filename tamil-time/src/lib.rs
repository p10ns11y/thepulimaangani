//! Tamil Nadu cultural time & calendar model.
//!
//! Design grid (not live astronomy): six **Siru** (~4 h), ten **Nazhigai** per
//! Siru (~24 min), eight **Jaamam**/saamam (~3 h from vidiyal epoch), six
//! **Perum** seasons (approx Gregorian), five **Tinai** landscapes.
//!
//! Ported from arch-machine eye-comfort `tamil_schedule.py` as a reusable SoT.

#![deny(missing_docs)]

mod display;
mod error;
mod infer;
mod jaamam;
mod labels;
mod parse;
mod resolve;
mod types;

pub use display::{
    nazhigai_ordinal, nazhigai_running_copy, scene_line, wallpaper_fallback_names, wallpaper_hint,
};
pub use error::TamilTimeError;
pub use infer::infer_tinai;
pub use jaamam::{
    jaamam_detail_for, jaamam_index_at, jaamam_label_for_parts, jaamam_split_for_siru,
    jaamam_window, JaamamDetail, JaamamPart,
};
pub use labels::{perum_label, siru_label, tinai_meta, TinaiMeta, PERUM_LABEL, SIRU_LABEL};
pub use parse::{parse_perum, parse_siru, parse_tinai};
pub use resolve::{
    nazhigai_in_siru, nazhigai_of_day, perum_for_date, resolve_tamil, resolve_tamil_at,
    siru_for_hour, ResolveInput, TamilState, DEFAULT_THEME_PREFIX,
};
pub use types::{
    CircadianPhase, Perum, Siru, Tinai, TinaiSource, JAAMAMS_PER_DAY, JAAMAM_EPOCH_HOUR,
    JAAMAM_HOURS, NAZHIGAIS_PER_JAAMAM, NAZHIGAIS_PER_SIRU, NAZHIGAI_MINUTES, PERUM, SIRU, TINAI,
};
