# Thepulimaangani — Project Context Document

**Last Updated**: April 20, 2026  
**Current Branch**: `seyon`  
**Status**: Core parser compiles and runs tests (with expected failures)

---

## 1. Project Overview

**Thepulimaangani** is a modern Rust rewrite of **Avalokitam** (https://github.com/virtualvinodh/avalokitam), a Tamil prosody (யாப்பு) analyzer.

### Goals
- Migrate from PHP/Quasar to **Rust + WebAssembly** for performance and privacy
- Create a clean, maintainable, machine-first implementation
- Preserve classical Tamil prosody rules (Tolkappiyam, Yapparungalam)
- Provide rich educational annotations for learners

---

## 2. Key Architectural Decisions

### 2.1 Machine-First Philosophy
- **Original Avalokitam** was written for humans (poets/scholars) → hard to maintain
- **Thepulimaangani** is written for machines first, then made human-friendly
- Traditional tables (2-asai, 3-asai, 4-asai, WordType) are used only for **display/education**, not core calculation

### 2.2 Layer Separation
- **Calculation Layer** (`src/`): Pure logic, no UI strings, no traditional names
- **Display Layer** (`tamil-seiyul-alagi/src/presentation.rs` → `ParseResult.presentation`): Tamil labels shipped with WASM JSON

### 2.3 ProsodicUnit Model (Matrix-Based)
- 12 Vowels × 18 Pure Consonants = 216 Uyirmei
- Clean enum: `Vowel(Vowel)`, `Consonant(Consonant)`, `VowelConsonant { vowel, consonant }`, `Aaytham`, `ConsonantCluster`
- This replaces the old string-based approach

### 2.4 SyllableBuilder
- State-machine based syllable construction
- Greedy நிரை-first logic
- uyir-U elision handling (only on last character)

---

## 3. Current State (April 20, 2026)

### What Works
- ✅ Parser compiles cleanly
- ✅ Basic pipeline: Text → ProsodicUnit → Syllable → Foot → Talai → Metre
- ✅ Tamil character matrix (`tamil_chars.rs`) — 247 characters correctly generated
- ✅ `ProsodicUnit` classification using official 12×18 matrix
- ✅ Tests run (some pass, some fail as expected)

### What Needs Work
- ❌ `uyir-U` elision detection (partially implemented, test still failing)
- ❌ Metre detection (currently too naive — always returns Venpaa)
- ❌ Full foot name mapping (still uses naive `chunks(2)`)
- ❌ String slicing bugs in tests (Tamil character boundary issues)
- ❌ `Letter` struct not properly exported

---

## 4. Critical Rules Implemented

### 4.1 uyir-U Elision (Tolkappiyam Origin)
- **Rule**: When a word **ends** with short `u` (உ) after **க், ச், ட், ப், ற்**, that final vowel is prosodically weak
- **Only the last character** of the word gets the hint
- **Origin**: தொல்காப்பியம் (Tolkappiyam), எழுத்ததிகாரம் ~100-110
- **Status**: Partially implemented (logic exists but test still failing)

### 4.2 ProsodicUnit Classification
- Pure Vowels (12): அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ
- Pure Consonants (18): க், ங், ச், ஞ், ட், ண், த், ந், ப், ம், ய், ர், ல், வ், ழ், ள், ற், ன்
- Uyirmei (216): Generated via matrix
- Aaytham (ஃ): Special ½ mātra character

---

## 5. File Structure & Purpose

| File | Purpose | Status |
|------|---------|--------|
| `src/lib.rs` | Main entry point + pipeline | Needs cleanup |
| `src/prosodic_unit.rs` | Core enum (Vowel, Consonant, VowelConsonant, Aaytham) | Good |
| `src/syllable_builder.rs` | State-machine syllable construction | Needs uyir-U fix |
| `src/letter.rs` | Convert graphemes → ProsodicUnit | Needs export fix |
| `src/tamil_chars.rs` | 247 Tamil characters + matrix generator | Excellent |
| `src/syllable.rs` | Syllable + SyllableType definitions | Needs to be created/verified |
| `src/foot.rs` | Foot grouping (currently naive) | Needs full WordType |
| `src/talai.rs` | Talai analysis | Basic |
| `src/metre.rs` | Metre detection | Too naive |
| `tamil-seiyul-alagi/src/presentation.rs` | Display layer (Tamil labels in JSON) | Shipped on `ParseResult.presentation` |
| `src/types.rs` | ParseOptions, ParseResult | Needs serde derives |
| `src/error.rs` | Error types | Good |

---

## 6. Remaining Tasks (Prioritized)

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| **1** | Fix `uyir-U` elision (only last character) | High | Low |
| **2** | Fix string slicing in tests | High | Low |
| **3** | Export `Letter` and `Syllable` properly | Medium | Low |
| **4** | Improve metre detection | Medium | Medium |
| **5** | Full foot name mapping (WordType) | High | High |
| **6** | Add Tolkappiyam comments/documentation | Low | Low |
| **7** | Clean up warnings (dead_code, unused imports) | Low | Low |

---

## 7. Historical Context

### Why uyir-U Exists
- In spoken Tamil, final short `u` after plosive consonants (க், ச், ட், ப், ற்) became **phonetically weak**
- Ancient grammarians (Tolkappiyam) recognized this and formalized it for poetry
- Allows poets flexibility in fitting lines to classical metres

### Machine-First vs Human-First
- **Original Avalokitam (PHP)**: Written for humans → scattered logic, hard to maintain
- **Thepulimaangani (Rust)**: Written for machines first → clean enums, state machines, clear separation

---

## 8. Next Immediate Actions (seyon branch)

1. Fix `uyir-U` elision logic (only check last character)
2. Run `cargo test test_uyir_u_elision_annotation`
3. Fix remaining compilation warnings
4. Update `PROJECT_CONTEXT.md` after each major change

---

**This document is the single source of truth** for anyone joining the project or starting a new thread.

*Maintained by the Thepulimaangani team.*