import { describe, expect, it } from 'vitest'

import {
  bondDisplayLabel,
  buildLinkageOverviewRows,
  linkageRowsByFromFoot,
} from '#/lib/prosody/parse/linkageOverview'
import type { ParsedFoot, ParsedLine, ParsedPoem } from '#/types/parsedPoem'

function foot(g: number, text = 'x'): ParsedFoot {
  return {
    foot_type: 'Ner',
    syllables: [{ text, syllable_type: 'Ner' }],
    foot_index_global: g,
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
    const m = linkageRowsByFromFoot(rows)
    expect(m.get(0)).toBeDefined()
    expect(m.get(0)?.edge.from_foot).toBe(0)
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
})
