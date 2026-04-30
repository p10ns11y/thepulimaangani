# Thepulimaangani 

Language and grammar tools


## Tamil Prosody Parser

A modern web application for analyzing Tamil poetry prosody, built with React, Rust WebAssembly, and TanStack Start. thepulimaangani provides syllable classification (நேர்/நிரை), word-level feet as **Ner/Nirai patterns**, metre **hypotheses**, consecutive-foot **linkage** (with classical talai names still a roadmap item), and structured JSON for the UI. See [ARCHITECTURE.md](./ARCHITECTURE.md), `tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md`, and [issue #49](https://github.com/p10ns11y/thepulimaangani/issues/49) for shipped vs planned behaviour.

## Project History

This project is a complete rewrite of the original [Avalokitam](https://github.com/virtualvinodh/avalokitam) project, which was built with PHP backend and Vue.js frontend. The new version maintains the same core functionality while adopting a modern web technology stack for improved performance, maintainability, and developer experience.

## Features

- **Syllable Analysis**: Classifies syllables as நேர் (Ner) or நிரை (Nirai)
- **Foot grouping**: One foot per linguistic word; machine-readable **Ner/Nirai pattern** strings (classical foot names are a presentation/UI follow-up)
- **Metre hypotheses**: Ranked metre candidates from the parser (heuristic; full classical rules are roadmap — see `tamil-seiyul-alagi/src/metre.rs` and `tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md`)
- **Letter counting**: Grapheme-based count in `ParseResult`
- **Linkage structure**: Consecutive feet with line/word positions; **`VenTalai` placeholder** on every edge until transition-table linkage lands
- **Real-time Parsing**: Instant analysis of Tamil text input
- **Export Functionality**: Export analysis results as JSON for further processing

## Installation

### Prerequisites

- Node.js 20 or higher (see `package.json` `engines` and [`.nvmrc`](.nvmrc))
- Rust 1.70 or higher (for building the WebAssembly parser)
- wasm-pack (for WebAssembly compilation)
- `rsync` (optional but recommended for local dev) to sync `wasm-pack` output into `src/wasm/` — see [`build/rsync_rust_wasm_to_web.sh`](build/rsync_rust_wasm_to_web.sh). **Production** (Vercel, minimal CI) uses [`build/copy_wasm_to_src.sh`](build/copy_wasm_to_src.sh) with `cp` when `rsync` is not installed ([`build/tamil_seiyul_alagi_wasm.sh`](build/tamil_seiyul_alagi_wasm.sh) picks automatically).

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

CI (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `pnpm run build`, `pnpm run typecheck`, and `pnpm run test` (Rust `cargo test` + Vitest).

### Commands

```bash
# Run all tests (Rust + Frontend)
pnpm run test

# Run only Rust tests
pnpm run test:rust

# Run only frontend tests
pnpm run test:frontend
```

### Optional: Rust line coverage (local)

Requires [cargo-tarpaulin](https://github.com/xd009642/tarpaulin):

```bash
cd tamil-seiyul-alagi && cargo tarpaulin
```

For a combined complexity + coverage report matching CI inputs, see **`pnpm run crap:local`** and [README § CI and deployment](README.md#ci-and-deployment).

### Coverage targets

Project guideline: maintain **high coverage** in both Rust and frontend (see root `AGENTS.md`). Exact line percentages change with the tree; use tarpaulin / `crap-report.md` for current numbers.

`rust-parser-prototype/` contains a quick prototype build based on original Avalokitam. It is archived for reference and is not meant to be extended.

## Architecture

Thepulimaangani consists of:

- **Frontend**: React application built with TanStack Start, using TanStack Router for routing and Tailwind CSS for styling
- **Backend**: Rust WebAssembly module for high-performance Tamil prosody parsing
- **Data Flow**: Text input → WebAssembly parser → JSON analysis → React display

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## CI and deployment

### GitHub Actions

- **Workflow:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on pushes to `malar` and `main` and on all pull requests: full `pnpm run build` (WebAssembly + Vite), `pnpm run typecheck`, and `pnpm run test` (Rust + Vitest). Node version matches [`.nvmrc`](.nvmrc).
- **CRAP report:** Job `crap_analysis` uploads artifact **`crap-analysis`** (download from the run’s **Artifacts**). Open **`crap-report.md`** for the summary. Manual baseline notes live in [`tamil-seiyul-alagi/QUALITY_CRAP_BASELINE.md`](tamil-seiyul-alagi/QUALITY_CRAP_BASELINE.md).

### CRAP report (local)

Combines cyclomatic complexity (Lizard XML on the Rust parser tree) with line coverage (`cargo llvm-cov` + Vitest `coverage-summary.json`). Writes **`crap-report.md`** at the repo root.

**Prerequisites (one-time):**

- Python 3 + `pip install lizard` (CLI must be on `PATH` as `lizard`)
- `rustup component add llvm-tools-preview` and `cargo install cargo-llvm-cov`

**Run (matches CI inputs):**

```bash
pnpm run crap:local
```

Then open **`crap-report.md`**. Generated inputs (`lizard-rust.xml`, `tamil-seiyul-alagi/llvm-cov-summary.json`, `coverage/`) are gitignored; re-run the command when you want a fresh report.

### Vercel (this repo’s working flow)

These pieces work together; changing one in isolation (for example, pointing the project at `dist` only) can produce a **blank page** or **404 on `/`**.

1. **Install** — [`vercel.json`](vercel.json) `installCommand` runs [`build/ensure-wasm-build-tools.sh`](build/ensure-wasm-build-tools.sh) (`rustup` when needed, the `wasm32-unknown-unknown` target, and a pinned `wasm-pack` binary on `PATH`), then `corepack enable` and `pnpm install --frozen-lockfile`. The Node version comes from the Vercel build image and [`.nvmrc`](.nvmrc) / `engines`. The subsequent `pnpm run build` compiles the Rust parser and copies WASM into [`src/wasm/`](AGENTS.md) (gitignored). The first Vercel build can take several minutes.

2. **Build** — `buildCommand` is `NITRO_PRESET=vercel pnpm run build`. The `NITRO_PRESET=vercel` prefix forces Nitro’s **vercel** preset and a [Build Output API v3](https://vercel.com/docs/build-output-api/v3) bundle under [`.vercel/output`](https://vercel.com/docs/build-output-api/v3#directory-structure) (`config.json`, `static/`, `functions/__server*`). A normal local or CI `pnpm run build` (without that prefix) still writes `dist/` and `.output/` for `vite preview` and tests.

3. **Output directory** — `outputDirectory` in `vercel.json` is **`.vercel/output`**. Vercel must deploy that directory. It overrides a mistaken **Output Directory** in the dashboard (for example `dist` or `dist/client`) that would deploy only the Vite client tree. Build logs that list `client/assets/...` and hashed JS/CSS/WASM are expected: those are the client artifacts; the **HTML for `/` is still rendered by the serverless function**, not by a root `index.html` in `dist/`.

4. **Vite** — [`vite.config.ts`](vite.config.ts) uses [`tanstackStart()`](https://tanstack.com/start/latest) and [`nitro()`](https://v3.nitro.build/) (no manual `preset` in code; the `NITRO_PRESET` env from step 2 selects the Vercel preset on deploy). This matches the [TanStack Start on Vercel](https://vercel.com/docs/frameworks/full-stack/tanstack-start) guidance.

**Production vs preview** (Vercel dashboard, not in `vercel.json`): In **Project → Settings → Git**, set **Production Branch** to `malar` for the production URL. **Pull requests** from connected branches get **Preview** deployments; if they are missing, check the same **Git** section and [deployment protection](https://vercel.com/docs/deployment-protection) / team policy.

### Other hosts

- **Cloudflare Pages:** the same `pnpm run build` can be a starting point, but a **static** root of `dist` alone is often wrong for TanStack Start—use current **TanStack Start + Cloudflare** docs for full-stack or worker routing.

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

**Git workflow:** default branch is `malar`. Pick a branch name from the pollinator table in [trinity-and-native-agents/creators.md](trinity-and-native-agents/creators.md). After merging a PR, run `./dx/syncagents.sh` from the repo root (see [dx/sync-branches-architecture-simple.md](dx/sync-branches-architecture-simple.md)).

Contributions are welcome! The project embraces a cosmic AI collaboration model:

- **[Creators](/trinity-and-native-agents/creators.md)** — Feature creation & pollinators (new life)
- **[Maintainers](/trinity-and-native-agents/maintainers.md)** — Krishna avatars (preservation & balance)
- **[Renewers](/trinity-and-native-agents/renewers.md)** — Shiva's fierce forms (renewal through pruning)
- **[Ainthinai](/trinity-and-native-agents/ainthinai.md)** — Ainthinai Tribal Earth Guardians (local land council)

Please see individual files for contribution guidelines and areas of focus.

## License

MIT License
