/**
 * @vitest-environment jsdom
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FootTypeCaption } from '#/components/prosody/FootTypeCaption'
import { wasmJsonToParsedPoem } from '#/lib/wasmWireParseResult'
import { bondDisplayLabel } from '#/lib/talaiLabels'
import { buildLinkageOverviewRows, linkageCoarseCounts } from '#/lib/linkageOverview'
import { resolveFootDisplayLabel, resolveFootDisplayParts } from '#/lib/footDisplayLabel'
import {
  wasmParseJsonFixture,
  wasmPoem,
  wasmPoemLine,
  wasmSyllableNode,
  wasmWordFoot,
} from '#/lib/__tests__/fixtures/wasmParseJsonBuilders'
import { parsedFoot, parsedPoem, parsedSyllable } from '#/lib/__tests__/fixtures/parsedPoemBuilders'
import { TalaiInlineFlow } from '#/components/prosody/TalaiInlineFlow'
import { PROSODY_DISPLAY_CONTRACT_VERSION } from '#/lib/prosodyDisplayContract'

describe('prosody display contract version', () => {
  it('is bumped when contract rules in prosodyDisplayContract.ts change materially', () => {
    expect(PROSODY_DISPLAY_CONTRACT_VERSION).toBe(2)
  })
})

describe('prosody display contract: WASM text ↔ UI helpers', () => {
  it('resolveFootDisplayLabel matches presentation.feet[g].foot_type after adapt', () => {
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
              foot_type: 'Ner-Ner',
              syllableNodes: [wasmSyllableNode('a', 'Ner'), wasmSyllableNode('b', 'Ner')],
              foot_index_global: 0,
            }),
          ],
        }),
      ]),
      presentation: {
        feet: [
          {
            text: 'ab',
            foot_type: 'தேமா · thema',
            foot_type_tamil: 'தேமா',
            foot_type_latin: 'thema',
          },
        ],
        talai: [],
      },
    })

    const poem = wasmJsonToParsedPoem(wasm)
    expect(poem).not.toBeNull()
    const foot = poem!.lines[0]!.feet[0]!
    expect(resolveFootDisplayLabel(foot)).toBe(poem!.presentation!.feet[0]!.foot_type)
    expect(resolveFootDisplayParts(foot)).toEqual({
      tamil: 'தேமா',
      latin: 'thema',
    })
  })

  it('legacy display_foot_type string is shown verbatim when no structured fields', () => {
    const foot = parsedFoot('Ner', [parsedSyllable('x', 'Ner')])
    expect(
      resolveFootDisplayLabel({
        ...foot,
        display_foot_type: 'custom WASM line',
      }),
    ).toBe('custom WASM line')
  })

  it('bondDisplayLabel equals presentation.talai[].talai_type when row matches edge', () => {
    const data = parsedPoem({
      original_text: 'ab',
      lines: [
        {
          line_class: 'Kuraladi',
          feet: [
            { ...parsedFoot('Ner', [parsedSyllable('a', 'Ner')]), foot_index_global: 0 },
            { ...parsedFoot('Ner', [parsedSyllable('b', 'Ner')]), foot_index_global: 1 },
          ],
        },
      ],
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'IyarcirVenTalai',
          is_valid: true,
        },
      ],
      presentation: {
        feet: [],
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
    const rows = buildLinkageOverviewRows(data)
    expect(bondDisplayLabel(rows[0])).toBe('இயற்சீர் வெண்டளை')
    expect(bondDisplayLabel(rows[0])).toBe(data.presentation!.talai[0]!.talai_type)
  })

  it('bondDisplayLabel uses TypeScript map when presentation.talai is absent', () => {
    const data = parsedPoem({
      original_text: 'ab',
      lines: [
        {
          line_class: '—',
          feet: [
            { ...parsedFoot('Ner', [parsedSyllable('a', 'Ner')]), foot_index_global: 0 },
            { ...parsedFoot('Ner', [parsedSyllable('b', 'Ner')]), foot_index_global: 1 },
          ],
        },
      ],
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
    const rows = buildLinkageOverviewRows(data)
    expect(bondDisplayLabel(rows[0])).toBe('இயற்சீர் வெண்டளை')
  })
})

describe('documented non-fidelity: coarse linkage summary', () => {
  it('TalaiInlineFlow coarse hint aggregates linkage_type keys, not a single WASM field', () => {
    const data = parsedPoem({
      original_text: 'ab',
      lines: [
        {
          line_class: '—',
          feet: [
            { ...parsedFoot('Ner', [parsedSyllable('a', 'Ner')]), foot_index_global: 0 },
            { ...parsedFoot('Ner', [parsedSyllable('b', 'Ner')]), foot_index_global: 1 },
          ],
        },
      ],
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
    const coarse = linkageCoarseCounts(data.linkage ?? [])
    expect(Object.keys(coarse)).toEqual(['VenTalai'])
    const { container } = render(<TalaiInlineFlow data={data} />)
    expect(container.textContent).toContain('×')
    expect(container.textContent).toMatch(/வெண்டளை/)
  })
})

describe('FootTypeCaption', () => {
  it('renders Tamil and Latin verbatim from structured foot (default)', () => {
    const { container } = render(
      <FootTypeCaption
        foot={{
          foot_type: 'Ner-Ner',
          syllables: [parsedSyllable('a', 'Ner')],
          display_foot_type: 'ignored when tamil+latin set',
          display_foot_type_tamil: 'தேமா',
          display_foot_type_latin: 'thema',
        }}
      />,
    )
    expect(container.textContent).toContain('தேமா')
    expect(container.textContent).toContain('thema')
  })

  it('tamilOnly variant hides Latin for Bond flow density', () => {
    const { container } = render(
      <FootTypeCaption
        variant="tamilOnly"
        foot={{
          foot_type: 'Ner-Ner',
          syllables: [parsedSyllable('a', 'Ner')],
          display_foot_type_tamil: 'தேமா',
          display_foot_type_latin: 'thema',
        }}
      />,
    )
    expect(container.textContent).toContain('தேமா')
    expect(container.textContent).not.toContain('thema')
  })
})
