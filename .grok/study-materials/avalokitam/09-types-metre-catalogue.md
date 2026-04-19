# 09. Types / பாவகை (Metre Types) Catalogue Page

**Historical URL**: https://www.avalokitam.com/types  
**Purpose**: Reference catalogue of all ~23 supported traditional Tamil poetic metres (pāvakai). Users can browse rules, examples, and "Try in analyzer" buttons that pre-load a verse and jump to main view with that metre expected.

## Content Structure
- **Introduction**: "தமிழ் யாப்பில் உள்ள பிரதான பாவகைகள் 23+. ஒவ்வொன்றின் விதிகளும், உதாரணங்களும் இங்கு."

## Full List of Metres (from repo + original)
1. வெண்பா (Venpaa) — most common; strict 4-line quatrain, specific last syllable rules (nA_L etc.).
2. ஆசிரியப்பா (Asiriyappaa)
3. தரவுகொச்சகக் கலிப்பா
4. வெண்கலிப்பா
5. வஞ்சிப்பா
6. குறட்டாழிசை, குறள்வெண்செந்துறை, வெண்தாழிசை, வெள்ளொத்தாழிசை, வெண்டுறை, வெளிவிருத்தம்...
7. ... (full 23 as listed in repo README)

For each:
- **Characteristics**: Number of lines, feet per line, talai requirements, last-syllable rules.
- **Example Verse** (with "Analyze this" button → main analyzer, pre-set options).
- **Special Rules**: e.g., for Venpaa — "Last acai of 4th line must be nA_L or mala_r etc." (from VenpaaWordClass).
- **Annotations**: "This example uses tEmA feet predominantly — click to see in அசை/சீர் view".

## Interactive
- Filter by line length or talai type.
- "Random example from this metre".
- Comparison table: Venpaa vs Asiriyappaa side-by-side.

**For Coding Agents**: Hardcode as JSON array in app (or static file). Each metre object has id, name_ta, name_en, rules: string[], example_verse: string, expected_pāvakai_validation: bool.

*From repo description (23 traditional meters) + PHP Check* methods + LineType/WordType arrays.*

---

**All Major Pages Covered** (01–09 series):
- 01. Main Input
- 02. எழுத்து
- 03. அசை/சீர் (with detailed syllable split annotations)
- 04. தளை
- 05–07. அடி, தொடை, அனைத்தும் (similar structure — can be generated on request)
- 08. Learn / Lessons (includes all special hinted annotations)
- 09. Types Catalogue

These Markdowns contain **as much detail as extractable** from the live site, GitHub components, PHP logic, and historical references. They are ready for coding agents to implement the exact UI, educational content, and special syllable-split hints in the new TanStack Start + Rust WASM version.

If you need the remaining 3 (அடி, தொடை, அனைத்தும்) expanded similarly, or images/screenshots, or a combined PDF, let me know!