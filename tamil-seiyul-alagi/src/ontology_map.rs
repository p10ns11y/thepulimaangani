//! S00 ontology map — machine-readable catalog + enum exhaustiveness.
//!
//! Human-readable entity graph: repo
//! [`data/training/reports/ontology_map.md`](../../data/training/reports/ontology_map.md).
//! Portfolio contract: `METRE_ML_METHODS_PORTFOLIO.md` §5.2.
//!
//! **Public catalog** (crate root re-exports): frozen id lists for structural
//! entities, closed enums, issue #36 bond table size, and dual-truth channel
//! nodes. Bump [`ONTOLOGY_MAP_VERSION`] when any catalog id set or meaning
//! changes (SOA ledger S03 fingerprint).
//!
//! Unit tests below fail if a new ontology variant is added without updating:
//! - dense index maps (`parse_features`)
//! - ML class maps (`metre::ml_head`)
//! - gold parent slugs (`poem_variations_training`)
//! - the cir × first-acai bond table (`linkage::classify_edge` via `analyze_linkage`)

/// Catalog version for S03 ledger / consumers.
///
/// Bump when structural ids, fixed metre/talai/special catalogs, dual-truth
/// channel ids, or issue #36 table cardinality change.
pub const ONTOLOGY_MAP_VERSION: u32 = 1;

/// Poem → Line → Foot → Syllable → Letter (portfolio Ontology pillar).
pub fn ontology_structural_entity_ids() -> &'static [&'static str] {
    &["Poem", "Line", "Foot", "Syllable", "Letter"]
}

/// Closed syllable (அசை) types.
pub fn ontology_syllable_type_ids() -> &'static [&'static str] {
    &["Ner", "Nirai"]
}

/// Cir (சீர்) classes from last acai × foot length (Vilam, not Vilai).
pub fn ontology_cir_class_ids() -> &'static [&'static str] {
    &["Maa", "Vilam", "Kaai", "Kani"]
}

/// Fixed coarse metre classes (ML/heuristic); `MetreType::Other` is open escape.
pub fn ontology_metre_type_fixed_ids() -> &'static [&'static str] {
    &["Venpaa", "Aciriyappaa", "Kalippaa", "Vanjippaa"]
}

/// Fixed coarse Talai families (wire keys); `LinkageType::Other` is open escape.
pub fn ontology_linkage_type_fixed_ids() -> &'static [&'static str] {
    &["VenTalai", "AciriyaTalai", "KaliTalai", "VanjiTalai"]
}

/// Special bond catalog — **wire-style** serde renames (8 incl. `Unknown`).
///
/// Order matches dense special bins 0..7 in `parse_features`.
pub fn ontology_linkage_special_ids() -> &'static [&'static str] {
    &[
        "NerondriyaAciriyaTalai",
        "NiraiondriyaAciriyaTalai",
        "IyarcirVenTalai",
        "VencirVenTalai",
        "KaliTalai",
        "OndriyaVanjiTalai",
        "OndrathaVanjiTalai",
        "Unknown",
    ]
}

/// Productive issue #36 cells: 4 cir × 2 first-acai = 8.
pub fn ontology_issue36_bond_table_len() -> usize {
    8
}

/// Parallel truth channels — never fuse classical into ML score without policy.
pub fn ontology_dual_truth_channel_ids() -> &'static [&'static str] {
    &["ml_metre", "classical_metre"]
}

#[cfg(test)]
mod tests {
    use super::{
        ontology_cir_class_ids, ontology_dual_truth_channel_ids, ontology_issue36_bond_table_len,
        ontology_linkage_special_ids, ontology_linkage_type_fixed_ids,
        ontology_metre_type_fixed_ids, ontology_structural_entity_ids, ontology_syllable_type_ids,
        ONTOLOGY_MAP_VERSION,
    };
    use crate::foot::Foot;
    use crate::letter::LetterType;
    use crate::linkage::{
        analyze_linkage, cir_class_for_foot, CirAcaiClass, FootPosition, LinkageSpecialType,
        LinkageType,
    };
    use crate::metre::classical_violations_for_metre;
    use crate::metre::ml_head::{
        class_index_for_metre, metre_for_class_index, METRE_ML_NUM_CLASSES,
    };
    use crate::metre::MetreType;
    use crate::parse_features::{
        LINKAGE_TYPE_FEATURE_DIM, LINK_SPECIAL_FEATURE_DIM, PARSE_FEATURE_DENSE_LEN,
        PARSE_FEATURE_SCHEMA_VERSION,
    };
    use crate::poem_variations_training::{
        gold_metre_label_for_parent, gold_metre_type_for_parent,
    };
    use crate::syllable::{Syllable, SyllableType};

    // --- Catalog helpers (match arms must stay exhaustive) ---

    fn syllable_type_all() -> [SyllableType; 2] {
        [SyllableType::Ner, SyllableType::Nirai]
    }

    fn cir_acai_class_all() -> [CirAcaiClass; 4] {
        [
            CirAcaiClass::Maa,
            CirAcaiClass::Vilam,
            CirAcaiClass::Kaai,
            CirAcaiClass::Kani,
        ]
    }

    fn linkage_type_fixed_json_keys() -> [(&'static str, LinkageType); 4] {
        [
            ("VenTalai", LinkageType::VenTalai),
            ("AciriyaTalai", LinkageType::AciriyaTalai),
            ("KaliTalai", LinkageType::KaliTalai),
            ("VanjiTalai", LinkageType::VanjiTalai),
        ]
    }

    fn linkage_special_all() -> [LinkageSpecialType; 8] {
        [
            LinkageSpecialType::NerondriyaAciriyathalai,
            LinkageSpecialType::NiraiondriyaAciriyathalai,
            LinkageSpecialType::IyarcirVenthalai,
            LinkageSpecialType::VencirVenthalai,
            LinkageSpecialType::Kalithalai,
            LinkageSpecialType::OndriyaVanchithalai,
            LinkageSpecialType::OndrathaVanchithalai,
            LinkageSpecialType::Unknown,
        ]
    }

    fn metre_type_fixed() -> [MetreType; 4] {
        [
            MetreType::Venpaa,
            MetreType::Aciriyappaa,
            MetreType::Kalippaa,
            MetreType::Vanjippaa,
        ]
    }

    fn letter_type_all() -> [LetterType; 4] {
        [
            LetterType::Uyir,
            LetterType::Mei,
            LetterType::Uyirmei,
            LetterType::Aaytham,
        ]
    }

    /// Display name used only to force a total match over `SyllableType`.
    fn syllable_type_label(t: SyllableType) -> &'static str {
        match t {
            SyllableType::Ner => "Ner",
            SyllableType::Nirai => "Nirai",
        }
    }

    fn cir_label(c: CirAcaiClass) -> &'static str {
        match c {
            CirAcaiClass::Maa => "Maa",
            CirAcaiClass::Vilam => "Vilam",
            CirAcaiClass::Kaai => "Kaai",
            CirAcaiClass::Kani => "Kani",
        }
    }

    fn linkage_type_dense_index(t: &LinkageType) -> Option<usize> {
        // Mirrors `parse_features::linkage_type_index` (private); keep in lockstep.
        match t {
            LinkageType::VenTalai => Some(0),
            LinkageType::AciriyaTalai => Some(1),
            LinkageType::KaliTalai => Some(2),
            LinkageType::VanjiTalai => Some(3),
            LinkageType::Other(_) => Some(6),
        }
    }

    fn linkage_special_dense_index(s: LinkageSpecialType) -> usize {
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

    fn foot_with(syllable_types: &[SyllableType]) -> Foot {
        Foot {
            syllables: syllable_types
                .iter()
                .enumerate()
                .map(|(i, st)| Syllable {
                    text: format!("s{i}"),
                    syllable_type: *st,
                    split_hint: None,
                    alt_split: false,
                    rule_ref: None,
                    line_index: 0,
                    word_index_in_line: 0,
                })
                .collect(),
            foot_type: String::new(),
            foot_index_global: None,
        }
    }

    fn positions(n: usize) -> Vec<FootPosition> {
        (0..n)
            .map(|i| FootPosition {
                foot_index: i,
                line_index: 0,
                word_index_in_line: i,
            })
            .collect()
    }

    // --- Public catalog locks ---

    #[test]
    fn public_catalog_matches_s00_contract() {
        assert!(ONTOLOGY_MAP_VERSION >= 1);
        assert_eq!(
            ontology_structural_entity_ids(),
            &["Poem", "Line", "Foot", "Syllable", "Letter"]
        );
        assert_eq!(ontology_syllable_type_ids(), &["Ner", "Nirai"]);
        assert_eq!(ontology_cir_class_ids(), &["Maa", "Vilam", "Kaai", "Kani"]);
        assert_eq!(
            ontology_metre_type_fixed_ids(),
            &["Venpaa", "Aciriyappaa", "Kalippaa", "Vanjippaa"]
        );
        assert_eq!(
            ontology_linkage_type_fixed_ids(),
            &["VenTalai", "AciriyaTalai", "KaliTalai", "VanjiTalai"]
        );
        assert_eq!(ontology_linkage_special_ids().len(), 8);
        assert!(ontology_linkage_special_ids().contains(&"Unknown"));
        assert_eq!(ontology_issue36_bond_table_len(), 8);
        assert_eq!(
            ontology_dual_truth_channel_ids(),
            &["ml_metre", "classical_metre"]
        );
    }

    #[test]
    fn public_special_catalog_ids_match_serde_wire_keys() {
        let ids = ontology_linkage_special_ids();
        for (i, s) in linkage_special_all().into_iter().enumerate() {
            let json = serde_json::to_string(&s).expect("serialize special");
            // JSON is a quoted string; strip quotes for id compare.
            let key = json.trim_matches('"');
            assert_eq!(ids[i], key, "special catalog order must match dense bins");
            assert_eq!(linkage_special_dense_index(s), i);
        }
    }

    // --- Exhaustiveness / catalog size ---

    #[test]
    fn syllable_type_has_exactly_ner_and_nirai() {
        let all = syllable_type_all();
        assert_eq!(all.len(), 2);
        for t in all {
            assert!(!syllable_type_label(t).is_empty());
        }
    }

    #[test]
    fn cir_acai_class_has_exactly_four_variants() {
        let all = cir_acai_class_all();
        assert_eq!(all.len(), 4);
        for c in all {
            assert!(!cir_label(c).is_empty());
        }
    }

    #[test]
    fn letter_type_has_exactly_four_variants() {
        assert_eq!(letter_type_all().len(), 4);
    }

    #[test]
    fn linkage_type_fixed_families_are_four_plus_other() {
        let fixed = linkage_type_fixed_json_keys();
        assert_eq!(fixed.len(), 4);
        for (key, t) in fixed {
            let json = serde_json::to_string(&t).expect("serialize LinkageType");
            assert_eq!(json, format!("\"{key}\""));
            let idx = linkage_type_dense_index(&t).expect("fixed type has index");
            assert!(idx < LINKAGE_TYPE_FEATURE_DIM);
        }
        let other = LinkageType::Other("x".into());
        assert_eq!(linkage_type_dense_index(&other), Some(6));
        assert!(LINKAGE_TYPE_FEATURE_DIM >= 7);
    }

    #[test]
    fn linkage_special_type_has_exactly_eight_variants_with_dense_indices() {
        let all = linkage_special_all();
        assert_eq!(all.len(), LINK_SPECIAL_FEATURE_DIM);
        assert_eq!(LINK_SPECIAL_FEATURE_DIM, 8);
        let mut seen = [false; 8];
        for s in all {
            let i = linkage_special_dense_index(s);
            assert!(i < 8);
            assert!(!seen[i], "duplicate dense index {i} for {s:?}");
            seen[i] = true;
        }
        assert!(seen.iter().all(|&b| b), "dense indices must cover 0..8");
    }

    #[test]
    fn metre_type_fixed_classes_match_ml_and_gold_slugs() {
        assert_eq!(METRE_ML_NUM_CLASSES, 4);
        let fixed = metre_type_fixed();
        assert_eq!(fixed.len(), METRE_ML_NUM_CLASSES);

        let expected = [
            (0usize, MetreType::Venpaa, "venpaa", "Venpaa"),
            (1, MetreType::Aciriyappaa, "aciriyappa", "Aciriyappaa"),
            (2, MetreType::Kalippaa, "kalippaa", "Kalippaa"),
            (3, MetreType::Vanjippaa, "vanjippaa", "Vanjippaa"),
        ];

        for (i, metre, slug, label) in expected {
            assert_eq!(class_index_for_metre(&metre), Some(i));
            assert_eq!(metre_for_class_index(i), Some(metre.clone()));
            assert_eq!(gold_metre_type_for_parent(slug), Some(metre));
            assert_eq!(gold_metre_label_for_parent(slug), Some(label));
        }

        assert_eq!(class_index_for_metre(&MetreType::Other("x".into())), None);
        assert_eq!(gold_metre_type_for_parent("unknown"), None);
        assert_eq!(metre_for_class_index(4), None);
    }

    #[test]
    fn parse_feature_schema_pins_for_ontology_consumers() {
        assert_eq!(PARSE_FEATURE_SCHEMA_VERSION, 1);
        assert_eq!(PARSE_FEATURE_DENSE_LEN, 51);
        // Layout blocks that encode linkage ontology: 7 coarse + 8 special.
        assert_eq!(LINKAGE_TYPE_FEATURE_DIM, 7);
        assert_eq!(LINK_SPECIAL_FEATURE_DIM, 8);
    }

    // --- Cir from foot last acai ---

    #[test]
    fn cir_class_from_foot_acai_count_and_last_type() {
        // 1–2 acai → Maa / Vilam
        assert_eq!(
            cir_class_for_foot(&foot_with(&[SyllableType::Ner])),
            Some(CirAcaiClass::Maa)
        );
        assert_eq!(
            cir_class_for_foot(&foot_with(&[SyllableType::Nirai])),
            Some(CirAcaiClass::Vilam)
        );
        assert_eq!(
            cir_class_for_foot(&foot_with(&[SyllableType::Ner, SyllableType::Nirai])),
            Some(CirAcaiClass::Vilam)
        );
        // 3+ → Kaai / Kani
        assert_eq!(
            cir_class_for_foot(&foot_with(&[
                SyllableType::Ner,
                SyllableType::Ner,
                SyllableType::Ner
            ])),
            Some(CirAcaiClass::Kaai)
        );
        assert_eq!(
            cir_class_for_foot(&foot_with(&[
                SyllableType::Nirai,
                SyllableType::Nirai,
                SyllableType::Nirai
            ])),
            Some(CirAcaiClass::Kani)
        );
        assert_eq!(cir_class_for_foot(&foot_with(&[])), None);
    }

    // --- #36 table: all CirAcaiClass × SyllableType pairs ---

    /// Expected (coarse, special) for each (prev_cir, next_first).
    fn expected_bond(
        prev: CirAcaiClass,
        next_first: SyllableType,
    ) -> (LinkageType, LinkageSpecialType) {
        match (prev, next_first) {
            (CirAcaiClass::Maa, SyllableType::Ner) => (
                LinkageType::AciriyaTalai,
                LinkageSpecialType::NerondriyaAciriyathalai,
            ),
            (CirAcaiClass::Vilam, SyllableType::Nirai) => (
                LinkageType::AciriyaTalai,
                LinkageSpecialType::NiraiondriyaAciriyathalai,
            ),
            (CirAcaiClass::Maa, SyllableType::Nirai) | (CirAcaiClass::Vilam, SyllableType::Ner) => {
                (
                    LinkageType::VenTalai,
                    LinkageSpecialType::IyarcirVenthalai,
                )
            }
            (CirAcaiClass::Kaai, SyllableType::Ner) => (
                LinkageType::VenTalai,
                LinkageSpecialType::VencirVenthalai,
            ),
            (CirAcaiClass::Kaai, SyllableType::Nirai) => {
                (LinkageType::KaliTalai, LinkageSpecialType::Kalithalai)
            }
            (CirAcaiClass::Kani, SyllableType::Nirai) => (
                LinkageType::VanjiTalai,
                LinkageSpecialType::OndriyaVanchithalai,
            ),
            (CirAcaiClass::Kani, SyllableType::Ner) => (
                LinkageType::VanjiTalai,
                LinkageSpecialType::OndrathaVanchithalai,
            ),
        }
    }

    fn foot_for_cir(cir: CirAcaiClass) -> Foot {
        match cir {
            CirAcaiClass::Maa => foot_with(&[SyllableType::Ner]),
            CirAcaiClass::Vilam => foot_with(&[SyllableType::Nirai]),
            CirAcaiClass::Kaai => {
                foot_with(&[SyllableType::Ner, SyllableType::Ner, SyllableType::Ner])
            }
            CirAcaiClass::Kani => {
                foot_with(&[SyllableType::Nirai, SyllableType::Nirai, SyllableType::Nirai])
            }
        }
    }

    #[test]
    fn issue36_table_covers_all_cir_times_first_acai() {
        let mut pairs = 0usize;
        for prev in cir_acai_class_all() {
            for next_first in syllable_type_all() {
                pairs += 1;
                let feet = vec![foot_for_cir(prev), foot_with(&[next_first])];
                let pos = positions(2);
                let links = analyze_linkage(&pos, &feet);
                assert_eq!(links.len(), 1);
                let (want_lt, want_lst) = expected_bond(prev, next_first);
                assert_eq!(
                    links[0].linkage_type, want_lt,
                    "coarse for ({prev:?}, {next_first:?})"
                );
                assert_eq!(
                    links[0].linkage_special_type, want_lst,
                    "special for ({prev:?}, {next_first:?})"
                );
                assert!(links[0].is_valid);
            }
        }
        assert_eq!(pairs, 8, "4 cir × 2 first acai");
    }

    /// Special types that appear as productive #36 bonds (not Unknown).
    #[test]
    fn issue36_productive_specials_are_seven() {
        let productive: Vec<_> = linkage_special_all()
            .into_iter()
            .filter(|s| *s != LinkageSpecialType::Unknown)
            .collect();
        assert_eq!(productive.len(), 7);
        // Every productive special is reachable from the table.
        let mut seen = std::collections::BTreeSet::new();
        for prev in cir_acai_class_all() {
            for next_first in syllable_type_all() {
                let (_, lst) = expected_bond(prev, next_first);
                seen.insert(format!("{lst:?}"));
            }
        }
        assert_eq!(seen.len(), 7);
        assert!(!seen.iter().any(|s| s.contains("Unknown")));
    }

    // --- Dual-truth / classical isolation (S00: stay empty) ---

    #[test]
    fn classical_checker_stays_empty_for_all_fixed_metres() {
        let feet = vec![foot_with(&[SyllableType::Ner])];
        let pos = positions(1);
        let linkage = analyze_linkage(&pos, &feet);
        for m in metre_type_fixed() {
            let v = classical_violations_for_metre(&m, &feet, &linkage);
            assert!(
                v.is_empty(),
                "classical_checker must stay empty until D01+; got {v:?} for {m:?}"
            );
        }
    }

    // --- Hierarchy trait surface still present ---

    #[test]
    fn poem_tree_layers_are_public_ontology_surface() {
        // Compile-time presence: construct minimal nodes (empty hierarchy is valid ontology).
        use crate::letter::Letter;
        use crate::poem_tree::{LetterNode, PoemLineNode, PoemNode, SyllableNode};

        let letter = LetterNode {
            inner: Letter {
                text: "அ".into(),
                letter_type: LetterType::Uyir,
                matra: 1,
            },
        };
        let syl = SyllableNode {
            inner: Syllable {
                text: "அ".into(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
                line_index: 0,
                word_index_in_line: 0,
            },
            letters: vec![letter],
            global_index: 0,
        };
        let line = PoemLineNode {
            line_index: 0,
            line_class: "—".into(),
            linguistic_words: vec![],
            words: vec![],
        };
        let poem = PoemNode {
            normalized_text: String::new(),
            lines: vec![line],
            syllables_flat: vec![syl.inner.clone()],
            linkage: vec![],
        };
        assert_eq!(poem.lines.len(), 1);
        assert_eq!(syl.letters.len(), 1);
    }

    #[test]
    fn metre_type_json_keys_are_canonical() {
        let cases = [
            (MetreType::Venpaa, "\"Venpaa\""),
            (MetreType::Aciriyappaa, "\"Aciriyappaa\""),
            (MetreType::Kalippaa, "\"Kalippaa\""),
            (MetreType::Vanjippaa, "\"Vanjippaa\""),
        ];
        for (m, key) in cases {
            assert_eq!(serde_json::to_string(&m).unwrap(), key);
        }
        // Legacy alias still deserializes.
        let m: MetreType = serde_json::from_str("\"Asiriyappaa\"").unwrap();
        assert_eq!(m, MetreType::Aciriyappaa);
    }
}
