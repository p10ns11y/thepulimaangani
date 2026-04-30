# Architecture Overview

## System Architecture

thepulimaangani is a modern web application for Tamil prosody analysis, built with a hybrid architecture combining React frontend with Rust WebAssembly backend for high-performance text processing.

## Technology Stack

### Frontend
- **Framework**: TanStack Start (React-based full-stack framework)
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite
- **Testing**: Vitest
- **Language**: TypeScript

### Backend
- **Language**: Rust
- **Compilation Target**: WebAssembly (wasm32-unknown-unknown)
- **Build Tool**: wasm-pack
- **Serialization**: serde_json for data interchange

### Core Dependencies
- **Frontend**: React 19, TanStack Router, Tailwind CSS
- **Backend**: wasm-bindgen, serde, regex, unicode-segmentation

## Architecture Components

### 1. React Frontend (`src/`)

The frontend is organized as follows:

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Site header with navigation
│   ├── Footer.tsx      # Site footer
│   └── LookToggle.tsx # Real / Redpill look
├── routes/             # File-based routing
│   ├── __root.tsx      # Root layout component
│   ├── index.tsx       # Main application page
│   └── about.tsx       # About page
├── styles.css          # Global styles and Tailwind imports
├── router.tsx          # Router configuration
└── wasm/               # WebAssembly module bindings
    ├── thepulimaangani_parser.js
    └── thepulimaangani_parser_bg.wasm
```

### 2. Rust WebAssembly Parser (`tamil-seiyul-alagi/`)

The Rust parser handles all Tamil prosody analysis:

```
tamil-seiyul-alagi/
├── src/
│   ├── lib.rs              # parse_poem, parse_poem_wasm, ParseResult
│   ├── word_scope.rs       # Linguistic words → syllables
│   ├── syllable_builder.rs # Ner/Nirai syllables
│   ├── foot.rs / foot_pattern.rs  # One foot per word; Ner-Nirai pattern string
│   ├── linkage.rs          # Consecutive-foot edges (placeholder linkage type)
│   ├── metre.rs            # Metre hypotheses (heuristic)
│   ├── poem_tree.rs        # Structured poem tree
│   └── presentation.rs     # Human-facing labels (not wired through WASM yet)
├── pkg/                # Generated WebAssembly bindings
├── Cargo.toml          # Rust dependencies
└── target/             # Build artifacts
```

**Accuracy note:** User-facing copy sometimes describes classical feet and full talai sets; the shipped WASM JSON uses **Ner/Nirai foot patterns**, **VenTalai-only** linkage types until the transition table lands, and **heuristic** metre ranking. See `tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md`, `QUALITY_CRAP_BASELINE.md`, and [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49).

### 3. Build Configuration

- **Vite Config** (`vite.config.ts`): Frontend build configuration with TanStack Start integration
- **TypeScript Config** (`tsconfig.json`): Type checking and compilation
- **Package Config** (`package.json`): Node.js dependencies and scripts

### WebAssembly Integration

The WebAssembly parser is built separately and its artifacts are copied to `src/wasm/` for bundling. These generated files are **not tracked in git** to keep the repository clean and ensure builds are reproducible from source.

**Build Process**:
1. **Rust Compilation**: `wasm-pack build --target web --out-dir pkg` generates JavaScript bindings and WASM binary in `tamil-seiyul-alagi/pkg/`
2. **File Copy**: Generated files are automatically copied from `tamil-seiyul-alagi/pkg/` to `src/wasm/` via `pnpm run build:wasm`
3. **Vite Bundling**: Vite processes the WASM files as static assets, serving them with proper MIME types
4. **Dynamic Import**: Frontend uses `import('../wasm/thepulimaangani_parser.js')` for lazy loading
5. **Runtime Connection**: JavaScript bindings initialize the WASM module and expose the `parse_poem_wasm()` function

**Why Not Track WASM Files**: Binary files are excluded from version control to avoid repository bloat and ensure that all builds are generated from the source Rust code, maintaining build reproducibility.

## Data Flow

1. **User Input**: Tamil text entered in React component
2. **WASM Call**: Frontend calls `parse_poem_wasm(text)` (Rust `parse_poem` with default options: `uyir_u` normalization on)
3. **Parsing Pipeline** (current implementation):
   - Text preprocessing and normalization
   - Syllable detection (நேர் / நிரை) per linguistic word
   - **Feet:** one foot per word; `foot_type` is a hyphenated **Ner/Nirai** pattern (not classical தேமா names in JSON)
   - **Metre:** ranked hypotheses; simple heuristics, not full classical rule engines yet
   - **Linkage:** consecutive feet with line/word positions; **`VenTalai` placeholder** on every edge until table-driven classification exists
4. **Result Serialization**: `ParseResult` to JSON in the browser
5. **Display**: React reads JSON via TypeScript adapters (`adaptWasmJsonToParsedPoem`, etc.); classical labels are a **presentation-layer** follow-up

## Core Algorithms

### Syllable Classification

The parser implements traditional Tamil prosody rules:

- **நேர் (Ner)**: Simple syllables with consonant-vowel patterns
- **நிரை (Nirai)**: Complex syllables with consonant-vowel-consonant patterns

### Foot grouping (current)

The engine groups syllables into **one foot per linguistic word** and sets `foot_type` to a machine-readable **Ner/Nirai sequence** (for example `Ner-Ner`). Mapping those patterns to classical names (தேமா, புளிமா, கூவிளம், கருவிளம்) is intended for **`presentation.rs`** / UI, not for the raw WASM JSON today.

### Metre detection (current)

`metre.rs` produces **hypotheses** with scores; it does **not** yet encode full classical constraints for வெண்பா, வெண்கலிப்பா, ஆசிரியப்பா, கலிப்பா, etc. Treat catalogue metres as **targets** for `MACHINE_FIRST_SPEC.md`, not guarantees from the current build.

### Linkage / talai (current)

Consecutive feet get a linkage record with **positions**; **`linkage_type` is `VenTalai` for every pair** with `is_valid: true` until the transition-table linkage stage is implemented. Classical talai names (கலித்தளை, ஆசிரியத்தளை, …) describe the **intended** system, not current per-edge classification in JSON.

## Performance Considerations

### WebAssembly Benefits

- **Performance**: Native-speed text processing in the browser
- **Bundle Size**: Efficient compression of parsing logic
- **Memory Safety**: Rust's memory safety guarantees
- **Unicode Support**: Robust handling of Tamil script (U+0B80-U+0BFF range)
- **Test Coverage**: 90%+ code coverage ensuring reliability of complex linguistic algorithms

### Frontend Optimizations

- **Dynamic Imports**: WebAssembly module loaded on-demand
- **Lazy Loading**: Parser initialization deferred until needed
- **Error Handling**: Graceful degradation for parsing failures

## Development Workflow

### Building WebAssembly Parser

The WebAssembly parser is built using the automated `build:wasm` script:

```bash
pnpm run build:wasm
```

This script:
1. Builds the Rust parser with `wasm-pack build --target web --out-dir pkg`
2. Copies the generated WebAssembly files to `src/wasm/` where Vite can access them

**Why Manual Copy Was Needed**: Vite requires WebAssembly files to be in the source directory for proper bundling and serving with the correct `application/wasm` MIME type. The build script automates this copy process.

### Frontend Development

```bash
pnpm run dev         # Development server (http://localhost:3000)
pnpm run build       # Production build (includes WASM build)
pnpm run build:only  # Frontend build only (assumes WASM is already built)
pnpm run test        # Run complete test suite (Rust + Frontend)
pnpm run test:rust   # Run Rust tests
pnpm run test:frontend # Run frontend tests (Vitest)
```

**Development Workflow**: When modifying the Rust parser, run `pnpm run build:wasm` to rebuild and copy the WebAssembly files. For frontend-only changes, `pnpm run dev` will hot-reload automatically.

**Note**: The `src/wasm/` directory is gitignored since it contains generated files. Always run `pnpm run build:wasm` after cloning the repository or modifying the Rust parser.

### WebAssembly Connection

The frontend connects to the WebAssembly parser through:

1. **Dynamic Import**: `import('../wasm/thepulimaangani_parser.js')` loads the WASM bindings
2. **Initialization**: `wasm.default()` initializes the WebAssembly module
3. **Function Call**: `wasm.parse_poem_wasm(text)` executes the Rust parsing logic
4. **Result Processing**: JSON results are parsed and displayed in the UI

Vite automatically handles serving the `.wasm` files with the correct `application/wasm` MIME type required for WebAssembly instantiation.

### Type Safety

- **Rust**: Strong typing with serde serialization
- **TypeScript**: Typed adapters and tests for WASM JSON shapes (`adaptWasmJsonToParsedPoem`, Vitest)
- **Runtime validation:** not via a separate JSON Schema pipeline; invalid shapes surface as TypeScript/test failures. Add explicit schema validation only if the project adopts it.

## Future Enhancements

### Planned Features

- **Batch Processing**: Analyze multiple poems simultaneously
- **Export Formats**: JSON, CSV, and PDF output options
- **Additional Metres**: Support for advanced classical metres (விருத்தம், வஞ்சிப்பா variants)
- **Comparative Analysis**: Side-by-side comparison of different metres
- **Educational Mode**: Interactive learning tools for Tamil prosody

### Architecture Improvements

- **Service Worker**: Offline parsing capabilities
- **Web Workers**: Background processing for large texts
- **IndexedDB**: Client-side result caching
- **Progressive Web App**: Installable application features

## Deployment

The application is designed for static deployment:

- **Build Output**: Self-contained static files
- **WebAssembly**: Embedded in the bundle
- **CDN Ready**: No server-side dependencies required
- **HTTPS Required**: WebAssembly requires secure context

This architecture provides a balance of modern web development practices with the performance requirements of complex linguistic analysis.