/** @vitest-environment jsdom */

import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DeveloperEvaluationGuide } from '#/components/prosody/DeveloperEvaluationGuide'

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...rest
  }: {
    to: string
    children: ReactNode
    className?: string
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

describe('DeveloperEvaluationGuide', () => {
  it('renders simple guide with plain-language metre story', () => {
    render(<DeveloperEvaluationGuide />)
    const root = screen.getByTestId('developer-evaluation-guide')
    expect(root).toBeTruthy()
    expect(screen.getByRole('heading', { name: /How metre guessing works here/i })).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-simple')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-research')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-docs')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-panel-simple')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /How mixed\? \(entropy\)/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Lead over #2/i })).toBeTruthy()
    expect(screen.getByText(/Back to Prosody Lab/i)).toBeTruthy()
  })

  it('research tab lists control, ML, information, and mining fields', () => {
    render(<DeveloperEvaluationGuide />)
    fireEvent.click(screen.getByTestId('dev-eval-tab-research'))
    const research = screen.getByTestId('dev-eval-panel-research')
    expect(research.textContent).toMatch(/Control systems/)
    expect(research.textContent).toMatch(/Separation principle/)
    expect(research.textContent).toMatch(/Entropy \(bits\)/)
    expect(research.textContent).toMatch(/Association rules/)
    expect(research.textContent).toMatch(/dense\[51\]/)
    expect(research.textContent).toMatch(/ml_only_classical_flags/)
  })

  it('training & docs tab links portfolio sources', () => {
    render(<DeveloperEvaluationGuide />)
    fireEvent.click(screen.getByTestId('dev-eval-tab-docs'))
    const docs = screen.getByTestId('dev-eval-panel-docs')
    expect(docs.textContent).toMatch(/How we train/)
    expect(docs.textContent).toMatch(/METRE_ML_BEGINNER_GUIDE/)
    expect(docs.textContent).toMatch(/METRE_ML_METHODS_PORTFOLIO/)
    expect(docs.textContent).toMatch(/PARSE_FEATURES/)
    expect(docs.textContent).toMatch(/special_type/)
  })
})
