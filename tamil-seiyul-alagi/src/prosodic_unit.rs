use crate::tamil_chars::generate_uyirmei_matrix;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Vowel {
    A,
    Aa,
    I,
    Ii,
    U,
    Uu,
    E,
    Ee,
    Ai,
    O,
    Oo,
    Au,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Consonant {
    K,
    Ng,
    Ch,
    Nj,
    Tt,
    Nn,
    Th,
    N,
    P,
    M,
    Y,
    R,
    L,
    V,
    Zh,
    Lll,
    Rr,
    Nnn,
}

#[derive(Debug, Clone, PartialEq)]
pub enum ProsodicUnit {
    Vowel(Vowel),
    Consonant(Consonant),
    VowelConsonant { vowel: Vowel, consonant: Consonant },
    Aaytham,
    ConsonantCluster(String),
}

impl ProsodicUnit {
    pub fn text(&self) -> String {
        match self {
            ProsodicUnit::Vowel(v) => match v {
                Vowel::A => "அ".to_string(),
                Vowel::Aa => "ஆ".to_string(),
                Vowel::I => "இ".to_string(),
                Vowel::Ii => "ஈ".to_string(),
                Vowel::U => "உ".to_string(),
                Vowel::Uu => "ஊ".to_string(),
                Vowel::E => "எ".to_string(),
                Vowel::Ee => "ஏ".to_string(),
                Vowel::Ai => "ஐ".to_string(),
                Vowel::O => "ஒ".to_string(),
                Vowel::Oo => "ஓ".to_string(),
                Vowel::Au => "ஔ".to_string(),
            },
            ProsodicUnit::Consonant(c) => match c {
                Consonant::K => "க்".to_string(),
                Consonant::Ng => "ங்".to_string(),
                Consonant::Ch => "ச்".to_string(),
                Consonant::Nj => "ஞ்".to_string(),
                Consonant::Tt => "ட்".to_string(),
                Consonant::Nn => "ண்".to_string(),
                Consonant::Th => "த்".to_string(),
                Consonant::N => "ந்".to_string(),
                Consonant::P => "ப்".to_string(),
                Consonant::M => "ம்".to_string(),
                Consonant::Y => "ய்".to_string(),
                Consonant::R => "ர்".to_string(),
                Consonant::L => "ல்".to_string(),
                Consonant::V => "வ்".to_string(),
                Consonant::Zh => "ழ்".to_string(),
                Consonant::Lll => "ள்".to_string(),
                Consonant::Rr => "ற்".to_string(),
                Consonant::Nnn => "ன்".to_string(),
            },
            ProsodicUnit::VowelConsonant { vowel, consonant } => {
                let matrix = generate_uyirmei_matrix();
                let v_idx = vowel_to_index(*vowel);
                let c_idx = consonant_to_index(*consonant);

                if v_idx < matrix.len() && c_idx < matrix[v_idx].len() {
                    matrix[v_idx][c_idx].clone()
                } else {
                    "?".to_string()
                }
            }
            ProsodicUnit::Aaytham => "ஃ".to_string(),
            ProsodicUnit::ConsonantCluster(s) => s.clone(),
        }
    }

    pub fn matra(&self) -> u8 {
        match self {
            ProsodicUnit::Vowel(v) => {
                match v {
                    Vowel::A | Vowel::I | Vowel::U | Vowel::E | Vowel::O => 1, // குறில்
                    _ => 2,                                                    // நெடில்
                }
            }
            ProsodicUnit::VowelConsonant { vowel, .. } => match vowel {
                Vowel::A | Vowel::I | Vowel::U | Vowel::E | Vowel::O => 1,
                _ => 2,
            },
            ProsodicUnit::Consonant(_) => 0, // 1/2  for foot grouping it is not useful
            ProsodicUnit::Aaytham => 0,      //  1/2
            ProsodicUnit::ConsonantCluster(_) => 0, // 1/2
        }
    }

    pub fn ends_with_consonant(&self) -> bool {
        matches!(
            self,
            ProsodicUnit::VowelConsonant { .. }
                | ProsodicUnit::Consonant(_)
                | ProsodicUnit::ConsonantCluster(_)
        )
    }
}

// ==================== HELPER FUNCTIONS ====================

fn vowel_to_index(v: Vowel) -> usize {
    match v {
        Vowel::A => 0,
        Vowel::Aa => 1,
        Vowel::I => 2,
        Vowel::Ii => 3,
        Vowel::U => 4,
        Vowel::Uu => 5,
        Vowel::E => 6,
        Vowel::Ee => 7,
        Vowel::Ai => 8,
        Vowel::O => 9,
        Vowel::Oo => 10,
        Vowel::Au => 11,
    }
}

fn consonant_to_index(c: Consonant) -> usize {
    match c {
        Consonant::K => 0,
        Consonant::Ng => 1,
        Consonant::Ch => 2,
        Consonant::Nj => 3,
        Consonant::Tt => 4,
        Consonant::Nn => 5,
        Consonant::Th => 6,
        Consonant::N => 7,
        Consonant::P => 8,
        Consonant::M => 9,
        Consonant::Y => 10,
        Consonant::R => 11,
        Consonant::L => 12,
        Consonant::V => 13,
        Consonant::Zh => 14,
        Consonant::Lll => 15,
        Consonant::Rr => 16,
        Consonant::Nnn => 17,
    }
}
