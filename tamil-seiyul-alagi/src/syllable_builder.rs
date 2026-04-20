//! SyllableBuilder — Clean Regex-based Implementation

use crate::prosodic_sequence::ProsodicSequence;
use crate::prosodic_unit::{Consonant, ProsodicUnit, Vowel};
use crate::syllable::{Syllable, SyllableType};
use regex::Regex;

const PLOSIVES_FOR_U_ELISION: [Consonant; 5] = [
    Consonant::K,
    Consonant::Ch,
    Consonant::Tt,
    Consonant::P,
    Consonant::Rr,
];

pub struct SyllableBuilder {
    result: Vec<Syllable>,
    alt_scansion: bool,
}

impl SyllableBuilder {
    pub fn new(alt_scansion: bool) -> Self {
        Self {
            result: Vec::new(),
            alt_scansion,
        }
    }

    pub fn build(mut self, units: &[ProsodicUnit]) -> Vec<Syllable> {
        if units.is_empty() {
            return self.result;
        }

        let sequence = ProsodicSequence::from_units(units.to_vec(), String::new());
        let num_str = sequence.as_string(); // e.g. "110120"

        // Regex patterns (ordered: triplet → pair → single)
        // 110,120,11,12 -> Nirai
        //  10, 20, 1, 2 (at the end or single letter word) -> Ner
        let re_triplet = Regex::new(r"^(110|120)").unwrap();
        let re_pair = Regex::new(r"^(11|12|10|20)").unwrap();
        let re_single = Regex::new(r"^[12]").unwrap();

        let mut pos = 0;

        while pos < num_str.len() {
            let remaining = &num_str[pos..];

            // 1. Try Triplet
            if let Some(m) = re_triplet.find(remaining) {
                let len = m.end();
                self.push_syllable(units, pos / 1, len, SyllableType::Nirai, "Nirai (triplet)");

                pos += len;
                continue;
            }

            // 2. Try Pair
            if let Some(m) = re_pair.find(remaining) {
                let len = m.end();
                let pattern = &remaining[0..len];

                let syllable_type = if pattern == "11" || pattern == "12" {
                    SyllableType::Nirai
                } else {
                    SyllableType::Ner
                };

                self.push_syllable(units, pos / 1, len, syllable_type, "Nirai/Ner (pair)");
                pos += len;
                continue;
            }

            // 3. Single
            if re_single.is_match(remaining) {
                let unit = &units[pos / 1];
                let hint = if self.is_uyir_u_elision_candidate(unit) {
                    Some("uyir-U elision".to_string())
                } else {
                    None
                };

                self.result.push(Syllable {
                    text: unit.text().to_string(),
                    syllable_type: SyllableType::Ner,
                    split_hint: hint.clone(),
                    alt_split: self.alt_scansion,
                    rule_ref: if hint.clone().is_some() {
                        Some("rules of letters".to_string())
                    } else {
                        None
                    },
                });
                pos += 1;
            } else {
                pos += 1; // safety
            }
        }

        self.result
    }

    fn push_syllable(
        &mut self,
        units: &[ProsodicUnit],
        start: usize,
        len: usize,
        syllable_type: SyllableType,
        rule: &str,
    ) {
        let text: String = units[start..start + len].iter().map(|u| u.text()).collect();

        let hint = if self.has_uyir_u_in_range(units, start, start + len) {
            Some("uyir-U elision".to_string())
        } else {
            None
        };

        self.result.push(Syllable {
            text,
            syllable_type,
            split_hint: hint,
            alt_split: self.alt_scansion,
            rule_ref: Some(rule.to_string()),
        });
    }

    fn has_uyir_u_in_range(&self, units: &[ProsodicUnit], start: usize, end: usize) -> bool {
        units[start..end]
            .iter()
            .any(|u| self.is_uyir_u_elision_candidate(u))
    }

    fn is_uyir_u_elision_candidate(&self, unit: &ProsodicUnit) -> bool {
        if let ProsodicUnit::VowelConsonant { vowel, consonant } = unit {
            if *vowel == Vowel::U {
                return PLOSIVES_FOR_U_ELISION.contains(consonant);
            }
        }
        false
    }
}
