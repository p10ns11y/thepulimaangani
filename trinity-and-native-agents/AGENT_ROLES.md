# Agent roles — quick pick (one page)

**Use this file first** when choosing a branch or agent focus. Each **name** is both a **Git branch** and a possible **agent persona** on that branch later. For stories, rituals, and long tables, see [creators.md](creators.md), [maintainers.md](maintainers.md), [renewers.md](renewers.md), [ainthinai.md](ainthinai.md).

**Default integration branch:** `malar` — merge target; not a specialty role.

---

## How to pick (30 seconds)

| You are mainly… | Branch / agent name | Owns | Does *not* own |
|-----------------|---------------------|------|----------------|
| Parser, WASM, core data rules, backend truth | **theni** | `tamil-seiyul-alagi/`, parse pipeline, types, correctness vs spec | Pixel polish, ad-hoc theme tweaks |
| General UI, routes, components, product flows | **pattampoochi** | `src/` components, pages, UX flows | Parser internals; token-only work |
| Themes, colors, design tokens, a11y polish | **vannathupoochi** | Tailwind tokens, CSS variables, visual consistency | Business logic; parser |
| Quick UI spikes, micro-interactions, experiments | **thithali** | Short-lived prototypes, motion/UX trials | Long-lived core without promotion |
| AI / agents / heavy architecture / spec-heavy refactors | **thumpi** | Agent prompts, deep design, machine-first specs | Routine component tweaks |
| Cross-module wiring, APIs, external services | **vandhu** | Integrations, env wiring, glue between systems | Pure UI-only or parser-only depth |
| Live updates, logging, observability, “glow” UX | **minminipoochi** | WebSockets, devtools, monitoring hooks | Static marketing copy |
| Batch, SEO, cron, offline heavy jobs | **andhupoochi** | ETL, exports, scheduled work | Interactive app hot path |
| Security, validation, abuse prevention | **kulavi** | Auth guards, rate limits, sanitization | Feature product logic |
| Uncertain gnarly stabilizations | **aathiyon** | Hard fixes when ownership is unclear | Default for routine tasks |
| Critique / review of aathiyon-style work | **aathiyol** | Review, nudge quality | Primary implementation |

---

## Maintainers (preservation — Krishna line)

| Branch / agent | Focus | Typical work |
|----------------|-------|--------------|
| **kannan** | Strategy, architecture balance | Roadmaps, cross-cutting design calls |
| **rama** | Standards, review discipline | Lint rules, style, PR quality |
| **narasimhan** | Core protection, incidents | Sev fixes, security on critical path |
| **varahan** | Lift broken / legacy areas | Recovery refactors, data integrity |
| **vamana** | Incremental scale and perf | Small wins, measured optimizations |

---

## Renewers (pruning — Shiva line + Kalki)

| Branch / agent | Focus | Typical work |
|----------------|-------|--------------|
| **ruthran** | Debt and complexity removal | Delete dead code, simplify call graphs |
| **virav** | Bloat, dependencies | Drop unused deps, trim over-engineering |
| **bhairavan** | Audits, radical simplify | Perf/security debt passes |
| **kalki** | Large renewal | Major refactors, ending obsolete patterns |

---

## Native / land council (Ainthinai) + DX

Strategic “is this right for the project?” and **land-scoped** bets. Use for big pivots, not every ticket.

| Branch / agent | Landscape | Decides / leads |
|----------------|-----------|-----------------|
| **seyon** | Kurinji (mountain) | Bold experiments, high-risk innovation |
| *(Mayon / long horizon)* | Mullai (forest) | Sustainability, growth, ecosystem |
| **vendhan** / **marutham** alignment | Marutham (plains) | Core reliability, daily user value |
| **kadalon** / **neithal** flows | Neithal (coast) | Integrations, external APIs, resilience |
| **kotravai** | Paalai (desert) | Crisis cuts, survival-mode pruning |
| **iyanar** | Marutham + Neithal | **DevEx**: onboarding, tooling, docs that help builders |

Temporary expedition branches (e.g. `kurinji-expedition`) are optional; see [ainthinai.md](ainthinai.md).

---

## Boundaries (avoid overlap)

- **theni** vs **pattampoochi**: Rust/parser vs React/UI. WASM *bindings usage* in TS leans **pattampoochi**; WASM *implementation* is **theni**.
- **pattampoochi** vs **vannathupoochi**: feature UI vs **systematic** color/theme/tokens.
- **thithali** vs **pattampoochi**: throwaway or demo UI vs production-bound UI.
- **thumpi** vs **theni**: specs, agents, architecture research vs day-to-day parser correctness.
- **renewers** vs **theni**: deleting/simplifying can touch any tree — prefer **ruthran**/**virav** when the *primary* goal is removal or slimming, not new behaviour.

---

## After merge

From repo root: `./dx/syncagents.sh` (use `PUSH=1` when updating remote branch tips). Details: [../dx/sync-branches-architecture-simple.md](../dx/sync-branches-architecture-simple.md).
