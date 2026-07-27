import { Fragment, useMemo } from 'react'

import { FootTypeCaption } from '#/components/prosody/FootTypeCaption'
import {
  getLineClassDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import {
  bondDisplayLabel,
  bondUsesCrossLineUi,
  buildLinkageOverviewRows,
  linkageCoarseCounts,
  linkageRowsByFromFoot,
  type LinkageOverviewRow,
} from '#/lib/prosody/parse/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type TalaiInlineFlowProps = {
  data: ParsedPoem
}

function BondChip({
  bond,
  variant,
}: {
  bond: LinkageOverviewRow
  variant: 'inline' | 'cross'
}) {
  const label = bondDisplayLabel(bond)
  return (
    <span
      className={
        variant === 'cross'
          ? 'border-rim/40 bg-surface-2/70 text-foreground inline-flex max-w-[min(100%,14rem)] items-center gap-1 rounded-full border px-2.5 py-1 font-tamil text-[0.68rem] leading-snug shadow-sm'
          : 'border-rim/35 bg-surface-2/55 text-muted-foreground inline-flex max-w-[11rem] shrink items-center justify-center self-end rounded-md border px-1.5 py-0.5 pb-1 text-center font-tamil text-[0.62rem] leading-tight'
      }
      title={label}
      data-testid={variant === 'cross' ? 'talai-bond-cross' : 'talai-bond-inline'}
    >
      {variant === 'cross' ? (
        <>
          <span aria-hidden className="text-muted-foreground">
            ↓
          </span>
          <span>{label}</span>
        </>
      ) : (
        <span>
          ← {label} →
        </span>
      )}
      {!bond.edge.is_valid ? (
        <span className="text-destructive pl-1 text-[0.58rem]">invalid</span>
      ) : null}
    </span>
  )
}

/**
 * Inline bond flow: feet as words with bond chips between them;
 * cross-line joins render in a dedicated gutter so last→first bonds never vanish.
 */
export function TalaiInlineFlow({ data }: TalaiInlineFlowProps) {
  const rows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const byFrom = useMemo(() => linkageRowsByFromFoot(rows), [rows])

  const coarseHint = useMemo(() => {
    const coarse = linkageCoarseCounts(data.linkage ?? [])
    return Object.entries(coarse)
      .map(([linkageFamilyKey, bondCount]) => `${getLinkageTypeDisplay(linkageFamilyKey)} ×${bondCount}`)
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
        <p className="text-muted-foreground/90 mb-4 border-rim/15 border-b pb-2 font-tamil text-[0.68rem] leading-snug">
          {coarseHint}
        </p>
      ) : null}

      {data.lines.map((line, physicalLineIndex) => {
        const hasFollowingLine = physicalLineIndex < data.lines.length - 1
        // Cross-line bond after last foot on this line (to next அடி)
        const lastFoot = line.feet[line.feet.length - 1]
        const lastGlobal =
          typeof lastFoot?.foot_index_global === 'number' ? lastFoot.foot_index_global : undefined
        const crossAfterLine =
          typeof lastGlobal === 'number' ? byFrom.get(lastGlobal) : undefined
        const showLineJoin =
          hasFollowingLine &&
          crossAfterLine &&
          bondUsesCrossLineUi(crossAfterLine, true, hasFollowingLine)

        return (
          <Fragment key={`talai-line-${physicalLineIndex}-${line.line_class}`}>
            <section className="mb-1 last:mb-2">
              <div className="text-muted-foreground mb-2 font-tamil text-[0.72rem] tracking-wide">
                அடி {physicalLineIndex + 1}{' '}
                <span className="text-muted-foreground/75">
                  ({getLineClassDisplay(line.line_class)})
                </span>
              </div>

              <div className="flex flex-wrap items-end justify-center gap-x-1 gap-y-3 sm:justify-start">
                {line.feet.map((foot, footIndexOnLine) => {
                  const globalFootIndex = foot.foot_index_global
                  const bondAfter =
                    typeof globalFootIndex === 'number' ? byFrom.get(globalFootIndex) : undefined
                  const wordText = foot.syllables.map((syllable) => syllable.text).join('')
                  const isLastOnLine = footIndexOnLine === line.feet.length - 1
                  const asCross = bondUsesCrossLineUi(bondAfter, isLastOnLine, hasFollowingLine)
                  // Mid-line only: same-line chip between words
                  const showInline = Boolean(bondAfter && !asCross)

                  return (
                    <Fragment
                      key={`talai-foot-${physicalLineIndex}-${footIndexOnLine}-${globalFootIndex ?? footIndexOnLine}`}
                    >
                      <div className="text-foreground flex min-w-0 max-w-[min(100%,13rem)] flex-col items-center gap-0.5 px-0.5">
                        <span className="font-tamil text-[1.06rem] leading-[1.38] tracking-tight">
                          {wordText}
                        </span>
                        <FootTypeCaption foot={foot} align="center" variant="tamilOnly" />
                      </div>

                      {showInline && bondAfter ? <BondChip bond={bondAfter} variant="inline" /> : null}
                    </Fragment>
                  )
                })}
              </div>
            </section>

            {showLineJoin && crossAfterLine ? (
              <div
                className="border-rim/20 mb-5 flex flex-col items-center gap-1 border-y border-dashed py-2.5"
                data-testid="talai-line-join"
              >
                <span className="text-muted-foreground text-[0.62rem] tracking-wide">
                  line join · அடி {physicalLineIndex + 1} → {physicalLineIndex + 2}
                </span>
                <BondChip bond={crossAfterLine} variant="cross" />
              </div>
            ) : null}
          </Fragment>
        )
      })}
    </div>
  )
}
