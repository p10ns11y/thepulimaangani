# Avalokitam - Analyzer Page

**URL:** https://www.avalokitam.com/analyzer  
**Purpose:** Main interactive Tamil prosody analyzer tool.

## Exact Verbatim Content (Full Extraction)

**Header / Navigation**
*menu*
அ
அவலோகிதம்
யாப்பு மென்பொருள்

**Input Section**
*input*
பா உள்ளிடும் வழிமுறைகள்

Checkboxes:
- யாப்புறுப்புக்களை மட்டும் வெளியிடவும்
- பாவினை கண்டறிய வேண்டாம்
- மாறுபட்ட அலகிடல்

**Sort / View Toolbar**
*sort_by_alpha* எழுத்து
*line_style* அசை/சீர்
*link* தளை
*format_align_justify* அடி
*local_florist* தொடை
*info* அனைத்தும்

**Additional Observed Elements**
- Large textarea / input area for pasting Tamil poetry (பா)
- Dynamic analysis output panel (updates on parse)
- Hierarchical or grouped display of the 6 prosody elements
- Real-time or on-demand parsing via backend

## Analyzed Details (Design & Layout)
- **Layout:** Classic SPA two-column (or stacked on mobile): Left/Top = Input + Options, Right/Bottom = Toolbar + Analysis Output.
- **Design:** Clean Material/Quasar style, Tamil-first, high contrast for readability. Icons are Material Icons. Responsive, mobile-friendly.
- **Interactive:** Checkboxes toggle output modes. Toolbar buttons switch the grouping/sorting of the analysis results (e.g., view everything by letter, by foot, by line, etc.).
- **Key Strength:** Multiple orthogonal views of the same analysis – extremely powerful for scholars.

## Adaptation Plan for https://github.com/p10ns11y/thepulimaangani

**Must Implement (High Fidelity):**
- Exact Tamil labels and checkbox text (copy-paste verbatim).
- Input textarea + the three checkboxes with identical behavior.
- Six toolbar buttons/icons that switch analysis view modes (use React state + TanStack to re-render the output grouped by எழுத்து / அசை/சீர் / தளை / அடி / தொடை / அனைத்தும்).
- Full support for all 6 elements + 22 metres (already partially in Rust WASM – expand to exact list).

**What is NOT necessary:**
- Old PHP backend calls → use existing Rust WASM.
- Quasar components → replace with Tailwind + shadcn/ui or Radix equivalents.
- Exact icon names → use matching Lucide icons (sort, align-justify, link, flower, info).

**Recommended Components:**
- `AnalyzerInput.tsx` (with checkboxes)
- `ProsodyToolbar.tsx` (6 mode buttons)
- `AnalysisOutput.tsx` (switchable views using existing parser output)

**Priority:** Highest – this is the core experience users expect.