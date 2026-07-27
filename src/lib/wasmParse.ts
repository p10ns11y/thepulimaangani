import { validatePoemInput } from '#/lib/prosodyValidation'

type WasmModule = {
  default: (opts?: { module_or_path: string }) => Promise<unknown>
  parse_poem_wasm: (text: string) => string
}

/**
 * Shared init so concurrent first-load callers (live bridge + optional PARSE)
 * do not race wasm-bindgen's unguarded double-init path. Failed init is
 * cleared so the next call can retry (cold deploy / flaky CDN fetch).
 */
let wasmInit: Promise<WasmModule> | null = null

async function loadWasmModule(): Promise<WasmModule> {
  // Dynamic import: wasm-pack output is gitignored until `pnpm run build:wasm`.
  // @ts-ignore TS2307 — no `.js` in tree for `tsc`; CI `build` step generates it before typecheck.
  const wasm = (await import('../wasm/thepulimaangani_parser.js')) as WasmModule
  // Nitro dev can intercept `/src/*`; serve wasm from stable public path instead.
  await wasm.default({ module_or_path: '/wasm/thepulimaangani_parser_bg.wasm' })
  return wasm
}

function ensureWasm(): Promise<WasmModule> {
  if (!wasmInit) {
    wasmInit = loadWasmModule().catch((err) => {
      wasmInit = null
      throw err
    })
  }
  return wasmInit
}

/** Validates input, loads WASM once (shared), returns raw JSON string from the parser. */
export async function runWasmParse(poemText: string): Promise<string> {
  const inputError = validatePoemInput(poemText)
  if (inputError) {
    throw new Error(inputError)
  }
  const wasm = await ensureWasm()
  const parseResult = wasm.parse_poem_wasm(poemText)
  if (parseResult.includes('Error') || parseResult.trim() === '') {
    throw new Error(
      'Unable to analyze the provided text. Please check that it contains valid Tamil poetry.',
    )
  }
  return parseResult
}

/** Test helper — reset singleton between cases that mock dynamic import. */
export function __resetWasmInitForTests(): void {
  wasmInit = null
}
