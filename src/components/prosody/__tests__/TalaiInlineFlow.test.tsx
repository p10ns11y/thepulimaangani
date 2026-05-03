/** @vitest-environment jsdom */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SyllableChip } from '#/components/prosody/SyllableChip'
import { TalaiInlineFlow } from '#/components/prosody/TalaiInlineFlow'
import {
  parsedFoot,
  parsedLine,
  parsedPoem,
  parsedSyllable,
} from '#/lib/__tests__/fixtures/parsedPoemBuilders'
import type { ParsedFoot, ParsedLine } from '#/types/parsedPoem'

function footG(g: number, text: string, foot_type = 'Ner'): ParsedFoot {
  return {
    ...parsedFoot(foot_type, [parsedSyllable(text, foot_type === 'Ner' ? 'Ner' : 'Nirai')]),
    foot_index_global: g,
  }
}

describe('TalaiInlineFlow', () => {
  it('shows message when there are no bonds', () => {
    const data = parsedPoem({
      original_text: 'x',
      lines: [parsedLine([footG(0, 'a')])],
      linkage: [],
    })
    render(<TalaiInlineFlow data={data} />)
    expect(document.body.textContent).toMatch(/No consecutive-foot bonds/)
  })

  it('renders coarse hint and same-line bond label between feet', () => {
    const data = parsedPoem({
      original_text: 'ab',
      lines: [
        parsedLine([
          footG(0, 'அ'),
          footG(1, 'ஆ'),
        ]),
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
    render(<TalaiInlineFlow data={data} />)
    expect(document.body.textContent).toContain('வெண்டளை')
    expect(document.body.textContent).toMatch(/←/)
    expect(document.body.textContent).toMatch(/→/)
  })

  it('renders cross-line bridge after last foot on a line', () => {
    const lines: ParsedLine[] = [
      {
        line_class: 'Kuraladi',
        feet: [footG(0, 'x'), footG(1, 'y')],
      },
      {
        line_class: 'Kuraladi',
        feet: [footG(2, 'z')],
      },
    ]
    const data = parsedPoem({
      original_text: 'x y\nz',
      lines,
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'VencirVenTalai',
          is_valid: true,
        },
        {
          from_foot: 1,
          to_foot: 2,
          linkage_type: 'VenTalai',
          linkage_special_type: 'IyarcirVenTalai',
          is_valid: true,
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
            talai_type: 'கடல் கடந்த தளை',
            is_valid: true,
          },
        ],
      },
    })
    render(<TalaiInlineFlow data={data} />)
    expect(document.body.textContent).toContain('கடல் கடந்த தளை')
    expect(document.body.textContent).toContain('↓')
  })

  it('shows invalid marker on bad bond', () => {
    const data = parsedPoem({
      original_text: 'ab',
      lines: [parsedLine([footG(0, 'a'), footG(1, 'b')])],
      linkage: [
        {
          from_foot: 0,
          to_foot: 1,
          linkage_type: 'VenTalai',
          linkage_special_type: 'Unknown',
          is_valid: false,
        },
      ],
    })
    render(<TalaiInlineFlow data={data} />)
    expect(document.body.textContent).toMatch(/invalid/i)
  })
})

describe('SyllableChip', () => {
  it('renders Ner and Nirai variants', () => {
    const { unmount } = render(<SyllableChip syllableType="Ner" text="நே" variant="compact" />)
    expect(document.body.textContent).toContain('நேர்')
    unmount()
    render(<SyllableChip syllableType="Nirai" text="ரை" variant="comfortable" />)
    expect(document.body.textContent).toContain('நிரை')
  })
})
