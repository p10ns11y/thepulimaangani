import type { ParsedFoot, ParsedPoem } from '#/types/parsedPoem'

import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'

const TAMIL_BLOCK = /[\u0B80-\u0BFF]/

function lineContainsTamil(line: string): boolean {
  return TAMIL_BLOCK.test(line)
}

function isBlankOnlyLine(line: string): boolean {
  return line.trim().length === 0
}

function prevNonBlankLineIndex(physical: string[], from: number): number {
  for (let j = from - 1; j >= 0; j--) {
    if (!isBlankOnlyLine(physical[j]!)) return j
  }
  return -1
}

function nextNonBlankLineIndex(physical: string[], from: number): number {
  for (let j = from + 1; j < physical.length; j++) {
    if (!isBlankOnlyLine(physical[j]!)) return j
  }
  return physical.length
}

/**
 * WASM `parsed.lines` omits blank-only physical rows (Rust `lines()` skips empty lines). The editor
 * still shows those rows, so merge: insert empty `feet` buckets for stanza-gap blanks **between**
 * two Tamil-bearing lines without consuming a parser line.
 */
function mergeFeetBucketsForBlankStanzaLines(
  physical: string[],
  structuredFeet: ParsedFoot[][],
): ParsedFoot[][] | null {
  const nPhys = physical.length
  const nStruct = structuredFeet.length
  if (nStruct === 0 || nPhys < nStruct) return null
  if (nPhys === nStruct) return structuredFeet

  const out: ParsedFoot[][] = []
  let si = 0

  for (let pi = 0; pi < nPhys; pi++) {
    const line = physical[pi] ?? ''
    if (isBlankOnlyLine(line)) {
      const prevI = prevNonBlankLineIndex(physical, pi)
      const nextI = nextNonBlankLineIndex(physical, pi)
      const prevTamil = prevI >= 0 && lineContainsTamil(physical[prevI]!)
      const nextTamil = nextI < nPhys && lineContainsTamil(physical[nextI]!)
      // Stanza gap (between Tamil blocks) or leading blank before the first Tamil line — WASM
      // `lines()` can omit those empty physical rows.
      if (nextTamil && (prevTamil || prevI < 0)) {
        out.push([])
        continue
      }
    }

    if (si >= structuredFeet.length) return null
    out.push(structuredFeet[si]!)
    si += 1
  }

  return si === structuredFeet.length ? out : null
}

/**
 * Feet per physical editor line: use WASM `parsed.lines` when line counts match, or when the only
 * extra physical rows are blank stanza separators between Tamil lines (WASM omits those lines).
 * On other mismatches (mid-edit before debounced parse returns), return **empty** feet per line so
 * we never slice parser feet onto wrong rows (the old character-weight fallback caused bleed-over).
 */
export function feetPerPhysicalLine(parsed: ParsedPoem | null, poemText: string): ParsedFoot[][] {
  const physical = physicalPoemLines(poemText)
  if (physical.length === 0) return []

  const structured = parsed?.lines ?? []
  if (structured.length === physical.length) {
    return structured.map((ln) => ln.feet)
  }

  const structuredFeet = structured.map((ln) => ln.feet)
  const merged = mergeFeetBucketsForBlankStanzaLines(physical, structuredFeet)
  if (merged) return merged

  return physical.map(() => [])
}

/** One UI group per **linguistic word** (one WASM foot). Syllables stay parser order. */
export function groupsFromFeet(lineFeet: ParsedFoot[]): { word: string; syllables: ParsedFoot['syllables'] }[] {
  return lineFeet.map((foot) => ({
    word: foot.syllables.map((s) => s.text).join(''),
    syllables: foot.syllables,
  }))
}
