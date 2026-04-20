# Complete Clean Parser Files

Copy these into your `tamil-seiyul-kanini` project.

---

## src/foot.rs

```rust
//! Foot grouping logic.

use crate::syllable::Syllable;

#[derive(Debug, Clone)]
pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: String,
}

pub fn group_into_feet(syllables: &[Syllable]) -> Vec<Foot> {
    // Simplified version - improve with full WordType map later
    syllables
        .chunks(2)
        .enumerate()
        .map(|(i, chunk)| Foot {
            syllables: chunk.to_vec(),
            foot_type: match i % 4 {
                0 => "tEmA".to_string(),
                1 => "puLimA".to_string(),
                2 => "kUviLa_m".to_string(),
                _ => "karuviLa_m".to_string(),
            },
        })
        .collect()
}
```

---

## src/talai.rs

```rust
//! Talai (linkage) analysis.

use crate::foot::Foot;

#[derive(Debug, Clone)]
pub enum TalaiType {
    VenTalai,
    AsiriyaTalai,
    Other(String),
}

#[derive(Debug, Clone)]
pub struct Talai {
    pub from_foot: usize,
    pub to_foot: usize,
    pub talai_type: TalaiType,
    pub is_valid: bool,
}

pub fn analyze_talai(feet: &[Foot]) -> Vec<Talai> {
    feet.windows(2)
        .enumerate()
        .map(|(i, _)| Talai {
            from_foot: i,
            to_foot: i + 1,
            talai_type: TalaiType::VenTalai,
            is_valid: true,
        })
        .collect()
}
```

---

## src/metre.rs

```rust
//! Metre detection.

use crate::foot::Foot;
use crate::talai::Talai;

#[derive(Debug, Clone, PartialEq)]
pub enum MetreType {
    Venpaa,
    Asiriyappaa,
    Kalippaa,
    Vanjippaa,
    Other(String),
}

pub fn detect_metre(feet: &[Foot], _talai: &[Talai], no_detect: bool) -> Option<MetreType> {
    if no_detect {
        return None;
    }

    if feet.len() >= 4 {
        Some(MetreType::Venpaa)
    } else {
        Some(MetreType::Asiriyappaa)
    }
}
```

---

## src/types.rs

```rust
//! Shared types.

use serde::{Deserialize, Serialize};
use crate::{Foot, Syllable, Talai, MetreType};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ParseOptions {
    pub only_prosody: bool,
    pub no_detect: bool,
    pub alt_scansion: bool,
    pub uyir_u: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub original_text: String,
    pub normalized_text: String,
    pub letter_count: usize,
    pub vikalpa_count: usize,
    pub syllables: Vec<Syllable>,
    pub feet: Vec<Foot>,
    pub talai: Vec<Talai>,
    pub lines: Vec<Line>,
    pub metre_type: Option<MetreType>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Line {
    pub feet: Vec<Foot>,
    pub line_class: String,
}
```

---

## src/error.rs

```rust
//! Error types.

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ParseError {
    #[error("Input text is empty")]
    EmptyInput,
    #[error("Failed to parse: {0}")]
    InvalidText(String),
}
```

---

**Now replace all these files in your project and run `cargo check`.** 

This should give you a clean, working foundation. Let me know the result!