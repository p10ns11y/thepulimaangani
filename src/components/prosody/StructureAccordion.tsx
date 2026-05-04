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

function metrePanelSubtitle(data: ParsedPoem): string {
  const parts: string[] = [`${data.metre_type} · vikalpa ${String(data.vikalpa_count)}`]
  if (typeof data.metre_entropy_bits === 'number' && Number.isFinite(data.metre_entropy_bits)) {
    parts.push(`entropy ${data.metre_entropy_bits.toFixed(2)} bits`)
  }
  if (typeof data.metre_epistemic_margin === 'number' && Number.isFinite(data.metre_epistemic_margin)) {
    parts.push(`top1−top2 ${(data.metre_epistemic_margin * 100).toFixed(0)} pp`)
  }
  return parts.join(' · ')
}

export function StructureAccordion({ data }: StructureAccordionProps) {
  const [open, setOpen] = useState<PanelId | null>(null)

  const bondRows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const metreSubtitle = useMemo(() => metrePanelSubtitle(data), [data])
  const sortedHypotheses = useMemo(() => {
    const hy = data.top_k_metre_hypotheses
    if (!hy?.length) return []
    return [...hy].sort((a, b) => {
      const ra = a.metre_rank ?? 255
      const rb = b.metre_rank ?? 255
      if (ra !== rb) return ra - rb
      return b.aggregate_score - a.aggregate_score
    })
  }, [data.top_k_metre_hypotheses])

  const toggle = (id: PanelId) => {
    setOpen((cur) => (cur === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <AccordionRow
        id="metre"
        title="பா விவரம் · Metre"
        subtitle={metreSubtitle}
        expanded={open === 'metre'}
        onToggle={() => toggle('metre')}
      >
        <div className="flex flex-col gap-3 pt-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
              <span className="text-muted-foreground text-xs">Metre type</span>
              <p className="text-foreground mt-0.5 font-tamil text-sm font-medium">{data.metre_type}</p>
            </div>
            <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
              <span className="text-muted-foreground text-xs">Vikalpa</span>
              <p className="text-foreground mt-0.5 text-sm font-medium">{String(data.vikalpa_count)}</p>
            </div>
            {typeof data.metre_entropy_bits === 'number' && Number.isFinite(data.metre_entropy_bits) ? (
              <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
                <span className="text-muted-foreground text-xs">Metre entropy</span>
                <p className="text-foreground mt-0.5 text-sm font-medium tabular-nums">
                  {data.metre_entropy_bits.toFixed(2)} bits
                </p>
              </div>
            ) : null}
            {typeof data.metre_epistemic_margin === 'number' &&
            Number.isFinite(data.metre_epistemic_margin) ? (
              <div className="bg-surface-2/40 rounded-md px-3 py-2.5">
                <span className="text-muted-foreground text-xs">Confidence gap</span>
                <p className="text-foreground mt-0.5 text-sm font-medium tabular-nums">
                  {(data.metre_epistemic_margin * 100).toFixed(0)} pp
                </p>
              </div>
            ) : null}
          </div>
          {sortedHypotheses.length > 0 ? (
            <div className="border-rim/30 bg-surface-2/25 rounded-md border px-3 py-2">
              <span className="text-muted-foreground text-xs">Coarse metre candidates (WASM)</span>
              <ul className="mt-1.5 flex flex-col gap-1">
                {sortedHypotheses.map((h) => (
                  <li
                    key={h.metre_type}
                    className="text-foreground/92 flex items-baseline justify-between gap-2 text-[0.72rem] leading-snug"
                  >
                    <span className="min-w-0 font-tamil">
                      {h.metre_rank != null ? (
                        <span className="text-muted-foreground mr-1.5 tabular-nums">#{h.metre_rank}</span>
                      ) : null}
                      {h.metre_type}
                    </span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">
                      {typeof h.metre_probability === 'number' && Number.isFinite(h.metre_probability)
                        ? `${(h.metre_probability * 100).toFixed(1)}%`
                        : `score ${h.aggregate_score}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
            <span className="text-foreground/88">How this works:</span> the WASM parser builds up to four
            coarse-metre hypotheses from rule priors and bond (linkage) patterns, then applies a dense
            51-number summary of the parse (no raw poem text in that vector). When shipped hybrid weights are
            active, a small logit layer re-ranks those hypotheses and attaches probabilities; the label above
            is that re-ranked best guess. Entropy and the top-two gap summarize uncertainty on the same
            distribution.
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
