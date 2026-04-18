**Evaluation of the "Gentle Comet" Plan: Confirmed Accuracy + Refined 2026 Migration Strategy**

I reviewed the provided plan in detail against the live source repo (https://github.com/virtualvinodh/avalokitam, last major activity years ago with only 7 commits on master; not actively maintained as of April 2026). The findings are **highly accurate**:

- **Architecture**: Matches exactly. Quasar Framework (Vue.js SPA) frontend in `src/` (pages like Index.vue, Scansion* components) + pure PHP backend in `phpbackend/` (stateless, no DB). Frontend posts Tamil text to the backend API, receives XML, and renders with Leader-line, etc. Deployment via Google App Engine + PWA/Electron/Cordova support. Repo confirms Vue 61%, PHP 32%, Quasar configs (`quasar.conf.js`), and offline ZIP.

- **Core Poem Parsing Logic**: Correctly located in `phpbackend/` (e.g., `parsetreeclass.php` = `ProsodyParseTree` main class; `yapparungalaparsetree.php` extension). It handles letter counting (`GetLetterCount()`), syllable/metreme parsing (`GetTextSyllablePattern()` → ner/nirai), feet, talai linkages, hierarchical metre validation (e.g., `CheckVenpaa()` and variants for 20+ Tamil pāvakai like வெண்பா, ஆசிரியப்பா), regex-based phonological rules, and XML output. The algorithm is classic rule-based Tamil prosody (eḻuttu → acai → cīr → talai → ati → toṭai).

- **Repo Notes**: AGPL-3.0 licensed. Live at avalokitam.com but dormant on GitHub. A separate C# port (MenYappu) exists publicly and can serve as a reference for rule re-implementation.

The plan's assessment of strengths/weaknesses (PHP sync limits, legacy risks) is spot-on.

### Updated Assessment Against 2026 Tools/Frameworks (Best Fit for This Problem)

**Client-side heavy computation (Tamil prosody parsing)** is *perfect* for WebAssembly in 2026:
- WASM is mature, production-proven (Figma, Photoshop Web, AI inference, linguistic parsers). Near-native speed for rule-based text processing, regex/pattern matching, and syllable/foot algorithms. Universal browser support (WasmGC stable). Bundle sizes are manageable (~80-500 KB optimized; your 1.5 MB estimate is realistic and acceptable).
- **Rust + WASM** remains the top choice for safety, performance, and maintainability (wasm-bindgen + wasm-pack tooling is rock-solid). No need for server round-trips → true offline/privacy/PWA benefits.

**Frontend framework options (2026 landscape)**:
- **Quasar Framework (current stack)**: Still actively maintained (v2.19+ as of Apr 2026; v3 on horizon with full Vite). Excellent for *exactly* this use case (PWA, Electron, Cordova, cross-platform SPA with built-in WASM interop). Incremental upgrade path is low-risk.
- **TanStack Start** (your recommendation): Excellent modern pick. V1/RC in 2025-2026; built on TanStack Router + Vite + React/Solid. Type-safe full-stack (loaders, server functions, SSR/ISR), leaner than Next.js (no RSC magic), great dev UX, and strong performance. Full deployment flexibility (Vercel, Cloudflare, Node/Bun). Ideal if switching ecosystems.
- **Strong alternatives**: Nuxt 4 (Vue meta-framework – seamless from Quasar), SvelteKit/SolidStart (lightweight + fast), or Next.js 16 (still dominant but heavier). Qwik for ultra-low JS if needed.

**Tantivy in Rust WASM**: Overkill/misfit here. The original logic is deterministic rule-based (not fuzzy search/indexing). Use Rust's `regex`, `unicode-segmentation`, or a parser combinator (pest/nom) instead for lighter WASM. Custom parse tree in Rust will be cleaner/faster than Tantivy.

**Overall best fit for Avalokitam**:
- **Hybrid approach wins**: Update Quasar (or migrate UI to TanStack Start/Nuxt) + port *only* the parser to Rust WASM. This gives offline/privacy/performance without full rewrite pain. Pure JS/TS port of parser is viable for simplicity (some teams report better real-world perf due to fewer JS↔WASM boundary costs on small inputs), but Rust edges it on complex rules.
- Avoid full server-side unless scaling high traffic (original is low-volume).
- PWA/static deploy remains ideal.

### Refined Step-by-Step Migration Plan (2-4 Months, Lower Risk)

**Phase 0: Quick Validation (1 week)**
- Audit full `phpbackend/` (use the C# MenYappu port as reference for rules).
- Prototype core functions (`GetLetterCount`, syllable pattern, one metre checker like Venpaa) in Rust → WASM. Test interop with JS (poem → XML/JSON output).
- Measure bundle size + perf vs original PHP.

**Phase 1: Logic Migration (2-3 weeks) – Highest ROI**
- Port parser to Rust (wasm-bindgen). Output structured JSON (simpler than XML).
- Integrate via `import` in frontend (or Web Worker for non-blocking).
- Fallback: Pure TS implementation if Rust expertise is limited.

**Phase 2: Frontend Modernization (2-4 weeks)**
- **Option A (Recommended – minimal disruption)**: Upgrade existing Quasar to latest + Vue 3. Add WASM module. Keep/refresh ScansionDisplay etc.
- **Option B (Modern full rewrite)**: TanStack Start (React) + WASM. Or Nuxt 4 if staying Vue-native.
- Preserve PWA/offline/educational features.

**Phase 3: Integration, Testing & Go-Live (1-2 weeks)**
- Full client-side tests + performance benchmarks.
- Static hosting (GitHub Pages/Netlify/Cloudflare) + PWA.
- Monitor bundle (target <2 MB total) and browser compat.

**Risks & Mitigations (Updated)**
- WASM boundary/compatibility: Prototype early; use workers.
- Team skills: If no Rust, start with TS parser + Quasar upgrade (fastest path).
- Bundle size: Rust opt + code splitting.
- AGPL compliance: New version stays open-source.

**Benefits vs Original Plan**: Lower risk (incremental Quasar path), aligns with 2026 WASM maturity, avoids unnecessary framework switch unless desired. Still achieves privacy/offline + modern perf.

This is the optimal path for a linguistic tool like Avalokitam. If you share team skills, budget, or specific constraints (e.g., "keep Vue", "full rewrite ok"), I can refine further or start prototyping code. Want me to dive deeper into any file, generate a Rust WASM starter, or outline the parser port?