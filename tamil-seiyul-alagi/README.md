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

**Location**: React app — `src/components/prosody/displayLabels.ts` and the Prosody lab Structure tab (maps `foot_type`, `linkage_type`, `linkage_special_type` to Tamil).

**Responsibilities**:
- Convert machine JSON into human-readable labels for the UI
- Map `Foot` / `foot_type` → traditional name (தேமா, …)
- Map linkage → தளை family + special type labels
- (Later) richer educational copy and tooltips

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
2. Human-facing foot and தளை labels are implemented in the **frontend** (`displayLabels.ts`); WASM stays machine-first.
3. Metre detection in Rust remains heuristic vs full classical rules in `MACHINE_FIRST_SPEC.md`.

See also `QUALITY_CRAP_BASELINE.md` and [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49) for doc/code alignment.

---

**This separation is a core architectural decision** for Thepulimaangani.

*Calculation Layer = Machine*  
*Display Layer = Human*