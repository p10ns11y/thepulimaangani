import { ChevronDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { getLineClassDisplay } from '#/components/prosody/displayLabels'
import { FootTypeCaption } from '#/components/prosody/FootTypeCaption'
import { SyllableChip } from '#/components/prosody/SyllableChip'
import { TalaiInlineFlow } from '#/components/prosody/TalaiInlineFlow'
import { buildLinkageOverviewRows } from '#/lib/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type PanelId = 'syllables' | 'bonds' | 'metre'

type StructureAccordionProps = {
  data: ParsedPoem
}

export function StructureAccordion({ data }: StructureAccordionProps) {
  const [open, setOpen] = useState<PanelId | null>(null)

  const bondRows = useMemo(() => buildLinkageOverviewRows(data), [data])

  const toggle = (id: PanelId) => {
    setOpen((cur) => (cur === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <AccordionRow
        id="metre"
        title="பா அலகிடு · Metre insights"
        subtitle={`${data.metre_type} · vikalpa ${String(data.vikalpa_count)}`}
        expanded={open === 'metre'}
        onToggle={() => toggle('metre')}
      >
        <div className="flex flex-col gap-3 pt-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
              <span className="text-muted-foreground text-xs">Metre type</span>
              <p className="text-foreground mt-0.5 font-tamil text-sm font-medium">{data.metre_type}</p>
            </div>
            <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
              <span className="text-muted-foreground text-xs">Vikalpa</span>
              <p className="text-foreground mt-0.5 text-sm font-medium">{String(data.vikalpa_count)}</p>
            </div>
          </div>
          <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
            <span className="text-foreground/88">Current prediction:</span> the parser scores up to four
            metres from rule-based priors and bond (linkage) patterns, then refines the ranking with a
            hand-tuned boost on a 51-value summary of the parse (no raw text in that vector). That summary is
            the same one used to train optional ML classifiers; the UI shows the parser&apos;s best guess, not
            a separate in-browser model.
          </p>
        </div>
      </AccordionRow>

      <AccordionRow
        id="bonds"
        title="தளை · Bond flow"
        subtitle={
          bondRows.length === 0 ? 'No bonds' : `${bondRows.length} bonds · inline with words`
        }
        expanded={open === 'bonds'}
        onToggle={() => toggle('bonds')}
      >
        <TalaiInlineFlow data={data} />
      </AccordionRow>

      <AccordionRow
        id="syllables"
        title="சொற்கள் மற்றும் அசைகள்"
        subtitle={`${data.syllables.length} syllables · feet as typed`}
        expanded={open === 'syllables'}
        onToggle={() => toggle('syllables')}
      >
        <div className="flex flex-col gap-3 pt-1">
          {data.lines.map((line, i) => (
            <div key={`acc-line-syl-${i}`}>
              <div className="text-muted-foreground mb-1.5 text-[0.65rem] font-medium uppercase tracking-wide">
                Line {i + 1} · {getLineClassDisplay(line.line_class)}
              </div>
              <div className="flex flex-col gap-2">
                {line.feet.map((foot, j) => {
                  return (
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
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </AccordionRow>
    </div>
  )
}

type AccordionRowProps = {
  id: PanelId
  title: string
  subtitle: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}

function AccordionRow({ title, subtitle, expanded, onToggle, children }: AccordionRowProps) {
  return (
    <div className="border-rim/35 bg-surface-1/50 overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="hover:bg-surface-2/60 flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors"
      >
        <ChevronDown
          className={`text-muted-foreground mt-0.5 size-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="text-foreground block text-sm font-medium">{title}</span>
          <span className="text-muted-foreground block text-[0.7rem] leading-snug">{subtitle}</span>
        </span>
      </button>
      {expanded ? <div className="border-t border-rim/25 px-3 pb-3 pt-1">{children}</div> : null}
    </div>
  )
}
