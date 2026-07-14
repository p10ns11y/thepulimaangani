//! Tinai geo heuristic (v1, not GIS).

use crate::error::TamilTimeError;
use crate::types::{Perum, Tinai, TinaiSource};

/// Simple TN coastal / hills / plains / forest / dry heuristic.
///
/// Documented mapping (v1, not GIS):
/// - East coast (lon ≳ 79.6° within TN lat band) → neythal
/// - Western Ghats / Nilgiris west (lon ≲ 77.3°) → kurinji
/// - Coimbatore foothills forest belt → mullai
/// - Dry interior + Mudhu Venil → palai
/// - Else plains → marutham
/// - Missing coords → marutham (default fertile plains)
pub fn infer_tinai(
    latitude: Option<f64>,
    longitude: Option<f64>,
    perum: Option<Perum>,
) -> Result<(Tinai, TinaiSource), TamilTimeError> {
    let (Some(lat), Some(lon)) = (latitude, longitude) else {
        return Ok((Tinai::Marutham, TinaiSource::Default));
    };

    if !((-90.0..=90.0).contains(&lat) && (-180.0..=180.0).contains(&lon)) {
        return Err(TamilTimeError::LatLonOutOfRange {
            lat: lat.to_string(),
            lon: lon.to_string(),
        });
    }

    let in_tn = (8.0..=13.6).contains(&lat) && (76.2..=80.5).contains(&lon);

    // Neythal — Coromandel / east shore
    if lon >= 79.55 && (8.0..=13.5).contains(&lat) {
        return Ok((Tinai::Neythal, TinaiSource::Geo));
    }

    // Kurinji — Western Ghats / Nilgiris / Palani hills
    if lon <= 77.35 && (9.2..=12.8).contains(&lat) {
        return Ok((Tinai::Kurinji, TinaiSource::Geo));
    }
    if lat >= 11.0 && lon <= 77.05 {
        return Ok((Tinai::Kurinji, TinaiSource::Geo));
    }

    // Mullai — forested western mid-belt
    if (10.3..=11.8).contains(&lat) && (76.9..=77.9).contains(&lon) {
        return Ok((Tinai::Mullai, TinaiSource::Geo));
    }

    // Palai — dry interior, especially harsh summer (Mudhu Venil)
    if (9.4..=11.6).contains(&lat)
        && (77.6..=79.1).contains(&lon)
        && perum == Some(Perum::MudhuVenil)
    {
        return Ok((Tinai::Palai, TinaiSource::Geo));
    }

    if in_tn || (8.0..=13.6).contains(&lat) {
        return Ok((Tinai::Marutham, TinaiSource::Geo));
    }
    Ok((Tinai::Marutham, TinaiSource::Default))
}
