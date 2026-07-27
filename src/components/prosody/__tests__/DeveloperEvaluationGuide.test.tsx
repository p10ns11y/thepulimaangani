/** @vitest-environment jsdom */

import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
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
  it('renders first-principles sections and field explanations', () => {
    render(<DeveloperEvaluationGuide />)
    const root = screen.getByTestId('developer-evaluation-guide')
    expect(root).toBeTruthy()
    expect(screen.getByRole('heading', { name: /How metre ML works here/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /plant · observer · constraint/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Entropy' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Confidence gap (Top1 − top2)' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Multi-head votes' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Soft classical sketch' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Dual-truth/i })).toBeTruthy()
    expect(root.textContent).toMatch(/ml_only_classical_flags/)
    expect(root.textContent).toMatch(/dense\[51\]/)
    expect(root.textContent).toMatch(/ADOPT/)
    expect(screen.getByText(/Back to Prosody Lab/i)).toBeTruthy()
  })
})
