# Thepulimaangani — UI Component Map

**Purpose**: Single source of truth for all React/TanStack Start components needed to deliver the full rich UI described in our per-page Markdown specs.  
**Owner**: Benjamin (Phase 2)  
**Status**: To be implemented on top of the existing solid TanStack Start foundation.  
**References**:
- `01-avalokitam-main-analyzer-input.md`
- `02-eluttu-letter-view.md`
- `03-asai-seer-view.md` (highest complexity — special annotations)
- `04-talai-linkage-view.md`
- `08-learn-lessons.md`
- `09-types-metre-catalogue.md`

**Guiding Principles**:
- Exact Tamil labels and cultural tone
- Special hinted annotations for syllable splits visible everywhere (uyir-U, clusters, sandhi, vikalpa)
- Real-time, no re-parse on view switch
- Beautiful, accessible, mobile-first (Tailwind + shadcn/ui + Framer Motion)
- Reusable annotation system (tooltip/popover with ruleRef from WASM)

---

## 1. High-Level Architecture

**Routing (TanStack Router)**:
- `/` or `/analyzer` → Main Analyzer (input + current view)
- `/learn` → Educational section
- `/types` → Metre catalogue
- Future: `/examples/:id`

**Global State** (lightweight — TanStack Query or simple Context + useState):
- `parseResult: ParseResult | null`
- `currentView: 'letter' | 'acai' | 'talai' | 'ati' | 'todai' | 'all'`
- `options: { onlyProsody, noDetect, altScansion }`
- `selectedExample?: string`

**Data Contract** (from WASM — must be finalized in Phase 1):
```ts
interface ParseResult {
  originalText: string;
  lines: Line[];
  metreType: string;
  letterCount: number;
  vikalpaCount: number;
  wordBond: string;
  errors: string[];
}

interface Line { feet: Foot[]; lineClass: string; }
interface Foot { syllables: Syllable[]; footType: string; }
interface Syllable {
  text: string;
  syllableType: 'Ner' | 'Nirai';
  splitHint?: string;      // e.g. "uyir-U elision after ற்"
  altSplit: boolean;
  ruleRef?: string;        // e.g. "Yapparungala 2.3"
}
```

---

## 2. Component Hierarchy (Recommended Structure)

```
src/
├── routes/
│   ├── __root.tsx                 # Layout + global nav (menu, dark mode)
│   ├── index.tsx                  # Main Analyzer page
│   ├── learn.tsx                  # Educational section
│   └── types.tsx                  # Metre catalogue
├── components/
│   ├── analyzer/
│   │   ├── MainInput.tsx              # Textarea + 3 options + Analyze button (01)
│   │   ├── ViewTabs.tsx               # Segmented control with exact Tamil labels
│   │   ├── ResultContainer.tsx        # Renders current view
│   │   ├── LetterView.tsx             # 02
│   │   ├── AcaiSeerView.tsx           # 03 — special annotations core
│   │   ├── TalaiView.tsx              # 04 — leader lines
│   │   ├── AtiView.tsx
│   │   ├── TodaiView.tsx
│   │   └── AllView.tsx                # Combined scansion
│   ├── shared/
│   │   ├── AnnotationTooltip.tsx      # Reusable popover for splitHint / ruleRef
│   │   ├── LeaderLine.tsx             # SVG or react-leader-line wrapper
│   │   ├── SyllableChip.tsx           # Clickable syllable with hint
│   │   ├── FootBox.tsx
│   │   └── ExampleLoader.tsx          # Pre-loaded classical verses
│   ├── learn/
│   │   ├── LessonAccordion.tsx
│   │   ├── SpecialAnnotationsModule.tsx
│   │   ├── InteractiveExercise.tsx    # Calls WASM live
│   │   └── ProgressTracker.tsx
│   └── types/
│       ├── MetreCard.tsx
│       └── ExampleButton.tsx
├── hooks/
│   ├── usePoemParser.ts           # Calls WASM + manages state
│   └── useAnnotation.ts           # Helpers for rendering hints
├── lib/
│   └── parseResult.ts             # Type definitions + helpers
└── data/
    ├── examples.json              # Pre-loaded verses with expected output
    └── metres.json                # 23+ pāvakai data (from 09)
```

---

## 3. Detailed Component Breakdown

### 3.1 Core Analyzer Components (Phase 2 Priority)

**MainInput.tsx** (01)
- Large textarea with Tamil placeholder
- Three checkboxes (exact labels from spec)
- "Parse Poem" button + "Load Example" dropdown
- Props: `onParse`, `options`, `setOptions`

**ViewTabs.tsx**
- Segmented control or tabs with **exact labels**:
  - எழுத்து | அசை/சீர் | தளை | அடி | தொடை | அனைத்தும்
- Syncs with `currentView` state
- Shows active view with subtle animation

**ResultContainer.tsx**
- Receives `parseResult` + `currentView`
- Conditionally renders the correct View component
- Passes annotation handlers

**LetterView.tsx** (02)
- Grid/flex of letter chips (text + type + matra)
- Total count at top
- Click → opens AnnotationTooltip with classification rule

**AcaiSeerView.tsx** (03 — Highest effort)
- Hierarchical display: syllables → feet
- Every syllable shows:
  - Ner/Nirai colour + badge
  - **Special hint badge** if `splitHint` exists (uyir-U, cluster, sandhi)
  - Clickable → AnnotationTooltip with full explanation + `ruleRef`
- Foot boxes with traditional names (தேமா, புளிமா, etc.)
- AltScansion toggle shows parallel "Standard vs Alternative" splits with dashed lines
- Uses `SyllableChip` + `FootBox`

**TalaiView.tsx** (04)
- Feet in horizontal sequence
- SVG leader lines between feet (or `react-leader-line`)
- Line label = talai type (வெண்டளை, ஆசிரியத்தளை, etc.)
- Colour: valid = green, broken = amber/red
- Hover on line → shows exact acai pair + rule

**AtiView.tsx / TodaiView.tsx / AllView.tsx**
- Follow same pattern as above (Line boxes, Ornament highlights, Full tree)
- AllView reuses other views in a scrollable or tabbed layout

### 3.2 Shared / Reusable Components

**AnnotationTooltip.tsx** (Critical for special annotations)
- Props: `hint`, `ruleRef`, `isAlt`
- Beautiful popover (shadcn/ui + Framer Motion)
- Shows: explanation text, rule reference, "See full lesson" link
- Used everywhere a `splitHint` or annotation exists

**LeaderLine.tsx**
- Wrapper for dynamic SVG lines between feet
- Configurable colour, curvature, label

**SyllableChip.tsx** & **FootBox.tsx**
- Consistent styling + click handlers for annotations
- Support `altSplit` visual treatment (dashed border or dual colour)

**ExampleLoader.tsx**
- Dropdown or cards of classical examples
- On click: loads text + triggers parse + optionally switches view

### 3.3 Educational Components (Phase 3)

**LessonAccordion.tsx**
- Collapsible lessons for each of the 6 elements
- Embeds live mini-examples that parse on click

**SpecialAnnotationsModule.tsx** (from 08)
- Deep dive into uyir-U, clusters, sandhi, vikalpa
- Interactive "Try splitting this word" exercise

**InteractiveExercise.tsx**
- Multiple choice or drag-and-drop
- Calls `parse_poem` live and validates

**MetreCard.tsx** (09)
- Card for each pāvakai with rules + "Analyze this example" button

---

## 4. Implementation Order (Recommended for Phase 2)

1. **Week 2**:
   - MainInput + ViewTabs + ResultContainer (skeleton)
   - LetterView + AcaiSeerView (core of special annotations)
   - AnnotationTooltip + SyllableChip

2. **Week 3**:
   - TalaiView + LeaderLine
   - AtiView, TodaiView, AllView
   - Polish + mobile + accessibility
   - Integration with Phase 1 WASM output

3. **Parallel (can start early)**:
   - Educational components (Phase 3 can overlap)
   - Example data + pre-loaded verses

---

## 5. Data & Styling Notes

- **Colours** (Tailwind + CSS variables):
  - Ner: blue-600 / indigo
  - Nirai: emerald-600
  - Valid talai: green
  - Alt / hint: amber + dashed
  - Error: red

- **Typography**: Noto Sans Tamil (or system Tamil font) + Inter for English

- **Animations**: Framer Motion — subtle scale on hover, line draw for talai, highlight flash on annotation

- **Accessibility**:
  - Every annotation has `aria-describedby`
  - Keyboard navigation through syllables/feet
  - High contrast mode support

---

## 6. How This Maps to Existing Repo Code

The repo already has many Scansion* and Display* components (ScansionDisplay, LinkageDisplay, etc.).  
**Recommendation**:
- Keep the good structure/logic
- Evolve or replace them with the richer versions above (especially add annotation system)
- Use the existing test coverage as safety net

---

**This component map is the practical blueprint for Benjamin.**  
It directly implements the vision in our per-page specs while staying pragmatic with the current codebase.

**Next**: Benjamin reviews this + starts with `MainInput.tsx` + `AcaiSeerView.tsx` (the heart of the special annotations).

Ready for any refinements or additional maps (e.g., state diagram, WASM TypeScript bindings). Just say the word. 🌿