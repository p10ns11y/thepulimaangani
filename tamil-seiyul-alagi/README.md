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

**Output**: Machine-first fields on `ParseResult` plus a sibling **`presentation`** object (Tamil labels from `presentation.rs`), not mixed into core enums.

---

## 2. Display / Presentation Layer (Human-facing)

**Location**: `tamil-seiyul-alagi/src/presentation.rs` — output is embedded in **`ParseResult.presentation`** on every successful parse (same JSON as `parse_poem_wasm`).

**Responsibilities**:
- Tamil metre name, foot mnemonics, and full தளை line strings for clients
- Optional: richer educational copy later

**Web UI**: `src/components/prosody/displayLabels.ts` remains a **fallback** when consuming older JSON without `presentation`, and for purely client-side mocks.

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

1. `ParseResult` from the calculation layer is the structured JSON/WASM output (logic + **`presentation`** labels).
2. Non-web clients should read **`presentation`** directly; the TanStack app prefers it when present.
3. Metre detection in Rust remains heuristic vs full classical rules in `MACHINE_FIRST_SPEC.md`.

See also `QUALITY_CRAP_BASELINE.md` and [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49) for doc/code alignment.

---

**This separation is a core architectural decision** for Thepulimaangani.

*Calculation Layer = Machine*  
*Display Layer = Human*