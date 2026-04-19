# Avalokitam.com - Main Analyzer Page (Tamil Prosody Analyzer)

**URL**: https://www.avalokitam.com/ (redirects to /analyzer)  
**Purpose**: Interactive web-based Tamil prosody (யாப்பு / yāppu) analyzer. Users input classical Tamil verses (பா), and the tool performs detailed scansion and metre identification according to traditional Tamil prosody rules (Tamil ilakkanam / இலக்கணம்). It breaks down the verse into the six fundamental elements and identifies the poetic metre (பாவகை / pāvakai). Includes options for learning and alternative analyses. Built with Quasar (Vue.js) frontend + PHP backend (original).

**Note for Coding Agents (2026 Rewrite)**: This is a Single-Page Application (SPA). All "pages" or views are client-side rendered within this interface. The new TanStack Start + Rust WASM version should replicate this UX closely, with the heavy parsing moved to client-side WASM for offline/privacy. Use exact Tamil labels and terminology below for authenticity. Visual output uses scansion highlighting, colour-coding for different elements, and connection lines (likely Leader-line.js for talai linkages).

---

## Header / Navigation
- **Logo/Title**: "Avalokitam" (அவலோகிதம்)
- **Subtitle**: "யாப்பு மென்பொருள்" (Prosody Software)
- **Menu**: "*menu*" (hamburger or dropdown; likely contains links to Learn section, Types, Search, About, or language toggle — historically included /learn and /types)
- **Language/Other**: Possibly English help link (historical /help-en)

**Design Notes**: Clean, minimal, responsive (works on mobile as noted in old reviews). Tamil-first UI with Unicode support. Dark/light mode possible in modern Quasar.

---

## Main Input Section
**Label**: "பா உள்ளிடும் வழிமுறைகள்" (Poem Input Methods / Ways to input the verse)

- **Primary Input**: Large textarea for pasting or typing Tamil poetic text (supports multiple lines/verses).
- **Input Options (Checkboxes)**:
  1. **யாப்புறுப்புக்களை மட்டும் வெளியிடவும்** — "Display only prosody elements" (hides non-prosody text or focuses output on scansion).
  2. **பாவினை கண்டறிய வேண்டாம்** — "Do not detect the poem" (skip full metre/pāvakai identification; useful for partial or experimental input).
  3. **மாறுபட்ட அலகிடல்** — "Alternative scansion" or "Different unit division" (uses variant rules for syllable/foot parsing; important for ambiguous classical verses).

**Usage Flow**:
1. User pastes Tamil verse (e.g., from Sangam or medieval poetry).
2. Adjusts checkboxes for desired output focus.
3. Clicks "Analyze" (inferred button; original PHP processes via POST to phpbackend/api.php returning XML).
4. Results render visually.

**Example Input** (typical from tool's purpose): Classical Tamil quatrains (வெண்பா etc.).

---

## View / Display Controls (Tabs or Icon Buttons)
These control the granularity and type of scansion visualization. Represented with Material Icons + Tamil labels (exact labels from UI):

- **எழுத்து** (eluttu) — Letter level (individual Tamil letters / graphemes, vowel/consonant analysis, matra count). Icon: sort_by_alpha or similar.
- **அசை/சீர்** (acai / seer or cir) — Metreme / Metrical Foot level. Breaks into ner (நேர்) and nirai (நிரை) syllables. Icon: line_style.
- **தளை** (talai) — Linkage / Bond between feet (e.g., வெண்டளை, ஆசிரியத்தளை). Visual lines connecting feet. Icon: link.
- **அடி** (ati) — Metrical Line / Verse line (groups feet into lines, determines line class like kuRaLaTi, ci_ntaTi, etc.). Icon: format_align_justify.
- **தொடை** (todai) — Ornamentation / Alliteration / Rhyme patterns or compound structures. Icon: local_florist.
- **அனைத்தும்** (all) — Full detailed view showing all six elements layered or in hierarchical tree (verse → lines → feet → syllables → letters). Icon: info.

**Implementation Note for New Stack**: Use tabs or segmented buttons in shadcn/ui. On selection, dynamically highlight/re-render the verse with appropriate colours, underlines, or SVG lines for talai. Output should support export (text, image, JSON).

---

## Output / Results Area (Inferred from Core Logic & Original Design)
The tool produces a **user-friendly visual display** of the prosodic analysis:

- **Hierarchical Breakdown**:
  - **எழுத்து (eluttu)**: Count and classification of letters (uyir, mei, uyirmei, etc.), total matras.
  - **அசை (acai)**: Ner (short/long single unit) vs Nirai (compound). Types like nE_r, nirY, nE_rpu, nirYpu.
  - **சீர் / Foot (cir)**: Combinations into named feet (e.g., tEmA, puLimA, kUviLam, karuviLam, and longer ones like tEmA_GkA_y, etc. — see original WordType array in PHP).
  - **தளை (talai)**: Linkage type between consecutive feet (e.g., வெண்டளை for Venpaa).
  - **அடி (ati)**: Full lines with line type classification (kuRaLaTi = 4 feet, etc. — see LineType array).
  - **தொடை (todai)**: Additional poetic ornaments.

- **Metre Identification (பாவகை / pāvakai)**:
  - Automatically detects one of ~23 traditional metres: வெண்பா (Venpaa), ஆசிரியப்பா (Asiriyappaa), தரவுகொச்சகக் கலிப்பா, வெண்கலிப்பா, வஞ்சிப்பா, etc.
  - Shows confidence or alternative possibilities (VikalpaCount in original).
  - For Venpaa specifically: special last syllable rules (VenLastSyllable), word class (nA_L, mala_r, kAcu, piRa_ppu).

- **Visual Features**:
  - Colour-coded syllables/feet.
  - Leader lines or arcs for talai connections.
  - Tree view or indented structure for parse tree.
  - Error highlighting if metre rules violated (MetreErrors array).
  - Total letter count, vikalpa count.

- **Learning / Educational Overlays**: Hover or click on any element shows explanation of the prosody rule (e.g., "This is a tEmA foot because..."). Historical /learn section provided basic ilakkanam lessons.

**Output Format (Original Backend)**: PHP returns XML (parsed by frontend with xml2js). New version should output clean JSON from Rust WASM for easy React rendering.

---

## Supported Metres & Prosody Rules (Key for Backend/WASM Port)
From original implementation and public descriptions:
- 23+ traditional Tamil poetic forms (pāvakai).
- Core algorithm: Rule-based, regex phonological patterns, hierarchical parse tree (verse → lines → feet → syllables).
- Special handling for classical Tamil phonology (e.g., uyir-U modifications, consonant clusters).
- Alternative scansion mode for ambiguous cases.

**Exact Data Structures (ported from PHP for Rust WASM)**:
- SyllableTypes: ["nE_r", "nirY"]
- WordType / Foot names: tEmA, puLimA, kUviLa_m, karuviLa_m, and extended 3/4 asai variants (tEmA_GkA_y, etc.).
- VenpaaWordClass, LineType classifications (kuRaLaTi for short lines, neTiLaTi for longer, etc.).
- Full metre checkers: CheckVenpaa(), CheckAsiriyappa(), etc.

**For Coding Agents**: Replicate in Rust using serde structs for ParseResult, Syllable, Foot, Line, etc. Use unicode-segmentation + custom Tamil rules (or port regex from original). See MenYappu C# port as secondary reference for logic.

---

## Additional / Historical Features (to Re-implement)
- **Learning Mode** (integrated or /learn): Basic lessons on eluttu, acai, seer, talai, ati, todai + exercises with instant feedback.
- **Types Explorer** (/types): Catalog of all supported pāvakai with rules, examples, and "try this metre" buttons.
- **Word Search** (/search): Search prosody-related terms or example verses.
- **Mobile Responsive**: Fully functional on phones/tablets; layout adapts (Quasar responsive).
- **Offline/PWA**: Original supports offline ZIP; new version should be fully client-side WASM for true offline use.
- **Export/Share**: Results as image, text, or structured data.

---

## Technical Notes for Rewrite (TanStack Start + Rust WASM)
- **Frontend**: Replicate exact Tamil labels, icons (use lucide-react or heroicons matching Material), responsive grid/flex layouts with Tailwind + shadcn/ui (Tabs, Checkbox, Textarea, Button).
- **State Management**: TanStack Router for any future multi-view (e.g., /analyzer, /learn, /types as routes, even if SPA).
- **WASM Integration**: Load avalokitam-parser.wasm on demand. Expose `parse_poem(tamil_text: string, options: {onlyProsody?: bool, noDetect?: bool, altScansion?: bool}) -> ParseResult`.
- **Performance**: Client-side only → instant feedback, no server. Bundle <2MB target.
- **Accessibility**: Proper Tamil font support (Noto Sans Tamil or similar), ARIA labels, keyboard navigation.
- **Examples to Seed**: Include 5–10 classic verses (e.g., from Thirukkural, Sangam) with pre-computed analysis for demo mode.

---

## Known Limitations of Current Site (for Improvement in Rewrite)
- Heavy reliance on backend (original PHP); new version fully offline.
- Limited English UI (Tamil-primary); consider bilingual toggle.
- Old deployment (GAE); new = static + CDN (Netlify/Cloudflare).
- Visuals could be enhanced with modern Canvas/SVG for scansion.

**Source References**:
- Live site: https://www.avalokitam.com/analyzer
- Original GitHub: https://github.com/virtualvinodh/avalokitam (phpbackend/parsetreeclass.php, yapparungalaparsetree.php)
- C# port reference: https://github.com/rajajhansi/MenYappu (good for rule logic)

---

*This Markdown is the primary reference document for the coding agents rebuilding Avalokitam in 2026. All UI text, labels, flow, and prosody terminology must match exactly for cultural and functional fidelity.*

**Generated**: April 19, 2026 | For internal use in Avalokitam rewrite project.