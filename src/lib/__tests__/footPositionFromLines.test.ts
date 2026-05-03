import { describe, expect, it } from 'vitest'

import { anchorPairForLinkageEdge, lineWordForGlobalFootIndex } from '#/lib/footPositionFromLines'
import type { ParsedLine, ParsedLinkageEdge } from '#/types/parsedPoem'

function lineWithFeet(...globals: number[]): ParsedLine {
  return {
    line_class: 'Kuraladi',
    feet: globals.map((g, i) => ({
      foot_type: 'Ner',
      syllables: [{ text: `w${i}`, syllable_type: 'Ner' }],
      foot_index_global: g,
    })),
  }
}

describe('footPositionFromLines', () => {
  it('maps global foot index to 1-based line and word', () => {
    const lines: ParsedLine[] = [
      lineWithFeet(0, 1),
      lineWithFeet(2),
    ]
    expect(lineWordForGlobalFootIndex(lines, 0)).toEqual({ line1: 1, word1: 1 })
    expect(lineWordForGlobalFootIndex(lines, 1)).toEqual({ line1: 1, word1: 2 })
    expect(lineWordForGlobalFootIndex(lines, 2)).toEqual({ line1: 2, word1: 1 })
  })

  it('uses WASM from/to when present', () => {
    const lines: ParsedLine[] = [lineWithFeet(0), lineWithFeet(1)]
    const edge: ParsedLinkageEdge = {
      from_foot: 0,
      to_foot: 1,
      linkage_type: 'VenTalai',
      linkage_special_type: 'VencirVenTalai',
      is_valid: true,
      from: { foot_index: 0, line_index: 2, word_index_in_line: 0 },
      to: { foot_index: 1, line_index: 3, word_index_in_line: 0 },
    }
    const a = anchorPairForLinkageEdge(lines, edge)
    expect(a.fromLine1).toBe(3)
    expect(a.toLine1).toBe(4)
    expect(a.crossLine).toBe(true)
  })
})
