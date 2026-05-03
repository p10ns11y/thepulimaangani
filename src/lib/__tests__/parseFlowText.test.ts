import { describe, expect, it } from 'vitest'

import { buildParseFlowText } from '#/components/prosody/parseFlowText'
import type { ParsedPoem } from '#/types/parsedPoem'

function minimalParsed(overrides: Partial<ParsedPoem> = {}): ParsedPoem {
  return {
    original_text: 'x',
    metre_type: 'Venpaa',
    letter_count: 12,
    vikalpa_count: 0,
    syllables: [{ text: 'a', syllable_type: 'Ner' }],
    lines: [
      {
        line_class: '—',
        feet: [{ foot_type: 'Ner', syllables: [{ text: 'a', syllable_type: 'Ner' }] }],
      },
    ],
    ...overrides,
  }
}

describe('buildParseFlowText', () => {
  it('includes metre, counts, vikalpa, and letter_count', () => {
    const out = buildParseFlowText(minimalParsed())
    expect(out).toContain('மீட்டர்: Venpaa')
    expect(out).toContain('வரிகள்: 1 | அடிகள்: 1 | சீர்கள்: 1')
    expect(out).toContain('விகற்பம்: 0')
    expect(out).toContain('எழுத்தெண்: 12')
  })

  it('stringifies object letter_count', () => {
    const out = buildParseFlowText(
      minimalParsed({ letter_count: { a: 1 } as ParsedPoem['letter_count'] }),
    )
    expect(out).toContain('{"a":1}')
  })
})
