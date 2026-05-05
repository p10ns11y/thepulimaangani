import { Fragment, useMemo } from 'react'

import { FootTypeCaption } from '#/components/prosody/FootTypeCaption'
import {
  getLineClassDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import { bondDisplayLabel, linkageRowsByFromFoot } from '#/lib/talaiLabels'
import { buildLinkageOverviewRows, linkageCoarseCounts } from '#/lib/prosody/parse/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type TalaiInlineFlowProps = {
  data: ParsedPoem
}

export function TalaiInlineFlow({ data }: TalaiInlineFlowProps) {
  const rows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const byFrom = useMemo(() => linkageRowsByFromFoot(rows), [rows])

  const coarseHint = useMemo(() => {
    const coarse = linkageCoarseCounts(data.linkage ?? [])
    return Object.entries(coarse)
      .map(([k, n]) => `${getLinkageTypeDisplay(k)} ×${n}`)
      .join(' · ')
  }, [data.linkage])

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground m-0 max-w-prose text-xs leading-relaxed">
        No consecutive-foot bonds in this parse.
      </p>
    )
  }

  return (
    <div className="talai-inline-flow -mx-3 max-w-none">
      {coarseHint ? (
        <p className="text-muted-foreground/90 mb-4 border-b border-rim/15 pb-2 font-tamil text-[0.68rem] leading-snug">
          {coarseHint}
        </p>
      ) : null}

      {data.lines.map((line, li) => (
        <section key={`talai-line-${li}-${line.line_class}`} className="mb-6 last:mb-2">
          <div className="text-muted-foreground mb-2 font-tamil text-[0.72rem] tracking-wide">
            அடி {li + 1}{' '}
            <span className="text-muted-foreground/75">({getLineClassDisplay(line.line_class)})</span>
          </div>

          <div className="flex flex-wrap items-end gap-x-0.5 gap-y-4">
            {line.feet.map((foot, fj) => {
              const g = foot.foot_index_global
              const bondAfter =
                typeof g === 'number' ? byFrom.get(g) : undefined
              const wordText = foot.syllables.map((s) => s.text).join('')
              const alt = typeof g === 'number' && g % 2 === 0

              const isLastOnLine = fj === line.feet.length - 1
              const showBetweenSameLine =
                !isLastOnLine && bondAfter && !bondAfter.crossLine
              const showCrossLineBridge =
                isLastOnLine && bondAfter && bondAfter.crossLine

              return (
                <Fragment key={`talai-foot-${li}-${fj}-${g ?? fj}`}>
                  <div
                    className={`flex min-w-0 max-w-[min(100%,13rem)] flex-col items-center gap-0.5 px-0.5 ${
                      alt ? 'text-syllable-ner' : 'text-syllable-nirai'
                    }`}
                  >
                    <span className="font-tamil text-[1.06rem] leading-[1.38] tracking-tight">{wordText}</span>
                    <FootTypeCaption foot={foot} align="center" variant="tamilOnly" />
                  </div>

                  {showBetweenSameLine ? (
                    <div className="flex max-w-[11rem] shrink flex-col items-center justify-end gap-0 self-end pb-1 text-center">
                      <span
                        className="text-muted-foreground font-tamil text-[0.62rem] leading-tight"
                        title={bondDisplayLabel(bondAfter)}
                      >
                        ← {bondDisplayLabel(bondAfter)} →
                      </span>
                      {!bondAfter.edge.is_valid ? (
                        <span className="text-destructive text-[0.58rem]">invalid</span>
                      ) : null}
                    </div>
                  ) : null}

                  {showCrossLineBridge ? (
                    <div className="min-w-full basis-full border-t border-rim/15 pt-3">
                      <p className="text-muted-foreground m-0 text-center font-tamil text-[0.68rem] leading-snug">
                        <span aria-hidden className="pr-1">
                          ↓
                        </span>
                        {bondDisplayLabel(bondAfter)}
                        {!bondAfter.edge.is_valid ? (
                          <span className="text-destructive pl-1 text-[0.62rem]">· invalid</span>
                        ) : null}
                      </p>
                    </div>
                  ) : null}
                </Fragment>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
