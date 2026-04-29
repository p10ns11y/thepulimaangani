import { feetPerPhysicalLine } from '#/lib/parserFeetLayout'
import { physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
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
  const a = normLines(base)
  const b = normLines(draft)
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
      }
    }
  }
  const out: LineDiffOp[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      out.push({ type: 'equal', line: a[i - 1]! })
      i--
      j--
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1] ?? 0) >= (dp[i - 1]![j] ?? 0))) {
      out.push({ type: 'insert', line: b[j - 1]! })
      j--
    } else if (i > 0) {
      out.push({ type: 'delete', line: a[i - 1]! })
      i--
    }
  }
  out.reverse()
  return out
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
  return perLine.map((lineFeet) => lineFeet.reduce((n, f) => n + f.syllables.length, 0))
}
