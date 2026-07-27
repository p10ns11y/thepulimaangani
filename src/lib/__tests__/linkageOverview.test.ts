import { describe, expect, it } from 'vitest'

import {
  bondDisplayLabel,
  bondUsesCrossLineUi,
  buildLinkageOverviewRows,
  linkageRowsByFromFoot,
} from '#/lib/prosody/parse/linkageOverview'
import type { ParsedFoot, ParsedLine, ParsedPoem } from '#/types/parsedPoem'

function foot(globalFootIndex: number, text = 'x'): ParsedFoot {
  return {
    foot_type: 'Ner',
    syllables: [{ text, syllable_type: 'Ner' }],
    foot_index_global: globalFootIndex,
  }
}

describe('buildLinkageOverviewRows', () => {
  it('uses presentation.talai physical lines for crossLine when linkage foot indices map to same UI line', () => {
    const lines: ParsedLine[] = [
      { line_class: 'Kuraladi', feet: [foot(0), foot(1)] },
      { line_class: 'Kuraladi', feet: [foot(2)] },
    ]
    const data: ParsedPoem = {
      original_text: 'a b\nc',
      metre_type: 'Venpaa',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines,
      linkage: [
        {
          from_foot: 1,
          to_foot: 2,
          linkage_type: 'AciriyaTalai',
          linkage_special_type: 'NerondriyaAciriyaTalai',
          is_valid: true,
          from: { foot_index: 1, line_index: 0, word_index_in_line: 1 },
          to: { foot_index: 2, line_index: 0, word_index_in_line: 0 },
        },
      ],
      presentation: {
        feet: [],
        talai: [
          {
            from: 1,
            to: 2,
            from_line: 0,
            to_line: 1,
            talai_type: 'நேரொன்றிய ஆசிரியத்தளை',
            is_valid: true,
          },
        ],
      },
    }

    const rows = buildLinkageOverviewRows(data)
    expect(rows).toHaveLength(1)
    expect(rows[0].crossLine).toBe(true)
    expect(rows[0].fromLine1).toBe(1)
    expect(rows[0].toLine1).toBe(2)
    expect(rows[0].presentationTalaiType).toBe('நேரொன்றிய ஆசிரியத்தளை')
  })

  it('indexes linkage rows by from_foot', () => {
    const rows = buildLinkageOverviewRows({
      original_text: '',
      metre_type: '—',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines: [
        { line_class: '—', feet: [foot(0), foot(1)] },
        { line_class: '—', feet: [foot(2)] },
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
    const rowBySourceFootIndex = linkageRowsByFromFoot(rows)
    expect(rowBySourceFootIndex.get(0)).toBeDefined()
    expect(rowBySourceFootIndex.get(0)?.edge.from_foot).toBe(0)
  })

  it('bondDisplayLabel prefers presentation talai string', () => {
    const rows = buildLinkageOverviewRows({
      original_text: '',
      metre_type: '—',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines: [{ line_class: '—', feet: [foot(0), foot(1)] }],
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'VencirVenTalai',
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
            talai_type: 'custom தளை label',
            is_valid: true,
          },
        ],
      },
    })
    expect(bondDisplayLabel(rows[0])).toBe('custom தளை label')
  })

  it('never demotes layout cross-line when presentation claims same line', () => {
    const lines: ParsedLine[] = [
      { line_class: 'Kuraladi', feet: [foot(0, 'a'), foot(1, 'b')] },
      { line_class: 'Kuraladi', feet: [foot(2, 'c')] },
    ]
    const rows = buildLinkageOverviewRows({
      original_text: 'a b\nc',
      metre_type: 'Venpaa',
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [],
      lines,
      linkage: [
        {
          from_foot: 1,
          to_foot: 2,
          linkage_type: 'VenTalai',
          linkage_special_type: 'IyarcirVenTalai',
          is_valid: true,
          from: { foot_index: 1, line_index: 0, word_index_in_line: 1 },
          to: { foot_index: 2, line_index: 1, word_index_in_line: 0 },
        },
      ],
      presentation: {
        feet: [],
        // Wrong presentation: same line — layout must still mark crossLine
        talai: [
          {
            from: 1,
            to: 2,
            from_line: 0,
            to_line: 0,
            talai_type: 'should not hide join',
            is_valid: true,
          },
        ],
      },
    })
    expect(rows[0].crossLine).toBe(true)
    expect(rows[0].fromLine1).toBe(1)
    expect(rows[0].toLine1).toBe(2)
  })

  it('bondUsesCrossLineUi covers last-of-line even if crossLine flag false', () => {
    const bond = {
      index1: 1,
      edge: {
        from_foot: 1,
        to_foot: 2,
        linkage_type: 'VenTalai',
        linkage_special_type: 'IyarcirVenTalai',
        is_valid: true,
      },
      fromLine1: 1,
      fromWord1: 2,
      toLine1: 1,
      toWord1: 1,
      crossLine: false,
    }
    expect(bondUsesCrossLineUi(bond, true, true)).toBe(true)
    expect(bondUsesCrossLineUi(bond, false, true)).toBe(false)
    expect(bondUsesCrossLineUi(undefined, true, true)).toBe(false)
  })
})
