import { describe, expect, it } from 'vitest'

import { mapFeetToPhysicalLines, physicalPoemLines } from '#/lib/mapFeetToPhysicalLines'
import type { ParsedFoot } from '#/types/parsedPoem'

const mkFoot = (id: string): ParsedFoot => ({
  foot_type: 'Ner-Ner',
  syllables: [{ text: id, syllable_type: 'Ner' }],
})

describe('physicalPoemLines', () => {
  it('matches Rust str::lines length when poem ends with newline (no phantom 4th line)', () => {
    expect(physicalPoemLines('a\nb\nc\n')).toEqual(['a', 'b', 'c'])
    expect(physicalPoemLines('a\nb\nc')).toEqual(['a', 'b', 'c'])
  })
})

describe('mapFeetToPhysicalLines', () => {
  it('returns one bucket for a single physical line', () => {
    const feet = [mkFoot('a'), mkFoot('b')]
    const out = mapFeetToPhysicalLines('one line', feet)
    expect(out).toHaveLength(1)
    expect(out[0]).toHaveLength(2)
  })

  it('splits feet across two lines by weight', () => {
    const feet = [mkFoot('1'), mkFoot('2'), mkFoot('3'), mkFoot('4')]
    const poem = 'short\nverylonglinetext'
    expect(physicalPoemLines(poem)).toHaveLength(2)
    const out = mapFeetToPhysicalLines(poem, feet)
    expect(out[0]!.length + out[1]!.length).toBe(4)
    expect(out[0]!.length).toBeLessThan(4)
    expect(out[1]!.length).toBeGreaterThan(0)
  })
})
