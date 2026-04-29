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
            foot_type: 'Ner-Ner',
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
})

describe('groupsFromFeet', () => {
  it('one group per foot with concatenated word label', () => {
    const g = groupsFromFeet([
      {
        foot_type: 'Ner-Nirai',
        syllables: [
          { text: 'நண்', syllable_type: 'Ner' },
          { text: 'ணு', syllable_type: 'Nirai' },
        ],
      },
      {
        foot_type: 'Ner-Nirai',
        syllables: [
          { text: 'வார்', syllable_type: 'Ner' },
          { text: 'வினை', syllable_type: 'Nirai' },
        ],
      },
    ])
    expect(g).toHaveLength(2)
    expect(g[0]!.word).toBe('நண்ணு')
    expect(g[1]!.word).toBe('வார்வினை')
  })
})
