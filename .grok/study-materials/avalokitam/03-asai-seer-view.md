# 03. அசை/சீர் (Acai / Seer / Metrical Foot) View Page

**Live Equivalent**: One of the main view modes in the analyzer (icon: line_style, label: அசை/சீர்)  
**Components**: SyllableLegend.vue, MetricalFeet.vue, DisplayFeet.vue / DisplayFeet2.vue / DisplayFeet3.vue, ScansionDisplay.vue (core renderer)  
**Purpose**: Detailed breakdown of syllables (அசை) into ner (நேர்) and nirai (நிரை), then grouped into named metrical feet (சீர் / cir). This is where **special hinted annotations for syllable splits** are most prominent.

## Page Title / Header
- **Main Label**: அசை / சீர் (Metreme / Metrical Foot)
- **Subtitle / Description** (inferred from educational intent): "அசை என்பது யாப்பின் அடிப்படை அலகு. நேர் மற்றும் நிரை என இரு வகைப்படும்."

## Input / Context (Inherited)
- Shows the original verse at top with current view highlighted.
- Options from main page (altScansion etc.) affect this view.

## Core Display: Syllable & Foot Breakdown

### 1. Syllable Level (அசை)
- **Types**:
  - **நேர் (Ner / nE_r)**: Single unit (short or long vowel/matras). Color: Blue or solid underline.
  - **நிரை (Nirai / nirY)**: Two units combined. Color: Green or bracketed.
  - **Special Variants**: nE_rpu, nirYpu (with "pu" sound considerations).

**Special Hinted Annotations for Syllable Splits** (Critical Feature):
- **Visual Indicators**:
  - Vertical bar | or · between letters showing split point.
  - Color gradient or badge on the split: "Standard split" vs "Alt split (uyir-U elided)".
  - Tooltip on hover: "This 'u' after 'க' is treated as non-syllabic in classical Tamil (rule: post-velar short u often drops in scansion). Alt: count as full nirai."
- **Common Special Cases Highlighted**:
  - **uyir-U Rule**: After k, c, T, p, R — the following 'u' may not form a full acai. Hint badge: "uyir-U elision possible — click for alt".
  - **Cluster Boundaries**: "nt", "mp", "nk" — split rules vary; hint shows "Standard: split before cluster" with reference to original regex in PHP (GetTextSyllablePattern).
  - **Long Vowel vs Short**: Matra count shown inline (e.g., "ā = 2 matras → ner").
  - **Sandhi Join**: When two words' syllables merge across word boundary, dashed line + "Sandhi: treat as single nirai for poetic flow".
- **Annotation Format in UI** (for new implementation):
  - Each syllable span has `title` or `data-hint` attribute.
  - Popover or bottom panel: "Rule Reference: See Yapparungala for nirai formation... " (link to internal lesson).
  - When altScansion=true: Two parallel parses side-by-side or toggle, with % confidence or "Vikalpa: 2 valid splits".

### 2. Foot Level (சீர் / cir)
- Groups 2–4 asais into traditional named feet.
- **Examples from Original WordType Array** (exact from PHP, port to Rust const):
  - 2 asais: nE_rnE_r → tEmA ; nirYnE_r → puLimA ; nE_rnirY → kUviLa_m ; nirYnirY → karuviLa_m
  - 3 asais (Kay seers): nE_rnE_rnE_r → tEmA_GkA_y , etc.
  - 3 asais (Kani seers): nE_rnE_rnirY → tEmA_GkaVi
  - 4 asais (Tanpuu, naRumpU, naRunizhal, Tannizhal variants): Full list in original (tEmA_nta_NpU, puLimA_nta_NNiZa_l, etc.).
- **Display**: Each foot in a box or connected group. Name badge (e.g., "tEmA"). Hover shows composition (e.g., "ner + ner").

**Special Annotations**:
- "This foot follows Venpaa last-syllable rule (nA_L / mala_r / kAcu / piRa_ppu)".
- "Alternative foot grouping possible under altScansion".

## Legend / Key (SyllableLegend.vue)
- Visual key for ner/nirai colors, split symbols, special hint icons.
- Short explanations: "நேர் = ஒரு அலகு | நிரை = இரு அலகுகள் இணைந்தது".
- "Click any split for detailed phonological rule".

## Interaction & Educational Layer
- Click any syllable or foot → Opens side panel or modal with:
  - Full rule explanation (from lessons).
  - Audio pronunciation hint (future: Web Speech API for Tamil).
  - "Related lesson: அசை வகைகள்" (links to Learn page).
- "Why this split?" button → Shows the exact regex or Rust logic path used.

## Example Output (Typical for a Venpaa Line)
Input line: "கற்றது கைம்மண் அளவு" (example)
- Breakdown: க(நேர்)ற்ற(நிரை)து(நேர்) | கை(நேர்)ம்(நிரை)மண்(நேர்) | அ(நேர்)ள(நிரை)வு(நேர்) ...
- With hints: On "து" → "uyir-U after ற் — standard ner; alt possible as part of previous nirai in some readings".

**For Coding Agents (Rust WASM + React)**:
- WASM returns detailed Syllable[] with `splitHint: string | null`, `altSplit: boolean`, `ruleRef: string`.
- Frontend: Use React Aria or shadcn Tooltip + Framer Motion for smooth highlight on hover.
- Store full parse tree in TanStack Query or Zustand for instant view switching without re-parsing.
- Accessibility: ARIA descriptions for each annotation ("Syllable split: ner, uyir-U elision hint active").

**Special Notes for Fidelity**:
- Original uses hierarchical parse tree (ProsodyParseTree → GetTextSyllablePattern).
- New version must match exact foot names and split logic for compatibility with classical texts.
- "Special hinted annotations" are the key differentiator — make them beautiful and informative (tooltips, color, expandable).

This view is central to the "learning" aspect of Avalokitam.

**Related Files in Series**:
- 02. எழுத்து View (letter-level matra counting)
- 04. தளை View (linkages between these feet)
- 08. Learn / Lessons (deeper explanations of these rules)

*Compiled from live UI labels, original PHP arrays (WordType, SyllableTypes), component names, and Tamil prosody rules.*