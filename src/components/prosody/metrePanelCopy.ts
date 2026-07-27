/**
 * Learner-facing pure helpers for Structure → Metre.
 *
 * Presentation policy lives here (not in React) so:
 * - unit tests drive the real shipped entry points
 * - the accordion stays a thin composition shell
 * - ML jargon cannot leak onto the default path without an explicit helper change
 */

import type {
  ParsedMetreHypothesis,
  ParsedMetreMlSurface,
  ParsedPoem,
} from '#/types/parsedPoem'

export type CertaintyLevel = 'clear' | 'mixed' | 'uncertain'

/** Map hybrid margin / entropy into plain language (not calibrated %). */
export function certaintyLevel(
  entropyBits?: number,
  epistemicMargin?: number,
): CertaintyLevel | null {
  if (typeof epistemicMargin === 'number' && Number.isFinite(epistemicMargin)) {
    if (epistemicMargin >= 0.35) return 'clear'
    if (epistemicMargin >= 0.15) return 'mixed'
    return 'uncertain'
  }
  if (typeof entropyBits === 'number' && Number.isFinite(entropyBits)) {
    // Four-way Shannon entropy max ≈ 2 bits
    if (entropyBits <= 0.85) return 'clear'
    if (entropyBits <= 1.5) return 'mixed'
    return 'uncertain'
  }
  return null
}

export function certaintyLabel(level: CertaintyLevel): string {
  switch (level) {
    case 'clear':
      return 'Clear estimate'
    case 'mixed':
      return 'Mixed signals'
    case 'uncertain':
      return 'Uncertain'
  }
}

/**
 * Semantic CSS class for certainty chips (tokens live in styles.css).
 * Avoids hard-coded hex and one-off Tailwind arbitrary color-mix in components.
 */
export function certaintySurfaceClass(level: CertaintyLevel): string {
  switch (level) {
    case 'clear':
      return 'certainty-surface certainty-surface--clear'
    case 'mixed':
      return 'certainty-surface certainty-surface--mixed'
    case 'uncertain':
      return 'certainty-surface certainty-surface--uncertain'
  }
}

/**
 * Soft mass in [0, 1] among candidates — not a calibrated accuracy %.
 * Prefer this over fake "72%" confidence language on the learner path.
 */
export function formatSoftScore(probability: number): string {
  if (!Number.isFinite(probability)) return '—'
  const clamped = Math.min(1, Math.max(0, probability))
  return clamped.toFixed(2)
}

/** Prefer short honesty line when the wire ships long engineer copy. */
export function resolveHonestyLine(wireLabel?: string | null): string {
  if (typeof wireLabel === 'string' && wireLabel.trim().length > 0 && wireLabel.length <= 72) {
    return wireLabel
  }
  return HONESTY_SHORT
}

/** Friendly names for multi-head ids shipped on the wire. */
export function headDisplayName(headId: string): string {
  switch (headId) {
    case 'heuristic_or_hybrid':
      return 'Parser path'
    case 'dense_logistic':
      return 'Pattern model'
    case 'prototype_knn':
      return 'Nearest example'
    default:
      return headId.replace(/_/g, ' ')
  }
}

/** Accordion subtitle: metre · vikalpa · plain certainty (no entropy/margin dumps). */
export function metrePanelSubtitle(
  metreType: string,
  vikalpaCount: number | string,
  entropyBits?: number,
  epistemicMargin?: number,
): string {
  const parts: string[] = [`${metreType} · vikalpa ${String(vikalpaCount)}`]
  const level = certaintyLevel(entropyBits, epistemicMargin)
  if (level) parts.push(certaintyLabel(level).toLowerCase())
  return parts.join(' · ')
}

/** Stable rank-then-score order for hypothesis lists. */
export function sortMetreHypotheses(
  hypotheses: readonly ParsedMetreHypothesis[] | undefined | null,
): ParsedMetreHypothesis[] {
  if (!hypotheses?.length) return []
  return [...hypotheses].sort((a, b) => {
    const ra = a.metre_rank ?? 255
    const rb = b.metre_rank ?? 255
    if (ra !== rb) return ra - rb
    return b.aggregate_score - a.aggregate_score
  })
}

export type HypothesisScoreView = {
  text: string
  title: string
}

/** Soft mass when present; else parser aggregate — never fake calibrated %. */
export function hypothesisScoreView(h: ParsedMetreHypothesis): HypothesisScoreView {
  if (typeof h.metre_probability === 'number' && Number.isFinite(h.metre_probability)) {
    return { text: formatSoftScore(h.metre_probability), title: SOFT_SCORE_HELP }
  }
  return {
    text: `score ${h.aggregate_score}`,
    title: 'Relative score from the parser path',
  }
}

/** Classical dual-truth line for learners (not “ok/flags” engineer shorthand). */
export function classicalCheckSummary(ok: boolean | null | undefined): string {
  if (ok === true) return 'No flags for this metre guess'
  if (ok === false) return 'Some classical flags for this metre guess'
  return 'Classical check not available'
}

/**
 * Progressive disclosure gate: show Technical notes only when there is
 * technical content worth hiding (heads, features, metrics, freeze, blurb).
 * Entropy/margin alone are enough — does not require a full metre_ml block.
 */
export function hasMetreTechNotes(input: {
  metre_ml?: ParsedMetreMlSurface | null
  metre_entropy_bits?: number
  metre_epistemic_margin?: number
}): boolean {
  const ml = input.metre_ml
  if (ml) {
    if (ml.head_votes.length > 0) return true
    if (ml.pattern_features.length > 0) return true
    if (ml.uncertainty_blurb) return true
    if (ml.a12_freeze_date) return true
    if (ml.dual_truth?.separation_policy) return true
  }
  if (typeof input.metre_entropy_bits === 'number' && Number.isFinite(input.metre_entropy_bits)) {
    return true
  }
  if (
    typeof input.metre_epistemic_margin === 'number' &&
    Number.isFinite(input.metre_epistemic_margin)
  ) {
    return true
  }
  return false
}

/** Convenience for components that already hold a ParsedPoem. */
export function hasMetreTechNotesFromPoem(data: ParsedPoem): boolean {
  return hasMetreTechNotes({
    metre_ml: data.metre_ml,
    metre_entropy_bits: data.metre_entropy_bits,
    metre_epistemic_margin: data.metre_epistemic_margin,
  })
}

export const HONESTY_SHORT = 'Statistical estimate — not classical proof'

export const CERTAINTY_HELP =
  'How peaked the metre guess is. Clear means one metre stands out; uncertain means several look plausible. Not a formal accuracy percentage.'

export const SOFT_SCORE_HELP =
  'Soft score among metre candidates (0–1 mass). Not a calibrated accuracy percentage.'

export const FALLBACK_METRE_EXPLAINER =
  'The parser ranks coarse metres from rules and bond patterns. When hybrid weights are active, scores are soft estimates — not classical proof.'

export const IN_SAMPLE_ADOPT_NOTE =
  'Live multi-head votes can be in-sample on anthology poems. Held-out ADOPT metrics live in training reports, not as UI confidence.'
