import { Link } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'

import {
  FALLBACK_METRE_EXPLAINER,
  IN_SAMPLE_ADOPT_NOTE,
  formatSoftScore,
  hasMetreTechNotesFromPoem,
  headDisplayName,
} from '#/components/prosody/metrePanelCopy'
import type { ParsedPoem } from '#/types/parsedPoem'

type DeveloperEvaluationPanelProps = {
  data: ParsedPoem
}

function DeveloperEvaluationHeader() {
  return (
    <header className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-foreground m-0 text-sm font-semibold tracking-tight">
          Developer Evaluation
        </h2>
        <p className="text-muted-foreground m-0 text-[0.72rem] leading-snug">
          Entropy and confidence gap describe how peaked the four-way ML distribution is — not classical
          proof. Multi-head soft masses are relative votes (often in-sample on anthology poems); ADOPT
          lives in freeze reports. Soft classical sketch flags the ML top guess in parallel only.
        </p>
      </div>
      <Link
        to="/developer-evaluation"
        className="border-rim/45 bg-surface-1/90 text-foreground hover:bg-surface-2/90 inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[0.7rem] font-medium no-underline transition-colors"
        data-testid="developer-evaluation-guide-link"
      >
        <BookOpen className="size-3.5 opacity-80" aria-hidden />
        How this works
      </Link>
    </header>
  )
}

/**
 * Full-pane developer surface: multi-head votes, dense features, epistemic metrics.
 * Learner Structure → Metre stays free of this detail (see MetrePanelBody).
 * Guide: `/developer-evaluation`.
 */
export function DeveloperEvaluationPanel({ data }: DeveloperEvaluationPanelProps) {
  const dual = data.metre_ml?.dual_truth
  const hasNotes = hasMetreTechNotesFromPoem(data)

  if (!hasNotes) {
    return (
      <div className="flex flex-col gap-3" data-testid="developer-evaluation-panel">
        <DeveloperEvaluationHeader />
        <p
          className="text-muted-foreground border-rim/30 bg-surface-2/20 m-0 rounded-md border px-3 py-2.5 text-[0.72rem] leading-relaxed"
          data-testid="developer-evaluation-empty"
        >
          {FALLBACK_METRE_EXPLAINER}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3.5" data-testid="developer-evaluation-panel">
      <DeveloperEvaluationHeader />

      <div
        className="border-rim/30 bg-surface-2/15 flex flex-col gap-3 rounded-md border px-3 py-2.5"
        data-testid="metre-ml-tech-notes"
      >
        {(typeof data.metre_entropy_bits === 'number' &&
          Number.isFinite(data.metre_entropy_bits)) ||
        (typeof data.metre_epistemic_margin === 'number' &&
          Number.isFinite(data.metre_epistemic_margin)) ? (
          <dl className="grid grid-cols-2 gap-2 text-[0.72rem] sm:grid-cols-3">
            {typeof data.metre_entropy_bits === 'number' &&
            Number.isFinite(data.metre_entropy_bits) ? (
              <div
                className="bg-surface-2/40 rounded-md px-2.5 py-2"
                title="How mixed the four-way ML mass is. Low = one metre stands out. Not classical proof."
              >
                <dt className="text-muted-foreground text-[0.65rem]">Entropy</dt>
                <dd className="text-foreground mt-0.5 tabular-nums">
                  {data.metre_entropy_bits.toFixed(2)} bits
                </dd>
                <dd className="text-muted-foreground mt-0.5 text-[0.6rem] leading-snug">
                  Peakedness of 4-way guess
                </dd>
              </div>
            ) : null}
            {typeof data.metre_epistemic_margin === 'number' &&
            Number.isFinite(data.metre_epistemic_margin) ? (
              <div
                className="bg-surface-2/40 rounded-md px-2.5 py-2"
                title="Top class mass minus second. Large gap = leader is clear among ML votes only."
              >
                <dt className="text-muted-foreground text-[0.65rem]">Confidence gap</dt>
                <dd className="text-foreground mt-0.5 tabular-nums">
                  {(data.metre_epistemic_margin * 100).toFixed(0)} pp
                </dd>
                <dd className="text-muted-foreground mt-0.5 text-[0.6rem] leading-snug">
                  Top1 − top2 (ML only)
                </dd>
              </div>
            ) : null}
            {data.metre_type ? (
              <div className="bg-surface-2/40 rounded-md px-2.5 py-2">
                <dt className="text-muted-foreground text-[0.65rem]">Parser metre</dt>
                <dd className="text-foreground mt-0.5 font-tamil text-[0.8rem] font-medium">
                  {data.metre_type}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        {data.metre_ml && data.metre_ml.head_votes.length > 0 ? (
          <div data-testid="metre-ml-head-votes">
            <span className="text-muted-foreground text-[0.7rem] font-medium">
              Model heads · soft mass 0–1 (relative vote, not calibrated %)
            </span>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {data.metre_ml.head_votes.map((vote) => (
                <li
                  key={vote.head_id}
                  className="border-rim/25 bg-surface-1/60 text-foreground/92 flex flex-col gap-0.5 rounded-md border px-2.5 py-1.5 text-[0.75rem] leading-snug sm:flex-row sm:items-baseline sm:justify-between"
                  title={vote.note || undefined}
                >
                  <span>
                    <span className="text-muted-foreground mr-1.5">
                      {headDisplayName(vote.head_id)}
                    </span>
                    <span className="font-tamil">{vote.metre_type}</span>
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
            <span className="text-muted-foreground text-[0.7rem] font-medium">
              Pattern features (dense signals for this poem)
            </span>
            <ul className="mt-1.5 flex flex-col gap-1">
              {data.metre_ml.pattern_features.map((f) => (
                <li
                  key={`${f.dense_index}-${f.feature_id}`}
                  className="text-foreground/92 flex items-baseline justify-between gap-2 text-[0.75rem]"
                >
                  <span className="min-w-0 font-mono text-[0.68rem]">
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
          <p className="text-muted-foreground m-0 text-[0.68rem] tabular-nums">
            Pattern freeze {data.metre_ml.a12_freeze_date} · ADOPT baseline era (reports, not live %)
          </p>
        ) : null}

        {dual?.separation_policy ? (
          <p className="text-muted-foreground m-0 font-mono text-[0.65rem]">
            dual-truth policy: {dual.separation_policy}
          </p>
        ) : null}

        {dual != null ? (
          <p className="text-muted-foreground m-0 text-[0.68rem] leading-relaxed">
            Soft classical sketch reports flags for the ML top guess only (parallel dual-truth). Research
            dual-compare uses buckets such as <span className="font-mono">ml_only_classical_flags</span> —
            not full classical proof.
          </p>
        ) : null}

        {data.metre_ml?.uncertainty_blurb ? (
          <p className="text-muted-foreground m-0 text-[0.7rem] leading-relaxed">
            {data.metre_ml.uncertainty_blurb}
          </p>
        ) : (
          <p className="text-muted-foreground m-0 text-[0.7rem] leading-relaxed">
            {IN_SAMPLE_ADOPT_NOTE}
          </p>
        )}
      </div>
    </div>
  )
}
