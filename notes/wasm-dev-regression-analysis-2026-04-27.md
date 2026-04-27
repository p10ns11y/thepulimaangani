# WASM Dev Serving Regression Analysis (2026-04-27)

## Incident summary

- Symptom: `pnpm run dev` returned `404 Not Found` for `thepulimaangani_parser_bg.wasm`.
- Observed request path: `/src/wasm/thepulimaangani_parser_bg.wasm` (from browser network panel).
- Impact: parser initialization failed, live parse flow failed in UI.

## Scope

- Runtime affected: browser dev server flow (`pnpm run dev`).
- Runtime not affected: Node local script flow (`test_parser.js`) because it initializes with bytes from `fs.readFileSync(...)`.

## Why previous production builds still worked

Before adding the `public/wasm/` copy step, production builds could still work because the pre-build step copied wasm artifacts into `src/wasm/`, and then `vite build` processed those source imports into bundled output under `dist/assets` (including the wasm payload and rewritten asset references). In short: prod succeeded through Vite's build-time asset pipeline, while dev failed due to runtime `/src/*` URL serving behavior under Nitro.

## Timeline and change analysis

### Before latest commit (`c1f7dbe`)

- Browser parser load happened in route code:
  - `const wasm = await import('../wasm/thepulimaangani_parser.js')`
  - `await wasm.default()`
- Vite config did **not** include Nitro plugin:
  - plugins were `devtools()`, `tailwindcss()`, `tanstackStart()`, `viteReact()`.
- This flow had been working in dev.

### Latest commit (`cfa7c33`) introduced two relevant shifts together

1. Added Nitro Vite plugin:
   - `plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()]`
2. Moved parsing call into `src/lib/wasmParse.ts` but kept wasm-bindgen default init path:
   - `await wasm.default()`

## Root cause

The generated wasm-bindgen loader in `src/wasm/thepulimaangani_parser.js` resolves default WASM path via:

- `new URL('thepulimaangani_parser_bg.wasm', import.meta.url)`

Under the current dev toolchain (TanStack Start + Nitro), this default URL resolved to `/src/wasm/...` and the dev server treated it as an app route path instead of a served wasm asset URL, producing 404.

So the regression is **not** from parser logic changes. It is an **asset URL resolution mismatch** exposed by framework/plugin runtime behavior change in latest commit.

## Why `test_parser.js` still worked

`test_parser.js` uses Node bytes directly:

- `const wasmBuffer = fs.readFileSync('./tamil-seiyul-alagi/pkg/thepulimaangani_parser_bg.wasm')`
- `await init(wasmBuffer)`

This bypasses browser URL resolution entirely, so it does not detect browser dev-serving regressions.

## Fix applied

In `src/lib/wasmParse.ts`, switched to explicit Vite-resolved wasm URL:

- `import wasmModuleUrl from '#/wasm/thepulimaangani_parser_bg.wasm?url'`
- `await wasm.default(wasmModuleUrl)`

This removes reliance on `import.meta.url` path guessing and forces asset-pipeline URL resolution in dev/build.

## Validation

- `pnpm run typecheck` passed.
- `pnpm run test:frontend` passed.
- Expected runtime outcome: wasm request should now go to Vite asset URL (not raw `/src/wasm/...` route).

## Regression classification

- Type: Runtime integration regression (dev asset serving).
- Trigger: Combined framework/plugin migration + default wasm-bindgen path resolution assumption.
- Blast radius: Browser-based parse initialization flows.

## Prevention actions

1. Keep wasm init explicit in browser code (`?url` or explicit URL object).
2. Add a small browser integration smoke test (or Playwright check) asserting wasm network response is 200 in dev.
3. Add release checklist item: when changing Vite plugins/runtime adapters, verify static asset modules (`.wasm`, fonts, workers).
4. Preserve `test_parser.js` as Node-only parser correctness check, but do not treat it as browser asset-serving coverage.


