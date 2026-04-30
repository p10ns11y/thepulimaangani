import { describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
import type { ParsedPoem } from '#/types/parsedPoem'

function poem(lines: ParsedPoem['lines']): ParsedPoem {
  return {
    original_text: '',
    metre_type: '—',
    letter_count: 0,
    vikalpa_count: 0,
    syllables: [],
    lines,
  }
}

describe('feetPerPhysicalLine', () => {
  it('uses structured lines when count matches physical lines', () => {
    const p = poem([
      {
        line_class: '—',
        feet: [
          {
            foot_type: 'Ner',
            syllables: [{ text: 'ab', syllable_type: 'Ner' }],
          },
        ],
      },
      {
        line_class: '—',
        feet: [
          {
            foot_type: 'Nirai',
            syllables: [{ text: 'cd', syllable_type: 'Nirai' }],
          },
        ],
      },
    ])
    const text = 'first line\nsecond'
    const buckets = feetPerPhysicalLine(p, text)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]![0]!.syllables[0]!.text).toBe('ab')
    expect(buckets[1]![0]!.syllables[0]!.text).toBe('cd')
  })

  it('returns empty feet per line when parser line count mismatches (avoid wrong-row slices)', () => {
    const p = poem([
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'only', syllable_type: 'Ner' }] }],
      },
    ])
    const text = 'line one\nline two'
    const buckets = feetPerPhysicalLine(p, text)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]).toEqual([])
    expect(buckets[1]).toEqual([])
  })
})

describe('groupsFromFeet', () => {
  it('one UI group per foot; word label is syllable texts joined (not a prosody assertion)', () => {
    // Abstract parts — avoids implying real Tamil Ner/Nirai splits (e.g. இரண்டு is not one Nirai acai).
    const g = groupsFromFeet([
      {
        foot_type: 'Ner-Nirai',
        syllables: [
          { text: 'w1a', syllable_type: 'Ner' },
          { text: 'w1b', syllable_type: 'Nirai' },
        ],
      },
      {
        foot_type: 'Ner-Nirai',
        syllables: [
          { text: 'w2a', syllable_type: 'Ner' },
          { text: 'w2b', syllable_type: 'Nirai' },
        ],
      },
    ])
    expect(g).toHaveLength(2)
    expect(g[0]!.word).toBe('w1aw1b')
    expect(g[1]!.word).toBe('w2aw2b')
  })
})
