# AGENTS.md - React Frontend Guidelines for Thepulimaangani

## Overview
React/TypeScript frontend using TanStack Start/Router, Vite, Tailwind CSS. Focus on user interface for Tamil prosody analysis.

## Structure
- `components/`: Reusable UI components (Header, Footer, ThemeToggle)
- `routes/`: File-based routing (__root.tsx, index.tsx, about.tsx)
- `styles.css`: Global styles and Tailwind imports
- `router.tsx`: Router configuration
- `wasm/`: WebAssembly bindings (generated, gitignored)

## Coding Style
- Strict TypeScript: No `any`, explicit types
- Components: CamelCase, functional with hooks
- Props: Interface definitions
- Imports: Group by type (React, external, internal)
- Styling: Tailwind classes, custom CSS for complex styles

## Rules
- Dynamic import WASM modules for performance
- Handle Tamil text input/output properly (Unicode sor test/validation strategy.upport)
- Test components with Vitest
- Run `pnpm run typecheck` after changes
- No direct WASM file edits (use build scripts)