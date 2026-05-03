import { ChevronDown } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import {
  getFootTypeDisplay,
  getLineClassDisplay,
  getLinkageSpecialDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import { SyllableChip } from '#/components/prosody/SyllableChip'
import { buildLinkageOverviewRows, linkageCoarseCounts } from '#/lib/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type PanelId = 'syllables' | 'bonds' | 'insights'

type StructureAccordionProps = {
  data: ParsedPoem
}

function bondLabelFine(row: ReturnType<typeof buildLinkageOverviewRows>[0]): string {
  const pres = row.presentationTalaiType?.trim()
  if (pres && pres.length > 0) return pres
  const e = row.edge
  if (e.linkage_special_type && e.linkage_special_type !== 'Unknown') {
    return getLinkageSpecialDisplay(e.linkage_special_type)
  }
  return getLinkageTypeDisplay(e.linkage_type)
}

export function StructureAccordion({ data }: StructureAccordionProps) {
  const [open, setOpen] = useState<PanelId | null>(null)

  const bondRows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const coarse = useMemo(() => linkageCoarseCounts(data.linkage ?? []), [data.linkage])

  const crossLineRows = useMemo(
    () => bondRows.filter((r) => r.crossLine),
    [bondRows],
  )
  const sameLineCount = bondRows.length - crossLineRows.length

  const toggle = (id: PanelId) => {
    setOpen((cur) => (cur === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-1.5">
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
                  const footLabel =
                    foot.display_foot_type != null && foot.display_foot_type.length > 0
                      ? foot.display_foot_type
                      : getFootTypeDisplay(foot.foot_type)
                  return (
                    <div key={`foot-syl-${i}-${j}`} className="flex flex-col gap-1.5">
                      <span className="text-muted-foreground text-[0.7rem]">{footLabel}</span>
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

      <AccordionRow
        id="bonds"
        title="தளை · Bonds / linkage"
        subtitle={
          bondRows.length === 0
            ? 'No bonds'
            : `${bondRows.length} bonds · ${crossLineRows.length} cross-line`
        }
        expanded={open === 'bonds'}
        onToggle={() => toggle('bonds')}
      >
        {bondRows.length === 0 ? (
          <p className="text-muted-foreground m-0 text-xs">No consecutive-foot bonds in this parse.</p>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(coarse).map(([k, n]) => (
                <span
                  key={k}
                  className="border-rim/35 bg-surface-2/80 text-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem]"
                >
                  {getLinkageTypeDisplay(k)} · {n}
                </span>
              ))}
            </div>
            {crossLineRows.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground text-[0.65rem] font-medium uppercase tracking-wide">
                  Cross-line
                </span>
                {crossLineRows.map((row) => (
                  <div
                    key={`xl-${row.index1}-${row.edge.from_foot}-${row.edge.to_foot}`}
                    className="border-rim/35 bg-surface-2/50 rounded-lg border px-2.5 py-2"
                  >
                    <div className="text-foreground flex flex-wrap items-baseline gap-x-1.5 font-tamil text-sm leading-snug">
                      <span className="text-muted-foreground tabular-nums">L{row.fromLine1}</span>
                      <span aria-hidden className="text-muted-foreground">
                        →
                      </span>
                      <span className="text-muted-foreground tabular-nums">L{row.toLine1}</span>
                    </div>
                    <p className="text-foreground mt-1 font-tamil text-sm leading-snug">{bondLabelFine(row)}</p>
                    {!row.edge.is_valid ? (
                      <span className="text-destructive mt-1 inline-block text-xs">Invalid bond</span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {sameLineCount > 0 ? (
              <p className="text-muted-foreground m-0 text-xs leading-relaxed">
                <span className="text-foreground/90">{sameLineCount}</span> further bonds stay within the same physical
                line (mostly consecutive words). Open full export or Text flow if you need every bond listed.
              </p>
            ) : null}
          </div>
        )}
      </AccordionRow>

      <AccordionRow
        id="insights"
        title="வரி வகை · Line insights"
        subtitle={`${data.lines.length} lines`}
        expanded={open === 'insights'}
        onToggle={() => toggle('insights')}
      >
        <div className="flex flex-col gap-3 pt-1">
          <div className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem]">
            <span>மாத்திரை: {data.metre_type}</span>
            <span>
              எழுத்து:{' '}
              {typeof data.letter_count === 'object'
                ? JSON.stringify(data.letter_count)
                : String(data.letter_count)}
            </span>
            <span>விகற்பம்: {String(data.vikalpa_count)}</span>
          </div>
          {data.lines.map((line, i) => (
            <div
              key={`ins-line-${i}-${line.line_class}`}
              className="border-rim/25 bg-surface-2/40 rounded-md border px-2.5 py-2"
            >
              <div className="text-foreground mb-2 font-tamil text-sm font-medium">
                அடி {i + 1}{' '}
                <span className="text-muted-foreground font-normal">({getLineClassDisplay(line.line_class)})</span>
              </div>
              <div className="flex flex-col gap-2">
                {line.feet.map((foot, j) => {
                  const footLabel =
                    foot.display_foot_type != null && foot.display_foot_type.length > 0
                      ? foot.display_foot_type
                      : getFootTypeDisplay(foot.foot_type)
                  return (
                    <div key={`ins-foot-${i}-${j}`}>
                      <div className="text-foreground font-tamil text-base leading-snug">
                        {foot.syllables.map((s) => s.text).join('')}
                      </div>
                      <div className="text-muted-foreground mt-0.5 font-tamil text-xs">{footLabel}</div>
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
