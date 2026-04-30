import { describe, expect, it } from 'vitest'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import {
  wasmLinguisticWord,
  wasmParseJsonFixture,
  wasmPoem,
  wasmPoemLine,
  wasmSyllableNode,
  wasmWordFoot,
} from '#/lib/__tests__/fixtures/wasmParseJsonBuilders'

describe('adaptWasmJsonToParsedPoem', () => {
  it('synthesizes one legacy line from top-level feet when lines is empty', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'அஃகு',
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
      lines: [],
      metre_type: 'Venpaa',
      errors: [],
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(1)
    expect(out!.lines[0]!.feet).toHaveLength(1)
    expect(out!.lines[0]!.feet[0]!.syllables).toHaveLength(2)
    expect(out!.lines[0]!.feet[0]!.syllables[0]!.syllable_type).toBe('Ner')
  })

  it('prefers poem.lines[].linguistic_words over words when both are present', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'a\nb',
      syllables: [],
      feet: [],
      lines: [],
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner-Ner',
              syllableNodes: [
                wasmSyllableNode('whole', 'Ner'),
                wasmSyllableNode('poem', 'Ner'),
              ],
            }),
          ],
          linguistic_words: [
            wasmLinguisticWord({
              word_index_in_line: 0,
              syllableNodes: [wasmSyllableNode('only', 'Ner')],
            }),
          ],
        }),
      ]),
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines[0]!.feet).toHaveLength(1)
    expect(out!.lines[0]!.feet[0]!.syllables[0]!.text).toBe('only')
  })

  it('builds one ParsedLine per poem.lines[] row from words when linguistic_words absent', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'a\nb',
      syllables: [],
      feet: [],
      lines: [],
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('x', 'Ner')],
              foot_index_global: 0,
            }),
          ],
        }),
        wasmPoemLine({
          line_index: 1,
          words: [
            wasmWordFoot({
              foot_type: 'Nirai',
              syllableNodes: [wasmSyllableNode('y', 'Nirai')],
              foot_index_global: 1,
            }),
          ],
        }),
      ]),
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(2)
    expect(out!.lines[0]!.feet[0]!.syllables[0]!.text).toBe('x')
    expect(out!.lines[1]!.feet[0]!.syllables[0]!.text).toBe('y')
  })

  it('uses linguistic_words on a row when words is empty (WASM lines 2+)', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'a\nb',
      syllables: [],
      feet: [],
      lines: [],
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('x', 'Ner')],
            }),
          ],
        }),
        wasmPoemLine({
          line_index: 1,
          words: [],
          linguistic_words: [
            wasmLinguisticWord({
              word_index_in_line: 0,
              syllableNodes: [wasmSyllableNode('அ', 'Ner'), wasmSyllableNode('ஆ', 'Nirai')],
            }),
          ],
        }),
      ]),
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(2)
    expect(out!.lines[1]!.feet[0]!.foot_type).toBe('Ner-Nirai')
    expect(out!.lines[1]!.feet[0]!.syllables).toHaveLength(2)
  })

  it('maps null metre_type from Rust to em dash', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'ab',
      syllables: [],
      feet: [],
      lines: [],
      metre_type: null,
      letter_count: 2,
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.metre_type).toBe('—')
    expect(out!.lines).toHaveLength(0)
  })
})
