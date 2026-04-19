# 01. Avalokitam Main Analyzer - Input & Options Page

**Corresponding Live URL**: https://www.avalokitam.com/ or /analyzer  
**Component(s)**: src/pages/Index.vue (main container)  
**Purpose for Coding Agents**: Replicate the primary input interface exactly. This is the entry point for all users. Must support Tamil Unicode input, real-time or on-submit analysis via Rust WASM, and the three key options that affect parsing behavior.

## Header
- **Title**: Avalokitam (அவலோகிதம்)
- **Tagline**: யாப்பு மென்பொருள் (Prosody Software)
- **Menu Icon**: "*menu*" (opens navigation to Learn, Types, Search, language, about, or GitHub link)

## Input Area
**Section Label**: பா உள்ளிடும் வழிமுறைகள் (Poem Input Methods)

- **Textarea**: Large, resizable, placeholder text in Tamil encouraging users to paste classical or original verses. Supports multi-line (full stanzas or multiple verses). Auto-detects or trims punctuation as per original preprocessing (tam2lat + splitText in PHP).

**Special Features**:
- Paste from clipboard button (inferred modern UX).
- Example verses button (loads pre-loaded classical examples like from Thirukkural or Sangam poems, with one-click "Try this" that triggers analysis).

## Analysis Options (Checkboxes - Critical for WASM Options Object)
These directly map to parameters passed to the parser:

1. **யாப்புறுப்புக்களை மட்டும் வெளியிடவும்**  
   - English: "Display only prosody elements"  
   - Effect: Filters output to show only the six elements (eluttu, acai, seer, talai, ati, todai). Hides raw text or non-prosodic annotations.  
   - WASM Flag: `onlyProsody: true`

2. **பாவினை கண்டறிய வேண்டாம்**  
   - English: "Do not detect the poem" / "Skip metre identification"  
   - Effect: Bypasses full pāvakai (metre type) detection and some rule checks (e.g., CheckVenpaa). Useful for partial verses or learning mode.  
   - WASM Flag: `noDetect: true`

3. **மாறுபட்ட அலகிடல்**  
   - English: "Alternative scansion" or "Different unit division"  
   - Effect: Uses variant phonological rules for syllable splitting (e.g., different handling of uyir-U after k/c/T/p/R, or cluster boundaries). Important for ambiguous classical Tamil where multiple valid scansions exist.  
   - WASM Flag: `altScansion: true`  
   - **Special Hinted Annotations**: When enabled, the output highlights alternative split points with dashed lines, tooltips explaining "Alternative: treat this 'u' as non-syllabic due to following consonant cluster" or "Standard split here; alt split merges into nirai".

**Analyze Button** (inferred prominent button, perhaps with icon): Triggers WASM parse_poem(inputText, options) and renders results in the chosen view.

## Additional Controls (Global)
- Font size / zoom for Tamil text readability.
- Dark mode toggle (Quasar supports; new version should too).
- Export current analysis (JSON, PNG of visual scansion, plain text report).

## Special Hinted Annotations for Syllable Splits (Key Feature)
In all views, but especially visible after analysis:
- **Ner (நேர்)**: Single short or long unit — highlighted with solid underline or color (e.g., blue).
- **Nirai (நிரை)**: Two-unit compound — bracketed or connected with arc.
- **Special Cases with Hints** (tooltips or inline badges):
  - **uyir-U after k/c/T/p/R**: "This 'u' is often elided in classical pronunciation — click for alt split".
  - **Consonant clusters (e.g., 'nt', 'mp')**: "Split here per standard rule; alt merges for poetic license".
  - **Sandhi / joining rules**: Visual indicator when two words merge across feet.
  - **Vikalpa (alternative)**: When altScansion is on, shows "2 possible splits — standard (solid) vs alt (dashed)" with percentage or rule reference.
- **Implementation in New Stack**: In React, use <span> with data-annotation attributes + CSS for highlights + shadcn/ui Tooltip or Popover for hints. Pass the full parse tree from WASM so frontend can render annotations dynamically.

## Example Usage Flow (for Testing)
1. Input: A short Venpaa quatrain.
2. Check "மாறுபட்ட அலகிடல்".
3. Analyze → View switches to அசை/சீர் → See hinted alt splits on specific syllables.
4. Switch to தளை → Lines show talai bonds with special notes if rules are borderline.

**For Coding Agents**: Make the input area the hero of the landing. Pre-load 3-5 famous examples (with "Load Example" buttons) that demonstrate special syllable split cases. This page must feel instant and culturally authentic.

**Next Pages in Series**:
- 02. எழுத்து (Letter) View
- 03. அசை/சீர் (Acai/Seer) View — includes detailed syllable split annotations
- ... (see other files)

*Extracted & expanded from live site UI (April 2026), original PHP logic, and component structure.*