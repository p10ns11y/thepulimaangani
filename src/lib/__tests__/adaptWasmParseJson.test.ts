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

  it('extracts per-line feet from nested poem.words when top-level lines is empty', () => {
    const wasm = {
      original_text: 'a\nb',
      syllables: [],
      feet: [],
      lines: [],
      poem: {
        lines: [
          {
            line_class: '—',
            line_index: 0,
            words: [
              {
                foot_type: 'Ner',
                foot_index_global: 0,
                word_index_in_line: 0,
                syllables: [{ inner: { text: 'x', syllable_type: 'Ner', alt_split: false } }],
              },
            ],
          },
          {
            line_class: '—',
            line_index: 1,
            words: [
              {
                foot_type: 'Nirai',
                foot_index_global: 1,
                word_index_in_line: 0,
                syllables: [{ inner: { text: 'y', syllable_type: 'Nirai', alt_split: false } }],
              },
            ],
          },
        ],
      },
      metre_type: null,
      letter_count: 0,
      vikalpa_count: 0,
      errors: [],
    }

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(2)
    expect(out!.lines[0]!.feet[0]!.syllables[0]!.text).toBe('x')
    expect(out!.lines[1]!.feet[0]!.syllables[0]!.text).toBe('y')
  })

  it('uses linguistic_words when words is empty (mirrors WASM lines 2+)', () => {
    const wasm = {
      original_text: 'a\nb',
      syllables: [],
      feet: [],
      lines: [],
      poem: {
        lines: [
          {
            line_class: '—',
            line_index: 0,
            words: [
              {
                foot_type: 'Ner',
                foot_index_global: 0,
                word_index_in_line: 0,
                syllables: [{ inner: { text: 'x', syllable_type: 'Ner', alt_split: false } }],
              },
            ],
          },
          {
            line_class: '—',
            line_index: 1,
            words: [],
            linguistic_words: [
              {
                word_index_in_line: 0,
                syllables: [
                  { inner: { text: 'அ', syllable_type: 'Ner', alt_split: false } },
                  { inner: { text: 'ஆ', syllable_type: 'Nirai', alt_split: false } },
                ],
              },
            ],
          },
        ],
      },
      metre_type: null,
      letter_count: 0,
      vikalpa_count: 0,
      errors: [],
    }

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(2)
    expect(out!.lines[1]!.feet[0]!.foot_type).toBe('Ner-Nirai')
    expect(out!.lines[1]!.feet[0]!.syllables).toHaveLength(2)
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
