import { useMemo, useState } from 'react'

import { getLineClassDisplay } from '#/components/prosody/displayLabels'
import { FootTypeCaption } from '#/components/prosody/FootTypeCaption'
import { MetrePanelBody } from '#/components/prosody/MetrePanelBody'
import { StructureAccordionRow } from '#/components/prosody/StructureAccordionRow'
import { SyllableChip } from '#/components/prosody/SyllableChip'
import { TalaiInlineFlow } from '#/components/prosody/TalaiInlineFlow'
import { metrePanelSubtitle } from '#/components/prosody/metrePanelCopy'
import { buildLinkageOverviewRows } from '#/lib/prosody/parse/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type PanelId = 'syllables' | 'bonds' | 'metre'

type StructureAccordionProps = {
  data: ParsedPoem
}

/**
 * Structure shell: exclusive accordion over Metre / Bonds / Syllables.
 * Metre product policy lives in metrePanelCopy + MetrePanelBody.
 */
export function StructureAccordion({ data }: StructureAccordionProps) {
  const [open, setOpen] = useState<PanelId | null>(null)

  const bondRows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const metreSubtitle = useMemo(
    () =>
      metrePanelSubtitle(
        data.metre_type,
        data.vikalpa_count,
        data.metre_entropy_bits,
        data.metre_epistemic_margin,
      ),
    [data.metre_type, data.vikalpa_count, data.metre_entropy_bits, data.metre_epistemic_margin],
  )

  const toggle = (id: PanelId) => {
    setOpen((cur) => (cur === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <StructureAccordionRow
        title="பா விவரம் · Metre"
        subtitle={metreSubtitle}
        expanded={open === 'metre'}
        onToggle={() => toggle('metre')}
      >
        <MetrePanelBody data={data} />
      </StructureAccordionRow>

      <StructureAccordionRow
        title="தளை · Bond flow"
        subtitle={
          bondRows.length === 0 ? 'No bonds' : `${bondRows.length} bonds · inline with words`
        }
        expanded={open === 'bonds'}
        onToggle={() => toggle('bonds')}
      >
        <TalaiInlineFlow data={data} />
      </StructureAccordionRow>

      <StructureAccordionRow
        title="சொற்கள் மற்றும் அசைகள்"
        subtitle={`${data.syllables.length} syllables · feet as typed`}
        expanded={open === 'syllables'}
        onToggle={() => toggle('syllables')}
      >
        <div className="flex flex-col gap-3 pt-1">
          {data.lines.map((line, i) => (
            <div key={`acc-line-syl-${i}`}>
              <div className="text-muted-foreground mb-1.5 text-[0.65rem] font-medium tracking-wide uppercase">
                Line {i + 1} · {getLineClassDisplay(line.line_class)}
              </div>
              <div className="flex flex-col gap-2">
                {line.feet.map((foot, j) => (
                  <div key={`foot-syl-${i}-${j}`} className="flex flex-col gap-1.5">
                    <FootTypeCaption foot={foot} align="start" />
                    <div className="flex flex-wrap gap-1.5">
                      {foot.syllables.map((syl, k) => (
                        <SyllableChip
                          key={`syl-${i}-${j}-${k}-${syl.text}`}
                          syllableType={syl.syllable_type}
                          text={syl.text}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </StructureAccordionRow>
    </div>
  )
}
