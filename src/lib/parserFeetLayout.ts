import type { ParsedFoot, ParsedPoem } from '#/types/parsedPoem'

import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'

/**
 * Feet per physical editor line: use WASM `parsed.lines` only when line counts match.
 * On mismatch (mid-edit before debounced parse returns), return **empty** feet per line so we never
 * slice parser feet onto wrong rows (the old character-weight fallback caused bleed-over).
 */
export function feetPerPhysicalLine(parsed: ParsedPoem | null, poemText: string): ParsedFoot[][] {
  const physical = physicalPoemLines(poemText)
  if (physical.length === 0) return []

  const structured = parsed?.lines ?? []
  if (structured.length === physical.length) {
    return structured.map((ln) => ln.feet)
  }

  // Editor line count ≠ parser snapshot (mid-edit debounce, trailing newline drift before fix, etc.).
  // Do **not** use character-weight `mapFeetToPhysicalLines` — it slices feet across wrong rows.
  return physical.map(() => [])
}

/** One UI group per **linguistic word** (one WASM foot). Syllables stay parser order. */
export function groupsFromFeet(lineFeet: ParsedFoot[]): { word: string; syllables: ParsedFoot['syllables'] }[] {
  return lineFeet.map((foot) => ({
    word: foot.syllables.map((s) => s.text).join(''),
    syllables: foot.syllables,
  }))
}
