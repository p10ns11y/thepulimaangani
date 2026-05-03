import { describe, expect, it } from 'vitest'

import { formatTotalLetters, graphemeCountOriginalText, resolveTotalLetters } from '#/lib/textualInsightsCounts'
import type { ParsedPoem } from '#/types/parsedPoem'

function base(overrides: Partial<ParsedPoem> = {}): ParsedPoem {
  return {
    original_text: 'அ',
    metre_type: '—',
    letter_count: 1,
    vikalpa_count: 0,
    syllables: [],
    lines: [],
    ...overrides,
  }
}

describe('textualInsightsCounts', () => {
  it('uses numeric letter_count for total', () => {
    expect(formatTotalLetters(base({ letter_count: 56 }))).toBe('56')
    expect(resolveTotalLetters(base({ letter_count: 56 }))).toBe(56)
  })

  it('falls back to grapheme count when letter_count is not a number', () => {
    const p = base({ original_text: 'ab', letter_count: { x: 1 } as ParsedPoem['letter_count'] })
    expect(resolveTotalLetters(p)).toBeNull()
    expect(graphemeCountOriginalText(p)).toBe(2)
    expect(formatTotalLetters(p)).toBe('2')
  })
})
