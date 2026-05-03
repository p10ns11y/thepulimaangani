import type { ParsedLine, ParsedLinkageEdge } from '#/types/parsedPoem'

/** 1-based line and word-on-line for global foot index (matches `foot_index_global` on feet). */
export function lineWordForGlobalFootIndex(
  lines: ParsedLine[],
  globalFootIndex: number,
): { line1: number; word1: number } | null {
  for (let li = 0; li < lines.length; li++) {
    const feet = lines[li].feet
    for (let wi = 0; wi < feet.length; wi++) {
      const g = feet[wi].foot_index_global
      if (g === globalFootIndex) {
        return { line1: li + 1, word1: wi + 1 }
      }
    }
  }
  return null
}

/** Prefer WASM `from`/`to`; else derive from foot indices + line layout. */
export function anchorPairForLinkageEdge(
  lines: ParsedLine[],
  edge: ParsedLinkageEdge,
): {
  fromLine1: number
  fromWord1: number
  toLine1: number
  toWord1: number
  crossLine: boolean
} {
  const fromPos =
    edge.from != null
      ? {
          line1: edge.from.line_index + 1,
          word1: edge.from.word_index_in_line + 1,
        }
      : lineWordForGlobalFootIndex(lines, edge.from_foot)
  const toPos =
    edge.to != null
      ? {
          line1: edge.to.line_index + 1,
          word1: edge.to.word_index_in_line + 1,
        }
      : lineWordForGlobalFootIndex(lines, edge.to_foot)

  const fromLine1 = fromPos?.line1 ?? 1
  const fromWord1 = fromPos?.word1 ?? 1
  const toLine1 = toPos?.line1 ?? 1
  const toWord1 = toPos?.word1 ?? 1

  return {
    fromLine1,
    fromWord1,
    toLine1,
    toWord1,
    crossLine: fromLine1 !== toLine1,
  }
}
