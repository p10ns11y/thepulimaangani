import { describe, expect, it } from 'vitest'

import { resolveFootDisplayLabel, resolveFootDisplayParts } from '#/lib/footDisplayLabel'
import { parsedFoot, parsedSyllable } from '#/lib/__tests__/fixtures/parsedPoemBuilders'

describe('resolveFootDisplayLabel', () => {
  it('uses display_foot_type when set', () => {
    const foot = parsedFoot('Ner', [parsedSyllable('x', 'Ner')])
    expect(resolveFootDisplayLabel({ ...foot, display_foot_type: 'தேமா (thema)' })).toBe(
      'தேமா (thema)',
    )
  })

  it('prefers structured Tamil/Latin from WASM over combined string', () => {
    const foot = parsedFoot('Ner-Ner', [
      parsedSyllable('a', 'Ner'),
      parsedSyllable('b', 'Ner'),
    ])
    expect(
      resolveFootDisplayLabel({
        ...foot,
        display_foot_type: 'தேமா · thema',
        display_foot_type_tamil: 'தேமா',
        display_foot_type_latin: 'thema',
      }),
    ).toBe('தேமா · thema')
    expect(
      resolveFootDisplayParts({
        ...foot,
        display_foot_type: 'ignored',
        display_foot_type_tamil: 'தேமா',
        display_foot_type_latin: 'thema',
      }),
    ).toEqual({ tamil: 'தேமா', latin: 'thema' })
  })

  it('falls back to getFootTypeDisplay from machine foot_type', () => {
    const foot = parsedFoot('Ner-Ner', [
      parsedSyllable('a', 'Ner'),
      parsedSyllable('b', 'Ner'),
    ])
    expect(resolveFootDisplayLabel(foot)).toBe('தேமா · thema')
  })
})
