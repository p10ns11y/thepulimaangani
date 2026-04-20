# Thepulimaangani Parser — Formal Algorithm Specification

**Version**: 1.0  
**Date**: April 19, 2026  
**Status**: Proposed Final Design

---

## 1. Overview

Thepulimaangani is a modern, idiomatic Rust implementation of classical Tamil prosody (யாப்பு / *Yāppu*) parsing. It aims to faithfully reproduce the behavior of the original Avalokitam while being more robust, maintainable, and suitable for WebAssembly deployment.

The parser analyzes Tamil poetic text and produces a structured breakdown according to the six fundamental elements of Tamil prosody:

1. எழுத்து (Letter)
2. அசை (Metreme)
3. சீர் (Foot)
4. தளை (Linkage)
5. அடி (Line)
6. தொடை (Ornament)

---

## 2. Core Data Structures

### 2.1 ProsodicUnit

```rust
enum ProsodicUnit {
    Vowel { is_long: bool, text: String },
    VowelConsonant { is_long: bool, text: String, consonant: char },
    ConsonantCluster { text: String },
}
```

**Classification**:
- **Vowel (உயிர்)**: Pure vowels (அ, ஆ, இ, ஈ, etc.)
- **VowelConsonant (உயிர்மெய்)**: Most common type — treated as a single unit
- **ConsonantCluster**: Rare (mainly ஃ)

### 2.2 Syllable

```rust
struct Syllable {
    text: String,
    syllable_type: SyllableType,      // Ner / Nirai
    split_hint: Option<String>,       // "uyir-U elision after ற்"
    alt_split: bool,
    rule_ref: Option<String>,
}
```

### 2.3 Foot, Talai, ParseResult

(Defined in `foot.rs`, `talai.rs`, `types.rs`)

---

## 3. Algorithm Steps

### Step 1: Normalization

- Remove punctuation (`. , ; ! ? ( ) —`)
- Handle special `uyir_u` markers if `ParseOptions.uyir_u = true`

### Step 2: Convert to ProsodicUnit

Convert each grapheme into a `ProsodicUnit`:
- Pure vowels → `Vowel`
- Most consonants → `VowelConsonant`
- Rare clusters → `ConsonantCluster`

### Step 3: Build Syllables (Metremes)

**Priority Order**:

**First try to form நிரை (Nirai)** — Greedy:
1. `(short + long) + consonant*`
2. `(short + long)`
3. `(short + short) + consonant*`
4. `(short + short)`

**Then form நேர் (Ner)**:
1. `long + consonant*` → immediate Ner
2. `short` or `long` as leftover at the end

**Consonant Attachment Rule**:
- A consonant (or group of consonants) **always attaches to the previous letter** (vowel, vowel+consonant, or consonant).

### Step 4: Group into Feet (சீர்)

Use traditional pattern matching (from original `WordType` array):
- 2-asai: `tEmA`, `puLimA`, `kUviLa_m`, `karuviLa_m`
- 3-asai: `tEmA_GkA_y`, `puLimA_GkaVi`, etc.
- 4-asai: `tEmA_nta_NpU`, `puLimA_nta_NNiZa_l`, etc.

### Step 5: Analyze Talai (தளை)

Determine linkage type between consecutive feet:
- வெண்டளை (Ven-talai)
- ஆசிரியத்தளை (Asiriya-talai)
- Others

### Step 6: Detect Metre (பாவகை)

- Basic detection: Venpaa, Asiriyappaa, Kalippaa, etc.
- Future: Full validation using `CheckVenpaa`, `CheckAsiriyappa`, etc.

### Step 7: Build ParseResult

Return structured JSON with rich annotations (`split_hint`, `alt_split`, `rule_ref`).

---

## 4. Special Rules

| Rule                        | Condition                                      | Behavior |
|----------------------------|------------------------------------------------|----------|
| **uyir-U Elision**         | Short `u` after க், ச், ட், ப், ற்            | Often merged with previous syllable |
| **Venpaa Last Syllable**   | Must end with: நாள் / மலர் / காசு / பிறப்பு    | Strict validation |
| **Vikalpa**                | `alt_scansion = true`                          | Generate alternative parses with hints |

---

## 5. Implementation Notes

- Use `ProsodicUnit` as the primary representation (not raw strings)
- Use `SyllableBuilder` state machine for robust syllable construction
- Keep foot grouping logic declarative (pattern matching)
- Make all special rules explicit and well-documented

---

**This document is the authoritative specification** for the Thepulimaangani parser algorithm.

*Maintained by the Thepulimaangani team.*