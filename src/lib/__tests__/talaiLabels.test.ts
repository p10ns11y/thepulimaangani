import { describe, expect, it } from 'vitest'

import { buildLinkageOverviewRows } from '#/lib/linkageOverview'
import { bondDisplayLabel, linkageRowsByFromFoot } from '#/lib/talaiLabels'
import type { ParsedFoot, ParsedPoem } from '#/types/parsedPoem'

function foot(g: number): ParsedFoot {
  return {
    foot_type: 'Ner',
    syllables: [{ text: 'x', syllable_type: 'Ner' }],
    foot_index_global: g,
  }
}

describe('talaiLabels', () => {
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
