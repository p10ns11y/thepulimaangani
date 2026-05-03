---
name: Prosody UI state portability + thin hooks
overview: Reduce React-local hooks to presentation-only; keep domain sync and cross-cutting UI in framework-agnostic layers (extend existing XState; optional small global UI store). Goal — swapping or adding another view layer (Svelte, Astro islands, etc.) stays bounded work, not a rewrite of business logic.
todos:
  - id: inventory-hooks
    content: Audit `components/prosody/**` — tag each useState/useEffect as domain vs presentation vs browser integration (scroll, observers)
    status: pending
  - id: single-writer-table
    content: Document one owner per field (poemText, draft, live snapshot, parse result, metre/sample, shell look) — no duplicate sources
    status: pending
  - id: boundary-rules
    content: Write team rules — React renders + dispatches events only; no poem/parse truth in component state
    status: pending
  - id: extend-prosody-machine
    content: Prefer extending prosodyLab/app actors for lab domain; add tiny invoked actors only where order matters (debounced live pipeline optional extraction)
    status: pending
  - id: cross-cutting-ui-store
    content: If needed, one thin slice for tab chrome / transient lab UI — Zustand or XState parallel region; never mirror poem/parse fields
    status: pending
  - id: adapter-pattern-future-views
    content: Define thin adapters — same actor/store subscriptions for React today; thin bindings for Svelte/Astro later (subscribe + send)
    status: pending
isProject: false
---

# Prosody lab: fewer hooks, portable sync, cross-cutting UI

## Why this exists

Local `useState` / `useEffect` chains make **sync bugs** (live vs Structure vs parse button) and **test fragility** (hook dispatcher, double React). Cross-cutting concerns (tabs, preferences, layout) scattered across components become **hard to reuse** if we add **Svelte**, **Astro islands**, or another renderer — unless **domain and sync logic live outside React**.

This plan is a **reference for a future PR**; it does not prescribe library churn without measurement.

---

## Principles

1. **One writer per domain field** — poem text, draft, live WASM snapshot, manual parse result, metre/sample selection. Never duplicate across Zustand + XState + `useState`.

2. **React = view + wiring** — components **subscribe** and **dispatch intents** (events / actions). Avoid storing **authoritative** poem/parse state in component state.

3. **Cross-cutting UI** (which result tab is active, panel chrome, non-persisted layout toggles) may use a **small dedicated store** or an **XState parallel region** — but keep it **orthogonal** to parser domain.

4. **Browser-only concerns** stay in thin hooks or small modules — `IntersectionObserver`, scroll anchoring, `matchMedia`. They **do not own** poem or parse truth.

5. **Future view libs** bind the **same** actor/store via thin adapters: `subscribe(selector)`, `send(event)` — no business logic inside Svelte/Astro files.

---

## Current baseline (do not throw away)

- **[app.machine.ts](src/machines/app.machine.ts)** — shell `look`, invokes **prosody** child.
- **[prosodyLab.machine.ts](src/machines/prosodyLab.machine.ts)** — metre, samples, editor open/draft/apply, manual parse invoke, `live` updates from `LivePreviewController`.

**Extend and clarify** this graph before adding a second global store.

---

## Target shape (conceptual)

| Layer | Owns | Examples |
|-------|------|----------|
| **XState (app + prosody)** | Serialized lab domain | `poemText`, `poemDraft`, `editorOpen`, `parse.result`, `live`, metre/sample events, parse invoke |
| **Optional: tiny UI store or XState `ui` region** | Cross-cutting **presentation** | Active parse-result tab id, “hints expanded”, rail visibility — **not** poem content |
| **Live preview pipeline** | Either stay **controller + machine events** (today) or **one invoked actor** that owns debounce + WASM call — **single** output to `live` |
| **React components** | DOM, a11y, composition | Cards, tabs markup, `fireEvent`-friendly boundaries |
| **Thin hooks** | Imperative DOM only | Sentinel scroll, reduced motion |

---

## Optional: Zustand vs more XState

- **Prefer XState** when transitions are **ordered** (editor vs parse vs sample change) or you want **inspectability** and tests without React.

- **Consider Zustand (or similar)** only for **flat, high-churn UI state** that would clutter the machine (many booleans for layout). **Rule:** Zustand fields must not duplicate `poemText` / `live` / `parse.result`.

- **Anti-pattern:** mirroring machine context into Zustand “for convenience” — creates two truths.

---

## Migration phases (future PR)

1. **Inventory** — spreadsheet of every hook in `components/prosody/**`: domain vs presentation vs DOM.

2. **Single-writer table** — one column: canonical owner (machine event vs UI store vs local).

3. **Collapse duplicates** — move stray `useState` that mirrors machine fields into **selectors + send**.

4. **Cross-cutting UI** — introduce **one** small store or machine region for tabs/chrome; persist only if product asks.

5. **Adapter sketch** — document `subscribeProsody(actor)` / `sendProsody(event)` for a hypothetical Svelte wrapper (no implementation required in phase 1).

6. **Tests** — prefer **machine/store tests** for rules; RTL for “wiring + a11y”.

---

## Success criteria

- Prosody route components show **mostly** `useSelector` / `useStore` / props — **no** `useState` for poem or parse.
- Changing **live vs Structure sync** does not require hunting three `useEffect`s.
- A second UI framework would **import the same actor/store** and subscribe — parser rules unchanged.

---

## Related docs

- Prior refactor: [frontend_prosody_state_machine_refactor.plan.md](./frontend_prosody_state_machine_refactor.plan.md)
- Branch/sync policy: [AGENTS.md](../../AGENTS.md), [dx/HUMAN_SYNC.md](../../dx/HUMAN_SYNC.md)
