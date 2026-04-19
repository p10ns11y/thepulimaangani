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
│   └── ThemeToggle.tsx # Dark/light theme toggle
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

### 2. Rust WebAssembly Parser (`rust-parser/`)

The Rust parser handles all Tamil prosody analysis:

```
rust-parser/
├── src/
│   └── lib.rs          # Main parser implementation
├── pkg/                # Generated WebAssembly bindings
├── Cargo.toml          # Rust dependencies
└── target/             # Build artifacts
```

### 3. Build Configuration

- **Vite Config** (`vite.config.ts`): Frontend build configuration with TanStack Start integration
- **TypeScript Config** (`tsconfig.json`): Type checking and compilation
- **Package Config** (`package.json`): Node.js dependencies and scripts

### WebAssembly Integration

The WebAssembly parser is built separately and its artifacts are copied to `src/wasm/` for bundling. These generated files are **not tracked in git** to keep the repository clean and ensure builds are reproducible from source.

**Build Process**:
1. **Rust Compilation**: `wasm-pack build --target web --out-dir pkg` generates JavaScript bindings and WASM binary in `rust-parser/pkg/`
2. **File Copy**: Generated files are automatically copied from `rust-parser/pkg/` to `src/wasm/` via `npm run build:wasm`
3. **Vite Bundling**: Vite processes the WASM files as static assets, serving them with proper MIME types
4. **Dynamic Import**: Frontend uses `import('../wasm/thepulimaangani_parser.js')` for lazy loading
5. **Runtime Connection**: JavaScript bindings initialize the WASM module and expose the `parse_poem()` function

**Why Not Track WASM Files**: Binary files are excluded from version control to avoid repository bloat and ensure that all builds are generated from the source Rust code, maintaining build reproducibility.

## Data Flow

1. **User Input**: Tamil text entered in React component
2. **WASM Call**: Frontend calls `parse_poem()` function via WebAssembly
3. **Parsing Pipeline**:
   - Text preprocessing and cleaning
   - Syllable detection (நேர்/நிரை classification)
   - Foot identification (தேமா, புளிமா, கூவிளம், கருவிளம், etc.)
   - Metre analysis (வெண்பா, வெண்கலிப்பா, ஆசிரியப்பா, கலிப்பா, etc.)
   - Complete bond/linkage calculation (கலித்தளை, வெண்டளை, ஆசிரியத்தளை, etc.)
4. **Result Serialization**: Analysis results serialized to JSON
5. **Display**: React component renders structured analysis

## Core Algorithms

### Syllable Classification

The parser implements traditional Tamil prosody rules:

- **நேர் (Ner)**: Simple syllables with consonant-vowel patterns
- **நிரை (Nirai)**: Complex syllables with consonant-vowel-consonant patterns

### Foot Types

Recognizes traditional Tamil prosodic feet:

- தேமா (tEmA): நேர்-நேர் pattern
- புளிமா (puLimA): நிரை-நேர் pattern
- கூவிளம் (kUviLa_m): நேர்-நிரை pattern
- கருவிளம் (karuviLa_m): நிரை-நிரை pattern

### Metre Detection

Implements rules for major Tamil metres:

- **வெண்பா (Venpaa)**: 4-foot lines with specific foot type restrictions
- **வெண்கலிப்பா (VenkaliPpaa)**: Multi-line poems with 4+3 foot structure and bond requirements
- **ஆசிரியப்பா (Asiriyappaa)**: 4-line poems with 4-foot lines and strict bonding rules
- **கலிப்பா (Kalippaa)**: Flexible multi-line poems with various foot count patterns (4-3-4-3, etc.)

### Bond Analysis (Talai)

Complete talai calculation system with traditional Tamil prosodic linkages:

- **கலித்தளை (Kali Talai)**: Specific linkage patterns requiring kali bonds
- **வெண்டளை (Ven Talai)**: Other linkage types including ven bonds
- **ஆசிரியத்தளை (Asiriya Talai)**: Scholarly bonds with strict requirements
- **இயற்சீர் வெண்டளை (Iyar Seer Ven Talai)**: Natural flow linkages
- **நேரொன்றிய ஆசிரியத்தளை (Ner Ondriya Asiriya Talai)**: Direct scholarly connections

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
npm run build:wasm
```

This script:
1. Builds the Rust parser with `wasm-pack build --target web --out-dir pkg`
2. Copies the generated WebAssembly files to `src/wasm/` where Vite can access them

**Why Manual Copy Was Needed**: Vite requires WebAssembly files to be in the source directory for proper bundling and serving with the correct `application/wasm` MIME type. The build script automates this copy process.

### Frontend Development

```bash
npm run dev         # Development server (http://localhost:3000)
npm run build       # Production build (includes WASM build)
npm run build:only  # Frontend build only (assumes WASM is already built)
npm run test        # Run complete test suite (Rust + Frontend)
npm run test:rust   # Run Rust tests with coverage (cargo-tarpaulin)
npm run test:frontend # Run frontend tests (Vitest)
```

**Development Workflow**: When modifying the Rust parser, run `npm run build:wasm` to rebuild and copy the WebAssembly files. For frontend-only changes, `npm run dev` will hot-reload automatically.

**Note**: The `src/wasm/` directory is gitignored since it contains generated binary files. Always run `npm run build:wasm` after cloning the repository or modifying the Rust parser.

### WebAssembly Connection

The frontend connects to the WebAssembly parser through:

1. **Dynamic Import**: `import('../wasm/avalokitam_parser.js')` loads the WASM bindings
2. **Initialization**: `wasm.default()` initializes the WebAssembly module
3. **Function Call**: `wasm.parse_poem(text)` executes the Rust parsing logic
4. **Result Processing**: JSON results are parsed and displayed in the UI

Vite automatically handles serving the `.wasm` files with the correct `application/wasm` MIME type required for WebAssembly instantiation.

### Type Safety

- **Rust**: Strong typing with serde serialization
- **TypeScript**: Interface definitions for WASM bindings
- **Runtime Validation**: JSON schema validation for results

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