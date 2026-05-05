import type { ParsedFoot } from '#/types/parsedPoem'

import type { feetPerPhysicalLine } from '#/lib/prosody/layout/parserFeetLayout'

type FeetBuckets = ReturnType<typeof feetPerPhysicalLine>

export function totalFeet(buckets: FeetBuckets): number {
  return buckets.reduce((totalFeetOnPoem, feetOnLine) => totalFeetOnPoem + feetOnLine.length, 0)
}

export function totalSyllablesFromBuckets(buckets: FeetBuckets): number {
  return buckets.reduce(
    (totalSyllablesOnPoem, feetOnLine) =>
      totalSyllablesOnPoem +
      feetOnLine.reduce((syllablesOnLine, foot) => syllablesOnLine + foot.syllables.length, 0),
    0,
  )
}

export function flattenFootSyllableTexts(lineFeet: ParsedFoot[]): string[] {
  return lineFeet.flatMap((foot) => foot.syllables.map((syllable) => syllable.text))
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
  const syllablesOnFirstPhysicalLine = flattenFootSyllableTexts(buckets[0] ?? []).length
  const syllablesOnRemainingLines = buckets
    .slice(1)
    .reduce((totalSyllables, feetOnLine) => totalSyllables + flattenFootSyllableTexts(feetOnLine).length, 0)
  return (
    syllablesOnFirstPhysicalLine > 0 &&
    syllablesOnRemainingLines === 0 &&
    syllablesOnFirstPhysicalLine === totalSyllablesInParse &&
    totalSyllablesInParse > 4
  )
}
