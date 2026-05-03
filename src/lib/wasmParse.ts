import { validatePoemInput } from '#/lib/prosodyValidation'

/** Validates input, loads WASM once per call, returns raw JSON string from the parser. */
export async function runWasmParse(poemText: string): Promise<string> {
  const inputError = validatePoemInput(poemText)
  if (inputError) {
    throw new Error(inputError)
  }
  // Dynamic import: wasm-pack output is gitignored until `pnpm run build:wasm`.
  // @ts-ignore TS2307 — no `.js` in tree for `tsc`; CI `build` step generates it before typecheck.
  const wasm = await import('../wasm/thepulimaangani_parser.js')
  // Nitro dev can intercept `/src/*`; serve wasm from stable public path instead.
  await wasm.default({ module_or_path: '/wasm/thepulimaangani_parser_bg.wasm' })
  const parseResult = wasm.parse_poem_wasm(poemText)
  if (parseResult.includes('Error') || parseResult.trim() === '') {
    throw new Error(
      'Unable to analyze the provided text. Please check that it contains valid Tamil poetry.',
    )
  }
  return parseResult
}
