import { describe, expect, it } from 'vitest'

import { splitGraphemes } from '#/lib/grapheme'
import { tamilIlaganam, uyirmeiMatrixFlat, uyirmeiPretextSource } from '#/lib/tamilIlaganam'

describe('splitGraphemes', () => {
  it('splits the site title by grapheme', () => {
    const t = 'Thepulimaangani'
    const g = splitGraphemes(t)
    expect(g.join('')).toBe(t)
  })
})

describe('uyirmeiPretextSource', () => {
  it('yields 12 lines matching the uyirmei matrix rows', () => {
    const s = uyirmeiPretextSource()
    const lines = s.split('\n')
    expect(lines).toHaveLength(12)
    for (let i = 0; i < 12; i++) {
      expect(lines[i]).toBe(tamilIlaganam.uyirmei_matrix[i]!.join(''))
    }
  })
})

describe('uyirmeiMatrixFlat', () => {
  it('has 216 characters', () => {
    expect(uyirmeiMatrixFlat()).toHaveLength(216)
  })
})
