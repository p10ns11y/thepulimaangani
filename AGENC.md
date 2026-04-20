# Repository Guidelines

# Thepulimaangani - Tamil Prosody Parser

## Project Structure & Module Organization
- .cta.json exists at the repository root.
- .cursor/ exists at the repository root.
- .git/ exists at the repository root.
- .gitignore exists at the repository root.
- .grok/ exists at the repository root.
- .kilo/ exists at the repository root.
- .tanstack/ exists at the repository root.
- .vscode/ exists at the repository root.
- ARCHITECTURE.md exists at the repository root.
- branches.md exists at the repository root.
- dist/ exists at the repository root.
- node_modules/ exists at the repository root.
- package-lock.json exists at the repository root.
- package.json exists at the repository root.
- public/ exists at the repository root.
- README.md exists at the repository root.
- tamil-seiyul-alagi/ exists at the repository root.
- src/ exists at the repository root.
- table.csv exists at the repository root.
- test_parser.js exists at the repository root.
- tsconfig.json exists at the repository root.
- tsconfig.tsbuildinfo exists at the repository root.
- vite.config.ts exists at the repository root.
- src/ currently contains __tests__/, components/, router.tsx, routes/, routeTree.gen.ts, styles.css, wasm/.
- ARCHITECTURE.md describes planned future structure including components/          # Reusable UI components, Header.tsx      # Site header with navigation, Footer.tsx      # Site footer, ThemeToggle.tsx # Dark/light theme toggle, routes/             # File-based routing, __root.tsx      # Root layout component, index.tsx       # Main application page, about.tsx       # About page, styles.css          # Global styles and Tailwind imports, router.tsx          # Router configuration, wasm/               # WebAssembly module bindings, thepulimaangani_parser.js; those paths are not all present yet.
- branches.md describes planned future structure including Your, Every, We; those paths are not all present yet.

## Build, Test, and Development Commands
- npm run dev  # vite dev --port 3000
- npm run build  # npm run build:wasm && vite build
- npm run build:wasm  # bash build/tamil_seiyul_alagi_wasm.sh
- npm run build:only  # vite build
- npm run preview  # vite preview
- npm run test  # vitest run

## Coding Style & Naming Conventions
- No explicit coding-style document was discovered in the current repository contents.

## Testing Guidelines
- npm run test  # vitest run

## Commit & Pull Request Guidelines
- Recent commit subject: Add project base
- Recent commit subject: Add branches strategy (#14)
- Recent commit subject: Cleanup legacy (#13)
- Recent commit subject: Initial commit: Add sample rusty-react-app
