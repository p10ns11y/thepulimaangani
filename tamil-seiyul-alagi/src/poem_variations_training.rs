//! Parse [`data/poem_variations.js`](../../data/poem_variations.js) and build UTF-8 training rows
//! (labels + optional 51-dim features from `parse_poem`).

use std::collections::{BTreeMap, HashMap};
use std::path::Path;

use regex::Regex;

use crate::linkage::Linkage;
use crate::metre::MetreType;
use crate::parse_features::{fnv1a_u32, PARSE_FEATURE_DENSE_LEN};
use crate::parse_poem;
use crate::types::{ParseFeatureSnapshot, ParseOptions, ParseResult};

/// One labelled sample from `poem_variations.js` (before parsing).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PoemVariationLabelRow {
    pub sample_id: String,
    pub parent_metre: String,
    pub row_kind: String,
    pub label_ta: String,
    pub text: String,
}

/// Label row plus parser outputs for CSV export.
#[derive(Debug, Clone)]
pub struct PoemVariationTrainingRow {
    pub label: PoemVariationLabelRow,
    pub parse_ok: bool,
    pub parse_error: String,
    pub predicted_metre: Option<String>,
    pub top_score: Option<i32>,
    pub features: Option<ParseFeatureSnapshot>,
    /// Full `ParseResult.linkage` when parse succeeded (WASM-style `linkage_type` / `linkage_special_type` strings).
    pub linkage: Vec<Linkage>,
}

/// Aggregated confusion from repeated Monte Carlo–style passes (deterministic shuffle per iteration).
#[derive(Debug, Clone, Default, serde::Serialize, serde::Deserialize)]
pub struct MetreMonteCarloAggregate {
    pub iterations: u32,
    pub total_evaluations: u64,
    /// Top-1 accuracy: predicted head metre equals gold coarse metre for `parent_metre`.
    pub total_correct: u64,
    /// Mean reciprocal rank of the gold metre in `top_k_metre_hypotheses` (0 if gold missing from list).
    #[serde(default)]
    pub mean_reciprocal_rank: f64,
    /// Count where gold appears in the top two hypotheses.
    #[serde(default)]
    pub correct_at_2: u64,
    pub confusion: BTreeMap<String, u64>,
}

/// Rows with `row_kind == "special_type"` (curated “good” variations).
pub fn poem_variation_special_type_rows(rows: &[PoemVariationLabelRow]) -> Vec<PoemVariationLabelRow> {
    rows.iter()
        .filter(|r| r.row_kind == "special_type")
        .cloned()
        .collect()
}

/// Rows whose `row_kind` is one of `kinds` (e.g. `&["special_type", "variation"]`). If `kinds` is empty, returns a clone of all `rows`.
pub fn poem_variation_rows_by_kinds(rows: &[PoemVariationLabelRow], kinds: &[&str]) -> Vec<PoemVariationLabelRow> {
    if kinds.is_empty() {
        return rows.to_vec();
    }
    rows.iter()
        .filter(|r| kinds.iter().any(|k| r.row_kind == *k))
        .cloned()
        .collect()
}

/// Parse like [`build_training_rows`] (uyir_u hints) for evaluation / diagnostics.
pub fn parse_label_row_for_eval(label: &PoemVariationLabelRow) -> Result<ParseResult, crate::error::ParseError> {
    parse_poem(label.text.trim(), ParseOptions::poem_variations_training())
}

/// Deterministic permutation for iteration `iter` (reproducible without RNG).
pub fn shuffle_labels_for_iteration(labels: &[PoemVariationLabelRow], iter: u32) -> Vec<PoemVariationLabelRow> {
    let mut out: Vec<_> = labels.to_vec();
    let salt = iter.to_le_bytes();
    out.sort_by(|a, b| {
        let mut ka = salt.to_vec();
        ka.extend_from_slice(a.sample_id.as_bytes());
        let mut kb = salt.to_vec();
        kb.extend_from_slice(b.sample_id.as_bytes());
        fnv1a_u32(&ka).cmp(&fnv1a_u32(&kb))
    });
    out
}

/// Gold coarse [`MetreType`] for a `parent_metre` slug from `poem_variations.js`.
pub fn gold_metre_type_for_parent(parent_slug: &str) -> Option<MetreType> {
    match parent_slug {
        "venpaa" => Some(MetreType::Venpaa),
        "aciriyappa" => Some(MetreType::Aciriyappaa),
        "kalippaa" => Some(MetreType::Kalippaa),
        "vanjippaa" => Some(MetreType::Vanjippaa),
        _ => None,
    }
}

/// Gold coarse metre label string for a `parent_metre` slug from `poem_variations.js` (`aciriyappa` → `Aciriyappaa`).
pub fn gold_metre_label_for_parent(parent_slug: &str) -> Option<&'static str> {
    gold_metre_type_for_parent(parent_slug).map(|m| match m {
        MetreType::Venpaa => "Venpaa",
        MetreType::Aciriyappaa => "Aciriyappaa",
        MetreType::Kalippaa => "Kalippaa",
        MetreType::Vanjippaa => "Vanjippaa",
        MetreType::Other(_) => "Other",
    })
}

/// Run `iterations` shuffled passes over `labels`, parse each sample, aggregate top-metre vs gold from `parent_metre`.
pub fn aggregate_metre_monte_carlo(
    labels: &[PoemVariationLabelRow],
    iterations: u32,
) -> MetreMonteCarloAggregate {
    let mut agg = MetreMonteCarloAggregate {
        iterations,
        ..Default::default()
    };
    let mut mrr_sum = 0.0f64;
    for it in 0..iterations {
        let perm = shuffle_labels_for_iteration(labels, it);
        for label in &perm {
            let Ok(r) = parse_label_row_for_eval(label) else {
                continue;
            };
            let hy = &r.top_k_metre_hypotheses;
            if hy.is_empty() {
                continue;
            }
            let Some(gold) = gold_metre_type_for_parent(label.parent_metre.as_str()) else {
                continue;
            };
            let pred1 = hy[0].metre_type.clone();
            agg.total_evaluations += 1;
            if pred1 == gold {
                agg.total_correct += 1;
            }
            let rank = hy.iter().position(|h| h.metre_type == gold);
            mrr_sum += rank.map(|i| 1.0 / (i + 1) as f64).unwrap_or(0.0);
            if rank.is_some_and(|i| i < 2) {
                agg.correct_at_2 += 1;
            }
            let key = format!("{}|{:?}", label.parent_metre, pred1);
            *agg.confusion.entry(key).or_insert(0) += 1;
        }
    }
    if agg.total_evaluations > 0 {
        agg.mean_reciprocal_rank = mrr_sum / agg.total_evaluations as f64;
    }
    agg
}

fn slice_between<'a>(s: &'a str, start_pat: &str, end_pat: &str) -> Option<&'a str> {
    let i = s.find(start_pat)? + start_pat.len();
    let j = s[i..].find(end_pat)? + i;
    Some(&s[i..j])
}

/// `const ORU_VIKARPA_KURAL_VENPAA = 'oru_vikarpa_kural_venpaa';` → const name → machine id.
fn const_string_map(js: &str) -> HashMap<String, String> {
    let re = Regex::new(r"(?m)^const\s+([A-Z0-9_]+)\s*=\s*'([^']*)'\s*;").expect("const regex");
    let mut m = HashMap::new();
    for cap in re.captures_iter(js) {
        m.insert(cap[1].to_string(), cap[2].to_string());
    }
    m
}

fn examples_map(js: &str) -> HashMap<String, String> {
    let body = slice_between(
        js,
        "const poemVariationExamples = {",
        "\n};\n\n/** Tamil display label",
    )
    .expect("poemVariationExamples block");
    let re = Regex::new(r"\[([a-zA-Z0-9_]+)\]\s*:\s*`([^`]*)`").expect("regex");
    let mut m = HashMap::new();
    for cap in re.captures_iter(body) {
        m.insert(cap[1].to_string(), cap[2].to_string());
    }
    m
}

fn tamil_labels_map(js: &str) -> HashMap<String, String> {
    let body = slice_between(
        js,
        "const tamilKeys = {",
        "\n};\n\n/** @param {string} key */",
    )
    .expect("tamilKeys block");
    let re = Regex::new(r"\[([a-zA-Z0-9_]+)\]\s*:\s*'([^']*)'").expect("regex");
    let mut out = HashMap::new();
    for cap in re.captures_iter(body) {
        out.insert(cap[1].to_string(), cap[2].to_string());
    }
    out
}

fn variation_ids_in_block(block_inner: &str) -> Vec<String> {
    let re = Regex::new(r"variationRow\(([a-zA-Z0-9_]+)\)").expect("regex");
    re.captures_iter(block_inner)
        .map(|c| c[1].to_string())
        .collect()
}

/// Parse the canonical `poem_variations.js` source (UTF-8) into ordered label rows.
pub fn poem_variation_label_rows(js: &str) -> Vec<PoemVariationLabelRow> {
    let consts = const_string_map(js);
    let examples = examples_map(js);
    let tamil = tamil_labels_map(js);

    let pv_body = slice_between(
        js,
        "const poemVariations = {",
        "\n};\n\nexport {",
    )
    .expect("poemVariations block");

    let parents = [
        (r"(?s)\[VENPAA\]\s*:\s*\{\s*special_types:\s*\[(.*?)\]\s*,\s*variations:\s*\[(.*?)\]\s*,\s*\}", "venpaa"),
        (r"(?s)\[ACIRIYAPPA\]\s*:\s*\{\s*special_types:\s*\[(.*?)\]\s*,\s*variations:\s*\[(.*?)\]\s*,\s*\}", "aciriyappa"),
        (r"(?s)\[KALIPPAA\]\s*:\s*\{\s*special_types:\s*\[(.*?)\]\s*,\s*variations:\s*\[(.*?)\]\s*,\s*\}", "kalippaa"),
        (r"(?s)\[VANJIPPAA\]\s*:\s*\{\s*special_types:\s*\[(.*?)\]\s*,\s*variations:\s*\[(.*?)\]\s*,\s*\}", "vanjippaa"),
    ];

    let mut out = Vec::new();
    for (pat, parent_slug) in parents {
        let re = Regex::new(pat).expect("parent regex");
        let cap = re
            .captures(pv_body)
            .unwrap_or_else(|| panic!("parent block not found: {parent_slug}"));
        let special_inner = cap.get(1).expect("special_types").as_str();
        let var_inner = cap.get(2).expect("variations").as_str();

        for sid_const in variation_ids_in_block(special_inner) {
            let sample_id = consts
                .get(&sid_const)
                .cloned()
                .unwrap_or_else(|| sid_const.to_lowercase());
            let text = examples.get(&sid_const).cloned().unwrap_or_default();
            let label_ta = tamil.get(&sid_const).cloned().unwrap_or_default();
            out.push(PoemVariationLabelRow {
                sample_id,
                parent_metre: parent_slug.to_string(),
                row_kind: "special_type".to_string(),
                label_ta,
                text,
            });
        }
        for sid_const in variation_ids_in_block(var_inner) {
            let sample_id = consts
                .get(&sid_const)
                .cloned()
                .unwrap_or_else(|| sid_const.to_lowercase());
            let text = examples.get(&sid_const).cloned().unwrap_or_default();
            let label_ta = tamil.get(&sid_const).cloned().unwrap_or_default();
            out.push(PoemVariationLabelRow {
                sample_id,
                parent_metre: parent_slug.to_string(),
                row_kind: "variation".to_string(),
                label_ta,
                text,
            });
        }
    }
    out
}

/// Parse each sample with [`ParseOptions::poem_variations_training`] and attach features + top hypothesis.
pub fn build_training_rows(labels: &[PoemVariationLabelRow]) -> Vec<PoemVariationTrainingRow> {
    labels
        .iter()
        .map(|label| {
            match parse_poem(label.text.trim(), ParseOptions::poem_variations_training()) {
                Ok(r) => {
                    let top = r.top_k_metre_hypotheses.first();
                    PoemVariationTrainingRow {
                        label: label.clone(),
                        parse_ok: true,
                        parse_error: String::new(),
                        predicted_metre: top.map(|h| format!("{:?}", h.metre_type)),
                        top_score: top.map(|h| h.aggregate_score),
                        features: r.parse_features.clone(),
                        linkage: r.linkage.clone(),
                    }
                }
                Err(e) => PoemVariationTrainingRow {
                    label: label.clone(),
                    parse_ok: false,
                    parse_error: e.to_string(),
                    predicted_metre: None,
                    top_score: None,
                    features: None,
                    linkage: Vec::new(),
                },
            }
        })
        .collect()
}

/// Write UTF-8 CSV (no BOM). Multilingual-safe: UTF-8 text fields; quote non-numeric fields.
pub fn write_poem_variations_training_csv(
    path: &Path,
    rows: &[PoemVariationTrainingRow],
) -> std::io::Result<()> {
    let mut wtr = csv::WriterBuilder::new()
        .quote_style(csv::QuoteStyle::NonNumeric)
        .from_path(path)?;

    let mut header = vec![
        "sample_id".to_string(),
        "parent_metre".to_string(),
        "label_metre_en".to_string(),
        "text_lang".to_string(),
        "row_kind".to_string(),
        "label_ta".to_string(),
        "text".to_string(),
        "parse_ok".to_string(),
        "parse_error".to_string(),
        "predicted_metre".to_string(),
        "top_score".to_string(),
        "pred_matches_parent".to_string(),
        "feature_schema_version".to_string(),
    ];
    for i in 0..PARSE_FEATURE_DENSE_LEN {
        header.push(format!("dense_{i}"));
    }
    wtr.write_record(&header)?;

    for row in rows {
        let pred = row.predicted_metre.as_deref();
        let pred_match = if row.parse_ok {
            match (pred, gold_metre_label_for_parent(row.label.parent_metre.as_str())) {
                (Some(p), Some(g)) => p == g,
                _ => false,
            }
        } else {
            false
        };
        let mut rec: Vec<String> = vec![
            row.label.sample_id.clone(),
            row.label.parent_metre.clone(),
            row.label.parent_metre.clone(),
            "ta".to_string(),
            row.label.row_kind.clone(),
            row.label.label_ta.clone(),
            row.label.text.clone(),
            if row.parse_ok { "1".into() } else { "0".into() },
            row.parse_error.clone(),
            row.predicted_metre.clone().unwrap_or_default(),
            row.top_score.map(|s| s.to_string()).unwrap_or_default(),
            if pred_match { "1".into() } else { "0".into() },
            row.features
                .as_ref()
                .map(|f| f.schema_version.to_string())
                .unwrap_or_default(),
        ];
        if let Some(f) = &row.features {
            for x in &f.dense {
                rec.push(format!("{x}"));
            }
        } else {
            for _ in 0..PARSE_FEATURE_DENSE_LEN {
                rec.push(String::new());
            }
        }
        wtr.write_record(&rec)?;
    }
    wtr.flush()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn js_fixture() -> String {
        std::fs::read_to_string(
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../data/poem_variations.js"),
        )
        .expect("read poem_variations.js")
    }

    #[test]
    fn label_row_count_matches_poem_variations() {
        let rows = poem_variation_label_rows(&js_fixture());
        assert_eq!(rows.len(), 36, "expected 36 samples from poem_variations.js");
    }

    #[test]
    fn mc_twenty_iterations_special_types_majority_correct() {
        let js = js_fixture();
        let labels = poem_variation_special_type_rows(&poem_variation_label_rows(&js));
        assert_eq!(labels.len(), 17);
        let agg = aggregate_metre_monte_carlo(&labels, 20);
        assert_eq!(agg.iterations, 20);
        assert_eq!(agg.total_evaluations, 340);
        assert!(
            agg.total_correct >= 280,
            "expected >=280/340 correct on special_types over 20 iters, got {}",
            agg.total_correct
        );
    }
}
