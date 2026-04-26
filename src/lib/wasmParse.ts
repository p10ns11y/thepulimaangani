import { validatePoemInput } from '#/lib/prosodyValidation'

/** Validates input, loads WASM once per call, returns raw JSON string from the parser. */
export async function runWasmParse(poemText: string): Promise<string> {
  const inputError = validatePoemInput(poemText)
  if (inputError) {
    throw new Error(inputError)
  }
  const wasm = await import('../wasm/thepulimaangani_parser.js')
  await wasm.default()
  const parseResult = wasm.parse_poem_wasm(poemText)
  if (parseResult.includes('Error') || parseResult.trim() === '') {
    throw new Error(
      'Unable to analyze the provided text. Please check that it contains valid Tamil poetry.',
    )
  }
  return parseResult
}
