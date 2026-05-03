import { describe, expect, it } from 'vitest'

import { normalizePoemText } from '#/lib/poemTextNormalize'

describe('normalizePoemText', () => {
  it('does not trim trailing newlines — line structure differs', () => {
    expect(normalizePoemText('a\n')).not.toBe(normalizePoemText('a\n\n'))
  })

  it('normalizes CRLF only', () => {
    expect(normalizePoemText('x\r\ny')).toBe('x\ny')
  })

  it('merges optional sandhi in ASCII parens for WASM (Rust skips unknown graphemes)', () => {
    expect(normalizePoemText('தெருமந்திட்(டு)')).toBe(normalizePoemText('தெருமந்திட்டு'))
  })
})
