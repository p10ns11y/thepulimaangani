**Date**: April 19, 2026

## Philosophy

We maintain a **strict separation** between:

1. **Calculation Layer** (Pure Logic)
2. **Display / Presentation Layer** (Human-facing)

---

## 1. Calculation Layer (Core)

**Location**: `src/` (parser modules)

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

**Location**: `src/presentation/` (or `src/formatter/`)

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

## Implementation Plan

1. Keep `ParseResult` as the **single source of truth** from the calculation layer
2. Create a `Presentation` module that transforms `ParseResult` into display-friendly structures
3. Move all traditional foot name logic, talai labels, and educational text into the presentation layer

---

**This separation is a core architectural decision** for Thepulimaangani.

*Calculation Layer = Machine*  
*Display Layer = Human*