import type { ParsedFoot } from '#/types/parsedPoem'

/** Split editor text into physical lines (newlines preserved as structure). */
export function physicalPoemLines(poemText: string): string[] {
  const t = poemText.replace(/\r\n/g, '\n')
  if (!t.trim()) return []
  return t.split('\n')
}

/**
 * Assigns parser feet to physical lines by **character-weighted** cumulative boundaries.
 * WASM does not emit per-line feet; this is a display heuristic so the preview aligns with line breaks.
 */
export function mapFeetToPhysicalLines(poemText: string, feet: ParsedFoot[]): ParsedFoot[][] {
  const lines = physicalPoemLines(poemText)
  if (lines.length === 0) return []
  if (feet.length === 0) return lines.map(() => [])

  const nLines = lines.length
  const nFeet = feet.length

  if (nLines === 1) return [feet.slice()]

  const weights = lines.map((line) => {
    const core = line.replace(/\s/g, '')
    return Math.max(1, [...core].length)
  })
  const totalW = weights.reduce((a, b) => a + b, 0)

  const boundaries: number[] = [0]
  for (let i = 0; i < nLines; i++) {
    const cumWeight = weights.slice(0, i + 1).reduce((a, b) => a + b, 0)
    const pos = Math.round((cumWeight / totalW) * nFeet)
    boundaries.push(Math.min(nFeet, pos))
  }
  boundaries[boundaries.length - 1] = nFeet
  for (let i = 1; i < boundaries.length; i++) {
    boundaries[i] = Math.max(boundaries[i]!, boundaries[i - 1]!)
  }

  const out: ParsedFoot[][] = []
  for (let i = 0; i < nLines; i++) {
    out.push(feet.slice(boundaries[i], boundaries[i + 1]))
  }
  return out
}

/** Words on a line for the reference row (split on whitespace). */
export function lineWordsForDisplay(line: string): string[] {
  const parts = line.trim().split(/\s+/).filter(Boolean)
  if (parts.length > 0) return parts
  return line.length > 0 ? [line] : ['…']
}
