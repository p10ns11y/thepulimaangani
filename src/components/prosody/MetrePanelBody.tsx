import { useMemo } from 'react'

import {
  CERTAINTY_HELP,
  FALLBACK_METRE_EXPLAINER,
  certaintyLabel,
  certaintyLevel,
  certaintySurfaceClass,
  classicalCheckSummary,
  hasMetreTechNotesFromPoem,
  hypothesisScoreView,
  resolveHonestyLine,
  sortMetreHypotheses,
} from '#/components/prosody/metrePanelCopy'
import type { ParsedPoem } from '#/types/parsedPoem'

type MetrePanelBodyProps = {
  data: ParsedPoem
}

/**
 * Learner-default Metre surface (Structure accordion).
 * Developer Evaluation (heads, features, metrics) lives in its own results tab.
 */
export function MetrePanelBody({ data }: MetrePanelBodyProps) {
  const sortedHypotheses = useMemo(
    () => sortMetreHypotheses(data.top_k_metre_hypotheses),
    [data.top_k_metre_hypotheses],
  )

  const level = useMemo(
    () => certaintyLevel(data.metre_entropy_bits, data.metre_epistemic_margin),
    [data.metre_entropy_bits, data.metre_epistemic_margin],
  )

  const dual = data.metre_ml?.dual_truth
  const hasDevEval = hasMetreTechNotesFromPoem(data)

  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="bg-surface-2/50 rounded-md px-3 py-2.5">
          <span className="text-muted-foreground text-xs">Metre</span>
          <p className="text-foreground mt-0.5 font-tamil text-sm font-medium">{data.metre_type}</p>
        </div>
        <div className="bg-surface-2/50 rounded-md px-3 py-2.5">
          <span className="text-muted-foreground text-xs">Vikalpa</span>
          <p className="text-foreground mt-0.5 text-sm font-medium">{String(data.vikalpa_count)}</p>
        </div>
        {level ? (
          <div
            className={`${certaintySurfaceClass(level)} col-span-2 rounded-md px-3 py-2.5 sm:col-span-1`}
            title={CERTAINTY_HELP}
          >
            <span className="text-muted-foreground text-xs">Certainty</span>
            <p className="text-foreground mt-0.5 text-sm font-medium">{certaintyLabel(level)}</p>
          </div>
        ) : null}
      </div>

      <p
        className="border-rim/40 bg-surface-2/35 text-foreground m-0 rounded-md border px-3 py-2 text-[0.72rem] leading-snug"
        data-testid="metre-ml-honesty"
      >
        {resolveHonestyLine(data.metre_ml?.honesty_label)}
      </p>

      {sortedHypotheses.length > 0 ? (
        <div className="border-rim/30 bg-surface-2/25 rounded-md border px-3 py-2">
          <span className="text-muted-foreground text-xs">Other metre guesses</span>
          <ul className="mt-1.5 flex flex-col gap-1">
            {sortedHypotheses.map((hypothesis) => {
              const score = hypothesisScoreView(hypothesis)
              return (
                <li
                  key={hypothesis.metre_type}
                  className="text-foreground/92 flex items-baseline justify-between gap-2 text-[0.72rem] leading-snug"
                >
                  <span className="min-w-0 font-tamil">
                    {hypothesis.metre_rank != null ? (
                      <span className="text-muted-foreground mr-1.5 tabular-nums">
                        #{hypothesis.metre_rank}
                      </span>
                    ) : null}
                    {hypothesis.metre_type}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums" title={score.title}>
                    {score.text}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {dual ? (
        <div
          className="border-rim/30 bg-surface-2/25 rounded-md border px-3 py-2"
          data-testid="metre-ml-dual-truth"
        >
          <span className="text-muted-foreground text-xs">Classical check (soft sketch)</span>
          <p className="text-foreground mt-1 text-[0.72rem] leading-snug">
            {classicalCheckSummary(dual.classical_ok_for_ml_top)}
            {dual.ml_metre_type ? (
              <span className="text-muted-foreground">
                {' '}
                · estimate: <span className="text-foreground font-medium">{dual.ml_metre_type}</span>
              </span>
            ) : null}
          </p>
          {dual.classical_violations.length > 0 ? (
            <ul className="text-muted-foreground mt-1.5 list-inside list-disc text-[0.68rem]">
              {dual.classical_violations.slice(0, 4).map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {hasDevEval ? (
        <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
          Multi-head votes, pattern features, and metrics are under{' '}
          <span className="text-foreground/85 font-medium">Developer Evaluation</span>.
        </p>
      ) : (
        <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
          {FALLBACK_METRE_EXPLAINER}
        </p>
      )}
    </div>
  )
}
