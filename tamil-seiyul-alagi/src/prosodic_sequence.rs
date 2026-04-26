//! ProsodicSequence — Intermediate numeric representation + Debug utilities

use crate::prosodic_unit::{ProsodicUnit, Vowel};

#[derive(Debug, Clone)]
pub struct ProsodicSequence {
    pub units: Vec<ProsodicUnit>,
    pub sequence: Vec<u8>, // 0 = Consonant, 1 = Short, 2 = Long
    pub original_text: String,
}

impl ProsodicSequence {
    pub fn from_units(units: Vec<ProsodicUnit>, original_text: String) -> Self {
        let sequence: Vec<u8> = units.iter().map(Self::unit_to_number).collect();

        let seq = Self {
            units,
            sequence,
            original_text,
        };

        seq
    }

    fn unit_to_number(unit: &ProsodicUnit) -> u8 {
        match unit {
            ProsodicUnit::Vowel(v) => Self::vowel_to_number(*v),
            ProsodicUnit::VowelConsonant { vowel, .. } => Self::vowel_to_number(*vowel),
            ProsodicUnit::Consonant(_) => 0,
            ProsodicUnit::Aaytham => 0,
            ProsodicUnit::ConsonantCluster(_) => 0,
        }
    }

    fn vowel_to_number(vowel: Vowel) -> u8 {
        match vowel {
            Vowel::A | Vowel::I | Vowel::U | Vowel::E | Vowel::O => 1, // Short
            _ => 2,                                                    // Long
        }
    }

    /// Returns the numeric sequence as a string (e.g. "110120")
    pub fn as_string(&self) -> String {
        self.sequence.iter().map(|n| n.to_string()).collect()
    }

    /// Pretty print for debugging
    pub fn debug_print(&self) {
        println!("\n=== ProsodicSequence Debug ===");
        println!("Original : {}", self.original_text);
        println!("Sequence : {}", self.as_string());
        println!(
            "Units    : {:?}",
            self.units.iter().map(|u| u.text()).collect::<Vec<_>>()
        );
        println!("================================\n");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::prosodic_unit::{Consonant, ProsodicUnit};

    #[test]
    fn converts_units_to_numeric_sequence() {
        let units = vec![
            ProsodicUnit::Vowel(Vowel::A),                    // 1
            ProsodicUnit::Vowel(Vowel::Aa),                   // 2
            ProsodicUnit::Consonant(Consonant::K),            // 0
            ProsodicUnit::VowelConsonant {
                vowel: Vowel::I,
                consonant: Consonant::Ng,
            }, // 1
        ];

        // Keep test data culturally and linguistically valid.
        // TODO(machine-first): surface a parser hint when non-Tamil input is dropped.
        let seq = ProsodicSequence::from_units(units, "அஆக்ஙி".to_string());
        assert_eq!(seq.sequence, vec![1, 2, 0, 1]);
        assert_eq!(seq.as_string(), "1201");
    }
}
