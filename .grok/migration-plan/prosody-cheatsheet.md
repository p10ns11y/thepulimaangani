# Tamil Prosody Cheat Sheet (யாப்பு)

**Thepulimaangani — Quick Reference**

## The 6 Core Elements

| Tamil       | English          | Western Term     | One-line Meaning |
|-------------|------------------|------------------|------------------|
| **எழுத்து** | Letter           | Letter           | Smallest unit (vowel/consonant) |
| **அசை**     | **Metreme**      | Metreme          | Basic rhythmic unit (நேர் / நிரை) |
| **சீர்**     | **Foot**         | Foot             | Group of 2–4 metremes (tEmA, puLimA...) |
| **தளை**     | **Linkage**      | Caesura          | Bond between two consecutive feet |
| **அடி**     | **Line**         | Line             | One full line of poetry |
| **தொடை**    | **Ornament**     | Alliteration     | Poetic devices (mōṉai, etukai...) |

---

## Key Additional Terms

- **நேர் (ner)** — Single-unit metreme
- **நிரை (nirai)** — Compound metreme (2 units)
- **பாவகை (pāvakai)** — Metre type (Venpaa, Asiriyappaa, Kalippaa...)
- **விகற்பம் (vikalpa)** — Alternative scansion
- **யாப்பு (yāppu)** — Tamil classical prosody

---

## Quick Usage Guide

| Context          | Recommended Term     | Example |
|------------------|----------------------|--------|
| Code (Rust/TS)   | `Metreme`, `Foot`, `Linkage` | `struct Foot { metremes: Vec<Metreme> }` |
| UI Labels        | Tamil + English      | "சீர் / Foot" |
| Docs             | Academic first       | "Metrical Foot (சீர்)" |

---

**Remember**: Tamil prosody is built on **rhythm** (அசை → சீர் → தளை → அடி), not just syllable count.

*Keep this sheet handy while developing Thepulimaangani.*