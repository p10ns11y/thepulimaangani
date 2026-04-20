# Machine-First vs Human-First Approach in Prosody Parsing

**Project**: Thepulimaangani (Avalokitam 2026 Rewrite)  
**Date**: April 19, 2026

---

## The Core Problem

The original Avalokitam (PHP) was written following **rules made for humans** (poets and scholars), not for machines.

This led to code that is:
- Hard to read
- Hard to maintain
- Full of scattered special cases
- Difficult to extend

---

## Two Different Mindsets

### Human-First Approach (Original Avalokitam)

- Written as if explaining to a poet
- Uses traditional tables and formulas *during calculation*
- Many nested conditions and magic numbers
- Follows classical treatises literally
- Good for correctness, bad for maintainability

### Machine-First Approach (Thepulimaangani)

- Written for computers first, humans second
- Uses efficient algorithms (greedy, state machines, look-ahead)
- Traditional tables used **only for display and education**
- Clear data structures and separation of concerns
- Easier to test, debug, and extend

---

## Our Philosophy

> **Traditional formulas (2-asai, 3-asai, 4-asai, Venpaa rules, etc.) should only appear in:**
> - UI display
> - Educational explanations  
> - Result annotations (`split_hint`, `rule_ref`)
>
> **Never in the core calculation logic.**

---

## Key Design Decisions

| Decision                        | Human-First (Old)          | Machine-First (New)              |
|---------------------------------|----------------------------|----------------------------------|
| Core Representation             | Raw strings + arrays       | `ProsodicUnit` enum              |
| Syllable Construction           | Complex nested conditions  | `SyllableBuilder` state machine  |
| Foot Grouping                   | Big lookup tables          | Pattern matching + validation    |
| Special Rules                   | Scattered everywhere       | Explicit methods + early exit    |
| Educational Content             | Mixed with logic           | Separate layer                   |

---

## Benefits of Machine-First Approach

1. **Much easier to understand** for developers
2. **Faster execution** (greedy algorithms + early exits)
3. **Easier to test** and debug
4. **Simpler to add new features**
5. **Better separation** between calculation and presentation

---

## Implementation Strategy

1. Use `ProsodicUnit` as the primary data type
2. Use `SyllableBuilder` for robust syllable construction
3. Keep traditional foot names and talai types only in result formatting
4. Document all special rules clearly (never hide them in magic numbers)

---

**This document defines the architectural philosophy** of Thepulimaangani.

*We build for machines first, then make it beautiful for humans.*