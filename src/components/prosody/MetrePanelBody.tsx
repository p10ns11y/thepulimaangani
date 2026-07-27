import { ChevronDown } from 'lucide-react'
import { useMemo } from 'react'

import {
  CERTAINTY_HELP,
  FALLBACK_METRE_EXPLAINER,
  IN_SAMPLE_ADOPT_NOTE,
  certaintyLabel,
  certaintyLevel,
  certaintySurfaceClass,
  classicalCheckSummary,
  formatSoftScore,
  hasMetreTechNotesFromPoem,
  headDisplayName,
  hypothesisScoreView,
  resolveHonestyLine,
  sortMetreHypotheses,
} from '#/components/prosody/metrePanelCopy'
import type { ParsedPoem } from '#/types/parsedPoem'

type MetrePanelBodyProps = {
  data: ParsedPoem
}

/**
 * Learner-default Metre surface + progressive Technical notes.
 * Pure policy/copy stays in metrePanelCopy; this file only composes DOM.
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
  const showTech = hasMetreTechNotesFromPoem(data)

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

      {showTech ? (
        <details
          className="border-rim/30 bg-surface-2/15 group structure-disclosure rounded-md border"
          data-testid="metre-ml-tech-notes"
        >
          <summary className="structure-disclosure-summary text-muted-foreground hover:text-foreground cursor-pointer list-none rounded-md px-3 py-2 text-[0.72rem] font-medium outline-none select-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-1.5">
              <ChevronDown
                className="structure-accordion-chevron size-3.5 shrink-0 group-open:rotate-180"
                aria-hidden
              />
              Technical notes
              <span className="text-muted-foreground/80 font-normal">
                · multi-head, features, metrics
              </span>
            </span>
          </summary>
          <div className="border-rim/20 flex flex-col gap-2.5 border-t px-3 py-2.5">
            {(typeof data.metre_entropy_bits === 'number' &&
              Number.isFinite(data.metre_entropy_bits)) ||
            (typeof data.metre_epistemic_margin === 'number' &&
              Number.isFinite(data.metre_epistemic_margin)) ? (
              <dl className="grid grid-cols-2 gap-2 text-[0.68rem]">
                {typeof data.metre_entropy_bits === 'number' &&
                Number.isFinite(data.metre_entropy_bits) ? (
                  <div>
                    <dt className="text-muted-foreground">Entropy</dt>
                    <dd className="text-foreground tabular-nums">
                      {data.metre_entropy_bits.toFixed(2)} bits
                    </dd>
                  </div>
                ) : null}
                {typeof data.metre_epistemic_margin === 'number' &&
                Number.isFinite(data.metre_epistemic_margin) ? (
                  <div>
                    <dt className="text-muted-foreground">Top1 − top2</dt>
                    <dd className="text-foreground tabular-nums">
                      {(data.metre_epistemic_margin * 100).toFixed(0)} pp
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {data.metre_ml && data.metre_ml.head_votes.length > 0 ? (
              <div data-testid="metre-ml-head-votes">
                <span className="text-muted-foreground text-[0.65rem]">
                  Model heads (soft mass 0–1, not calibrated %)
                </span>
                <ul className="mt-1 flex flex-col gap-1">
                  {data.metre_ml.head_votes.map((vote) => (
                    <li
                      key={vote.head_id}
                      className="text-foreground/92 flex flex-col gap-0.5 text-[0.72rem] leading-snug sm:flex-row sm:items-baseline sm:justify-between"
                      title={vote.note || undefined}
                    >
                      <span>
                        <span className="text-muted-foreground mr-1.5">
                          {headDisplayName(vote.head_id)}
                        </span>
                        {vote.metre_type}
                      </span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {formatSoftScore(vote.score)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.metre_ml && data.metre_ml.pattern_features.length > 0 ? (
              <div data-testid="metre-ml-pattern-features">
                <span className="text-muted-foreground text-[0.65rem]">
                  Pattern features (dense signals)
                </span>
                <ul className="mt-1 flex flex-col gap-1">
                  {data.metre_ml.pattern_features.map((f) => (
                    <li
                      key={`${f.dense_index}-${f.feature_id}`}
                      className="text-foreground/92 flex items-baseline justify-between gap-2 text-[0.72rem]"
                    >
                      <span className="min-w-0 font-mono text-[0.65rem]">
                        [{f.dense_index}] {f.feature_id}
                        <span className="text-muted-foreground ml-1">{f.direction}</span>
                      </span>
                      <span className="text-muted-foreground shrink-0 tabular-nums">
                        {f.weight.toFixed(3)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.metre_ml?.a12_freeze_date ? (
              <p className="text-muted-foreground m-0 text-[0.65rem] tabular-nums">
                Pattern freeze {data.metre_ml.a12_freeze_date}
              </p>
            ) : null}

            {dual?.separation_policy ? (
              <p className="text-muted-foreground m-0 font-mono text-[0.62rem]">
                policy: {dual.separation_policy}
              </p>
            ) : null}

            {data.metre_ml?.uncertainty_blurb ? (
              <p className="text-muted-foreground m-0 text-[0.65rem] leading-relaxed">
                {data.metre_ml.uncertainty_blurb}
              </p>
            ) : (
              <p className="text-muted-foreground m-0 text-[0.65rem] leading-relaxed">
                {IN_SAMPLE_ADOPT_NOTE}
              </p>
            )}
          </div>
        </details>
      ) : (
        <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
          {FALLBACK_METRE_EXPLAINER}
        </p>
      )}
    </div>
  )
}
