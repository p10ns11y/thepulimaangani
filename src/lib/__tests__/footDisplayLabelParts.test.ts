import { describe, expect, it } from 'vitest'

import { splitFootDisplayLabel } from '#/lib/footDisplayLabelParts'

describe('splitFootDisplayLabel', () => {
  it('splits Tamil name and Latin in parentheses', () => {
    expect(splitFootDisplayLabel('தேமா (thema)')).toEqual({
      tamil: 'தேமா',
      latin: 'thema',
    })
  })

  it('normalizes spaces inside parentheses', () => {
    expect(splitFootDisplayLabel('கருவிளங்காய் ( karuvilangkaay )')).toEqual({
      tamil: 'கருவிளங்காய்',
      latin: 'karuvilangkaay',
    })
  })

  it('strips trailing annotation after em dash', () => {
    expect(splitFootDisplayLabel('மா (ma) — from Rust')).toEqual({
      tamil: 'மா',
      latin: 'ma',
    })
  })

  it('splits `தமிழ் · latin` (Rust combined field)', () => {
    expect(splitFootDisplayLabel('தேமா · thema')).toEqual({
      tamil: 'தேமா',
      latin: 'thema',
    })
  })

  it('handles empty string', () => {
    expect(splitFootDisplayLabel('   ')).toEqual({ tamil: '' })
  })
})
