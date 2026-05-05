import type { ParsedFoot } from '#/types/parsedPoem'

/** Split editor text into physical lines — aligned with Rust `str::lines()` on normalized `\n` text. */
export function physicalPoemLines(poemText: string): string[] {
  const normalizedPoemText = poemText.replace(/\r\n/g, '\n')
  if (!normalizedPoemText.trim()) return []
  const parts = normalizedPoemText.split('\n')
  // Rust `lines()` does not yield an extra empty line solely because the string ends with `\n`;
  // JS `split('\n')` adds a trailing `''` in that case → off-by-one vs WASM `ParseResult.lines`.
  if (parts.length > 1 && parts[parts.length - 1] === '') {
    parts.pop()
  }
  return parts
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
  const totalWeightAcrossLines = weights.reduce((sum, lineWeight) => sum + lineWeight, 0)

  const boundaries: number[] = [0]
  for (let i = 0; i < nLines; i++) {
    const cumulativeWeight = weights.slice(0, i + 1).reduce((sum, w) => sum + w, 0)
    const pos = Math.round((cumulativeWeight / totalWeightAcrossLines) * nFeet)
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
