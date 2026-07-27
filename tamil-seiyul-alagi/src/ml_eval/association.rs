//! A08 — association-style itemset rules from discrete bins → metre (mining).

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq)]
pub struct AssociationRule {
    pub antecedent: String,
    pub consequent_class: usize,
    pub support: f64,
    pub confidence: f64,
}

/// Mine rules: for each discrete feature key that fires, estimate P(class|key).
pub fn mine_class_rules(
    item_rows: &[Vec<String>],
    ys: &[usize],
    min_support: f64,
    min_confidence: f64,
) -> Vec<AssociationRule> {
    assert_eq!(item_rows.len(), ys.len());
    let n = item_rows.len().max(1) as f64;
    let mut item_class: BTreeMap<(String, usize), u32> = BTreeMap::new();
    let mut item_n: BTreeMap<String, u32> = BTreeMap::new();
    for (items, &y) in item_rows.iter().zip(ys.iter()) {
        for it in items {
            *item_n.entry(it.clone()).or_insert(0) += 1;
            *item_class.entry((it.clone(), y)).or_insert(0) += 1;
        }
    }
    let mut rules = Vec::new();
    for (item, cnt) in &item_n {
        let support = *cnt as f64 / n;
        if support < min_support {
            continue;
        }
        for c in 0..4usize {
            let hit = item_class.get(&(item.clone(), c)).copied().unwrap_or(0);
            let conf = hit as f64 / (*cnt as f64).max(1.0);
            if conf >= min_confidence {
                rules.push(AssociationRule {
                    antecedent: item.clone(),
                    consequent_class: c,
                    support,
                    confidence: conf,
                });
            }
        }
    }
    rules.sort_by(|a, b| {
        b.confidence
            .partial_cmp(&a.confidence)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    rules
}

/// Encode dense linkage histogram peaks as discrete items.
pub fn items_from_dense(dense: &[f32]) -> Vec<String> {
    let mut out = Vec::new();
    if dense.len() > 12 {
        let mut best = 12usize;
        let mut best_v = dense[12];
        for j in 12..19.min(dense.len()) {
            if dense[j] > best_v {
                best_v = dense[j];
                best = j;
            }
        }
        if best_v > 0.0 {
            out.push(format!("dom_linkage_bin_{}", best - 12));
        }
    }
    if dense.len() > 3 {
        if dense[3] <= 4.0 {
            out.push("short_feet".into());
        } else {
            out.push("long_feet".into());
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mines_confident_rule() {
        let rows = vec![
            vec!["short_feet".into()],
            vec!["short_feet".into()],
            vec!["long_feet".into()],
        ];
        let ys = vec![0, 0, 1];
        let rules = mine_class_rules(&rows, &ys, 0.3, 0.6);
        assert!(rules.iter().any(|r| r.antecedent == "short_feet" && r.consequent_class == 0));
    }
}
