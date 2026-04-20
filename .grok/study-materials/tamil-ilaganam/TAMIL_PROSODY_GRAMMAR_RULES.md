# Tamil Prosody (யாப்பு இலக்கணம்) - Comprehensive Grammar Rules

**Compiled from Classical Sources**  

- **யாப்பருங்கலம்** (Yapparungalam) by அமிதசாகரன் (Amitasagaran): Primary authority on segmentation (அலகிடல்), foot classification, and metre rules.  
- **யாப்பருங்கலக் காரிகை** (Yapparungalakkarigai) by அமிதசாகரன்: Concise summary with examples of அலகிடல் (scansion).  
- **தொல்காப்பியம் - எழுத்ததிகாரம்** (Tolkappiyam - Ezhuthathikaram) by தொல்காப்பியர்: Foundational rules for letters (எழுத்து), syllables, uyir-U elision, and phonetic classification.  
- **பிங்கலந்தை** (Pingalandai) by பிங்கலன்: Additional conventions for segmentation, word boundaries, and poetic license.  
- **திருக்குறள் Commentaries** (Various, e.g., பரிமேலழகர்): Practical application of rules to குறள் வெண்பா, showing real-world scansion examples.

**Date Compiled**: April 20, 2026  
**Purpose**: Single source of truth for Tamil prosody rules, for both human scholars and machine parsers. References Tolkappiyam (~~1st-3rd century CE) and later Yapparungalam tradition (~~10th century).

---

## 1. Basic Building Blocks (அடிப்படை அலகுகள்)

### 1.1 எழுத்து (Ezhuttu - Letters/Phonemes)

Tamil has **247 characters** (as per modern Unicode + classical):

- **உயிர் எழுத்துகள் (Uyir Ezhutukkal - Pure Vowels)**: 12  
அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ  
  - Short vowels (குறில்): அ, இ, உ, எ, ஒ (1 mātrā)  
  - Long vowels (நெடில்): ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ (2 mātrā)  
  - Diphthongs: ஐ, ஔ
- **மெய் எழுத்துகள் (Mei Ezhutukkal - Pure Consonants)**: 18  
க், ங், ச், ஞ், ட், ண், த், ந், ப், ம், ய், ர், ல், வ், ழ், ள், ற், ன்  
  - Plosives (வல்லினம்): க், ச், ட், த், ப், ற் (hard stops)  
  - Nasals (மெல்லினம்): ங், ஞ், ண், ந், ம், ன்  
  - Semivowels/Liquids (இடையினம்): ய், ர், ல், வ், ழ், ள்
- **உயிர்மெய் எழுத்துகள் (Uyirmei - Vowel-Consonant Compounds)**: 12 × 18 = **216**  
Formed by matrix: e.g., க + அ = க, க + ஆ = கா, etc. (inherent 'a' for short).
- **ஆய்தம் (Aaytham)**: ஃ (special ½ mātrā character, often glottal or emphatic).

**Classification (Tolkappiyam Ezhuthathikaram)**:  

- Vowels classified by length and quality.  
- Consonants by place of articulation (velar, palatal, retroflex, dental, labial, etc.) and manner (stop, nasal, etc.).  
- No independent 'h' or other sounds; all are accounted in the 247.

**Sandhi Rules (Punarchi - இணைப்பு)**: Critical for word boundaries in poetry.  

- Vowel sandhi (உயிர் இணைப்பு): e.g., அ + ஆ = ஆ (elision or coalescence).  
- Consonant sandhi: Doubling, assimilation (e.g., க் + க் = க்க).  
- Uyir-U special case (see below).

**Section 1.2 அசை (Asai)** (full replacement):

### 1.2 அசை (Asai - Metremes / Prosodic Syllables)

The core unit of rhythm. Two types (precise classification aligned with `syllable_builder.rs` + classical sources):

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

** Looks fine but not allowed to form syllable **

1. காபூ (two long units) not allowed to form syllable -> கா | பூ -> **நேர் நேர்**
2. காதி (long unit short unit) not allowed ->  கா | தி -> **நேர் நேர்**

The above two combination looks similar to   
2.  ககா (one short unit one long unit) - 3 **mātrā**  
But not allowed

### 1.3 சீர் (Cir / Foot)

Groups of 2, 3, or 4 அசை (asai). Traditional names (from Yapparungalam):

- **2-asai feet** (most common in Venpaa):  
  - தேமா (Thema): நேர் + நேர் (e.g., "தே + மா")  
  - புளிமா (Pulima): நிரை + நேர் (e.g., "புளி + மா")  
  - கூவிளம் (Kuvilam): நேர் + நிரை  
  - கருவிளம் (Karu vilam): நிரை + நிரை
- **3-asai feet** (Asiriyappaa, etc.):  
  - தேமாங்காய் (Themangai), etc. (more complex names).
- **4-asai feet** (Kalippaa): Even longer combinations.

**WordType Mapping**: In practice, feet often align with word boundaries, but poetry allows crossing (enjambment via talai).

**Segmentation (அலகிடல் - Alagidal)**: From Yapparungalam - rules for dividing text into asai without violating word integrity where possible, but poetry permits flexibility. Greedy நிரை-first preferred in many contexts.

### 1.4 தளை (Thalai - Linkage / Bond)

How feet connect across boundaries. Determines "flow" or "break".

Types (key for metre validation):

- **வெண்தளை (Ven Thalai)**: "White bond" - specific consonant/vowel matching at foot junction (e.g., for Venpaa).  
- **ஆசிரியத்தளை (Asiriya Thalai)**: For Asiriyappaa.  
- **கலித்தளை (Kali Thalai)**: For Kalippaa.  
- Others: புகை, etc.

**Rule**: The ending sound of one foot and starting of next must match certain phonetic classes (vallinam, mellinam, idaiyinam) or specific letters. Tolkappiyam has precise tables.

### 1.5 அடி (Adi - Metrical Line)

A line of poetry, typically 4 feet (in Venpaa: 4 cir per line).  

- Venpaa: 4 lines × 4 feet, with specific talai at end of 3rd and 4th.  
- Total mātrā per line often ~16-20, but structure > count.

### 1.6 தொடை (Todai / Totai - Ornament / Alliteration)

- **எதுகை (Ethukai)**: Rhyme at line ends (last syllable of each line rhymes).  
- **மோனை (Monai)**: Alliteration at start of feet or lines.  
- **இயைபு (Iyai pu)**: Internal assonance.  
Not core to metre but essential for classical beauty.

---

## 2. Critical Special Rules

### 2.1 உயிர்-உ எழுத்து நீக்கம் (Uyir-U Elision) - Tolkappiyam Origin

**Rule** (Ezhuthathikaram ~ sutras 100-110):  
When a **word ends** with short **உ (u)** **immediately after** one of the plosive consonants **க், ச், ட், ப், ற்**, that final உ is **prosodically weak** and **elided** (ignored in scansion).  

- The preceding consonant "absorbs" the u, making the syllable end on the consonant (often making it நேர் or affecting talai).  
- **Only applies to the LAST character of the word** (not internal).  
- **Phonetic reason**: In spoken ancient Tamil, final short u after stops became devoiced/weak (like schwa deletion). Grammarians formalized for poetry to allow flexibility in metre fitting.  
- **Example**: Word "மகன்" (makan) or "பொருள்" wait, more like "அகம்" but specific: e.g., "குரு" if ends with u after plosive? Standard examples in commentaries: words like "நடு" (natu - ட் + உ), the உ is elided, so treated as ending in ட்.  
- **In parser**: Annotate only the final ProsodicUnit if it matches Vowel(u) after specific Consonant.

**Status in Classical Texts**: Strictly observed in Sangam and later poetry for accurate scansion.

### 2.2 Other Elision & Sandhi in Poetry

- **Uyir Elision**: General vowel coalescence at word junctions (e.g., "அ + ஆ = ஆ").  
- **Mei Doubling**: Consonants double across boundaries in some metres.  
- **Poetic License (Pingalandai)**: Poets may stretch rules for euphony, but core scansion follows Yapparungalam strictly for classification.

### 2.3 Metre-Specific Rules (from Yapparungalam + Commentaries)

- **வெண்பா (Venpaa)**: 4 lines, each 4 feet (mostly 2-asai). Strict ven-talai at specific positions. Last foot often "நாள்" or special. Example: திருக்குறள்.  
- **ஆசிரியப்பா (Asiriyappaa)**: Longer lines, 3-5 asai feet, asiriya-talai. Used in epics like சிலப்பதிகாரம்.  
- **கலிப்பா (Kalippaa)**: 4-asai feet dominant, kali-talai. Dance-like rhythm.  
- **வஞ்சிப்பா (Vanjippaa)**, **மருட்பா (Marutpaa)**: Variants with specific foot counts and ornaments.

**Validation**: A valid metre must have correct number of feet per line, correct talai types at junctions, and ethukai/monai where required. No "always Venpaa" - must detect based on structure.

---

## 3. Segmentation Algorithm (அலகிடல்) - High-Level Human View

1. Split text into words (using space or punctuation, but poetry often continuous).
2. For each word: Convert to stream of ProsodicUnits (letters).
3. Apply uyir-U elision on last unit if applicable.
4. Build syllables greedily: Collect units into Ner or Nirai based on vowel length + following consonant.
5. Group syllables into feet (prefer traditional 2/3/4 asai patterns, using WordType for naming).
6. Analyze talai between feet.
7. Identify metre by line count, foot count, talai pattern, and rhyme.

**Common Pitfalls**: Tamil Unicode grapheme clusters (e.g., கா is one char but two units: க + ா). Must use proper iterator, not byte/string slice.

---

## 4. Practical Examples from திருக்குறள் Commentaries

- **குறள் 1**: "அகர முதல எழுத்தெல்லாம்..."  
Scansion: Breaks into specific Ner/Nirai, Thema feet, ven-talai, confirmed Venpaa.  
- Elision examples: Words ending in -கு, -சு, -டு, -பு, -று often elide u in scansion to fit metre.

**Sources for Examples**: Parimelazhagar commentary provides line-by-line அலகிடல்.

---

## 5. References & Further Reading

- Full Tolkappiyam text + commentaries.  
- Yapparungalam with examples (critical edition).  
- Modern: "Tamil Prosody" by Ulrike Niklas (detailed structural analysis).  
- Avalokitam original (PHP) for legacy logic.

This document forms the **authoritative rule set** for any Tamil prosody analyzer.

*End of General Rules*