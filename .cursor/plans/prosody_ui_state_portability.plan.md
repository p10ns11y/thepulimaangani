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
    content: If needed, TanStack Store or XState parallel region for tab chrome / transient lab UI — never mirror poem/parse fields (see plan § TanStack Store)
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

## TanStack Store — when it fits (and “locked in”)

You already ship **TanStack Start / Router**. **[TanStack Store](https://tanstack.com/store)** is a **small, framework-agnostic** subscription store (vanilla core + React hooks). It is a plausible choice for **cross-cutting UI** that should **not** bloat XState — but it **does** anchor maintenance to the TanStack stack.

### Good use cases (low overhead)

| Use case | Why TanStack Store |
|----------|---------------------|
| **Parse result panel UI chrome** — remember last selected tab (Live / Structure / Text flow) across navigations **within** the lab | Pure presentation; orthogonal to poem/parse; survives remount without growing prosody machine context. |
| **Shared read-mostly “lab shell” state** — e.g. sidebar collapsed, compact density — consumed by **multiple routes** under the same app shell | One subscribe API from shell layout + leaf panels; avoids prop-drilling without encoding layout in XState unless URL/analytics needs it. |
| **Cross-route breadcrumbs / “last opened sample id”** (non-authoritative hints) | Keeps **routing-adjacent** fluff out of `prosodyLab` machine until product ties it to URL params. |
| **Thin derived caches** for expensive-but-pure transforms of **already-owned** data — *only* if you **subscribe** from machine-fed inputs and **never** duplicate source fields | Example: keyed memo by `live.layoutVersion`; invalidated when parent passes new snapshot — still **one upstream truth** (machine `live`). |

### Bad use cases (extra overhead — avoid)

| Use case | Prefer instead |
|----------|----------------|
| Poem text, draft, editor open, metre/sample, parse invoke, `live`, `parse.result` | **prosodyLab / app XState** |
| Debounced WASM pipeline | **Module + machine events** (existing `LivePreviewController` shape) |
| Anything that must be **replayable / ordered / inspectable** as a workflow | **XState** |
| **Mirroring** machine fields “for convenience” in the store | Nothing — fix selectors |

### “Locked in?” tradeoff

- **Pros:** Same vendor as Router/Start; small API; vanilla core suits **future non-React** bindings better than a React-first store default.
- **Cons:** Another layer beside **XState**; requires **clear boundaries** so TanStack Store never becomes a second prosody brain.

**Rule:** TanStack Store holds **UI/session chrome** or **pure derivatives** with a **documented invalidation rule** from machine-owned snapshots — **not** parallel copies of domain fields.

---

## Optional: Zustand vs more XState

- **Prefer XState** when transitions are **ordered** (editor vs parse vs sample change) or you want **inspectability** and tests without React.

- **Consider Zustand (or similar)** only for **flat, high-churn UI state** that would clutter the machine (many booleans for layout). **Rule:** Zustand fields must not duplicate `poemText` / `live` / `parse.result`.

- **Anti-pattern:** mirroring machine context into Zustand “for convenience” — creates two truths.

---

## Library & pattern fit map (reference)

*Tight map for this stack: prosody lab, WASM, XState already in place.* **Goal:** maximum leverage, minimum new concepts to maintain.

### Rule of thumb

**Extend what you own first.** Every new library is another mental model, upgrade path, and “who writes this field?” diagram. For Thepulimaangani that usually means:

1. **App / prosody XState** — anything that must stay **consistent across panels** (poem, draft, parse snapshot, live preview, loading/errors, sample/metre).
2. **Thin module + machine events** — debounced WASM pipeline feeding **`prosody.LIVE.STATE`** (already shaped like this).
3. **Local React state** — **only** true UI chrome (e.g. uncontrolled tab index, transient hover).
4. **localStorage + tiny helpers** — persisted prefs (typewriter, physics) — **don’t** introduce a store until reads scatter everywhere.

Add **Zustand / Nanostores / TanStack Store / Jotai / signals** only where XState is **worse** than the dependency cost (tables below). For **TanStack Store** specifically, see the section **TanStack Store — when it fits (and “locked in”)** above.

### Where each *pattern* fits without extra overhead

| Pattern / tool | Best fit (this repo) | Overhead to avoid |
|----------------|----------------------|-------------------|
| **XState (actors / machines)** | Editor lifecycle, sample changes, manual parse, **`live` replacing stale UI**, any **ordered** flow | Duplicating the same field in a second store |
| **No global store — functions + events** | `LivePreviewController`-style: debounce → WASM → adapt → **one** `prosody.LIVE.STATE` | Second subscription layer for a single pipeline |
| **Nanostores** | Shared **ephemeral** UI that **many** small islands need (Astro) | Until non-React surfaces **exist**; **never** duplicate poem/parse |
| **TanStack Store** | Cross-route / shell **UI chrome**; tab memory; dedicated section above | Mirroring `poemText` / `live` |
| **Zustand** | Many **independent** layout booleans with **no** ordering rules | Easiest place to **accidentally mirror** machine state — high discipline |
| **Jotai** | Many **small derived** pieces from same WASM JSON | Often **overkill** if few views derive from `live` |
| **Valtio** | Large **mutable** nested blobs | Poem/parse are mostly **strings + immutable JSON** — poor default fit |
| **Legend-State** | **Persistence / sync** (offline, conflict handling) | Skip until real sync requirements |
| **Preact / signal-style libs** | UIs with **thousands** of fine-grained scalars | Parser updates are **batchy** (debounced WASM) — usually unnecessary |

### One-page summary (this product)

| Concern | Prefer | Usually skip |
|---------|--------|----------------|
| Poem, draft, editor, parse, live, samples | **XState prosody** | Second global store |
| Debounced WASM → live JSON | **Controller module + machine events** | Signals / atoms for this alone |
| Structure vs Live sync | **Derived from same `live` / resolved JSON** | Duplicate copies in Jotai |
| Tab index, panel chrome | **Local state or Radix** until duplicated | New store for one panel |
| Prefs (sound, physics) | **localStorage hooks** | Global store until used in many places |
| Future Svelte/Astro island | **Subscribe to same actor / small UI-only store** | Rewriting domain logic per framework |

### Bottom line

**Lowest maintenance:** **deeper XState + thin non-React modules** for side effects, not more generic state libraries. Add **Nanostores or TanStack Store** only when a **second renderer** or **cross-route** UI state makes that cost real — not preemptively.

That keeps boundaries **solid** without importing Solid’s ecosystem.

---

## Migration phases (future PR)

1. **Inventory** — spreadsheet of every hook in `components/prosody/**`: domain vs presentation vs DOM.

2. **Single-writer table** — one column: canonical owner (machine event vs UI store vs local).

3. **Collapse duplicates** — move stray `useState` that mirrors machine fields into **selectors + send**.

4. **Cross-cutting UI** — introduce **one** small store (prefer TanStack Store if aligned with § above, else XState parallel region) for tabs/chrome; persist only if product asks.

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
