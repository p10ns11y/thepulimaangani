# 08. Learn / Lessons Page (அடிப்படை யாப்பிலக்கணம் / Basic Prosody Lessons)

**Historical URL**: https://www.avalokitam.com/learn (integrated or accessible via menu in current SPA)  
**Component(s)**: RuleList.vue + educational sections in Scansion* and main Index.vue  
**Purpose for Coding Agents**: This is the **educational heart** of Avalokitam. Rebuild as a dedicated route (/learn) or tabbed section with interactive lessons on the 6 elements, syllable splitting rules, special annotations, and metre identification. Include quizzes or "try it yourself" that call the WASM parser.

## Page Structure
- **Header**: "யாப்பிலக்கணம் கற்க" (Learn Prosody) or "அடிப்படை யாப்பு பாடங்கள்"
- **Navigation within Learn**: Tabs or accordion for each of the 6 elements + "Special Cases & Annotations" + "Metre Types (பாவகைகள்)" + "Interactive Exercises".

## Lesson 1: எழுத்து (Eluttu - Letters)
- **Definition**: The smallest unit — individual Tamil letters (uyir, mei, uyirmei, aaytham).
- **Key Concepts**:
  - Matra (mātra) counting: Short vowels = 1, long = 2, etc.
  - Classification: உயிர் (vowels), மெய் (consonants), உயிர்மெய் (consonant+vowel), ஆய்தம்.
- **Special Annotations/Hints**:
  - "ஆய்தம் (ḥ) is usually not counted as a full letter in scansion."
  - Visual: Table or grid showing letter → matra value, with examples from input.
- **Interactive**: Click letter in verse → highlights its classification and matra contribution.

## Lesson 2: அசை (Acai - Metremes / Syllables)
- **Core Rule**: அசை = basic rhythmic unit.
  - **நேர் (Ner)**: One mātra (or equivalent). Examples: க, கா, கி, கீ.
  - **நிரை (Nirai)**: Two mātras combined (usually short + short or specific patterns).
- **Special Hinted Annotations for Syllable Splits** (Detailed):
  - **uyir-U Elision (most important special case)**: After consonants க், ச், ட், ப், ற் — the following short 'u' (உ) is often **not** counted as starting a new acai in classical scansion. 
    - Hint example: "கற்ற → க(நேர்)ற்ற(நிரை) | 'து' u after ற் → elided in standard; alt: full nirai if poetic emphasis".
    - Visual: Dashed underline or "U-elide" badge + tooltip with rule quote from Yapparungala or original PHP GetLetterCount / GetTextSyllablePattern.
  - **Cluster Rules**: "nt", "mp", "nk", "ñc" — split before or after depending on context. Hint: "Standard split before nasal cluster per Tamil prosody treatises".
  - **Long Vowel + Consonant**: "ā + consonant" often forms ner; hint shows matra math.
  - **Word Boundary Sandhi**: When two words join, the split may "borrow" a unit — annotated as "Sandhi merge: treat as single nirai for flow".
- **Examples with Annotations**:
  - Verse snippet with 3-4 syllables highlighted, each with expandable "Why this split?" panel explaining the exact phonological condition.
- **Exercise**: "Split this word into acai" — user drags or clicks, WASM validates in real-time, shows hint if wrong.

## Lesson 3: சீர் (Seer / Metrical Foot)
- **Definition**: 2–4 asais grouped into traditional named feet.
- **Full List** (exact from original PHP WordType — port as const Map in Rust):
  - 2-asai: tEmA (ner+ner), puLimA (nirai+ner), kUviLa_m (ner+nirai), karuviLa_m (nirai+nirai)
  - 3-asai Kay: tEmA_GkA_y, puLimA_GkA_y, kUviLa_GkA_y, karuviLa_GkA_y
  - 3-asai Kani: tEmA_GkaVi, etc.
  - 4-asai Tanpuu / naRumpU / naRunizhal / Tannizhal variants (full 8+ combinations).
- **Special Annotations**:
  - "This foot is a 'tEmA_nta_NpU' (4-asai Tanpuu type) — common in longer lines".
  - "Last foot in Venpaa must follow special rule (nA_L / mala_r / kAcu / piRa_ppu)".
- **Interactive**: Drag syllables to form feet → auto-names the foot + validates against rules.

## Lesson 4: தளை (Talai - Linkage / Bond)
- **Definition**: The "bond" or rhythmic connection between consecutive feet.
- **Main Types**:
  - வெண்டளை (Ven-talai) — for Venpaa.
  - ஆசிரியத்தளை (Asiriya-talai).
  - Other traditional linkages.
- **Special Annotations**:
  - Visual leader lines between feet with label "வெண்டளை (strong bond)".
  - Hint: "This talai satisfies Venpaa rule because last acai of previous foot + first of next match X pattern".
  - "Broken talai detected — metre may be invalid or poetic license used".
- **Exercise**: Given feet, user predicts talai type → WASM checks.

## Lesson 5: அடி (Ati - Metrical Line)
- **Line Classes** (from original LineType & TolLineClass arrays):
  - kuRaLaTi (4 feet, short line)
  - ci_ntaTi (5-6 feet)
  - aLavaTi (7-10 feet)
  - neTiLaTi (longer)
  - kaZineTiLaTi variants up to 24+ feet.
- **Annotations**: "This line is kuRaLaTi — typical for Venpaa quatrain".
- **Special**: Last line rules, total line count validation.

## Lesson 6: தொடை (Todai - Ornamentation)
- **Types**: Alliteration (mōṉai), rhyme (etukai), etc.
- **Annotations**: Highlights repeating sounds across feet/lines with connecting arcs.

## "Special Cases & Advanced Annotations" Module (Dedicated Section)
- **uyir-U Detailed Rules** (full list of consonants that trigger elision).
- **Vikalpa (Alternatives)**: When multiple valid splits exist — shows "Primary (most common in Sangam) vs Secondary".
- **Error / Rule Violation Hints**: "This split violates basic ner/nirai formation — see Yapparungala rule X".
- **Classical vs Modern**: Toggle that shows how medieval vs modern Tamil might scan differently, with hints.

## Interactive Exercises & Quizzes
- "Identify the acai type" (multiple choice or click on verse).
- "Build a valid Venpaa line" — drag-and-drop feet, WASM validates talai + last syllable.
- "Find the special split" — highlights a verse with hidden annotation, user clicks the hinted syllable.
- Progress tracking (localStorage): "Lessons completed: 4/6".

## Implementation Notes for New Stack
- **Content Storage**: Hardcode lessons as Markdown or JSON in the app (or fetch from static /learn.json). Use React Markdown or MDX for rich text with embedded examples.
- **Interactivity**: Every example verse is live — clicking "Analyze this example" calls WASM and jumps to the relevant view with annotations highlighted.
- **Accessibility & i18n**: Full Tamil + optional English translations for rules (historical /help-en).
- **Visual Polish**: Use Framer Motion for animated splits, confetti on correct quiz answers, SVG for talai lines with labels.
- **Data from Original**: RuleList.vue likely contained the static explanations — replicate tone (educational, respectful of tradition, clear for learners).

**Why This Page Matters for the Rewrite**:
The original Avalokitam's strength is not just analysis but **teaching** the complex Tamil prosody system through interactive, annotated visuals. The "special hinted annotations for syllable splits" (uyir-U, clusters, sandhi) are the unique pedagogical feature — make them delightful and accurate in Rust + React.

**Cross-References**:
- All view pages (02–07) link back here for "Learn more about this rule".
- Types page (09) expands on metre-specific lessons.

*Compiled from site purpose ("features to enable learning Tamil prosody"), component names (RuleList, SyllableLegend), PHP logic comments, and traditional Tamil ilakkanam sources referenced in Avalokitam.*

**Next**: 09. Types / பாவகை Catalogue Page (full list of 23+ metres with examples and rules).