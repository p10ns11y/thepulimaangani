import { describe, expect, it } from 'vitest'

import {
  CERTAINTY_HELP,
  HONESTY_SHORT,
  SOFT_SCORE_HELP,
  certaintyLabel,
  certaintyLevel,
  certaintySurfaceClass,
  classicalCheckSummary,
  formatSoftScore,
  hasMetreTechNotes,
  headDisplayName,
  hypothesisScoreView,
  metrePanelSubtitle,
  resolveHonestyLine,
  sortMetreHypotheses,
} from '#/components/prosody/metrePanelCopy'
import type { ParsedMetreHypothesis } from '#/types/parsedPoem'

describe('metrePanelCopy', () => {
  it('maps margin to clear / mixed / uncertain', () => {
    expect(certaintyLevel(undefined, 0.5)).toBe('clear')
    expect(certaintyLevel(undefined, 0.2)).toBe('mixed')
    expect(certaintyLevel(undefined, 0.05)).toBe('uncertain')
  })

  it('falls back to entropy when margin missing', () => {
    expect(certaintyLevel(0.4)).toBe('clear')
    expect(certaintyLevel(1.2)).toBe('mixed')
    expect(certaintyLevel(1.9)).toBe('uncertain')
  })

  it('returns null when no signals', () => {
    expect(certaintyLevel()).toBeNull()
  })

  it('labels certainty for learners', () => {
    expect(certaintyLabel('clear')).toBe('Clear estimate')
    expect(certaintyLabel('mixed')).toBe('Mixed signals')
    expect(certaintyLabel('uncertain')).toBe('Uncertain')
  })

  it('maps certainty levels to semantic CSS classes (no hard-coded hex)', () => {
    expect(certaintySurfaceClass('clear')).toBe('certainty-surface certainty-surface--clear')
    expect(certaintySurfaceClass('mixed')).toBe('certainty-surface certainty-surface--mixed')
    expect(certaintySurfaceClass('uncertain')).toBe(
      'certainty-surface certainty-surface--uncertain',
    )
    expect(certaintySurfaceClass('clear')).not.toMatch(/#|rgb|oklch/)
  })

  it('maps head ids to friendly names', () => {
    expect(headDisplayName('heuristic_or_hybrid')).toBe('Parser path')
    expect(headDisplayName('dense_logistic')).toBe('Pattern model')
    expect(headDisplayName('prototype_knn')).toBe('Nearest example')
    expect(headDisplayName('custom_head')).toBe('custom head')
  })

  it('formats soft mass without fake percentage units', () => {
    expect(formatSoftScore(0.72)).toBe('0.72')
    expect(formatSoftScore(1)).toBe('1.00')
    expect(formatSoftScore(0)).toBe('0.00')
    expect(formatSoftScore(Number.NaN)).toBe('—')
    expect(formatSoftScore(1.4)).toBe('1.00')
    expect(formatSoftScore(0.72)).not.toMatch(/%/)
    expect(SOFT_SCORE_HELP.toLowerCase()).toMatch(/not a calibrated/)
  })

  it('resolves honesty line: short wire text kept, long or empty → short default', () => {
    expect(resolveHonestyLine('Soft sketch only')).toBe('Soft sketch only')
    expect(resolveHonestyLine('')).toBe(HONESTY_SHORT)
    expect(resolveHonestyLine(null)).toBe(HONESTY_SHORT)
    expect(resolveHonestyLine(undefined)).toBe(HONESTY_SHORT)
    expect(resolveHonestyLine('x'.repeat(80))).toBe(HONESTY_SHORT)
    expect(HONESTY_SHORT.toLowerCase()).toMatch(/not classical/)
    expect(CERTAINTY_HELP.length).toBeGreaterThan(20)
  })

  it('builds learner subtitle without dumping entropy bits', () => {
    const sub = metrePanelSubtitle('வெண்பா', 2, 0.4, 0.5)
    expect(sub).toMatch(/வெண்பா/)
    expect(sub).toMatch(/vikalpa 2/)
    expect(sub).toMatch(/clear estimate/)
    expect(sub).not.toMatch(/entropy|bits|pp/i)
  })

  it('sorts hypotheses by rank then aggregate score', () => {
    const rows: ParsedMetreHypothesis[] = [
      { metre_type: 'b', aggregate_score: 9, violations: [], rule_ids: [], metre_rank: 2 },
      { metre_type: 'a', aggregate_score: 1, violations: [], rule_ids: [], metre_rank: 1 },
      { metre_type: 'c', aggregate_score: 5, violations: [], rule_ids: [] },
    ]
    expect(sortMetreHypotheses(rows).map((h) => h.metre_type)).toEqual(['a', 'b', 'c'])
    expect(sortMetreHypotheses(undefined)).toEqual([])
  })

  it('hypothesisScoreView prefers soft mass over fake %', () => {
    const soft = hypothesisScoreView({
      metre_type: 'venpaa',
      aggregate_score: 3,
      violations: [],
      rule_ids: [],
      metre_probability: 0.72,
    })
    expect(soft.text).toBe('0.72')
    expect(soft.text).not.toMatch(/%/)
    expect(soft.title.toLowerCase()).toMatch(/not a calibrated/)

    const fallback = hypothesisScoreView({
      metre_type: 'venpaa',
      aggregate_score: 12,
      violations: [],
      rule_ids: [],
    })
    expect(fallback.text).toBe('score 12')
  })

  it('classical check summary is learner prose', () => {
    expect(classicalCheckSummary(true)).toMatch(/No flags/)
    expect(classicalCheckSummary(false)).toMatch(/Some classical/)
    expect(classicalCheckSummary(null)).toMatch(/not available/)
    expect(classicalCheckSummary(undefined)).toMatch(/not available/)
  })

  it('hasMetreTechNotes gates progressive disclosure without requiring metre_ml', () => {
    expect(hasMetreTechNotes({})).toBe(false)
    expect(hasMetreTechNotes({ metre_entropy_bits: 0.9 })).toBe(true)
    expect(hasMetreTechNotes({ metre_epistemic_margin: 0.2 })).toBe(true)
    expect(
      hasMetreTechNotes({
        metre_ml: {
          dual_truth: {
            classical_violations: [],
            separation_policy: 'parallel',
          },
          head_votes: [],
          pattern_features: [],
          uncertainty_blurb: '',
          honesty_label: '',
          a12_freeze_date: '',
        },
      }),
    ).toBe(true)
    expect(
      hasMetreTechNotes({
        metre_ml: {
          dual_truth: {
            classical_violations: [],
            separation_policy: '',
          },
          head_votes: [{ head_id: 'dense_logistic', metre_type: 'venpaa', score: 0.5, note: '' }],
          pattern_features: [],
          uncertainty_blurb: '',
          honesty_label: '',
          a12_freeze_date: '',
        },
      }),
    ).toBe(true)
  })
})
