import type { ParsedFoot, ParsedPoem } from '#/types/parsedPoem'

import { mapFeetToPhysicalLines, physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'

/**
 * Feet per physical editor line: prefer WASM `parsed.lines` when line counts match;
 * otherwise fall back to character-weighted {@link mapFeetToPhysicalLines}.
 */
export function feetPerPhysicalLine(parsed: ParsedPoem | null, poemText: string): ParsedFoot[][] {
  const physical = physicalPoemLines(poemText)
  if (physical.length === 0) return []

  const structured = parsed?.lines ?? []
  if (structured.length === physical.length) {
    return structured.map((ln) => ln.feet)
  }

  const flat = structured.flatMap((ln) => ln.feet)
  return mapFeetToPhysicalLines(poemText, flat.length > 0 ? flat : [])
}

/** One UI group per **linguistic word** (one WASM foot). Syllables stay parser order. */
export function groupsFromFeet(lineFeet: ParsedFoot[]): { word: string; syllables: ParsedFoot['syllables'] }[] {
  return lineFeet.map((foot) => ({
    word: foot.syllables.map((s) => s.text).join(''),
    syllables: foot.syllables,
  }))
}
