import { describe, expect, it } from 'vitest'

import { feetPerPhysicalLine, groupsFromFeet } from '#/lib/parserFeetLayout'
import {
  parsedFoot,
  parsedLine,
  parsedPoem,
  parsedSyllable,
} from '#/lib/__tests__/fixtures/parsedPoemBuilders'

describe('feetPerPhysicalLine', () => {
  it('uses structured lines when physical line count matches parsed.lines', () => {
    const p = parsedPoem({
      lines: [
        parsedLine([
          parsedFoot('Ner-Ner', [parsedSyllable('ab', 'Ner')]),
        ]),
        parsedLine([
          parsedFoot('Nirai', [parsedSyllable('cd', 'Nirai')]),
        ]),
      ],
    })
    const poemText = 'first line\nsecond'
    const buckets = feetPerPhysicalLine(p, poemText)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]![0]!.syllables[0]!.text).toBe('ab')
    expect(buckets[1]![0]!.syllables[0]!.text).toBe('cd')
  })

  it('returns empty feet per line when counts differ (no wrong-row slices)', () => {
    const p = parsedPoem({
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('only', 'Ner')])])],
    })
    const poemText = 'line one\nline two'
    const buckets = feetPerPhysicalLine(p, poemText)
    expect(buckets).toHaveLength(2)
    expect(buckets[0]).toEqual([])
    expect(buckets[1]).toEqual([])
  })
})

describe('groupsFromFeet', () => {
  it('emits one UI group per foot; word label is syllable texts concatenated', () => {
    const g = groupsFromFeet([
      parsedFoot('Ner-Nirai', [parsedSyllable('நண்', 'Ner'), parsedSyllable('ணு', 'Nirai')]),
      parsedFoot('Ner-Nirai', [parsedSyllable('வார்', 'Ner'), parsedSyllable('வினை', 'Nirai')]),
    ])
    expect(g).toHaveLength(2)
    expect(g[0]!.word).toBe('நண்ணு')
    expect(g[1]!.word).toBe('வார்வினை')
  })
})
