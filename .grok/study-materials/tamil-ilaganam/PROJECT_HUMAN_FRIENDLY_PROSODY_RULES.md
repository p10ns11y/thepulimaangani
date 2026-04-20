# Thepulimaangani - Human-Friendly Prosody Rules for the Project

**Extracted & Simplified from Classical Sources**  
**For**: Poets, learners, educators, and UI display.  
**Not for core calculation** - use MACHINE_FIRST_TECHNICAL_GRAMMAR.md for implementation.  
**Last Updated**: April 20, 2026 (seyon branch)

This document translates the dense classical rules into approachable Tamil + English explanations, with examples relevant to the parser's output (syllables, feet, talai, metre). It preserves educational value while aligning with the project's **layer separation** (Calculation Layer pure logic → Display Layer human labels via `presentation.rs`).

---

## 1. Core Concepts Made Simple (எளிய விளக்கம்)

### Letters → Prosodic Units (எழுத்து → அலகு)

Tamil text is first broken into **Prosodic Units** (machine enum, but human sees as familiar letters):

- **Pure Vowels (உயிர்)**: அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ  
- **Pure Consonants (மெய்)**: க் ங் ச் ஞ் ட் ண் த் ந் ப் ம் ய் ர் ல் வ் ழ் ள் ற் ன்  
- **Uyirmei (உயிர்மெய்)**: க கா கி ... (216 combinations - the everyday letters you read/write)  
- **Aaytham (ஆய்தம்)**: ஃ (rare, emphatic "h" sound, counts as half-beat)

**Why it matters**: The parser uses a 12×18 matrix to classify every character instantly. No string guessing!

**Human Tip**: In poetry, "கா" is one visual letter but two units internally (க + ா) for rhythm counting.

### Asai (அசை) - The Heartbeat of Poetry

Every syllable in a poem is either:

- **நேர் (Ner)**: "Light" / "straight" beat (**1 - 2 + 1/2 mātrā**).  
**Precise forms** (per parser + classical, updated for clarity):  
  - Any **single prosodic unit with mātrā = 1** (குறில்) — can be a short pure vowel (e.g., அ, இ, உ, எ, ஒ) **or** a uyirmei with short vowel (e.g., க, பி, து, மு, கல்)  
  - நெடில் treated as light (long unit counted as 1 mātrā in specific classical contexts)  
  - குறில் + ஒற்று (short unit + consonant closure)  
  - நெடில் + ஒற்று (long unit + consonant, light position)  
  **Examples**: அ, க, ப, தி, மு, கா (in light context), கல்.  
  **When**: Feels short and crisp.
- **நிரை (Nirai)**: "Flowing" / "heavy" beat (**2 mātrā**).  
**Precise forms** (updated for clarity):  
  - **குறில் + குறில்** (two short prosodic units, each mātrā = 1 — pure vowels **or** uyirmei)  
  - **குறில் + நெடில்** (short unit + long unit in specific groupings)  
  - குறில் + குறில் + ஒற்று  
  - குறில் + நெடில் + ஒற்று

**நேர் (Ner - "Straight" / Light, 1 - 2+1/2 mātrā)**:    

- Any **single prosodic unit with mātrā = 1** (குறில்)    
  - Short pure vowel (அ, இ, உ, எ, ஒ)    - 1 **mātrā**
  - Uyirmei with short vowel + consonant (க, பி, து, etc.) - 1 + 1/2 **mātrā**
- நெடில் when standalone (long unit always 2 mātrā)  - 2 **mātrā**
- Short unit + consonant closure (குறில் + ஒற்று)   - 1 + 1/2 **mātrā**
- Long unit + consonant  (நெடில் + ஒற்று) - 2 + 1/2 **mātrā**  
**Examples**: அ, க, ப, தி, மு, கா (light), கல்.  
**Human mnemonic**: Crisp, single-beat unit.

**நிரை (Nirai - "Flowing" / Heavy, 2-3+1/2 mātrā)**:    

- **குறில் + குறில்** (two short prosodic units, each mātrā = 1 — pure vowels **or** uyirmei)   - 2 **mātrā**
- **குறில் + நெடில்** (short + long unit combination)   - 3 **mātrā**
- குறில் + குறில் + ஒற்று    - 2 + 1/2 **mātrā**
- குறில் + நெடில் + ஒற்று - 3 + 1/2 **mātrā**

**Examples**:   

1. பதி (two short units) - 2 **mātrā**
2. ககா (one short unit one long unit) - 3 **mātrā**
3. ககால் (one short unit one long unit and consonant) - 3 + 1/2 **mātrā**

**Looks similar but not allowed to form syllable**

1. காபூ (two long units) not allowed to form syllable -> கா | பூ -> **நேர் நேர்**
2. காதி (long unit short unit) not allowed ->  கா | தி -> **நேர் நேர்**

The above two combination looks similar to "2.  ககா (one short unit one long unit) - 3 **mātrā"** but not allowed

**Official Vowel Mātrā Array** (for clean coding):

```python
vowel_matras = [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2]  # A, Aa, I, Ii, U, Uu, E, Ee, Ai, O, Oo, Au
```

**Rule**: Any uyirmei inherits the mātrā of its vowel (e.g., **பே** = 2 because ஏ = 2). This greatly simplifies the parser.

**Human-Friendly Rule of Thumb** (Yapparungalam + code):  
Greedy left-to-right: Prefer **நிரை** first (combine if current mātrā=1 and next unit makes total 2). Else **நேர்**. Read aloud — if it flows into a heavy beat, it’s நிரை. UI shows “நேர் (1)” / “நிரை (2)” with tooltips

**Bonus update** (same file, under “Human Tip”):  

>  **Human Tip**: “கா” is one visual character but **one nedil unit (mātrā = 2)**. “கி” is one **kuril unit (mātrā = 1)**. The parser never guesses — it uses the 12×18 matrix + mātrā array.

### Cir / Foot (சீர்) - Building Blocks of the Line

Feet are groups of 2–4 அசை. Traditional poetic names (display only, not for calc):

**Common 2-asai feet** (Venpaa style):

- **தேமா** (Thema): நேர் + நேர்  → "ta-ma" feel (light-light)
- **புளிமா** (Pulima): நிரை + நேர் → "pu-li-ma" (heavy-light, like tamarind!)
- **கூவிளம்** (Kuvilam): நேர் + நிரை
- **கருவிளம்** (Karuvilam): நிரை + நிரை

**3-asai & 4-asai**: Used in Asiriyappaa / Kalippaa (more complex names like தேமாங்காய்).

**Human Tip from Commentaries**: In திருக்குறள், most lines use தேமா / புளிமா combinations. Count the "beats" per line — should feel balanced.

**WordType in UI**: Parser will map internal groups to these beautiful traditional names for education.

**Human-Friendly Foot Split Rules (Precise for Venpaa & General Yappu)**:  
These are the practical segmentation rules for splitting a line into நேர் / நிரை (and special final forms). Use for manual scansion or to understand parser output.

- **நேர் (Ner)**:  
  - குறில் (short vowel)  
  - நெடில் (long vowel, light context)  
  - குறில் + ஒற்று (short vowel + consonant)  
  - நெடில் + ஒற்று (long vowel + consonant, light)
- **நிரை (Nirai)**:  
  - குறில் + குறில் (two short vowels)  
  - குறில் + நெடில் (short + long)  
  - குறில் + குறில் + ஒற்று (two shorts + consonant)  
  - குறில் + நெடில் + ஒற்று (short + long + consonant)
- **நேர்பு (Nerpu)** — Special for **வெண்பாவின் ஈற்றசை** (final syllable of Venpaa line only):  
நேர் + ஈற்றுகரம் (Ner + final short u/karam)
- **நிரைபு (Niraipu)** — Special for **வெண்பாவின் ஈற்றசை** (final syllable of Venpaa line only):  
நிரை + ஈற்றுகரம் (Nirai + final short u/karam)

**Why these matter**: In திருக்குறள்-style Venpaa, the last அசை of each line often uses நேர்பு / நிரைபு to fit the strict 4-foot structure + ethukai. The parser's `finalize()` + uyir-U logic helps detect these.  
**Tip for learners**: Count the asai per foot — most குறள் lines are 2-asai feet (தேமா/புளிமா) with possible நேர்பு at line end.

### தளை (Thalai - The "Glue" Between Feet)

How one foot "bonds" to the next. Critical for authentic rhythm.

- **வெண்தளை (Ven Thalai)**: Clean "white" bond — specific sound match (e.g., ends in mellinam consonant, next starts matching). Signature of **வெண்பா**.
- **ஆசிரியத்தளை**: Flowing bond for epic style (**ஆசிரியப்பா**).
- **கலித்தளை**: Energetic, dance-like bond for **கலிப்பா**.

**Human Example**: In a Venpaa line, the junction between 3rd and 4th foot must have ven-thalai — if not, it's not a proper Venpaa!

### Metre (யாப்பு / பா) - The Complete Poem Structure

The "big picture" name:

- **வெண்பா (Venpaa)**: 4 lines × 4 feet each. Strict ven-thalai. Most famous (திருக்குறள், நாலடியார்). Short, witty, moral.
- **ஆசிரியப்பா (Asiriyappaa)**: Longer lines (3–5 asai feet), asiriya-thalai. Used in long poems (சிலப்பதிகாரம்).
- **கலிப்பா (Kalippaa)**: 4-asai feet, kali-thalai. Rhythmic, often in dramas or devotional.
- Others: வஞ்சிப்பா, மருட்பா (rarer).

**Detection Rule (Human)**: Count lines & feet per line + check thalai type at key positions + check end-rhyme (எதுகை). If matches Venpaa pattern → Venpaa. Never assume "always Venpaa"!

**Special Rule - உயிர்-உ எழுத்து நீக்கம் (Uyir-U Elision)**  
**Super Important for Correct Scansion** (Tolkappiyam எழுத்ததிகாரம் ~100-110):

**Classical Rule (strict)**: If a **word ends** with short **உ** right after **க் / ச் / ட் / ப் / ற்**, the உ is prosodically weak and "disappears" (elided) for rhythm. Only the **very last character of the whole word** is affected (internal உ stays full). This allows poets flexibility in fitting metres.

**Current Code Implementation** (in `syllable_builder.rs`):  
`is_uyir_u_elision()` checks the last unit remaining in the `current` buffer during `finalize()`. If it matches VowelConsonant { vowel: U, consonant in {K, Ch, Tt, P, Rr} }, it treats it as நேர் with annotation "uyir-U elision (after க்/ச்/ட்/ப்/ற்)" and rule_ref to Tolkappiyam. (Commented `apply_uyir_u_elision` shows prior combine logic.)

**Gap & Priority Fix**: Current version approximates at end-of-text; full classical requires **per-word boundary detection** (only elide if it's the *last char of its word*). See MACHINE_FIRST_TECHNICAL_GRAMMAR... §2.1 for the state-machine + word-buffer enhancement. This is **Priority #1** — makes `test_uyir_u_elision_annotation` pass.

**Example**:

- Word: "நடு" (naṭu - ட் + உ) → elide உ → treated as ending in ட் (changes asai/talai).
- "அகரம் உலகு" → only the final உ of "உலகு" elided if after ற்/க் etc.

**In UI**: Annotate "உ (உயிர்-உ நீக்கம் • தொல்காப்பியம்)" with tooltip. High educational value for learners!

---

## 2. Full Parsing Pipeline (What User Sees)

1. **Input Text** → "அகர முதல எழுத்தெல்லாம்..."
2. **Letter Breakdown** (hidden): 247-char matrix classification.
3. **Syllable Builder** (with uyir-U fix): Groups into நேர்/நிரை with annotations.
4. **Foot Grouper**: Chunks into தேமா / புளிமா etc. (using traditional names for display).
5. **Talai Analyzer**: Checks bonds between feet.
6. **Metre Detector**: Matches pattern → "வெண்பா (குறள் வெண்பா)".
7. **Rich Output**:
  - Original text with syllable highlights.
  - Table: Foot | Type | Asai Count | Talai
  - Educational notes: "This line uses 2-asai feet with ven-talai — classic Venpaa!"
  - Warnings: "Uyir-U elision applied at position X"

**Educational Goal**: Learners see **why** a line is Venpaa, not just the label. References Tolkappiyam/Yapparungalam inline.

---

## 3. Key Rules Summary for Quick Reference (Human)


| Concept          | Human Rule                                                 | Classical Source            | Parser Impact                        |
| ---------------- | ---------------------------------------------------------- | --------------------------- | ------------------------------------ |
| Uyir-U Elision   | Word-final உ after க்/ச்/ட்/ப்/ற் → ignore உ               | Tolkappiyam Ezhuthathikaram | Only last char; annotate in display  |
| Ner vs Nirai     | Short crisp = நேர்; long/closed = நிரை (greedy நிரை first) | Yapparungalam               | Core of syllable_builder.rs          |
| 2-asai Feet      | Thema (N+N), Pulima (Ni+N), etc.                           | Yapparungalam               | Map to WordType enum for UI          |
| Ven Talai        | Specific sound match at foot junctions in Venpaa           | Tolkappiyam + Yapparungalam | talai.rs validation                  |
| Venpaa Structure | 4 lines × 4 feet + ven-talai + ethukai                     | Commentaries on Kurals      | metre.rs detector (currently naive!) |
| Sandhi           | Vowel/consonant merging at word joins                      | Tolkappiyam                 | Handled in ProsodicUnit stream       |


---

## 4. Common Poetry Examples (for Testing & UI)

**திருக்குறள் Example** (Kural 1):

- Text: அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு
- Expected: Venpaa, specific Ner/Nirai mix, Thema/Pulima feet, ven-talai at key spots.
- Uyir-U: "உலகு" ends with உ after க்? Wait, "கு" - yes, உ elided in scansion.

**Test Cases to Add**:

- Simple Ner: "அம்மா" → அம் (Nir?) + மா (Ner?)
- Elision: "படு" (paṭu) → elide உ, treat as "பட்"
- Full Venpaa line from Kural.

---

## 5. What This Means for Thepulimaangani UI/UX

- **Display Layer** (`presentation.rs`): Convert machine enums → beautiful Tamil labels + explanations.
- **Tooltips**: Hover on "நிரை" → "நீண்ட உயிர் அல்லது மூடிய அசை (2 மாத்திரை) — யாப்பருங்கலம் படி"
- **Annotations**: "உயிர்-உ நீக்கம் (தொல்காப்பியம் எழுத்ததிகாரம்)" 
- **Educational Mode**: Toggle "Show Classical References" linking to sources.
- **Avoid**: Hard-coding "always Venpaa" — make metre detection smart!

This human-friendly layer makes the powerful Rust parser accessible to students, poets, and scholars while staying true to Amitasagaran and Tolkappiyar.

*Next*: See MACHINE_FIRST_TECHNICAL_GRAMMAR.md for the "machine brain" implementation.