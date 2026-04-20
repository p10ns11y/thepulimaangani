//! ProsodicSequence — Intermediate numeric representation + Debug utilities

use crate::prosodic_unit::{ProsodicUnit, Vowel};

#[derive(Debug, Clone)]
pub struct ProsodicSequence {
    pub units: Vec<ProsodicUnit>,
    pub sequence: Vec<u8>,        // 0 = Consonant, 1 = Short, 2 = Long
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

        // === DEBUG OUTPUT ===
        println!("\n[ProsodicSequence] Created");
        println!("  Original Text : {}", seq.original_text);
        println!("  Numeric Seq   : {}", seq.as_string());
        println!("  Length        : {}", seq.sequence.len());

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
        println!("Units    : {:?}", self.units.iter().map(|u| u.text()).collect::<Vec<_>>());
        println!("================================\n");
    }
}