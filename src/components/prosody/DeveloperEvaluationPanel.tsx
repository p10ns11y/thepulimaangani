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

/**
 * Full-pane developer surface: multi-head votes, dense features, epistemic metrics.
 * Learner Structure → Metre stays free of this detail (see MetrePanelBody).
 * Room to grow with more eval instrumentation later.
 */
export function DeveloperEvaluationPanel({ data }: DeveloperEvaluationPanelProps) {
  const dual = data.metre_ml?.dual_truth
  const hasNotes = hasMetreTechNotesFromPoem(data)

  if (!hasNotes) {
    return (
      <div className="flex flex-col gap-3" data-testid="developer-evaluation-panel">
        <header className="flex flex-col gap-0.5">
          <h2 className="text-foreground m-0 text-sm font-semibold tracking-tight">
            Developer Evaluation
          </h2>
          <p className="text-muted-foreground m-0 text-[0.72rem] leading-snug">
            Multi-head metre votes, pattern features, and epistemic metrics for model debugging.
          </p>
        </header>
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
      <header className="flex flex-col gap-0.5">
        <h2 className="text-foreground m-0 text-sm font-semibold tracking-tight">
          Developer Evaluation
        </h2>
        <p className="text-muted-foreground m-0 text-[0.72rem] leading-snug">
          Technical notes · multi-head, features, metrics — expand later with richer eval detail.
        </p>
      </header>

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
              <div className="bg-surface-2/40 rounded-md px-2.5 py-2">
                <dt className="text-muted-foreground text-[0.65rem]">Entropy</dt>
                <dd className="text-foreground mt-0.5 tabular-nums">
                  {data.metre_entropy_bits.toFixed(2)} bits
                </dd>
              </div>
            ) : null}
            {typeof data.metre_epistemic_margin === 'number' &&
            Number.isFinite(data.metre_epistemic_margin) ? (
              <div className="bg-surface-2/40 rounded-md px-2.5 py-2">
                <dt className="text-muted-foreground text-[0.65rem]">Top1 − top2</dt>
                <dd className="text-foreground mt-0.5 tabular-nums">
                  {(data.metre_epistemic_margin * 100).toFixed(0)} pp
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
              Model heads (soft mass 0–1, not calibrated %)
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
              Pattern features (dense signals)
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
            Pattern freeze {data.metre_ml.a12_freeze_date}
          </p>
        ) : null}

        {dual?.separation_policy ? (
          <p className="text-muted-foreground m-0 font-mono text-[0.65rem]">
            policy: {dual.separation_policy}
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
