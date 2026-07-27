/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MetrePanelBody } from '#/components/prosody/MetrePanelBody'
import {
  FALLBACK_METRE_EXPLAINER,
  IN_SAMPLE_ADOPT_NOTE,
} from '#/components/prosody/metrePanelCopy'
import {
  parsedFoot,
  parsedLine,
  parsedPoem,
  parsedSyllable,
} from '#/lib/__tests__/fixtures/parsedPoemBuilders'

describe('MetrePanelBody', () => {
  it('renders classical summary and fallback explainer without ML surface', () => {
    const data = parsedPoem({
      original_text: 'தமிழ்',
      metre_type: 'வெண்பா',
      vikalpa_count: 1,
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('தமிழ்', 'Ner')])])],
    })
    render(<MetrePanelBody data={data} />)
    expect(screen.getByText('வெண்பா')).toBeTruthy()
    expect(screen.getByText('Vikalpa')).toBeTruthy()
    expect(screen.getByTestId('metre-ml-honesty')).toBeTruthy()
    expect(screen.getByText(FALLBACK_METRE_EXPLAINER)).toBeTruthy()
    expect(screen.queryByTestId('metre-ml-tech-notes')).toBeNull()
  })

  it('renders certainty, dual-truth, hypotheses, and technical notes with ML surface', () => {
    const data = parsedPoem({
      original_text: 'தமிழ்',
      metre_type: 'வெண்பா',
      vikalpa_count: 2,
      metre_entropy_bits: 0.4,
      metre_epistemic_margin: 0.42,
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('தமிழ்', 'Ner')])])],
      top_k_metre_hypotheses: [
        {
          metre_type: 'ஆசிரியப்பா',
          aggregate_score: 0.2,
          violations: [],
          rule_ids: [],
          metre_probability: 0.2,
          metre_rank: 2,
        },
        {
          metre_type: 'வெண்பா',
          aggregate_score: 0.7,
          violations: [],
          rule_ids: [],
          metre_probability: 0.7,
          metre_rank: 1,
        },
      ],
      metre_ml: {
        honesty_label: 'Soft sketch only',
        uncertainty_blurb: '',
        a12_freeze_date: '2026-01-01',
        dual_truth: {
          ml_metre_type: 'வெண்பா',
          classical_ok_for_ml_top: true,
          classical_violations: ['rule-a', 'rule-b'],
          separation_policy: 'no_fuse',
        },
        head_votes: [
          {
            head_id: 'dense_logistic',
            metre_type: 'வெண்பா',
            score: 0.81,
            note: 'in-sample',
          },
        ],
        pattern_features: [
          {
            dense_index: 3,
            feature_id: 'feat_line_count',
            weight: 0.125,
            direction: '+',
          },
        ],
      },
    })

    render(<MetrePanelBody data={data} />)

    expect(screen.getByText('Clear estimate')).toBeTruthy()
    expect(screen.getByTestId('metre-ml-honesty').textContent).toMatch(/Soft sketch only/)
    expect(screen.getByText('Other metre guesses')).toBeTruthy()
    expect(screen.getByText('ஆசிரியப்பா')).toBeTruthy()
    expect(screen.getByTestId('metre-ml-dual-truth')).toBeTruthy()
    expect(screen.getByText(/estimate:/)).toBeTruthy()
    expect(screen.getByText('rule-a')).toBeTruthy()

    const tech = screen.getByTestId('metre-ml-tech-notes')
    expect(tech).toBeTruthy()
    // Open details so nested copy is visible if browser hides closed content.
    tech.setAttribute('open', '')
    expect(screen.getByTestId('metre-ml-head-votes')).toBeTruthy()
    expect(screen.getByText('Pattern model')).toBeTruthy()
    expect(screen.getByTestId('metre-ml-pattern-features')).toBeTruthy()
    expect(screen.getByText(/feat_line_count/)).toBeTruthy()
    expect(screen.getByText(/Pattern freeze 2026-01-01/)).toBeTruthy()
    expect(screen.getByText(/policy: no_fuse/)).toBeTruthy()
    expect(screen.getByText(IN_SAMPLE_ADOPT_NOTE)).toBeTruthy()
  })

  it('shows uncertainty blurb when provided instead of default adopt note', () => {
    const data = parsedPoem({
      original_text: 'x',
      metre_type: 'கலிப்பா',
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('x', 'Ner')])])],
      metre_entropy_bits: 1.9,
      metre_ml: {
        honesty_label: '',
        uncertainty_blurb: 'Heads disagree on this sample.',
        dual_truth: {
          classical_ok_for_ml_top: false,
          classical_violations: [],
          separation_policy: 'strict',
        },
        head_votes: [],
        pattern_features: [],
      },
    })
    render(<MetrePanelBody data={data} />)
    const tech = screen.getByTestId('metre-ml-tech-notes')
    tech.setAttribute('open', '')
    expect(screen.getByText('Heads disagree on this sample.')).toBeTruthy()
    expect(screen.queryByText(IN_SAMPLE_ADOPT_NOTE)).toBeNull()
  })
})
