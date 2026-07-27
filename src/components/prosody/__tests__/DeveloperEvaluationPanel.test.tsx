/** @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DeveloperEvaluationPanel } from '#/components/prosody/DeveloperEvaluationPanel'
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

describe('DeveloperEvaluationPanel', () => {
  it('shows empty developer evaluation copy when no tech signals', () => {
    const data = parsedPoem({
      original_text: 'தமிழ்',
      metre_type: 'வெண்பா',
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('தமிழ்', 'Ner')])])],
    })
    render(<DeveloperEvaluationPanel data={data} />)
    expect(screen.getByTestId('developer-evaluation-panel')).toBeTruthy()
    expect(screen.getByTestId('developer-evaluation-empty')).toBeTruthy()
    expect(screen.getByText(FALLBACK_METRE_EXPLAINER)).toBeTruthy()
    expect(screen.getByText('Developer Evaluation')).toBeTruthy()
  })

  it('renders tech notes full pane with heads, features, and metrics', () => {
    const data = parsedPoem({
      original_text: 'தமிழ்',
      metre_type: 'வெண்பா',
      metre_entropy_bits: 0.4,
      metre_epistemic_margin: 0.42,
      lines: [parsedLine([parsedFoot('Ner', [parsedSyllable('தமிழ்', 'Ner')])])],
      metre_ml: {
        honesty_label: 'Soft sketch only',
        uncertainty_blurb: '',
        a12_freeze_date: '2026-01-01',
        dual_truth: {
          ml_metre_type: 'வெண்பா',
          classical_ok_for_ml_top: true,
          classical_violations: [],
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

    render(<DeveloperEvaluationPanel data={data} />)

    expect(screen.getByTestId('developer-evaluation-panel')).toBeTruthy()
    expect(screen.getByTestId('metre-ml-tech-notes')).toBeTruthy()
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
    render(<DeveloperEvaluationPanel data={data} />)
    expect(screen.getByText('Heads disagree on this sample.')).toBeTruthy()
    expect(screen.queryByText(IN_SAMPLE_ADOPT_NOTE)).toBeNull()
  })
})
