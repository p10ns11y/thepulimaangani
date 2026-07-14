//! Error type for parse / resolve failures.

use thiserror::Error;

/// Errors from parsing names or resolving Tamil state.
#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum TamilTimeError {
    /// Unknown tinai name.
    #[error("unknown tinai {name:?}; use one of: kurinji, mullai, marutham, neythal, palai")]
    UnknownTinai {
        /// Input that failed.
        name: String,
    },
    /// Unknown perum name.
    #[error(
        "unknown perum {name:?}; use one of: ila_venil, mudhu_venil, kar, kulir, munpani, pinpani"
    )]
    UnknownPerum {
        /// Input that failed.
        name: String,
    },
    /// Unknown siru name.
    #[error(
        "unknown siru {name:?}; use one of: vidiyal, kaalai, nanpagal, erpaadu, maalai, yaamam"
    )]
    UnknownSiru {
        /// Input that failed.
        name: String,
    },
    /// Hour outside 0–23.
    #[error("hour must be int 0–23, got {0}")]
    InvalidHour(i32),
    /// Minute outside 0–59.
    #[error("minute must be int 0–59, got {0}")]
    InvalidMinute(i32),
    /// Nazhigai outside 0–9.
    #[error("nazhigai must be int 0–9, got {0}")]
    InvalidNazhigai(i32),
    /// Jaamam index outside 1–8.
    #[error("jaamam index must be int 1–8, got {0}")]
    InvalidJaamamIndex(i32),
    /// Latitude outside −90..90.
    #[error("latitude must be -90..90, got {0}")]
    InvalidLatitude(String),
    /// Longitude outside −180..180.
    #[error("longitude must be -180..180, got {0}")]
    InvalidLongitude(String),
    /// Lat/lon pair out of range.
    #[error("lat/lon out of range: {lat}, {lon}")]
    LatLonOutOfRange {
        /// Latitude.
        lat: String,
        /// Longitude.
        lon: String,
    },
}
