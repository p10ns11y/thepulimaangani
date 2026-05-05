import type { ParsedFoot, ParsedPoem } from '#/types/parsedPoem'

import { physicalPoemLines } from '#/lib/prosody/layout/mapFeetToPhysicalLines'

const TAMIL_BLOCK = /[\u0B80-\u0BFF]/

function lineContainsTamil(line: string): boolean {
  return TAMIL_BLOCK.test(line)
}

function isBlankOnlyLine(line: string): boolean {
  return line.trim().length === 0
}

function prevNonBlankLineIndex(physical: string[], from: number): number {
  for (let scanLineIndex = from - 1; scanLineIndex >= 0; scanLineIndex--) {
    if (!isBlankOnlyLine(physical[scanLineIndex]!)) return scanLineIndex
  }
  return -1
}

function nextNonBlankLineIndex(physical: string[], from: number): number {
  for (let scanLineIndex = from + 1; scanLineIndex < physical.length; scanLineIndex++) {
    if (!isBlankOnlyLine(physical[scanLineIndex]!)) return scanLineIndex
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
  let structuredLineCursor = 0

  for (let physicalLineIndex = 0; physicalLineIndex < nPhys; physicalLineIndex++) {
    const line = physical[physicalLineIndex] ?? ''
    if (isBlankOnlyLine(line)) {
      const prevNonBlankIndex = prevNonBlankLineIndex(physical, physicalLineIndex)
      const nextNonBlankIndex = nextNonBlankLineIndex(physical, physicalLineIndex)
      const prevTamil =
        prevNonBlankIndex >= 0 && lineContainsTamil(physical[prevNonBlankIndex]!)
      const nextTamil =
        nextNonBlankIndex < nPhys && lineContainsTamil(physical[nextNonBlankIndex]!)
      // Stanza gap (between Tamil blocks) or leading blank before the first Tamil line — WASM
      // `lines()` can omit those empty physical rows.
      if (nextTamil && (prevTamil || prevNonBlankIndex < 0)) {
        out.push([])
        continue
      }
    }

    if (structuredLineCursor >= structuredFeet.length) return null
    out.push(structuredFeet[structuredLineCursor]!)
    structuredLineCursor += 1
  }

  return structuredLineCursor === structuredFeet.length ? out : null
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
    word: foot.syllables.map((syllable) => syllable.text).join(''),
    syllables: foot.syllables,
  }))
}
