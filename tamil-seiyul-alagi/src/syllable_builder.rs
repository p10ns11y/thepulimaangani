//! SyllableBuilder — Robust state-machine based syllable construction.
//!
//! This is the heart of the new parser design. It makes it much harder
//! to make the mistakes we were making earlier (wrong consonant attachment,
//! incorrect நிரை/நேர் classification).

use crate::prosodic_unit::{ProsodicUnit, Vowel, Consonant};
use crate::syllable::{Syllable, SyllableType};

pub struct SyllableBuilder {
    current: Vec<ProsodicUnit>,
    result: Vec<Syllable>,
    alt_scansion: bool,
}

impl SyllableBuilder {
    pub fn new(alt_scansion: bool) -> Self {
        Self {
            current: Vec::new(),
            result: Vec::new(),
            alt_scansion,
        }
    }

    /// Main entry point — process a sequence of ProsodicUnits
    pub fn build(mut self, units: &[ProsodicUnit]) -> Vec<Syllable> {
        for unit in units {
            self.process_unit(unit.clone());
        }
        self.finalize();
        self.result
    }

    fn process_unit(&mut self, unit: ProsodicUnit) {  
        if self.try_form_nirai(&unit) {
            return;
        }
    
        if self.try_form_ner(&unit) {
            return;
        }
    
        self.current.push(unit);
    }

    /// Try to form a நிரை (Nirai)
    fn try_form_nirai(&mut self, next: &ProsodicUnit) -> bool {
        if self.current.is_empty() {
            return false;
        }

        let last = self.current.last().unwrap();

        let can_form_nirai = match (last.matra(), next.matra()) {
            (1, 1) | (1, 2) => true,
            _ => false,
        };

        if can_form_nirai {
            let mut combined_text = last.text().to_string();
            combined_text.push_str(next.text());

            self.result.push(Syllable {
                text: combined_text,
                syllable_type: SyllableType::Nirai,
                split_hint: self.generate_nirai_hint(last, next),
                alt_split: self.alt_scansion,
                rule_ref: Some("Nirai formation rule".to_string()),
            });

            self.current.clear();
            true
        } else {
            false
        }
    }

    fn try_form_ner(&mut self, unit: &ProsodicUnit) -> bool {
        if unit.matra() >= 1 {
            self.result.push(Syllable {
                text: unit.text().to_string(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
            });
            true
        } else {
            false
        }
    }

    fn generate_nirai_hint(&self, first: &ProsodicUnit, second: &ProsodicUnit) -> Option<String> {
        if first.ends_with_consonant() && second.ends_with_consonant() {
            Some("Nirai formed from two short units with consonant clusters".to_string())
        } else if second.ends_with_consonant() {
            Some("Nirai with final consonant cluster".to_string())
        } else {
            None
        }
    }

    fn finalize(&mut self) {
        // Check if the last unit needs uyir-U elision
        if let Some(last) = self.current.last() {
            if self.is_uyir_u_elision(last) {
                if let Some(unit) = self.current.pop() {
                    self.result.push(Syllable {
                        text: unit.text().to_string(),
                        syllable_type: SyllableType::Ner,
                        split_hint: Some("uyir-U elision (after க்/ச்/ட்/ப்/ற்)".to_string()),
                        alt_split: self.alt_scansion,
                        rule_ref: Some("Classical uyir-U rule (Tolkappiyam)".to_string()),
                    });
                }
            }
        }
    
        // Add remaining units normally
        for unit in self.current.drain(..) {
            self.result.push(Syllable {
                text: unit.text().to_string(),
                syllable_type: SyllableType::Ner,
                split_hint: None,
                alt_split: false,
                rule_ref: None,
            });
        }
    }
    
    fn is_uyir_u_elision(&self, unit: &ProsodicUnit) -> bool {
        if let ProsodicUnit::VowelConsonant { vowel, consonant, .. } = unit {
            if *vowel == Vowel::U {
                return matches!(consonant, 
                    Consonant::K | Consonant::Ch | 
                    Consonant::Tt | Consonant::P | 
                    Consonant::Rr
                );
            }
        }
        false
    }


    // fn apply_uyir_u_elision(&mut self, unit: ProsodicUnit) {
    //     if let Some(prev) = self.current.pop() {
    //         let mut combined = prev.text().to_string();
    //         combined.push_str(unit.text());

    //         self.result.push(Syllable {
    //             text: combined,
    //             syllable_type: SyllableType::Ner,
    //             split_hint: Some("uyir-U elision (after க்/ச்/ட்/ப்/ற்)".to_string()),
    //             alt_split: self.alt_scansion,
    //             rule_ref: Some("Classical uyir-U rule".to_string()),
    //         });
    //     }
    // }
}