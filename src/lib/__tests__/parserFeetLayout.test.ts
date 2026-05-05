import { describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/prosody/layout/parserFeetLayout'
import type { ParsedPoem } from '#/types/parsedPoem'

import {
  parsedSampleFirstTwoLines,
  parsedSampleThreeLines,
} from '#/lib/__tests__/fixtures/samplePoemThreeLines.fixture'

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
  it('uses structured lines when physical line count matches parsed.lines', () => {
    const { original_text, lines } = parsedSampleFirstTwoLines()
    const full = parsedSampleThreeLines()
    const buckets = feetPerPhysicalLine({ ...full, original_text, lines }, original_text)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]!.length).toBe(lines[0]!.feet.length)
    expect(buckets[1]!.length).toBe(lines[1]!.feet.length)
    expect(buckets[0]![0]!.syllables[0]!.text).toBe(lines[0]!.feet[0]!.syllables[0]!.text)
  })

  it('returns empty feet per line when parser line count mismatches (avoid wrong-row slices)', () => {
    const mismatchParsedPoem = poem([
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'only', syllable_type: 'Ner' }] }],
      },
    ])
    const text = 'line one\nline two'
    const buckets = feetPerPhysicalLine(mismatchParsedPoem, text)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]).toEqual([])
    expect(buckets[1]).toEqual([])
  })

  it('keeps structured feet aligned when blank stanza lines sit between Tamil rows', () => {
    const poemText = 'கற்றது\n\nமொழிந்தது'
    const lines: ParsedPoem['lines'] = [
      {
        line_class: '—',
        feet: [
          {
            foot_type: 'Ner-Nirai',
            syllables: [
              { text: 'கற்', syllable_type: 'Ner' },
              { text: 'றது', syllable_type: 'Nirai' },
            ],
          },
        ],
      },
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'மொழிந்தது', syllable_type: 'Ner' }] }],
      },
    ]
    const buckets = feetPerPhysicalLine(poem(lines), poemText)
    expect(buckets).toHaveLength(3)
    expect(buckets[0]!.length).toBe(1)
    expect(buckets[1]).toEqual([])
    expect(buckets[2]!.length).toBe(1)
    expect(buckets[2]![0]!.syllables[0]!.text).toBe('மொழிந்தது')
  })

  it('handles two consecutive blank stanza separators between Tamil rows', () => {
    const poemText = 'கற்றது\n\n\nமொழிந்தது'
    const lines: ParsedPoem['lines'] = [
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'கற்றது', syllable_type: 'Ner' }] }],
      },
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'மொழிந்தது', syllable_type: 'Ner' }] }],
      },
    ]
    const buckets = feetPerPhysicalLine(poem(lines), poemText)
    expect(buckets).toHaveLength(4)
    expect(buckets[0]!.length).toBe(1)
    expect(buckets[1]).toEqual([])
    expect(buckets[2]).toEqual([])
    expect(buckets[3]!.length).toBe(1)
  })
})

describe('groupsFromFeet', () => {
  it('one UI group per foot; word label is syllable texts joined (real parser feet)', () => {
    const sample = parsedSampleThreeLines()
    const feet = sample.lines[0]!.feet.slice(0, 2)
    const linguisticWordGroups = groupsFromFeet(feet)
    expect(linguisticWordGroups).toHaveLength(2)
    expect(linguisticWordGroups[0]!.word).toBe(feet[0]!.syllables.map((syllable) => syllable.text).join(''))
    expect(linguisticWordGroups[1]!.word).toBe(feet[1]!.syllables.map((syllable) => syllable.text).join(''))
  })
})
