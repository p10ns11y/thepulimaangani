/**
 * Real parser output for {@link SAMPLE_POEM_THREE_LINES} (same defaults as `parse_poem_wasm`: `uyir_u`).
 * Regenerate committed parser JSON after Rust changes (repo root): **`pnpm run dump:test-fixtures`**, then **`pnpm run build:wasm`**.
 */
import rawParseResult from '#/lib/__tests__/fixtures/samplePoemThreeLines.parseResult.json'

import { wasmJsonToParsedPoem } from '#/lib/wasmWireParseResult'
import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import type { ParsedPoem } from '#/types/parsedPoem'

export const SAMPLE_POEM_THREE_LINES = rawParseResult.original_text as string

/** Full `ParsedPoem` from the committed `ParseResult` JSON (via the same adapter as WASM). */
export function parsedSampleThreeLines(): ParsedPoem {
  const p = wasmJsonToParsedPoem(rawParseResult)
  if (!p) throw new Error('samplePoemThreeLines.parseResult.json failed wasmJsonToParsedPoem')
  return p
}

/**
 * First two physical lines of the sample + matching `lines` slice — for layout-only tests
 * without loading WASM.
 */
export function parsedSampleFirstTwoLines(): ParsedPoem {
  const full = parsedSampleThreeLines()
  const parts = full.original_text.replace(/\r\n/g, '\n').split('\n')
  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop()
  }
  const two = parts.slice(0, 2)
  const poemText = two.join('\n') + '\n'
  const lines = full.lines.slice(0, 2)
  return {
    ...full,
    original_text: poemText,
    lines,
  }
}

/** Sanity: editor line split matches fixture row count for the full sample. */
export function assertSamplePhysicalLineCount(): void {
  const full = parsedSampleThreeLines()
  const n = physicalPoemLines(SAMPLE_POEM_THREE_LINES).length
  if (n !== full.lines.length) {
    throw new Error(
      `Fixture out of sync: physicalPoemLines=${n} vs parsed.lines=${full.lines.length}. Regenerate with cargo run --example dump_live_preview_fixture`,
    )
  }
}
