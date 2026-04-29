import { describe, expect, it } from 'vitest'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'

describe('adaptWasmJsonToParsedPoem', () => {
  it('synthesizes a line from top-level feet when lines is empty', () => {
    const wasm = {
      original_text: 'அஃகு',
      normalized_text: 'அஃகு',
      letter_count: 3,
      vikalpa_count: 0,
      syllables: [{ text: 'அஃ', syllable_type: 'Ner' }],
      feet: [
        {
          foot_type: 'Ner-Ner',
          syllables: [
            { text: 'அஃ', syllable_type: 'Ner' },
            { text: 'கு', syllable_type: 'Nirai' },
          ],
        },
      ],
      linkage: [],
      lines: [],
      metre_type: 'Venpaa',
      errors: [],
    }

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(1)
    expect(out!.lines[0]!.feet).toHaveLength(1)
    expect(out!.lines[0]!.feet[0]!.syllables).toHaveLength(2)
    expect(out!.lines[0]!.feet[0]!.syllables[0]!.syllable_type).toBe('Ner')
  })

  it('accepts null metre_type from Rust Option::None', () => {
    const wasm = {
      original_text: 'ab',
      letter_count: 2,
      vikalpa_count: 0,
      syllables: [],
      feet: [],
      lines: [],
      metre_type: null,
      errors: [],
    }

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.metre_type).toBe('—')
    expect(out!.lines).toHaveLength(0)
  })
})
