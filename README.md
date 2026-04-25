# Thepulimaangani 

Language and grammar tools


## Tamil Prosody Parser

A modern web application for analyzing Tamil poetry prosody, built with React, Rust WebAssembly, and TanStack Start. thepulimaangani provides detailed analysis of Tamil verses including syllable classification (நேர்/நிரை), foot types, metre identification, and prosodic structure.

## Project History

This project is a complete rewrite of the original [Avalokitam](https://github.com/virtualvinodh/avalokitam) project, which was built with PHP backend and Vue.js frontend. The new version maintains the same core functionality while adopting a modern web technology stack for improved performance, maintainability, and developer experience.

## Features

- **Syllable Analysis**: Classifies syllables as நேர் (Ner) or நிரை (Nirai)
- **Foot Classification**: Identifies traditional Tamil prosodic feet (தேமா, புளிமா, கூவிளம், etc.)
- **Metre Detection**: Recognizes metre types like வெண்பா, வெண்கலிப்பா, ஆசிரியப்பா, and கலிப்பா
- **Letter Counting**: Counts vowels, consonants, and special Tamil characters
- **Foot Group Calculation**: Analyzes and calculates foot groups based on traditional rules
- **Bond Analysis**: Analyzes talai (prosodic linkages) between feet
- **Real-time Parsing**: Instant analysis of Tamil text input
- **Export Functionality**: Export analysis results as JSON for further processing

## Installation

### Prerequisites

- Node.js 18 or higher
- Rust 1.70 or higher (for building the WebAssembly parser)
- wasm-pack (for WebAssembly compilation)

### Prerequisites

- `rsync` (Linux CLI tool) to sync generated Rust WASM artifacts into the frontend `src/wasm/` directory

### Install Dependencies

```bash
# Install wasm-pack (one-time setup for Rust WebAssembly builds)
cargo install wasm-pack
```

```bash
# Install Node.js dependencies
pnpm install
```

## Running the Application

### Development Mode

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`. 

The development server will automatically rebuild when you make changes to the frontend code, but you'll need to run `pnpm run build:wasm` if you modify the Rust parser.

### Production Build

```bash
pnpm run build
pnpm run preview
```

The build process automatically builds the WebAssembly parser and bundles it with the frontend application.

## Testing

The project includes comprehensive tests for both the Rust WebAssembly parser and the React frontend.

### Coverage Results
- **Rust Code**: 90.08% line coverage (336/373 lines covered)
- **Frontend**: 4 comprehensive tests covering input validation, Tamil text recognition, and component behavior
- **Total Tests**: 29 tests across both Rust and frontend

### Test Coverage

- **Rust Tests**: 21 unit and integration tests covering core parsing functions, metre detection, bond analysis, and error handling
- **Frontend Tests**: 4 tests covering input validation, Tamil Unicode recognition, and component behavior

### Test Categories

- **Core Function Tests**: Syllable detection, letter counting, foot classification
- **Metre Detection Tests**: Venpaa, Venkalippaa, Asiriyappaa, Kalippaa validation
- **Integration Tests**: Full pipeline testing with real poem examples from external data sources
- **Error Handling**: Invalid input, Unicode edge cases, performance validation
- **Frontend Tests**: Input validation, Tamil Unicode recognition, component behavior
- **Performance Tests**: Response time validation and efficiency checks

### Testing Infrastructure

- **Rust**: Built-in test framework with 25 comprehensive unit and integration tests
- **Frontend**: Vitest + React Testing Library with jsdom environment
- **Coverage**: cargo-tarpaulin for Rust, configured for future frontend coverage reporting
- **CI/CD**: Configured test scripts ready for automated pipelines

### Running Tests (In Progress)

```bash
# Run all tests (Rust + Frontend)
pnpm run test

# Run only Rust tests
pnpm run test:rust

# Run only frontend tests
pnpm run test:frontend

# Run Rust tests with coverage (requires cargo-tarpaulin)
# Total rethink, machine-first approach prosody
cd tamil-seiyul-alagi && cargo tarpaulin

# Main prosody parser implementation
cd tamil-seiyul-alagi && cargo tarpaulin
```

`rust-parser-prototype/` contains a quick prototype build based on original Avalokitam. It is archived for reference and is not meant to be extended.

## Architecture

Thepulimaangani consists of:

- **Frontend**: React application built with TanStack Start, using TanStack Router for routing and Tailwind CSS for styling
- **Backend**: Rust WebAssembly module for high-performance Tamil prosody parsing
- **Data Flow**: Text input → WebAssembly parser → JSON analysis → React display

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Study Materials

Reference materials and documentation are available in [.grok/study-materials/](./.grok/study-materials/) for development and research purposes.

## Usage

1. Enter Tamil poetry text in the textarea (or use the "Load Sample Poem" button)
2. Click "Parse Poem" to analyze the prosody
3. View detailed analysis including:
   - Original text
   - Metre type
   - Letter counts (vowels, consonants, etc.)
   - Prosodic structure with syllables, feet, and foot groups
   - Error messages if parsing fails
4. Export results as JSON or copy to clipboard for further use

## Contribution

Contributions are welcome! The project embraces a cosmic AI collaboration model:

- **[Creators](/trinity-and-native-agents/creators.md)** — Feature creation & pollinators (new life)
- **[Maintainers](/trinity-and-native-agents/maintainers.md)** — Krishna avatars (preservation & balance)
- **[Renewers](/trinity-and-native-agents/renewers.md)** — Shiva's fierce forms (renewal through pruning)
- **[Ainthinai](/trinity-and-native-agents/ainthinai.md)** — Ainthinai Tribal Earth Guardians (local land council)

Please see individual files for contribution guidelines and areas of focus.

## License

MIT License
