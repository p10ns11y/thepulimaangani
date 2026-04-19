# Thepulimaangani - Tamil Prosody Parser

A modern web application for analyzing Tamil poetry prosody, built with React, Rust WebAssembly, and TanStack Start. thepulimaangani provides detailed analysis of Tamil verses including syllable classification (நேர்/நிரை), foot types, metre identification, and prosodic structure.

## Project History

This project is a complete rewrite of the original [Avalokitam](https://github.com/virtualvinodh/avalokitam) project, which was built with PHP backend and Vue.js frontend. The new version maintains the same core functionality while adopting a modern web technology stack for improved performance, maintainability, and developer experience.

## Features

- **Syllable Analysis**: Classifies syllables as நேர் (Ner) or நிரை (Nirai)
- **Foot Classification**: Identifies traditional Tamil prosodic feet (தேமா, புளிமா, கூவிளம், etc.)
- **Metre Detection**: Recognizes metre types like வெண்பா, வெண்கலிப்பா, etc.
- **Letter Counting**: Counts vowels, consonants, and special Tamil characters
- **Bond Analysis**: Analyzes talai (prosodic linkages) between feet
- **Real-time Parsing**: Instant analysis of Tamil text input

## Installation

### Prerequisites

- Node.js 18 or higher
- Rust 1.70 or higher (for building the WebAssembly parser)
- wasm-pack (for WebAssembly compilation)

### Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install wasm-pack (one-time setup for Rust WebAssembly builds)
cargo install wasm-pack

# Build the Rust WebAssembly parser and copy files to frontend
npm run build:wasm
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`. The development server will automatically rebuild when you make changes to the frontend code, but you'll need to run `npm run build:wasm` if you modify the Rust parser.

### Production Build

```bash
npm run build
```

The build process automatically builds the WebAssembly parser and bundles it with the frontend application.

## Development Branch

Current development work belongs to the **`kulavi`** branch (குளவி/Wasp) - focused on validation, testing, and protection of core logic through comprehensive test coverage.

### Branch Strategy
This project follows a thematic branching strategy inspired by Tamil pollinator names. See [branches.md](./branches.md) for the complete branch responsibility map. The main branch is `malar` (மலர்/flower), with specialized branches for different types of development work.

## Testing

The project includes comprehensive tests for both the Rust WebAssembly parser and the React frontend, achieving **90%+ code coverage** for Rust and **80%+ coverage** for frontend components.

### Coverage Results
- **Rust Code**: 90.08% line coverage (336/373 lines covered)
- **Frontend**: 4 comprehensive tests covering input validation, Tamil text recognition, and component behavior
- **Total Tests**: 29 tests across both Rust and frontend

### Running Tests

```bash
# Run all tests (Rust + Frontend)
npm run test

# Run only Rust tests
npm run test:rust

# Run only frontend tests
npm run test:frontend

# Run frontend tests in watch mode (for development)
npm run test:watch

# Run Rust tests with coverage (requires cargo-tarpaulin)
cd rust-parser && cargo tarpaulin --ignore-tests
```

### Test Coverage

- **Rust Tests**: 21 unit and integration tests covering core parsing functions, metre detection, bond analysis, and error handling
- **Frontend Tests**: 4 tests covering input validation, Tamil text recognition, and component behavior

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

## Architecture

Thepulimaangani consists of:

- **Frontend**: React application built with TanStack Start, using TanStack Router for routing and Tailwind CSS for styling
- **Backend**: Rust WebAssembly module for high-performance Tamil prosody parsing
- **Data Flow**: Text input → WebAssembly parser → JSON analysis → React display

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Usage

1. Enter Tamil poetry text in the textarea
2. Click "Parse Poem" to analyze the prosody
3. View detailed analysis including:
   - Original text
   - Metre type
   - Letter counts (vowels, consonants, etc.)
   - Prosodic structure with syllables and feet
   - Error messages if parsing fails

## Contributing

This project aims to accurately implement traditional Tamil prosodic analysis. The Rust parser is based on established Tamil prosody rules and is continuously improved.

## License

MIT License
