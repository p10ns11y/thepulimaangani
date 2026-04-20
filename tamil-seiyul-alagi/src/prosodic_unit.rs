#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Vowel {
    A, Aa, I, Ii, U, Uu, E, Ee, Ai, O, Oo, Au,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Consonant {
    K, Ng, Ch, Nj, Tt, Nn, Th, N, P, M,
    Y, R, L, V, Zh, Lll, Rr, Nnn,
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
    pub fn matra(&self) -> u8 {
        match self {
            ProsodicUnit::Vowel(_) => 1,
            ProsodicUnit::VowelConsonant { .. } => 1,
            ProsodicUnit::Consonant(_) => 0,
            ProsodicUnit::Aaytham => 0,
            ProsodicUnit::ConsonantCluster(_) => 0,
        }
    }

    pub fn ends_with_consonant(&self) -> bool {
        matches!(self, 
            ProsodicUnit::VowelConsonant { .. } | 
            ProsodicUnit::Consonant(_) | 
            ProsodicUnit::ConsonantCluster(_)
        )
    }

    pub fn text(&self) -> &str {
        match self {
            ProsodicUnit::Vowel(_) => "",
            ProsodicUnit::Consonant(_) => "",
            ProsodicUnit::VowelConsonant { .. } => "",  // Simplified
            ProsodicUnit::Aaytham => "ஃ",
            ProsodicUnit::ConsonantCluster(text) => text,
        }
    }
}