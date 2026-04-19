# Tamil Prosody Glossary (யாப்பு இலக்கண சொற்கள்)

**Project**: Thepulimaangani (Avalokitam 2026 Rewrite)  
**Purpose**: Standardized English and academic terminology for Tamil prosody (யாப்பு / *Yāppu*).  
**Last Updated**: April 19, 2026

This glossary defines the six fundamental elements of classical Tamil prosody along with other important terms used in the parser and documentation.

---

## The Six Core Elements of Tamil Prosody

These six elements form the complete analytical framework used by Avalokitam and Thepulimaangani.

| Tamil Term      | Common English       | **Recommended Term**     | Western / Latin Equivalent      | Description |
|-----------------|----------------------|---------------------------|----------------------------------|-----------|
| **எழுத்து**<br>(eluttu) | Letter              | **Letter**                | Letter / Grapheme               | The smallest unit. Individual Tamil letters (vowels, consonants, *uyirmei*, *aaytham*). |
| **அசை**<br>(acai)     | Syllable / Metreme   | **Metreme**               | Metreme                         | Basic rhythmic/prosodic unit. Divided into **நேர்** (*ner*) and **நிரை** (*nirai*). |
| **சீர்**<br>(seer / cir) | Foot / Metrical Foot | **Foot**                  | **Foot** (Greek/Latin prosody)  | Traditional grouping of 2–4 metremes with specific names (*tEmA*, *puLimA*, *kUviLa_m*, etc.). |
| **தளை**<br>(talai)    | Linkage / Bond       | **Linkage**               | Caesura (approximate)           | The rhythmic connection or "bond" between two consecutive feet. |
| **அடி**<br>(ati)      | Line                 | **Line**                  | Line / Stich                    | One complete metrical line composed of multiple feet (*kuRaLaTi*, *neTiLaTi*, etc.). |
| **தொடை**<br>(todai)   | Ornamentation        | **Ornament**              | Alliteration / Rhyme patterns   | Poetic devices such as *mōṉai* (alliteration), *etukai* (rhyme), etc. |

---

## Detailed Explanations

### 1. எழுத்து (eluttu) — Letter
- The foundational unit of Tamil script and prosody.
- Classified into: உயிர் (vowels), மெய் (consonants), உயிர்மெய் (consonant + vowel), ஆய்தம் (*aaytham*).
- Includes **matra** (mātra) counting (short = 1, long = 2).

### 2. அசை (acai) — Metreme
- The most important building block of Tamil rhythm.
- Two main types:
  - **நேர் (ner)**: Single unit (short or long)
  - **நிரை (nirai)**: Compound of two units
- Special rules apply (especially **uyir-U elision** after certain consonants).

### 3. சீர் (seer / cir) — Foot
- A traditional grouping of metremes with specific names.
- Common feet: *tEmA*, *puLimA*, *kUviLa_m*, *karuviLa_m*, and many extended forms (e.g., *tEmA_GkA_y*).
- This is the closest equivalent to the Western concept of a **metrical foot**.

### 4. தளை (talai) — Linkage
- The "glue" that connects two consecutive feet.
- Determines the rhythmic flow of the line.
- Major types: **வெண்டளை** (*Ven-talai*), **ஆசிரியத்தளை** (*Asiriya-talai*).

### 5. அடி (ati) — Line
- One complete line of poetry.
- Classified by length and structure (*kuRaLaTi* = short line, *neTiLaTi* = long line, etc.).
- Multiple lines together form a stanza or poem.

### 6. தொடை (todai) — Ornament
- Stylistic and ornamental features of classical poetry.
- Includes *mōṉai* (initial alliteration), *etukai* (rhyme), *murai* (repetition), etc.
- Adds beauty and musicality beyond pure rhythm.

---

## Additional Important Terms

| Tamil Term          | English / Academic Term          | Description |
|---------------------|----------------------------------|-----------|
| **நேர்** (ner)       | Ner (or *nE_r*)                  | Single-unit metreme |
| **நிரை** (nirai)     | Nirai (or *nirY*)                | Compound metreme (usually two units) |
| **பாவகை** (pāvakai)  | Metre Type                       | The overall poetic form (e.g., *Venpaa*, *Asiriyappaa*, *Kalippaa*) |
| **விகற்பம்** (vikalpa) | Alternative Scansion           | Multiple valid ways to scan the same verse |
| **யாப்பு** (yāppu)   | Prosody                          | The entire system of Tamil classical versification |
| **இலக்கணம்** (ilakkanam) | Grammar / Prosodic Rules      | The rule system governing *yāppu* |

---

## Usage Recommendations (for Code & Documentation)

| Context              | Recommended Term     | Example |
|----------------------|----------------------|--------|
| **Rust / TypeScript types** | `Metreme`, `Foot`, `Linkage`, `Line` | `struct Foot { syllables: Vec<Metreme> }` |
| **UI / Frontend**    | Use Tamil + English  | "அசை / Metreme", "சீர் / Foot" |
| **Documentation**    | Academic term first  | "Metrical Foot (சீர்)" |
| **Comments in Code** | English term         | `// Group syllables into traditional feet (seer)` |
| **User-facing text** | Tamil primary        | Keep original Tamil labels in the UI |

---

## Why These Terms Matter

Using consistent terminology across the codebase, documentation, and UI helps:
- Maintain cultural authenticity
- Make the project accessible to both Tamil scholars and modern developers
- Avoid confusion when porting rules from the original PHP implementation

---

**Maintained by**: Thepulimaangani Team  
**References**: Original Avalokitam PHP logic, classical Tamil prosody treatises (*Yapparungalam*, *Tholkappiyam*), and modern scholarly works on Tamil *yāppu*.

---

*This glossary is the single source of truth for terminology in the Thepulimaangani project.*