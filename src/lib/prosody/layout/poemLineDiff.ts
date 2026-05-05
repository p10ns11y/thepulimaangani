import { feetPerPhysicalLine } from '#/lib/prosody/layout/parserFeetLayout'
import { physicalPoemLines } from '#/lib/prosody/layout/mapFeetToPhysicalLines'
import type { ParsedPoem } from '#/types/parsedPoem'

/** Raw newline split (preserves structure even when a line is empty). */
export function normLines(s: string): string[] {
  return s.replace(/\r\n/g, '\n').split('\n')
}

export type LineDiffOp = { type: 'equal' | 'insert' | 'delete'; line: string }

/**
 * Longest-common-subsequence line diff: inserts (draft-only), deletes (base-only), equal.
 * Used for preview styling so a removed line is visible as deleted, not mis-colored as the next line.
 */
export function lineDiffOps(base: string, draft: string): LineDiffOp[] {
  const baseLines = normLines(base)
  const draftLines = normLines(draft)
  const baseLineCount = baseLines.length
  const draftLineCount = draftLines.length
  const lcsLengthTable: number[][] = Array.from({ length: baseLineCount + 1 }, () =>
    new Array(draftLineCount + 1).fill(0),
  )
  for (let basePrefixLen = 1; basePrefixLen <= baseLineCount; basePrefixLen++) {
    for (let draftPrefixLen = 1; draftPrefixLen <= draftLineCount; draftPrefixLen++) {
      if (baseLines[basePrefixLen - 1] === draftLines[draftPrefixLen - 1]) {
        lcsLengthTable[basePrefixLen]![draftPrefixLen] =
          lcsLengthTable[basePrefixLen - 1]![draftPrefixLen - 1]! + 1
      } else {
        lcsLengthTable[basePrefixLen]![draftPrefixLen] = Math.max(
          lcsLengthTable[basePrefixLen - 1]![draftPrefixLen]!,
          lcsLengthTable[basePrefixLen]![draftPrefixLen - 1]!,
        )
      }
    }
  }
  const opsReversed: LineDiffOp[] = []
  let baseIdx = baseLineCount
  let draftIdx = draftLineCount
  while (baseIdx > 0 || draftIdx > 0) {
    if (baseIdx > 0 && draftIdx > 0 && baseLines[baseIdx - 1] === draftLines[draftIdx - 1]) {
      opsReversed.push({ type: 'equal', line: baseLines[baseIdx - 1]! })
      baseIdx--
      draftIdx--
    } else if (
      draftIdx > 0 &&
      (baseIdx === 0 ||
        (lcsLengthTable[baseIdx]![draftIdx - 1] ?? 0) >= (lcsLengthTable[baseIdx - 1]![draftIdx] ?? 0))
    ) {
      opsReversed.push({ type: 'insert', line: draftLines[draftIdx - 1]! })
      draftIdx--
    } else if (baseIdx > 0) {
      opsReversed.push({ type: 'delete', line: baseLines[baseIdx - 1]! })
      baseIdx--
    }
  }
  opsReversed.reverse()
  return opsReversed
}

/**
 * 0-based draft line indices for lines that are new or modified vs base (LCS “insert” steps only).
 * Kept for header/summary that refer to the current text area lines.
 */
export function getChangedLineIndices(base: string, draft: string): number[] {
  const ops = lineDiffOps(base, draft)
  const out: number[] = []
  let draftIndex = 0
  for (const op of ops) {
    if (op.type === 'insert') {
      out.push(draftIndex)
      draftIndex++
    } else if (op.type === 'equal') {
      draftIndex++
    }
  }
  return out
}

export function syllableCountsPerPhysicalLine(poemText: string, parsed: ParsedPoem): number[] {
  const lines = physicalPoemLines(poemText)
  if (lines.length === 0) return []
  const perLine = feetPerPhysicalLine(parsed, poemText)
  return perLine.map((lineFeet) =>
    lineFeet.reduce((syllableTotal, foot) => syllableTotal + foot.syllables.length, 0),
  )
}
