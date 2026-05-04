//! Fixed-layout **numeric features** derived only from structured parse output
//! (feet, syllables, linkage, line shape). No raw poem text is embedded.
//!
//! The WASM-facing snapshot type is [`crate::types::ParseFeatureSnapshot`]. Build it with
//! [`ParseFeatureVector::from_pipeline`] then `.into_snapshot()`, or `ParseFeatureSnapshot::from(&parse_result)`.
//!
//! Bump [`PARSE_FEATURE_SCHEMA_VERSION`] and [`PARSE_FEATURE_DENSE_LEN`] together whenever
//! the layout changes so downstream trainers / ONNX graphs can reject mismatched vectors.
//!
//! ## Dense layout (schema version 1)
//!
//! | Range | Block |
//! |-------|--------|
//! | `[0..12)` | **Global:** `ln(1+letter_count)`, `vikalpa_count`, `lines`, `feet`, `syllables`, mean feet/line, max feet/line, mean syllables/foot, max syllables/foot, Ner ratio, Nirai ratio, linkage count |
//! | `[12..19)` | **LinkageType:** fraction of each coarse type (see [`LinkageType`]) |
//! | `[19..27)` | **LinkageSpecialType:** fraction of each special bond |
//! | `[27..43)` | **Foot pattern bins:** FNV-1a hash of each `foot.foot_type` string mod 16, mass normalized by foot count |
//! | `[43..51)` | **Line foot histogram:** fraction of lines with 0,1,2,3,4,5–8,9–12,13+ feet |

use serde::{Deserialize, Serialize};

use crate::foot::Foot;
use crate::linkage::{Linkage, LinkageSpecialType, LinkageType};
use crate::syllable::Syllable;
use crate::syllable::SyllableType;
use crate::types::{Line, ParseFeatureSnapshot, ParseResult};

/// Increment when the dense vector layout or semantics change.
pub const PARSE_FEATURE_SCHEMA_VERSION: u32 = 1;

/// Total length of [`ParseFeatureVector::dense`].
pub const PARSE_FEATURE_DENSE_LEN: usize =
    N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL + N_FOOT_HASH + N_LINE_FOOT_HIST;

/// Start index in `dense` for the global summary block (length [`GLOBAL_FEATURE_DIM`]).
pub const GLOBAL_FEATURE_OFFSET: usize = 0;
pub const GLOBAL_FEATURE_DIM: usize = N_GLOBAL;

/// Normalized histogram of [`LinkageType`] (length [`LINKAGE_TYPE_FEATURE_DIM`]).
pub const LINKAGE_TYPE_FEATURE_OFFSET: usize = N_GLOBAL;
pub const LINKAGE_TYPE_FEATURE_DIM: usize = N_LINKAGE_TYPE;

/// Normalized histogram of [`LinkageSpecialType`] (length [`LINK_SPECIAL_FEATURE_DIM`]).
pub const LINK_SPECIAL_FEATURE_OFFSET: usize = N_GLOBAL + N_LINKAGE_TYPE;
pub const LINK_SPECIAL_FEATURE_DIM: usize = N_LINK_SPECIAL;

/// Soft multiset of `foot_type` strings via FNV-1a bins (length [`FOOT_PATTERN_BIN_DIM`]).
pub const FOOT_PATTERN_BIN_OFFSET: usize = N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL;
pub const FOOT_PATTERN_BIN_DIM: usize = N_FOOT_HASH;

/// Normalized histogram of feet-per-line counts (length [`LINE_FOOT_HIST_FEATURE_DIM`]).
pub const LINE_FOOT_HIST_OFFSET: usize =
    N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL + N_FOOT_HASH;
pub const LINE_FOOT_HIST_FEATURE_DIM: usize = N_LINE_FOOT_HIST;

const N_GLOBAL: usize = 12;
const N_LINKAGE_TYPE: usize = 7;
const N_LINK_SPECIAL: usize = 8;
const N_FOOT_HASH: usize = 16;
const N_LINE_FOOT_HIST: usize = 8;
/// Stable FNV-1a 32-bit hash for reproducible bins across platforms (not cryptographic).
pub fn fnv1a_u32(bytes: &[u8]) -> u32 {
    let mut h: u32 = 2166136261;
    for &b in bytes {
        h ^= u32::from(b);
        h = h.wrapping_mul(16777619);
    }
    h
}

/// Intermediate pipeline state for [`ParseFeatureVector::from_pipeline`] (before `ParseResult` exists).
#[derive(Debug, Clone, Copy)]
pub struct ParseFeatureSource<'a> {
    pub letter_count: usize,
    pub vikalpa_count: usize,
    pub lines: &'a [Line],
    pub syllables: &'a [Syllable],
    pub feet: &'a [Foot],
    pub linkage: &'a [Linkage],
}

/// Dense prosody features for small models (linear layer, GBM export, etc.).
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ParseFeatureVector {
    pub schema_version: u32,
    /// Fixed-length vector; see module documentation for layout.
    pub dense: Vec<f32>,
}

impl ParseFeatureVector {
    /// Build features from pipeline fields (same layout as WASM snapshot on [`crate::types::ParseResult`]).
    pub fn from_pipeline(src: ParseFeatureSource<'_>) -> Self {
        let mut dense = vec![0.0f32; PARSE_FEATURE_DENSE_LEN];
        fill_global_from_parts(&mut dense[0..N_GLOBAL], src);
        fill_linkage_types_slice(&mut dense[N_GLOBAL..N_GLOBAL + N_LINKAGE_TYPE], src.linkage);
        fill_linkage_special_slice(
            &mut dense[N_GLOBAL + N_LINKAGE_TYPE..N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL],
            src.linkage,
        );
        fill_foot_pattern_bins_slice(
            &mut dense[N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL
                ..N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL + N_FOOT_HASH],
            src.feet,
        );
        fill_line_foot_histogram_slice(
            &mut dense[N_GLOBAL + N_LINKAGE_TYPE + N_LINK_SPECIAL + N_FOOT_HASH..],
            src.lines,
        );

        Self {
            schema_version: PARSE_FEATURE_SCHEMA_VERSION,
            dense,
        }
    }

    /// Convert to the JSON field shape on [`crate::types::ParseResult::parse_features`].
    pub fn into_snapshot(self) -> ParseFeatureSnapshot {
        ParseFeatureSnapshot {
            schema_version: self.schema_version,
            dense: self.dense,
        }
    }

    /// Borrow as a fixed slice when `dense` has the expected length (always true if built via `from_pipeline`).
    pub fn dense_slice(&self) -> &[f32] {
        &self.dense
    }
}

impl From<&ParseResult> for ParseFeatureSnapshot {
    fn from(result: &ParseResult) -> Self {
        ParseFeatureVector::from_pipeline(ParseFeatureSource {
            letter_count: result.letter_count,
            vikalpa_count: result.vikalpa_count,
            lines: &result.lines,
            syllables: &result.syllables,
            feet: &result.feet,
            linkage: &result.linkage,
        })
        .into_snapshot()
    }
}

fn ln1p_u32(n: usize) -> f32 {
    ((n as f64) + 1.0).ln() as f32
}

fn fill_global_from_parts(slice: &mut [f32], src: ParseFeatureSource<'_>) {
    let n_lines = src.lines.len().max(1);
    let n_feet = src.feet.len();
    let n_syl = src.syllables.len();
    let n_link = src.linkage.len();

    let mut ner = 0usize;
    let mut nirai = 0usize;
    for s in src.syllables {
        match s.syllable_type {
            SyllableType::Ner => ner += 1,
            SyllableType::Nirai => nirai += 1,
        }
    }
    let n_st = (ner + nirai).max(1);

    let mut max_feet_per_line = 0usize;
    let mut total_feet_lines = 0usize;
    for ln in src.lines {
        let c = ln.feet.len();
        max_feet_per_line = max_feet_per_line.max(c);
        total_feet_lines += c;
    }
    let mean_feet_per_line = (total_feet_lines as f32) / (n_lines as f32);

    let mut max_syl_per_foot = 0usize;
    let mut sum_syl_foot = 0usize;
    for f in src.feet {
        let c = f.syllables.len();
        max_syl_per_foot = max_syl_per_foot.max(c);
        sum_syl_foot += c;
    }
    let mean_syl_per_foot = if n_feet == 0 {
        0.0f32
    } else {
        (sum_syl_foot as f32) / (n_feet as f32)
    };

    slice[0] = ln1p_u32(src.letter_count);
    slice[1] = src.vikalpa_count as f32;
    slice[2] = src.lines.len() as f32;
    slice[3] = n_feet as f32;
    slice[4] = n_syl as f32;
    slice[5] = mean_feet_per_line;
    slice[6] = max_feet_per_line as f32;
    slice[7] = mean_syl_per_foot;
    slice[8] = max_syl_per_foot as f32;
    slice[9] = (ner as f32) / (n_st as f32);
    slice[10] = (nirai as f32) / (n_st as f32);
    slice[11] = n_link as f32;
}

fn linkage_type_index(t: &LinkageType) -> usize {
    match t {
        LinkageType::VenTalai => 0,
        LinkageType::AciriyaTalai => 1,
        LinkageType::KaliTalai => 2,
        LinkageType::VanjiTalai => 3,
        // Indices 4–5 reserved (unused in schema v1); keep dense layout stable.
        LinkageType::Other(_) => 6,
    }
}

fn fill_linkage_types_slice(slice: &mut [f32], linkage: &[Linkage]) {
    let denom = linkage.len().max(1) as f32;
    for link in linkage {
        let i = linkage_type_index(&link.linkage_type);
        if i < N_LINKAGE_TYPE {
            slice[i] += 1.0 / denom;
        }
    }
}

fn linkage_special_index(s: LinkageSpecialType) -> usize {
    match s {
        LinkageSpecialType::NerondriyaAciriyathalai => 0,
        LinkageSpecialType::NiraiondriyaAciriyathalai => 1,
        LinkageSpecialType::IyarcirVenthalai => 2,
        LinkageSpecialType::VencirVenthalai => 3,
        LinkageSpecialType::Kalithalai => 4,
        LinkageSpecialType::OndriyaVanchithalai => 5,
        LinkageSpecialType::OndrathaVanchithalai => 6,
        LinkageSpecialType::Unknown => 7,
    }
}

fn fill_linkage_special_slice(slice: &mut [f32], linkage: &[Linkage]) {
    let denom = linkage.len().max(1) as f32;
    for link in linkage {
        let i = linkage_special_index(link.linkage_special_type);
        slice[i] += 1.0 / denom;
    }
}

fn fill_foot_pattern_bins_slice(slice: &mut [f32], feet: &[Foot]) {
    let denom = feet.len().max(1) as f32;
    for foot in feet {
        let h = fnv1a_u32(foot.foot_type.as_bytes()) as usize % N_FOOT_HASH;
        slice[h] += 1.0 / denom;
    }
}

/// Bin `foot_count` on one physical line into histogram slots (counts normalized by line count).
fn line_foot_bin(foot_count: usize) -> usize {
    match foot_count {
        0 => 0,
        1 => 1,
        2 => 2,
        3 => 3,
        4 => 4,
        5 | 6 | 7 | 8 => 5,
        9..=12 => 6,
        _ => 7,
    }
}

fn fill_line_foot_histogram_slice(slice: &mut [f32], lines: &[Line]) {
    let denom = lines.len().max(1) as f32;
    for ln in lines {
        let b = line_foot_bin(ln.feet.len());
        if b < N_LINE_FOOT_HIST {
            slice[b] += 1.0 / denom;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parse_poem;
    use crate::types::{ParseFeatureSnapshot, ParseOptions};

    #[test]
    fn dense_len_matches_constant() {
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let r = parse_poem("கற்றது கைமணற்கு அணிதல்", opts).unwrap();
        let v = ParseFeatureSnapshot::from(&r);
        assert_eq!(v.schema_version, PARSE_FEATURE_SCHEMA_VERSION);
        assert_eq!(v.dense.len(), PARSE_FEATURE_DENSE_LEN);
    }

    #[test]
    fn same_input_same_vector() {
        let text = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let a = parse_poem(text, opts.clone()).unwrap();
        let b = parse_poem(text, opts).unwrap();
        let fa = ParseFeatureSnapshot::from(&a);
        let fb = ParseFeatureSnapshot::from(&b);
        assert_eq!(fa, fb);
    }

    #[test]
    fn global_slice_non_nan() {
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let r = parse_poem("அ\nஅ\nஅ", opts).unwrap();
        let v = ParseFeatureSnapshot::from(&r);
        for (i, &x) in v.dense.iter().enumerate() {
            assert!(x.is_finite(), "index {i} is not finite: {x}");
        }
    }

    #[test]
    fn from_pipeline_matches_from_parse_result() {
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let r = parse_poem("முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்", opts).unwrap();
        let a = ParseFeatureSnapshot::from(&r);
        let b = ParseFeatureVector::from_pipeline(ParseFeatureSource {
            letter_count: r.letter_count,
            vikalpa_count: r.vikalpa_count,
            lines: &r.lines,
            syllables: &r.syllables,
            feet: &r.feet,
            linkage: &r.linkage,
        })
        .into_snapshot();
        assert_eq!(a, b);
    }

    /// Golden vector for the sample kural (Venpaa). Regenerate with:
    /// `pnpm run dump:test-fixtures` or `cargo run --example dump_kural_parse_features_fixture`.
    #[test]
    fn golden_kural_venpaa_parse_features_match_fixture() {
        let fixture: ParseFeatureSnapshot = serde_json::from_str(include_str!(
            "../tests/test_data/kural_venpaa_parse_features.json"
        ))
        .expect("fixture JSON");
        let text = "முற்ற உணர்ந்தானை ஏத்தி மொழிகுவன்\nகுற்றமொன்று இல்லா அறம்";
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let r = parse_poem(text, opts).expect("parse");
        let got = ParseFeatureSnapshot::from(&r);
        assert_eq!(
            got.schema_version, fixture.schema_version,
            "bump fixture if PARSE_FEATURE_SCHEMA_VERSION changes"
        );
        assert_eq!(got.dense.len(), fixture.dense.len());
        const EPS: f32 = 1e-4;
        for (i, (&a, &b)) in got.dense.iter().zip(fixture.dense.iter()).enumerate() {
            assert!(
                (a - b).abs() < EPS,
                "dense[{i}] mismatch: got {a}, fixture {b}"
            );
        }
    }

    #[test]
    fn global_counts_differ_for_short_vs_multiword() {
        let mut opts = ParseOptions::default();
        opts.no_detect = true;
        let r1 = parse_poem("கா", opts.clone()).unwrap();
        let r2 = parse_poem("கா கி கு கே கை", opts).unwrap();
        let v1 = ParseFeatureSnapshot::from(&r1);
        let v2 = ParseFeatureSnapshot::from(&r2);
        assert_ne!(v1.dense[3], v2.dense[3], "foot count feature should differ");
        assert_ne!(v1.dense[11], v2.dense[11], "linkage count should differ");
    }
}
