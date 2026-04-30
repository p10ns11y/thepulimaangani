import type { ParsedFoot } from '#/types/parsedPoem'

import type { feetPerPhysicalLine } from '#/lib/parserFeetLayout'

type FeetBuckets = ReturnType<typeof feetPerPhysicalLine>

export function totalFeet(buckets: FeetBuckets): number {
  return buckets.reduce((n, row) => n + row.length, 0)
}

export function totalSyllablesFromBuckets(buckets: FeetBuckets): number {
  return buckets.reduce(
    (n, row) => n + row.reduce((m, ft) => m + ft.syllables.length, 0),
    0,
  )
}

export function flattenFootSyllableTexts(lineFeet: ParsedFoot[]): string[] {
  return lineFeet.flatMap((ft) => ft.syllables.map((s) => s.text))
}

/**
 * Detects the “whole poem syllables only on row 0” bug when physical rows > 1
 * but chips only appear on the first row.
 */
export function isFirstRowOnlyEntirePoemLayout(
  buckets: FeetBuckets,
  totalSyllablesInParse: number,
): boolean {
  if (buckets.length < 2) return false
  const s0 = flattenFootSyllableTexts(buckets[0] ?? []).length
  const sRest = buckets
    .slice(1)
    .reduce((n, row) => n + flattenFootSyllableTexts(row).length, 0)
  return s0 > 0 && sRest === 0 && s0 === totalSyllablesInParse && totalSyllablesInParse > 4
}
