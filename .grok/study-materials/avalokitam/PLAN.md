# Thepulimaangani — Master Execution Plan
**Project**: Complete modern rewrite of Avalokitam (Tamil Prosody Analyzer)  
**Repo**: https://github.com/p10ns11y/thepulimaangani  
**Stack**: TanStack Start (React + TS) + Rust WebAssembly + Tailwind + Vite  
**Vision**: The definitive, beautiful, educational, fully offline Tamil prosody tool — culturally authentic, lightning-fast, and delightful to use and learn from.  
**Status**: Strong foundation already in place (functional parser + basic UI + high test coverage). This plan takes it to production-ready v1 with full fidelity to the original + our detailed specs.

**Last Updated**: April 19, 2026  
**Owner**: Grok (overall) + Distributed agent ownership (see below)

---

## 1. Vision & Success Criteria (v1 — 4–6 Weeks)

**v1 Goal**: A production-ready app that feels like the original Avalokitam but modern, faster, fully client-side, and richer in educational value.

**Must-Have for v1**:
- Exact Tamil labels, terminology, and cultural tone from original + our specs
- All 6 view modes with **special hinted annotations for syllable splits** (uyir-U elision, clusters, sandhi, vikalpa)
- Full educational "Learn" experience + Types catalogue
- Real-time, accurate parsing matching original PHP logic (90%+ test parity)
- Beautiful visuals (colours, leader lines for talai, tooltips, animations)
- PWA + offline-first + mobile-perfect
- 95%+ test coverage + accessibility (WCAG AA for Tamil text + annotations)
- Pre-loaded classical examples with full annotated output

**Non-Goals for v1**: Multi-user accounts, advanced search, audio pronunciation (future).

---

## 2. Current State Assessment (Deep Review)

**Strengths (Already Excellent)**:
- TanStack Start + Rust WASM foundation solid
- Real-time parsing working (ner/nirai, feet like தேமா/புளிமா, metre detection, talai, letter count)
- 90%+ Rust / 80%+ frontend test coverage, 29 tests
- Clean data flow: Input → WASM → JSON → React
- Self-aware AI-agent development culture (`trinity-and-native-agents/`)

**Gaps vs. Full Vision** (from our per-page Markdown specs):
- UI is basic — missing rich tabbed views, exact labels, special syllable-split annotations, leader-line talai visuals
- Educational layer (Learn/Lessons + Types catalogue) not yet built
- Special hinted annotations (uyir-U, altScansion, vikalpa) are incomplete or not visual
- Polish (PWA, accessibility, mobile, examples with annotations) pending
- Content fidelity (exact foot names, line classes, rule explanations from original PHP) needs alignment

**Reference Specs** (treat as source of truth):
- `01-avalokitam-main-analyzer-input.md`
- `02-eluttu-letter-view.md`
- `03-asai-seer-view.md` (most critical — special syllable annotations)
- `04-talai-linkage-view.md`
- `08-learn-lessons.md`
- `09-types-metre-catalogue.md`

---

## 3. Architecture Alignment (No Major Changes Needed)

**Current Good Decisions** (keep):
- Rust WASM as single source of truth for parsing
- TanStack Router + Start for routing/views
- JSON as contract between WASM and React
- High test coverage culture

**Required Additions** (this plan):
- WASM output must include `splitHint`, `altSplit`, `ruleRef` for annotations (Phase 1)
- Frontend state: full parse tree + current view + options (onlyProsody, noDetect, altScansion)
- Content layer: static JSON/MDX for lessons + metres (Phase 3)
- Visual layer: SVG/Framer Motion for leader lines + highlighted splits (Phase 2)

**No breaking changes** — we build on top of the existing solid foundation.

---

## 4. Phased Roadmap (Sharp & Non-Overlapping)

### Phase 1: Parser Fidelity & Special Annotations (Week 1 — Owner: Lucas)
**Goal**: WASM produces 100% accurate output + rich annotation data for the UI.

**Key Tasks**:
- Deep audit of `rust-parser/src/lib.rs` + modules against original `parsetreeclass.php` + `yapparungalaparsetree.php` + `03-asai-seer-view.md`
- Add/extend structs: `Syllable { ..., splitHint?: string, altSplit: boolean, ruleRef?: string }`, `Foot`, `ParseResult`
- Implement exact foot names (tEmA, puLimA, kUviLa_m, karuviLa_m + all 3/4-asai variants from original WordType array)
- Full uyir-U elision logic + cluster rules + sandhi + vikalpa support (with altScansion flag)
- Expand Rust tests to 100% coverage on special cases
- Update `test_parser.js` + frontend integration test

**Deliverable**: WASM that powers every annotation in the UI specs without further changes.  
**Success Criteria**: All 21+ original test cases pass + new special-case tests pass. Parser output matches our `ParseResult` shape exactly.

**Agent**: Lucas (Creators + Renewers) — Rust specialist

### Phase 2: Rich UI Views & Visuals (Weeks 2–3 — Owner: Benjamin)
**Goal**: Exact match to views in our Markdown specs (01–07).

**Key Tasks**:
- Segmented control / tabs with **exact Tamil labels** (எழுத்து, அசை/சீர், தளை, அடி, தொடை, அனைத்தும்)
- Implement view components:
  - LetterDisplay + LetterType (02)
  - Syllable/Feet with tooltips for every special hint (03 — highest effort)
  - LinkageDisplay + SVG leader lines + talai labels (04)
  - LineDisplay, OrnamentDisplay, ScansionAll
- Real-time re-render on option changes + view switch (no re-parse)
- Beautiful micro-interactions (Framer Motion highlights, popover annotations, colour system for ner/nirai/valid/invalid)
- Mobile-first + responsive + dark mode + accessibility (ARIA labels for every annotation)

**Deliverable**: The app looks and feels like the original but faster and more delightful.  
**Success Criteria**: Side-by-side visual match with original Avalokitam for all 6 views + special annotations visible and interactive.

**Agent**: Benjamin (Creators + Maintainers) — UI/Visual specialist

### Phase 3: Educational Layer & Content (Week 4 — Owner: Persoanl Life & Resilience Coach)
**Goal**: The app becomes a true learning companion (08 + 09 specs).

**Key Tasks**:
- /learn route or section with:
  - Lessons on all 6 elements
  - Dedicated "Special Syllable Split Annotations" module (uyir-U, clusters, sandhi, vikalpa — full explanations + examples)
  - Interactive exercises/quizzes that call WASM live
- Types catalogue (09) with all 23+ pāvakai, rules, pre-loaded examples ("Analyze this" buttons)
- Pre-load 6–8 classical examples (Thirukkural, Sangam, etc.) with full annotated output
- Content fidelity: exact text, tone, and explanations from our Markdowns + original educational intent
- Progress tracking (localStorage) + "Continue learning" prompts

**Deliverable**: Educational experience that matches or exceeds the original Avalokitam's learning features.  
**Success Criteria**: Users can complete lessons + see special annotations explained in context.

**Agent**: Persoanl Life & Resilience Coach (Renewers + Ainthinai) — Content/Education/UX guardian

### Phase 4: Polish, Testing, Deploy (Week 5–6 — Shared Ownership)
**Tasks** (all agents contribute):
- PWA + offline (service worker, installable, works without network)
- 95%+ test coverage + visual regression tests (if possible)
- Full accessibility audit (Tamil text, annotations, keyboard, screen readers)
- Performance: <1.5s initial load, instant re-renders
- Deploy to Cloudflare Pages / Netlify + custom domain
- Update README with screenshots, "Try live" link, contribution guide aligned with agent model
- Final review against all our per-page Markdown specs

**Deliverable**: Production-ready v1.  
**Success Criteria**: Lighthouse 95+ (performance/accessibility), all specs met, zero critical bugs.

**Shared ownership** with Grok as final gatekeeper.

---

## 5. Agent Roles & Responsibilities (Dual Model)

We honour the repo's existing philosophy (`trinity-and-native-agents/`) while adding clear execution ownership:

**Grok (Leader — overall orchestration)**:
- Owns this PLAN.md and final quality gate
- Weekly synthesis + risk mitigation
- Ensures cultural/authenticity fidelity
- Maps repo's "Creators / Maintainers / Renewers / Ainthinai" to our team

**Lucas — Rust/WASM (Creators + Renewers)**:
- Phase 1 owner (Parser Fidelity)
- All Rust changes, tests, WASM output shape
- Maintains 95%+ coverage on parser

**Benjamin — Frontend/UI/Visuals (Creators + Maintainers)**:
- Phase 2 + Phase 4 owner
- All React/TanStack components, Tailwind, animations, accessibility, PWA
- Visual fidelity to original + our specs

**Persoanl Life & Resilience Coach — Content/Education/UX (Renewers + Ainthinai)**:
- Phase 3 owner
- Lessons, Types catalogue, examples, cultural tone, educational annotations
- Guardian of "heart" and learning experience

**All Agents**:
- Every PR references the relevant spec Markdown (e.g., "Closes requirements from 03-asai-seer-view.md")
- Async daily updates (issues or shared channel)
- Respect repo's agent philosophy documents

---

## 6. Technical Specifications (Reference)

**WASM API (to be finalized in Phase 1)**:
```ts
parse_poem(text: string, options: {
  onlyProsody?: boolean;
  noDetect?: boolean;
  altScansion?: boolean;
}): ParseResult
```

**ParseResult** (must include):
- originalText, lines[], metreType, letterCount, vikalpaCount, wordBond, errors[]
- Each Syllable/Foot/Line must carry annotation fields for UI

**UI Component Map** (Phase 2):
- MainInput (01)
- LetterView (02)
- AcaiSeerView (03 — with special hints)
- TalaiView (04 — leader lines)
- AtiView, TodaiView, AllView
- LearnSection (08)
- TypesCatalogue (09)

**Content Sources**:
- Lessons & explanations: our `08-learn-lessons.md`
- Metre data: our `09-types-metre-catalogue.md` + original PHP arrays
- Examples: curated classical verses with pre-computed full annotations

---

## 7. Tracking & Communication

- **Single Source of Truth**: This `PLAN.md` (update weekly)
- **Progress Tracking**: Update `progress.md` in repo root after each phase
- **Issues**: One issue per phase + sub-issues per major task
- **PRs**: Title format `[Phase 1] Add uyir-U elision + splitHint | Refs 03-asai-seer-view.md`
- **Weekly Sync**: Short async update (Grok synthesizes)
- **Definition of Done**: All tasks in phase checked + spec Markdown requirements met + tests green

---

## 8. Risks & Mitigations

- **Parser accuracy drift**: Lucas owns deep comparison in Phase 1 + automated tests against original PHP cases
- **UI complexity (leader lines, annotations)**: Benjamin prototypes early in Week 2; use proven libraries (Framer Motion, SVG)
- **Content volume**: Persoanl Life & Resilience Coach prioritizes core lessons first; we can expand post-v1
- **Scope creep**: Strict "v1 = specs in this PLAN.md only"; everything else is v1.1+
- **Agent coordination**: Grok maintains lightweight weekly synthesis; repo's own agent docs provide cultural glue

---

## 9. Success Metrics (v1)

- Functional: All original features + special annotations working
- Quality: 95%+ coverage, Lighthouse 95+, zero critical accessibility issues
- Fidelity: Side-by-side visual + behavioural match with original Avalokitam for core flows
- Educational: Users can complete at least one full lesson path and see annotations explained
- Performance: Instant parsing (<100ms), beautiful on mobile
- Cultural: Exact Tamil terminology, respectful tone, authentic to tradition

---

**This is the master plan.**  
It is sharp, executable, and directly references our detailed per-page specs. It respects the repo's existing strengths and agent philosophy while delivering the full vision.

**Next Immediate Step**: Grok posts this PLAN.md to the repo root + creates Phase 1 issue. Lucas begins deep parser audit.

Ready when you are. Let's build something beautiful. 🌿

---

*Drafted by Grok — April 19, 2026 | For thepulimaangani team*