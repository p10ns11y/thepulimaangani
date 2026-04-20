# Machine-First Technical Grammar Parser Design for Thepulimaangani

**Philosophy**: Pure logic, enums, state machines. No human strings in core. Display layer (`presentation.rs`) translates later.  
**Inspired by**: Tolkappiyam (foundational), Yapparungalam (segmentation authority), Pingalandai (conventions).  
**Goal**: Correct, maintainable, testable Rust implementation. Fixes current issues (uyir-U only on last char, naive metre, string slicing).  
**Branch**: seyon  
**Date**: April 20, 2026

This document provides:

1. **General Technical Grammar Parser** (reusable Tamil text → structured linguistic units).
2. **Yappu-Specific Prosody Parser** (extends general for metre analysis).

---

## 1. General Technical Grammar Parser (Reusable Foundation)

### 1.1 Core Data Model (Pure Enums - No Strings)

```rust
// src/prosodic_unit.rs (already good - keep & expand)
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ProsodicUnit {
    Vowel(Vowel),
    Consonant(Consonant),
    VowelConsonant { vowel: Vowel, consonant: Consonant }, // Uyirmei
    Aaytham,
    ConsonantCluster(Vec<Consonant>), // For rare clusters like க்ஷ் (but Tamil prefers single)
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Vowel {
    A, Aa, I, Ii, U, Uu, E, Ee, Ai, O, Oo, Au,  // 12
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Consonant {
    K, Ng, C, Nj, T, Nn, Th, N, P, M, Y, R, L, V, Zh, Lll, Rr, Nnn,  // 18 (standard names)
}

// Matrix generator (tamil_chars.rs - excellent, keep)
pub const VOWELS: [Vowel; 12] = [Vowel::A, ...];
pub const CONSONANTS: [Consonant; 18] = [...];
pub fn generate_uyirmei_matrix() -> [[ProsodicUnit; 18]; 12] { ... } // 216 entries
```

**Letter Classification** (src/letter.rs - fix export):

- Input: &str (Tamil grapheme cluster)
- Output: ProsodicUnit
- Use `unicode-segmentation` crate for proper graphemes (fix string slicing bugs!).
- Special: Detect Aaytham, handle inherent 'a' in consonants.

**General Parser Pipeline** (new `src/general_grammar.rs` or extend lib.rs):

```rust
pub struct TamilTextParser {
    options: ParseOptions, // e.g., strict_sandhi: bool
}

impl TamilTextParser {
    pub fn parse_to_units(&self, text: &str) -> Result<Vec<ProsodicUnit>, Error> {
        // 1. Grapheme iterator (fix boundary issues)
        // 2. Classify each to ProsodicUnit via matrix lookup
        // 3. Apply general sandhi rules (optional, for advanced)
        // 4. Return stream
    }

    pub fn parse_to_syllables(&self, text: &str) -> Result<Vec<Syllable>, Error> {
        let units = self.parse_to_units(text)?;
        self.build_syllables(units)
    }
}
```

**Syllable (General)**:

```rust
#[derive(Debug, Clone)]
pub struct Syllable {
    pub units: Vec<ProsodicUnit>,
    pub phonetic: String, // For debug only
}
```

This general layer handles **any Tamil text** (prose/poetry) → structured units/syllables. Reusable for spellcheckers, TTS, etc.

---

## 2. Yappu-Specific Prosody Parser (Core of Thepulimaangani)

Extends general parser with prosody rules. **State-machine heavy** for correctness.

### 2.1 SyllableBuilder (src/syllable_builder.rs - Priority Fix)

**Current Issue**: uyir-U partially implemented, test failing.

**Machine-First Fix (only last character of word)**:

```rust
// In syllable_builder.rs
use crate::prosodic_unit::{ProsodicUnit, Vowel, Consonant};

const PLOSIVES_FOR_U_ELISION: [Consonant; 5] = [
    Consonant::K, Consonant::C, Consonant::T, Consonant::P, Consonant::Rr
];

pub struct SyllableBuilder {
    current_word_units: Vec<ProsodicUnit>, // Buffer per word for "last char" check
    // ... state for greedy
}

impl SyllableBuilder {
    pub fn new() -> Self { ... }

    /// Main entry: process full text, respecting word boundaries for uyir-U
    pub fn build_from_text(&mut self, text: &str) -> Result<Vec<Syllable>, Error> {
        let units = /* from general parser */;
        let mut syllables = vec![];
        let mut i = 0;
        while i < units.len() {
            // Detect word end (space or punctuation or end)
            let is_word_end = ...; // Use unicode or custom word breaker
            if is_word_end && !self.current_word_units.is_empty() {
                self.apply_uyir_u_elision_on_last(&mut self.current_word_units);
            }
            // ... build syllable from units[i..]
            // Push to syllables, update current_word_units
            i += 1;
        }
        // Final word end
        if !self.current_word_units.is_empty() {
            self.apply_uyir_u_elision_on_last(&mut self.current_word_units);
        }
        Ok(syllables)
    }

    fn apply_uyir_u_elision_on_last(&self, word_units: &mut Vec<ProsodicUnit>) {
        if let Some(last) = word_units.last() {
            if let ProsodicUnit::VowelConsonant { vowel: Vowel::U, consonant } = last {
                if PLOSIVES_FOR_U_ELISION.contains(consonant) {
                    // Elide: replace with pure Consonant version (or mark weak)
                    *word_units.last_mut().unwrap() = ProsodicUnit::Consonant(*consonant);
                    // Annotation: "uyir_u_elided: true"
                }
            }
        }
    }

    /// Greedy நிரை-first syllable construction (core logic)
    fn build_next_syllable(&mut self, units: &[ProsodicUnit]) -> Option<(Syllable, usize)> {
        if units.is_empty() { return None; }
        // State machine:
        // State 0: Start
        // Handle Aaytham as 0.5 or special
        // Look for units whose mātrā sum == 2  - 3.5 
        //  with proper unit combination (short + (short| long) +consonants*)→ Nirai
       // (kuril = 1, nedil = 2; uyirmei inherits from vowel)
       // Use vowel_matras arrays and matrix (derive from it's vowel) for instant lookup
    }
}
```

**Syllable Type Enum** (src/syllable.rs - create/verify):

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SyllableType {
    Ner,   // 1 matra
    Nirai, // 2 matra
}

#[derive(Debug, Clone)]
pub struct Syllable {
    pub units: Vec<ProsodicUnit>,
    pub syllable_type: SyllableType,
    pub uyir_u_elided: bool,  // Annotation for display/education
    pub matra: u8,            // 1 or 2
}
```

**Test Fix**: `cargo test test_uyir_u_elision_annotation` should pass after this (only check **last** char per word).

### 2.2 Foot Builder (src/foot.rs - Improve from naive chunks(2))

```rust
#[derive(Debug, Clone)]
pub enum WordType { // Or FootType - traditional names for display only
    Thema,      // N + N
    Pulima,     // Ni + N
    Kuvilam,    // N + Ni
    Karuvilam,  // Ni + Ni
    // 3-asai, 4-asai variants...
    Unknown,
}

pub struct Foot {
    pub syllables: Vec<Syllable>,
    pub foot_type: WordType,  // Mapped from pattern
    pub asai_count: usize,
}

impl FootBuilder {
    pub fn group_into_feet(&self, syllables: &[Syllable]) -> Vec<Foot> {
        let mut feet = vec![];
        let mut i = 0;
        while i < syllables.len() {
            // Smart grouping: prefer 2-asai, then 3, then 4 based on context/metre hint
            // Or use options: ParseOptions { preferred_foot_size: 2 }
            // For now: try 2, fallback
            if let Some(foot) = self.try_group_2_asai(&syllables[i..]) {
                feet.push(foot);
                i += 2;
            } else if ... 3-asai ...
            // ...
        }
        feet
    }

    fn map_to_wordtype(&self, syls: &[Syllable]) -> WordType {
        match (syls.get(0).map(|s| s.syllable_type), syls.get(1).map(|s| s.syllable_type)) {
            (Some(SyllableType::Ner), Some(SyllableType::Ner)) => WordType::Thema,
            (Some(SyllableType::Nirai), Some(SyllableType::Ner)) => WordType::Pulima,
            // ...
            _ => WordType::Unknown,
        }
    }
}
```

### 2.3 Talai Analyzer (src/talai.rs - Basic → Full)

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum TalaiType {
    Ven,      // வெண்தளை
    Asiriya,  // ஆசிரியத்தளை
    Kali,     // கலித்தளை
    // Others from Pingalandai
}

pub struct TalaiAnalyzer;

impl TalaiAnalyzer {
    pub fn analyze_between(&self, foot1: &Foot, foot2: &Foot) -> TalaiType {
        let end_sound = foot1.last_phonetic_class(); // vallinam / mellinam / idaiyinam
        let start_sound = foot2.first_phonetic_class();
        // Rule table from Tolkappiyam / Yapparungalam
        if end_sound == mellinam && start_sound == /* matching */ { TalaiType::Ven }
        else if ... { TalaiType::Asiriya }
        // ...
    }
}
```

### 2.4 Metre Detector (src/metre.rs - Fix "always Venpaa")

```rust
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Metre {
    Venpaa { lines: u8, talai_valid: bool },
    Asiriyappaa { /* params */ },
    Kalippaa { /* params */ },
    Vanjippaa,
    Marutpaa,
    Unknown,
}

pub struct MetreDetector;

impl MetreDetector {
    pub fn detect(&self, lines: &[Vec<Foot>], talai_sequence: &[TalaiType]) -> Metre {
        let line_count = lines.len();
        let feet_per_line: Vec<usize> = lines.iter().map(|l| l.len()).collect();

        // Venpaa heuristic (improve with full rules):
        if line_count == 4 
            && feet_per_line.iter().all(|&f| f == 4) 
            && talai_sequence.windows(2).any(|w| w[0] == TalaiType::Ven && w[1] == TalaiType::Ven)
            && has_ethukai(lines) // rhyme check
        {
            return Metre::Venpaa { lines: 4, talai_valid: true };
        }
        // Similar for others (Asiriyappaa: variable feet 3-5, specific talai)
        // Kalippaa: 4-asai dominant
        // Fallback: Unknown or best match with confidence
        Metre::Unknown
    }
}
```

**Full Validation**: Use rule tables from Yapparungalam for exact match. Add `ParseOptions { strict_metre: bool }`.

### 2.5 Full Pipeline (src/lib.rs - Cleanup)

```rust
pub struct ParseResult {
    pub original_text: String,
    pub syllables: Vec<Syllable>,
    pub feet: Vec<Foot>,
    pub talai: Vec<TalaiType>,
    pub metre: Metre,
    pub annotations: Vec<String>, // Educational notes
    pub errors: Vec<Error>,
}

pub fn parse_poem(text: &str, options: ParseOptions) -> ParseResult {
    let parser = TamilTextParser::new(options);
    let syllables = parser.parse_to_syllables(text)?;  // General + yappu
    let feet = FootBuilder::new().group_into_feet(&syllables);
    let talai = TalaiAnalyzer::analyze_all(&feet);
    let metre = MetreDetector::detect(&group_by_lines(feet), &talai);
    
    // Add uyir-U annotations etc.
    ParseResult { ... }
}
```

**Error Handling** (src/error.rs - good): Specific `UyirUElisionError`, `InvalidTalai`, `MetreMismatch`.

**Types** (src/types.rs): Add `#[derive(Serialize, Deserialize)]` for WASM/JSON output to frontend.

---

## 3. Implementation Priorities & Fixes (from PROJECT_CONTEXT)

1. **High**: Fix uyir-U (only last char) → update syllable_builder.rs + test.
2. **High**: Fix string slicing → use `unicode-segmentation::Graphemes`.
3. **Medium**: Export `Letter`, `Syllable` properly (pub use in lib.rs).
4. **Medium**: Improve metre detection (implement full detector above).
5. **High**: Full WordType mapping in foot.rs (replace naive chunks(2)).
6. **Low**: Add Tolkappiyam/Yapparungalam comments in code (e.g., `// Per Tolkappiyam Ezhuthathikaram sutra 105`).
7. **Low**: `cargo clippy --fix` for dead_code, unused imports.

**Testing Strategy**:

- Unit: Each rule (uyir-U specific words, Ner/Nirai classification matrix).
- Integration: Full Kural lines → expected Metre::Venpaa.
- Property: Random valid Venpaa input → roundtrip parse == original structure.

**WASM/Frontend**: Output JSON with `annotations` for rich UI (tooltips referencing sources).

---

## 4. Why Machine-First Wins

- **Original Avalokitam (PHP)**: Human-first → scattered ifs, hard to extend.
- **Thepulimaangani (Rust)**: Enums + state machines + separation → easy to prove correctness, add new metres, test exhaustively.
- **Extensibility**: General parser reusable; yappu layer plugs in rules without touching core.

This design ensures **Thepulimaangani** becomes the definitive, maintainable Tamil prosody engine.

*Update PROJECT_CONTEXT.md after implementing each priority.*