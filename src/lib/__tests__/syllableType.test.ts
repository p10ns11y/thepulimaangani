import { describe, expect, it } from 'vitest'

import { isNerSyllableType } from '#/lib/prosody/syllableType'

describe('isNerSyllableType', () => {
  it('accepts Ner variants', () => {
    expect(isNerSyllableType('Ner')).toBe(true)
    expect(isNerSyllableType('ner')).toBe(true)
    expect(isNerSyllableType(' NER ')).toBe(true)
    expect(isNerSyllableType('நேர்')).toBe(true)
  })

  it('rejects Nirai and empty', () => {
    expect(isNerSyllableType('Nirai')).toBe(false)
    expect(isNerSyllableType('nirai')).toBe(false)
    expect(isNerSyllableType('நிரை')).toBe(false)
    expect(isNerSyllableType('')).toBe(false)
    expect(isNerSyllableType(undefined)).toBe(false)
  })
})
