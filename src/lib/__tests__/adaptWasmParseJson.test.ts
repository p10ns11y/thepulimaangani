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

  it('assigns poem-wide foot indices for linguistic_words (not word_index_in_line) so presentation.feet aligns', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'x\ny',
      syllables: [],
      feet: [],
      lines: [],
      presentation: {
        feet: [
          { text: 'x', foot_type: 'LABEL_GLOBAL_0' },
          { text: 'y', foot_type: 'LABEL_GLOBAL_1' },
        ],
        talai: [],
      },
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [],
          linguistic_words: [
            wasmLinguisticWord({
              word_index_in_line: 0,
              syllableNodes: [wasmSyllableNode('a', 'Ner'), wasmSyllableNode('b', 'Ner')],
            }),
          ],
        }),
        wasmPoemLine({
          line_index: 1,
          words: [],
          linguistic_words: [
            wasmLinguisticWord({
              word_index_in_line: 0,
              syllableNodes: [wasmSyllableNode('c', 'Ner'), wasmSyllableNode('d', 'Ner')],
            }),
          ],
        }),
      ]),
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines).toHaveLength(2)
    expect(out!.lines[0]!.feet[0]!.foot_index_global).toBe(0)
    expect(out!.lines[1]!.feet[0]!.foot_index_global).toBe(1)
    expect(out!.lines[0]!.feet[0]!.display_foot_type).toBe('LABEL_GLOBAL_0')
    expect(out!.lines[1]!.feet[0]!.display_foot_type).toBe('LABEL_GLOBAL_1')
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

  it('normalizes linkage edges and assigns global foot indices from poem tree', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'ab',
      syllables: [],
      feet: [],
      lines: [],
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('a', 'Ner')],
              foot_index_global: 0,
            }),
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('b', 'Ner')],
              foot_index_global: 1,
            }),
          ],
        }),
      ]),
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'IyarcirVenTalai',
          is_valid: true,
        },
      ],
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.lines[0]!.feet[0]!.foot_index_global).toBe(0)
    expect(out!.lines[0]!.feet[1]!.foot_index_global).toBe(1)
    expect(out!.linkage).toHaveLength(1)
    expect(out!.linkage![0]!.linkage_type).toBe('VenTalai')
    expect(out!.linkage![0]!.linkage_special_type).toBe('IyarcirVenTalai')
  })

  it('prefers WASM presentation metre and foot labels when present', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'ab',
      syllables: [],
      feet: [],
      lines: [],
      metre_type: 'Venpaa',
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('a', 'Ner')],
              foot_index_global: 0,
            }),
          ],
        }),
      ]),
      presentation: {
        metre_type: 'வெண்பா',
        feet: [{ text: 'a', foot_type: 'மா (ma) — from Rust' }],
        talai: [],
      },
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.metre_type).toBe('வெண்பா')
    expect(out!.presentation?.feet[0]?.foot_type).toBe('மா (ma) — from Rust')
    expect(out!.lines[0]!.feet[0]!.display_foot_type).toBe('மா (ma) — from Rust')
  })

  it('uses presentation.talai for bond when linkage is absent', () => {
    const wasm = wasmParseJsonFixture({
      original_text: 'ab',
      syllables: [],
      feet: [],
      lines: [],
      poem: wasmPoem([
        wasmPoemLine({
          line_index: 0,
          words: [
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('a', 'Ner')],
              foot_index_global: 0,
            }),
            wasmWordFoot({
              foot_type: 'Ner',
              syllableNodes: [wasmSyllableNode('b', 'Ner')],
              foot_index_global: 1,
            }),
          ],
        }),
      ]),
      linkage: [],
      presentation: {
        feet: [
          { text: 'a', foot_type: 'மா' },
          { text: 'b', foot_type: 'மா' },
        ],
        talai: [
          {
            from: 0,
            to: 1,
            from_line: 0,
            to_line: 0,
            talai_type: 'இயற்சீர் வெண்டளை',
            is_valid: true,
          },
        ],
      },
    })

    const out = adaptWasmJsonToParsedPoem(wasm)
    expect(out).not.toBeNull()
    expect(out!.linkage).toBeUndefined()
    expect(out!.presentation?.talai).toHaveLength(1)
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
