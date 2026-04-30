# AGENTS.md - React Frontend Guidelines for Thepulimaangani

## Overview
React/TypeScript frontend using TanStack Start/Router, Vite, Tailwind CSS. Focus on user interface for Tamil prosody analysis.

## Structure
- `components/`: Reusable UI (Header, Footer, LookToggle)
- `components/ui/`: shadcn/ui primitives (Button, Card, Tabs, Select, …)
- `components/prosody/`: Prosody lab surface (samples, Pretext viewport, parse panels)
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

## Branches and post-merge sync

- **Default branch:** `malar`. Name your branch using [trinity-and-native-agents/AGENT_ROLES.md](../trinity-and-native-agents/AGENT_ROLES.md) first; full detail in [creators.md](../trinity-and-native-agents/creators.md).
- **After every PR merge:** run `./dx/syncagents.sh` from the repo root; see [dx/sync-branches-architecture-simple.md](../dx/sync-branches-architecture-simple.md).

## Backlog / future UI
- **Site-wide font size** (toolbar or settings) for Tamil body text and panels — accessibility and reading comfort.

## Rules
- Dynamic import WASM modules for performance
- Handle Tamil text input/output properly (Unicode support)
- Test components with Vitest
- Run `pnpm run typecheck` after changes
- No direct WASM file edits (use build scripts)