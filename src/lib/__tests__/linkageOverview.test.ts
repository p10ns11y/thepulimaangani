import { describe, expect, it } from 'vitest'

import { buildLinkageOverviewRows } from '#/lib/linkageOverview'
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
})
