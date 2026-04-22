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

// TODO: fix variables names (pos, len, remaining too generic)
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
        //  10, 20 or 1, 2 (at the end or single letter word) -> Ner
        let re_triplet = Regex::new(r"^(110|120)").unwrap();
        let re_pair = Regex::new(r"^(11|12|10|20)").unwrap();
        let re_single = Regex::new(r"^[12]").unwrap();

        let mut pos = 0;

        while pos < num_str.len() {
            let remaining = &num_str[pos..];

            if let Some(m) = re_triplet.find(remaining) {
                let len = m.end();


                let  is_last_syllable = self.is_last_syllable(
                    &pos, 
                    &len,
                     &num_str.len()
                );

                self.push_syllable(
                    units,
                    pos / 1,
                    len,
                    SyllableType::Nirai,
                    "Nirai (triplet)",
                    is_last_syllable
                );

                pos += len;
                continue;
            }

            if let Some(m) = re_pair.find(remaining) {
                let len = m.end();

                let  is_last_syllable = self.is_last_syllable(
                    &pos, 
                    &len,
                     &num_str.len()
                );

                let pattern = &remaining[0..len];

                let syllable_type = if pattern == "11" || pattern == "12" {
                    SyllableType::Nirai
                } else {
                    SyllableType::Ner
                };

                self.push_syllable(
                    units,
                    pos / 1,
                    len,
                    syllable_type,
                    "Nirai/Ner (pair)",
                    is_last_syllable
                );
                pos += len;
                continue;
            }

            if re_single.is_match(remaining) {
                let len = 1;
                
                let  is_last_syllable = self.is_last_syllable(
                    &pos, 
                    &len,
                     &num_str.len()
                );

                let syllable_type = SyllableType::Ner;

                self.push_syllable(
                    units,
                    pos / 1,
                    len,
                    syllable_type,
                    "Nirai/Ner (pair)",
                    is_last_syllable
                );
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
        is_last_syllable: bool
    ) {
        let text: String = units[start..start + len].iter().map(|u| u.text()).collect();

        let hint = if is_last_syllable && self.is_uyir_u(&units) {
            Some("uyir-U elision".to_string())
        } else {
            None
        };
        self.result.push(Syllable {
            text,
            syllable_type,
            split_hint: hint,
            alt_split: self.alt_scansion,
            rule_ref: Some(rule.to_string())
        });
    }

    //  In the whole word, last characters decide the condition
    fn is_uyir_u(&self, units: &[ProsodicUnit]) -> bool {
        let last_index = units.len() - 1;
        let last_char = &units[last_index];

        if let ProsodicUnit::VowelConsonant { vowel, consonant: _ } = last_char {
            let second_last_char = &units[last_index - 1];
    
            if *vowel == Vowel::U {
                let uyir_u = match second_last_char {
                    ProsodicUnit::VowelConsonant { 
                        vowel:_, 
                        consonant 
                    } => PLOSIVES_FOR_U_ELISION.contains(consonant),
                    _ => false
                };

                return  uyir_u;
            }
        }
        false
    }

    fn is_last_syllable(
        &self,
        current_postion: &usize, 
        syllable_legth: &usize, 
        unit_length: &usize
    ) -> bool {
        if (*current_postion + *syllable_legth) == *unit_length {
            return  true;
        }
        false
    }
}
