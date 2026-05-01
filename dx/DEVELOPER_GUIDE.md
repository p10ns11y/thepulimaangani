# Developer guide

Longer reference for contributors. For a **quick path** from clone to running app (about five minutes), use the root [README.md](../README.md).

---

## What this project is

Tamil prosody (யாப்பு) analysis in the browser: **React / TanStack Start** frontend and a **Rust → WebAssembly** parser (`tamil-seiyul-alagi/`). A rewrite of [Avalokitam](https://github.com/virtualvinodh/avalokitam). Shipped vs planned parser behaviour: [ARCHITECTURE.md](../ARCHITECTURE.md), [tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md](../tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md), [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49).

---

## Features (summary)

- Syllables as நேர் / நிரை; feet as **Ner/Nirai pattern strings** per linguistic word
- Metre **hypotheses** (heuristic); linkage (**Talai**) with line/word positions; WASM JSON uses Latin keys with a **`*Talai`** suffix on new linkage enums (legacy `*thalai` spellings still accepted by the parser on deserialize)
- Optional **`parse_features`** (51 floats) and **`top_k_metre_hypotheses`** on `ParseResult` JSON when metre detection runs; training export / Monte Carlo notes: [`tamil-seiyul-alagi/TRAINING_PROCESS.md`](../tamil-seiyul-alagi/TRAINING_PROCESS.md)
- JSON export; live parsing in the UI

---

## Testing and coverage

**CI** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)): `pnpm run build`, `pnpm run typecheck`, `pnpm run test` (Rust + Vitest). Node version: [`.nvmrc`](../.nvmrc) (currently **22**; `package.json` `engines.node` is `>=22`).

```bash
pnpm run test           # Rust + frontend
pnpm run test:rust      # Parser only
pnpm run test:frontend  # Vitest only
pnpm run typecheck
```

**Optional Rust line coverage** (requires [cargo-tarpaulin](https://github.com/xd009642/tarpaulin)):

```bash
cd tamil-seiyul-alagi && cargo tarpaulin
```

**CRAP-style report** (complexity + coverage, matches CI inputs): prerequisites in [§ CRAP report (local)](#crap-report-local). Then:

```bash
pnpm run crap:local
```

Open **`crap-report.md`** at repo root. GitHub Actions job `crap_analysis` uploads artifact **`crap-analysis`**. Parser risk baseline: [`tamil-seiyul-alagi/QUALITY_CRAP_BASELINE.md`](../tamil-seiyul-alagi/QUALITY_CRAP_BASELINE.md).

Coverage expectations: see root [`AGENTS.md`](../AGENTS.md).

`rust-parser-prototype/` is an archived Avalokitam-era prototype; do not extend it.

---

## Architecture

- **Frontend:** TanStack Start, Router, Tailwind — [`src/`](../src/)
- **Parser:** WASM crate — [`tamil-seiyul-alagi/`](../tamil-seiyul-alagi/)
- **Flow:** text → `parse_poem_wasm` → JSON → React

Details: [ARCHITECTURE.md](../ARCHITECTURE.md).

---

## CI and deployment

### GitHub Actions

- Workflow runs on `malar` / `main` and on PRs (build, typecheck, test).
- **CRAP artifact:** job `crap_analysis` → download **`crap-analysis`** → open **`crap-report.md`**.

### CRAP report (local)

Combines Lizard (Rust tree) with `cargo llvm-cov` and Vitest coverage summary → **`crap-report.md`**.

**One-time prerequisites**

- Python 3 + `pip install lizard` (`lizard` on `PATH`)
- `rustup component add llvm-tools-preview` and `cargo install cargo-llvm-cov`

**Run**

```bash
pnpm run crap:local
```

Generated inputs (`lizard-rust.xml`, `tamil-seiyul-alagi/llvm-cov-summary.json`, `coverage/`) are gitignored.

### Vercel (this repo)

Wrong dashboard settings (e.g. output = `dist` only) can yield a **blank page** or **404 on `/`**.

1. **Install** — [`vercel.json`](../vercel.json) `installCommand` runs [`build/ensure-wasm-build-tools.sh`](../build/ensure-wasm-build-tools.sh) (Rust target `wasm32-unknown-unknown`, pinned `wasm-pack`), then `corepack enable` and `pnpm install --frozen-lockfile`. First build can take several minutes.

2. **Build** — `buildCommand`: `NITRO_PRESET=vercel pnpm run build`. That preset writes [Build Output API v3](https://vercel.com/docs/build-output-api/v3) under [`.vercel/output`](../.vercel/output). Local `pnpm run build` without the env still produces `dist/` and `.output/` for preview and tests.

3. **Output directory** — must be **`.vercel/output`**, not `dist` or `dist/client` alone. Server-rendered `/` comes from Nitro, not a static root `index.html` in `dist/`.

4. **Vite** — [`vite.config.ts`](../vite.config.ts): TanStack Start + Nitro; see [TanStack Start on Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start).

**Dashboard:** set **Production Branch** to `malar`. PRs get previews; if missing, check Git integration and [deployment protection](https://vercel.com/docs/deployment-protection).

Short summary for agents: [`AGENTS.md`](../AGENTS.md).

### Other hosts

**Cloudflare Pages:** a static `dist` root alone is often insufficient for full-stack TanStack Start; follow current TanStack + Cloudflare docs for routing/workers.

---

## Study materials

[`.grok/study-materials/`](../.grok/study-materials/) — reference prose and research notes.

---

## Using the app (in browser)

1. Open the app (local: `http://localhost:3000` after `pnpm run dev`).
2. Enter Tamil text or load a sample, parse, inspect syllables/feet/metre hints.
3. Export JSON or copy results as needed.

---

## Contribution and branches

- **Default branch:** `malar`.
- **Pick a role/branch:** [trinity-and-native-agents/AGENT_ROLES.md](../trinity-and-native-agents/AGENT_ROLES.md) first; full tables in [creators.md](../trinity-and-native-agents/creators.md), [maintainers.md](../trinity-and-native-agents/maintainers.md), [renewers.md](../trinity-and-native-agents/renewers.md), [ainthinai.md](../trinity-and-native-agents/ainthinai.md).
- **After merging a PR:** **`./dx/syncagents-agent.sh`** (autonomous agents / minimal clones — skips mass `origin/*` locals; optional `PUSH=1` only when your environment is safe). **`./dx/syncagents-push-human.sh`** (human maintainer — full remote tracking + gated push). **`./dx/syncagents.sh`** is the core engine (creates missing local `origin/*` tracking branches by default, then hard-resets non-default branches to the default tip; skips open PR heads and `legacy`). **Agents:** read **Autonomous agents & safety** in [sync-branches-architecture-simple.md](./sync-branches-architecture-simple.md); use **`DRY_RUN=1 ./dx/syncagents-agent.sh`** first. [HUMAN_SYNC.md](./HUMAN_SYNC.md).

---

## License

MIT — see [README.md](../README.md).
