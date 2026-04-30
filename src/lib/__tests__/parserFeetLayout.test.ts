import { describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
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
    const p = poem(lines)
    const full = parsedSampleThreeLines()
    const buckets = feetPerPhysicalLine({ ...full, original_text, lines }, original_text)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]!.length).toBe(lines[0]!.feet.length)
    expect(buckets[1]!.length).toBe(lines[1]!.feet.length)
    expect(buckets[0]![0]!.syllables[0]!.text).toBe(lines[0]!.feet[0]!.syllables[0]!.text)
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
  it('one UI group per foot; word label is syllable texts joined (real parser feet)', () => {
    const sample = parsedSampleThreeLines()
    const feet = sample.lines[0]!.feet.slice(0, 2)
    const g = groupsFromFeet(feet)
    expect(g).toHaveLength(2)
    expect(g[0]!.word).toBe(feet[0]!.syllables.map((s) => s.text).join(''))
    expect(g[1]!.word).toBe(feet[1]!.syllables.map((s) => s.text).join(''))
  })
})
