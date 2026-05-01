# Thepulimaangani

Tamil prosody (யாப்பு) in the browser: React (TanStack Start) + Rust WebAssembly parser. See [ARCHITECTURE.md](./ARCHITECTURE.md) for stack and data flow.

---

## Quick start (about 5 minutes)

Do these steps **in order** the first time you work on the repo.

### 0. Prerequisites (install once on your machine)

| Tool | Why |
|------|-----|
| **Git** | Clone this repository |
| **Node.js 22+** | Matches [`package.json`](package.json) `engines` and [`.nvmrc`](.nvmrc) |
| **pnpm** | Package manager (`corepack enable` then `corepack prepare pnpm@10.33.0 --activate`, or install pnpm per [pnpm.io](https://pnpm.io/installation)) |
| **Rust (stable)** + **rustup** | Builds the WASM parser |
| **wasm-pack** | `cargo install wasm-pack` |
| **`wasm32-unknown-unknown`** target | `rustup target add wasm32-unknown-unknown` |

Optional: **`rsync`** for faster local WASM copy (otherwise the build script uses `cp`). See [`build/tamil_seiyul_alagi_wasm.sh`](build/tamil_seiyul_alagi_wasm.sh).

### 1. Clone and enter the repo

```bash
git clone https://github.com/p10ns11y/thepulimaangani.git
cd thepulimaangani
```

### 2. Install Node dependencies

Uses a pinned pnpm from `packageManager` in [`package.json`](package.json):

```bash
corepack enable
pnpm install
```

### 3. Run the development server

`pnpm run dev` builds WASM once, then starts Vite on **http://localhost:3000**.

```bash
pnpm run dev
```

- **Frontend-only edits:** save files; Vite reloads.
- **Rust parser edits:** run `pnpm run build:wasm`, then refresh (or restart `pnpm run dev`).

### 4. (Optional) Typecheck and tests

Same commands as CI:

```bash
pnpm run typecheck
pnpm run test
```

---

## Production build (local)

```bash
pnpm run build
pnpm run preview
```

---

## Deployment

Vercel must use **`.vercel/output`** (Nitro Build Output API v3), not `dist` alone. Full checklist: [**CI and deployment** in `dx/DEVELOPER_GUIDE.md`](dx/DEVELOPER_GUIDE.md#ci-and-deployment). Short summary for agents: [`AGENTS.md`](AGENTS.md).

---

## More documentation

| Doc | Contents |
|-----|----------|
| [`dx/DEVELOPER_GUIDE.md`](dx/DEVELOPER_GUIDE.md) | Testing, CRAP report, Vercel details, contribution links, study materials |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Frontend vs parser, WASM pipeline, shipped vs roadmap behaviour |
| [`AGENTS.md`](AGENTS.md) | Commands, quality gates, Vercel note, branch sync |
| [`trinity-and-native-agents/AGENT_ROLES.md`](trinity-and-native-agents/AGENT_ROLES.md) | Which Git branch / role to use for a task |
| [`tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md`](tamil-seiyul-alagi/MACHINE_FIRST_SPEC.md) | Machine-first parser spec (draft) |
| [`tamil-seiyul-alagi/AGENTS.md`](tamil-seiyul-alagi/AGENTS.md) | Parser crate: WASM build, linkage/metre JSON naming (`*Talai`), quality gates |
| [`tamil-seiyul-alagi/PARSE_FEATURES.md`](tamil-seiyul-alagi/PARSE_FEATURES.md) | 51-dim `parse_features` layout for WASM / training |
| [`tamil-seiyul-alagi/TRAINING_PROCESS.md`](tamil-seiyul-alagi/TRAINING_PROCESS.md) | CSV / JSONL export, Monte Carlo evaluation, PCA example |

---

## License

MIT License
