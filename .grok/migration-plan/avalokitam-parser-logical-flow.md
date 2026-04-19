# Avalokitam Parser Logical Flow
**For Original Avalokitam + Adaptation to thepulimaangani**

This document describes the complete logical flow of the Tamil prosody parser used in Avalokitam. It can be used as a reference implementation guide when enhancing or documenting https://github.com/p10ns11y/thepulimaangani.

---

## 1. High-Level Parser Pipeline (ASCII Diagram)

```
Input Tamil Poetry (பா)
          │
          ▼
┌─────────────────────────────┐
│ 1. PREPROCESSING & TOKENIZE │
│    - Normalize Unicode      │
│    - Split into letters     │
│    - Identify kuril/nedil/ottu│
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 2. SYLLABLE CLASSIFICATION  │
│    (எழுத்து → அசை)           │
│    - நேர் (Ner)             │
│    - நிரை (Nirai)           │
│    - நேர்பு / நிரைபு (special│
│      for Venpaa ending)     │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 3. FOOT GROUPING (சீர்)      │
│    - ஈரசை (2 acai)          │
│    - மூவசை (3 acai)         │
│    - நான்கசை (4 acai)       │
│    - Match patterns:        │
│      தேமா, புளிமா, கூவிளம், │
│      கருவிளம் + காய்/கனி/பூ│
│      /நிழல் variants        │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 4. LINKAGE ANALYSIS (தளை)    │
│    - Check bonding rules    │
│      between consecutive    │
│      feet                   │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 5. LINE FORMATION (அடி)      │
│    - Count feet per line    │
│    - Validate ending rules  │
│      (நாள், மலர், காசு,     │
│       பிறப்பு for Venpaa)   │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 6. ORNAMENTATION (தொடை)      │
│    - Detect optional        │
│      decorative patterns    │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 7. METRE RULE MATCHING      │
│    - Compare structure      │
│      against 22 known       │
│      metre templates        │
│    - Output: வெண்பா variant,│
│      ஆசிரியப்பா, கலிப்பா,   │
│      வஞ்சிப்பா, etc.        │
└─────────────────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ 8. STRUCTURED OUTPUT        │
│    - Hierarchical view      │
│    - Multiple sort modes    │
│      (எழுத்து / அசை/சீர் /  │
│       தளை / அடி / தொடை)     │
│    - Validation results     │
│    - Educational feedback   │
└─────────────────────────────┘
```

---

## 2. Detailed Step-by-Step Explanation

### Step 1: Preprocessing & Tokenize
- Accept raw Tamil text input.
- Normalize (handle combining characters, zero-width joiners if any).
- Split into individual letters (எழுத்து) while respecting Tamil orthography.
- Classify each letter: குறில் (short), நெடில் (long), ஒற்று (consonant cluster).

**Original UI:** Happens silently when user pastes into the main analyzer input.

**thepulimaangani Mapping:** Already handled in your Rust `tokenize` / `letter_classification` functions.

### Step 2: Syllable Classification (அசை)
- Group letters into அசை (metremes/syllables).
- Apply rules for **நேர்** and **நிரை** (see Reference page for exact patterns).
- Special handling for **வெண்பா ஈற்றசை** (ending syllable):
  - நாள் (⏑)
  - மலர் (―)
  - காசு (⏑ ⏑ உ)
  - பிறப்பு (― ⏑ உ)

**Original UI:** Visible in "எழுத்து" and "அசை/சீர்" sort modes.

### Step 3: Foot Grouping (சீர்)
- Combine 2–4 அசை into traditional feet.
- Exact patterns from Reference page:
  - **ஈரசை**: தேமா, புளிமா, கூவிளம், கருவிளம்
  - **மூவசை**: தேமாங்காய், புளிமாங்காய், கூவிளங்காய், கருவிளங்காய், தேமாங்கனி, etc.
  - **நான்கசை**: 16 named variants (தேமாந்தண்பூ … கருவிளநறுநிழல்)

**Original UI:** Core of the "அசை/சீர்" view.

### Step 4: Linkage / Bond Analysis (தளை)
- Analyze how feet connect (தளை rules are complex in classical prosody).
- Detect valid vs. invalid bonds between consecutive சீர்.

**Original UI:** Dedicated "தளை" sort/filter mode.

### Step 5: Line Formation & Validation (அடி)
- Count number of feet per line (usually 4, last line often 3 for குறள் வெண்பா).
- Enforce ending rules (especially for வெண்பா).
- Check total structure (e.g., 2 lines for குறள் வெண்பா, 4 lines for most others).

**Original UI:** "அடி" view + automatic metre detection.

### Step 6: Ornamentation (தொடை) – Optional
- Detect repetitive or decorative sound patterns (அடி தொடை, எதுகை, மோனை, etc.).
- Not always required for basic metre identification.

**Original UI:** "தொடை" filter mode.

### Step 7: Metre Identification
- Match the complete structure against the 22 supported metres (full list in README).
- Output the specific subtype (e.g., "ஒரு விகற்ப குறள் வெண்பா", "நேரிசை சிந்தியல் வெண்பா", etc.).

**Original UI:** Main result banner + "பாவினை கண்டறிய வேண்டாம்" toggle.

### Step 8: Multi-View Output & Educational Feedback
- Support all sort modes from the toolbar.
- Show rule-by-rule validation (as seen on /types page with *done* / *info* badges).
- Allow live editing with instant re-validation (key feature of /types page).

---

## 3. Data Flow in thepulimaangani (Rust WASM + React)

```
React UI (Input + Checkboxes + Toolbar)
          │
          ▼  (on "Parse" or real-time)
Rust WASM Parser (wasm-pack)
   ├── tokenize_and_classify()
   ├── group_into_feet()
   ├── analyze_talai()
   ├── validate_lines_and_ending()
   ├── detect_metre()
   └── return JSON analysis tree
          │
          ▼
React Components
   ├── AnalysisOutput (switchable views)
   ├── ValidationBadges (for /types page)
   └── ReferencePanel (for /reference page)
```

**Key Rust Modules to Enhance (if not already complete):**
- `syllable.rs` – நேர்/நிரை + ending rules
- `foot.rs` – All 2/3/4 acai patterns with names
- `metre.rs` – Full 22-metre rule engine + subtype detection
- `output.rs` – Structured JSON for all 6 elements + sort modes

---

## 4. How to Integrate This Document

**Relevant files:**

1. [analyzer.md](./analyzer.md)

2.  [referrenced.md](./referrenced.md)

3.  [types.md](./types.md)


3. **Create new page in thepulimaangani** (optional but excellent):
   - Route: `/parser-flow` or integrate as expandable section in Help page.
   - Render the ASCII diagram + step explanations using a nice code block + Tailwind cards.

---

**This document is now ready to be committed** to your repository as `docs/avalokitam-parser-logical-flow.md`.

It gives developers and users a clear mental model of how the entire system works — from raw text to beautiful multi-view analysis.

Would you like me to also generate the final combined set of all 7 markdown files (the 6 pages + this flow) in a single folder, or update any specific file further?