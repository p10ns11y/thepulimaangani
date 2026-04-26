import { describe, expect, it } from 'vitest'

import { alignSyllablesToWords } from '#/lib/alignSyllablesToWords'

describe('alignSyllablesToWords', () => {
  it('maps syllables to two words', () => {
    const line = 'நண்ணு வார்வினை'
    const syllables = [
      { text: 'நண்', syllable_type: 'Ner' },
      { text: 'ணு', syllable_type: 'Nirai' },
      { text: 'வார்', syllable_type: 'Ner' },
      { text: 'வினை', syllable_type: 'Nirai' },
    ]
    const g = alignSyllablesToWords(line, syllables)
    expect(g).toHaveLength(2)
    expect(g[0]!.word).toBe('நண்ணு')
    expect(g[0]!.syllables.map((s) => s.text).join('')).toBe('நண்ணு')
    expect(g[1]!.word).toBe('வார்வினை')
    expect(g[1]!.syllables.map((s) => s.text).join('')).toBe('வார்வினை')
  })

  it('returns one group for an unspaced line', () => {
    const line = 'அகரமுதல'
    const syllables = [
      { text: 'அக', syllable_type: 'Ner' },
      { text: 'ர', syllable_type: 'Nirai' },
      { text: 'மு', syllable_type: 'Ner' },
      { text: 'தல்', syllable_type: 'Nirai' },
    ]
    const g = alignSyllablesToWords(line, syllables)
    expect(g.length).toBeGreaterThanOrEqual(1)
    expect(g[0]!.syllables.length).toBe(4)
  })
})
