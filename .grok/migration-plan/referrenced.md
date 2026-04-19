# Avalokitam - Reference Page
**URL:** https://www.avalokitam.com/reference

## Exact Verbatim Content (Full Extraction)

**Header**
*menu*
அ
அவலோகிதம்
யாப்பு மென்பொருள்

**Toolbar (same as analyzer)**
*sort_by_alpha* எழுத்து
*line_style* அசை/சீர்
*link* தளை
*format_align_justify* அடி
*local_florist* தொடை
*traffic* பா/பாவின விதிகள்

**Core Reference Content (verbatim)**

⏑ நேர்
― நிரை

**நேர்** : குறில் (அ) நெடில் (அ) குறில் + ஒற்று (அ) நெடில் + ஒற்று

**நிரை** : குறில் + குறில் (அ) குறில் + நெடில் (அ) குறில் + குறில் + ஒற்று (அ) குறில் + நெடில் + ஒற்று

**நேர்பு** : நேர் + ஈற்றுகரம் (வெண்பாவின் ஈற்றசையில் மட்டும்)
**நிரைபு** : நிரை + ஈற்றுகரம் (வெண்பாவின் ஈற்றசையில் மட்டும்)

**ஈரசை**
⏑ ⏑ → தே மா
― ⏑ → புளி மா
⏑ ― → கூ விளம்
― ― → கரு விளம்

**மூவசை** (all 8 combinations with names: தேமாங்காய், புளிமாங்காய், கூவிளங்காய், etc.)

**நான்கசை** (all 16 combinations with full names: தேமாந்தண்பூ, புளிமாந்தண்பூ, ..., கருவிளநறுநிழல்)

**வெண்பா ஈற்றசை**
⏑ → நாள்
― → மலர்
⏑ ⏑ உ → காசு
― ⏑ உ → பிறப்பு

## Analyzed Details
- **Purpose:** Authoritative quick-reference for syllable (நேர்/நிரை), foot (சீர்), and special வெண்பா ending rules.
- **Design:** Clean, tabular/symbolic layout using Unicode prosody symbols (⏑ ―). Excellent for quick lookup while analyzing.
- **Strength:** Visual + textual explanation side-by-side.

## Adaptation Plan for thepulimaangani

**Must Implement (Exact Fidelity):**
- All symbols (⏑ ―) and exact Tamil explanations.
- Full lists of ஈரசை, மூவசை, நான்கசை with names.
- Special வெணபா ஈற்றசை section.
- Keep the toolbar (including new *traffic* "பா/பாவின விதிகள்" button).

**What is NOT necessary:**
- Nothing major – this is pure reference data. Store as JSON/constants in your repo for easy updates.

**Recommended:**
- `ProsodyReference.tsx` page or modal/sidebar component.
- Make it searchable/filterable (bonus over original).

**Priority:** Medium-High – essential companion to the analyzer.