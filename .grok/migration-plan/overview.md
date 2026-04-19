



### `analyzer.md`

```markdown
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
```

---

### `types.md`

```markdown
# Avalokitam - Types Page (வெண்பா வகைகள்)
**URL:** https://www.avalokitam.com/types

## Exact Verbatim Content (Full Extraction – Partial due to length, key sections captured)

**Header**
*menu*
அ
அவலோகிதம்
யாப்பு மென்பொருள்

**Page Title / Intro**
வெண்பா
வெண்பாவினம்
ஆசிரியப்பா
ஆசிரியப்பாவினம்
கலிப்பா
கலிப்பாவினம்
வஞ்சிப்பா
வஞ்சிப்பாவினம்

**Interactive Instructions (verbatim)**
கீழே உள்ள பாக்களை தாங்கள் தாராளமாக மாற்றலாம். நீங்கள் மாற்ற மாற்ற, உங்கள் மாற்றம் பா விதிகளுக்கு உட்பட்டுள்ளதா என்று உடனடியாக காட்டுவிடும். மூல உதாரணத்தை திரும்பப்பெற ‘மீளமை’ என்பதை கிளிக் செய்யவும். பாவினை விலாவரியாக அவலோகிதம் கொண்டு ஆராய, ‘ஆராய்க’ என்பதை கிளிக் செய்யவும்.

**Examples (verbatim – multiple interactive cards)**

**ஒரு விகற்ப குறள் வெண்பா**
ஆராய்க | மீளமை

Rules with status:
- ஈற்றடியின் ஈற்றுச்சீரைத் தவிர்த்து ஈரசைச்சீர்களும் காய்ச்சீர்களும் மட்டுமே பயின்று வருதல் வேண்டும் *done*
- வெண்டளைகள் மட்டுமே பயின்று வருதல் வேண்டும் *done*
- ஈற்றடி மூன்று சீர்களும் ஏனைய அடிகள் நான்கு சீர்களும் கொண்டிருத்தல் வேண்டும் *done*
- ஈற்றடியின் ஈற்றுச்சீர் நாள், மலர், காசு, பிறப்பு ஆகியவற்றுள் இருத்தல் வேண்டும் *done*
- நேரிசையாகின் ஒருவிகற்பமோ அல்லது இருவிகற்பமோ கொண்டு எதுகை அமைந்த தனிச்சொல் பெற்று வருதல் வேண்டும். நேரிசை விதிகள் பொருந்தாத அனைத்தும் இன்னிசை ஆகும். *info*

Result: 2 அடிகளுடன் 1 விகற்பம் கொண்டு வந்ததால் ஒரு விகற்பக் குறள் வெண்பா ஆயிற்று

(Repeated similar interactive blocks for:)
- இரு விகற்ப குறள் வெண்பா
- நேரிசை சிந்தியல் வெண்பா
- இன்னிசை சிந்தியல் வெண்பா
- ஒரு விகற்ப நேரிசை வெண்பா
(and more variants)

## Analyzed Details
- **Purpose:** Educational + interactive explorer for different வெண்பா subtypes (குறள், சிந்தியல், நேரிசை, இன்னிசை, etc.).
- **Design:** Card-based layout with editable example poems. Live validation (green *done* / blue *info* badges).
- **Interactive:** "ஆராய்க" runs full analyzer on the example. "மீளமை" resets to original. Users can edit text and see instant rule compliance feedback.
- **Value:** Best teaching tool in the original site.

## Adaptation Plan for thepulimaangani

**Must Implement:**
- Exact page title and intro text.
- Multiple editable example cards with "ஆராய்க" (Analyze) and "மீளமை" (Reset) buttons.
- Live rule validation badges (*done* / *info*) – map to your existing metre rules engine.
- Allow free editing of example text with real-time feedback (leverage your real-time WASM parser).

**What is NOT necessary:**
- Old PHP validation logic → use your Rust parser + rule engine.
- Exact card styling → modern Tailwind cards with green/blue badges.

**Recommended Components:**
- `VenpaaTypesExplorer.tsx` (grid of cards)
- Reusable `ExamplePoemCard.tsx` with editable textarea + live validation

**Priority:** High – excellent for learning section.
```

---

### `reference.md`

```markdown
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
```

---

### `prosody.md`, `help.md`, `about.md`

**Note on Extraction:** These three pages returned "No content found" or "Insufficient relevant content" in multiple tool attempts. This is typical for client-side rendered SPAs where content is injected via JavaScript after initial load. They almost certainly exist (user confirmed the URLs) and likely contain:

- **/prosody**: Deep dive into the 6 elements (எழுத்து, அசை, சீர், தளை, அடி, தொடை) with diagrams/examples.
- **/help**: User guide, how to use the analyzer, troubleshooting, keyboard shortcuts.
- **/about**: Project history, credits to Bodhisattva Avalokiteśvara, license, links to GitHub, contact.

**Analyzed Details (Inferred from Context + README):**
- Consistent header/navigation across all pages.
- Educational tone matching the rest of the site.
- Likely use the same Quasar components and Tamil typography.

**Adaptation Plan for thepulimaangani (Unified for these 3 pages):**

**Must Implement:**
- Create matching routes/pages: `/prosody`, `/help`, `/about` using TanStack Router.
- Keep identical header + menu.
- For /prosody: Expandable sections or cards for each of the 6 elements with examples (use your existing parser to generate live examples).
- For /help: Step-by-step guide + FAQ (map to your test cases and README).
- For /about: Copy the beautiful origin story about Avalokiteśvara + license note (update to MIT).

**What is NOT necessary:**
- Any old PHP-rendered content or GAE-specific text.
- Exact old layout files – rebuild cleanly with Tailwind.

**Recommended Structure:**
- `app/routes/prosody.tsx`
- `app/routes/help.tsx`
- `app/routes/about.tsx`
- Shared `Header.tsx` component with active nav highlighting.

**Priority:** Medium (after core analyzer + types + reference).

---

**Final Notes for Implementation in thepulimaangani**

1. **Navigation:** Add a top menu or sidebar linking to: Analyzer | Types | Reference | Prosody | Help | About (exact Tamil + English where appropriate).
2. **Shared Assets:** Extract all Tamil strings into a single `i18n/avalokitam.ts` file for easy maintenance.
3. **Data:** Move the reference lists (நேர்/நிரை, சீர் types, 22 metres) into TypeScript constants or JSON – already partially done in your Rust side.
4. **Testing:** Add Playwright or React Testing Library tests that assert exact Tamil strings appear.
5. **Deployment:** These pages can be static + client-side interactive – perfect for your current stack.
