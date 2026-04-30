**Date**: April 19, 2026

## Philosophy

We maintain a **strict separation** between:

1. **Calculation Layer** (Pure Logic)
2. **Display / Presentation Layer** (Human-facing)

---

## 1. Calculation Layer (Core)

**Location**: `tamil-seiyul-alagi/src/` (parser modules; crate root `src/` below)

**Responsibilities**:
- Convert text → `ProsodicUnit[]`
- Build `Syllable[]` using `SyllableBuilder`
- Group into `Foot[]`
- Analyze `Talai[]`
- Detect `MetreType`
- Return `ParseResult` with **machine-friendly data**

**What it should NOT contain**:
- Traditional foot names (tEmA, puLimA, etc.)
- Human-readable talai labels
- Educational explanations
- UI strings

**Output**: Structured data only (`ParseResult` with enums and rich annotations)

---

## 2. Display / Presentation Layer (Human-facing)

**Location**: `tamil-seiyul-alagi/src/presentation.rs` (single module today; not consumed on the WASM path until wired from the app)

**Responsibilities**:
- Convert machine data into human-readable form
- Map `Foot` → traditional name ("tEmA", "puLimA", etc.)
- Format `Talai` with proper labels ("வெண்டளை", "ஆசிரியத்தளை")
- Generate educational explanations
- Prepare data for UI components

**This layer is allowed to use**:
- Traditional tables and formulas
- Tamil labels
- Educational content

---

## Benefits of This Separation

| Benefit                        | Description |
|--------------------------------|-------------|
| **Cleaner Core Logic**         | Calculation layer stays pure and fast |
| **Easier Testing**             | Core logic can be tested without UI concerns |
| **Better Maintainability**     | Changes to display don't affect parsing |
| **Flexibility**                | Can support multiple UIs (web, CLI, mobile) easily |
| **Educational Value**          | Traditional content lives where it belongs |

---

## Implementation status

1. `ParseResult` from the calculation layer is the structured JSON/WASM output.
2. `presentation.rs` exists for human-facing labels (foot pattern display, etc.); **wire it** from TS/WASM when the UI should show classical names.
3. Classical foot names and full talai labels in the UI remain a **follow-up** once linkage/metre match `MACHINE_FIRST_SPEC.md` more closely.

See also `QUALITY_CRAP_BASELINE.md` and [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49) for doc/code alignment.

---

**This separation is a core architectural decision** for Thepulimaangani.

*Calculation Layer = Machine*  
*Display Layer = Human*