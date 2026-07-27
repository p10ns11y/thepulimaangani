/** @vitest-environment jsdom */

import * as React from 'react'
import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DeveloperEvaluationGuide } from '#/components/prosody/DeveloperEvaluationGuide'
import {
  DEFAULT_DEV_EVAL_TAB,
  parseDevEvalTab,
  type DevEvalTab,
} from '#/lib/devEvalTabs'

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

function panelState(testId: string): string | null {
  return screen.getByTestId(testId).getAttribute('data-state')
}

/**
 * Mirrors `/developer-evaluation` route wiring: search.tab → guide; tab click → navigate search.
 */
function ShareableDevEvalHarness({
  initialTab,
}: {
  initialTab?: unknown
}) {
  const [tab, setTab] = React.useState<DevEvalTab>(() =>
    parseDevEvalTab(initialTab),
  )
  return (
    <DeveloperEvaluationGuide
      tab={tab}
      onTabChange={(next) => {
        setTab(next)
      }}
    />
  )
}

describe('DeveloperEvaluationGuide', () => {
  it('renders simple guide with plain-language metre story', () => {
    render(<DeveloperEvaluationGuide />)
    const root = screen.getByTestId('developer-evaluation-guide')
    expect(root).toBeTruthy()
    expect(root.getAttribute('data-active-tab')).toBe('simple')
    expect(
      screen.getByRole('heading', { name: /How metre guessing works here/i }),
    ).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-simple')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-research')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-tab-docs')).toBeTruthy()
    expect(screen.getByTestId('dev-eval-panel-simple')).toBeTruthy()
    expect(panelState('dev-eval-panel-simple')).toBe('active')
    expect(
      screen.getByRole('heading', { name: /How mixed\? \(entropy\)/i }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Lead over #2/i })).toBeTruthy()
    expect(screen.getByText(/Back to Prosody Lab/i)).toBeTruthy()
  })

  it('opens the tab that matches the shareable URL key (deep-link)', () => {
    for (const tab of ['simple', 'research', 'docs'] as const) {
      const { unmount } = render(<DeveloperEvaluationGuide tab={tab} />)
      const root = screen.getByTestId('developer-evaluation-guide')
      expect(root.getAttribute('data-active-tab')).toBe(tab)
      expect(panelState(`dev-eval-panel-${tab}`)).toBe('active')
      for (const other of ['simple', 'research', 'docs'] as const) {
        if (other === tab) continue
        expect(panelState(`dev-eval-panel-${other}`)).toBe('inactive')
      }
      unmount()
    }
  })

  it('invalid tab key falls back to Simple guide', () => {
    const bad = parseDevEvalTab('not-a-tab')
    expect(bad).toBe(DEFAULT_DEV_EVAL_TAB)
    render(<DeveloperEvaluationGuide tab={bad} />)
    expect(
      screen
        .getByTestId('developer-evaluation-guide')
        .getAttribute('data-active-tab'),
    ).toBe('simple')
    expect(panelState('dev-eval-panel-simple')).toBe('active')
  })

  it('research tab lists control, ML, information, and mining fields', () => {
    render(<DeveloperEvaluationGuide tab="research" />)
    const research = screen.getByTestId('dev-eval-panel-research')
    expect(research.getAttribute('data-state')).toBe('active')
    expect(research.textContent).toMatch(/Control systems/)
    expect(research.textContent).toMatch(/Separation principle/)
    expect(research.textContent).toMatch(/Entropy \(bits\)/)
    expect(research.textContent).toMatch(/Association rules/)
    expect(research.textContent).toMatch(/dense\[51\]/)
    expect(research.textContent).toMatch(/ml_only_classical_flags/)
  })

  it('training & docs tab links portfolio sources', () => {
    render(<DeveloperEvaluationGuide tab="docs" />)
    const docs = screen.getByTestId('dev-eval-panel-docs')
    expect(docs.getAttribute('data-state')).toBe('active')
    expect(docs.textContent).toMatch(/How we train/)
    expect(docs.textContent).toMatch(/METRE_ML_BEGINNER_GUIDE/)
    expect(docs.textContent).toMatch(/METRE_ML_METHODS_PORTFOLIO/)
    expect(docs.textContent).toMatch(/PARSE_FEATURES/)
    expect(docs.textContent).toMatch(/special_type/)
  })

  it('tab selection notifies parent so the shareable URL can update', () => {
    // Controlled harness mirrors route: parent must update `tab` after each change
    // or Radix will not re-fire for a value that is already active.
    const seen: DevEvalTab[] = []
    function Harness() {
      const [tab, setTab] = React.useState<DevEvalTab>('simple')
      return (
        <DeveloperEvaluationGuide
          tab={tab}
          onTabChange={(next) => {
            seen.push(next)
            setTab(next)
          }}
        />
      )
    }
    render(<Harness />)
    // Radix Tabs activates on mouseDown (not click alone) in jsdom.
    fireEvent.mouseDown(screen.getByTestId('dev-eval-tab-research'))
    fireEvent.mouseDown(screen.getByTestId('dev-eval-tab-docs'))
    fireEvent.mouseDown(screen.getByTestId('dev-eval-tab-simple'))
    expect(seen).toEqual(['research', 'docs', 'simple'])
    expect(panelState('dev-eval-panel-simple')).toBe('active')
  })

  it('controlled tab follows parent updates (URL → UI mapping)', () => {
    const { rerender } = render(<DeveloperEvaluationGuide tab="simple" />)
    expect(panelState('dev-eval-panel-simple')).toBe('active')

    rerender(<DeveloperEvaluationGuide tab="research" />)
    expect(
      screen
        .getByTestId('developer-evaluation-guide')
        .getAttribute('data-active-tab'),
    ).toBe('research')
    expect(panelState('dev-eval-panel-research')).toBe('active')
    expect(panelState('dev-eval-panel-simple')).toBe('inactive')

    rerender(<DeveloperEvaluationGuide tab="docs" />)
    expect(panelState('dev-eval-panel-docs')).toBe('active')
  })

  it('shareable harness: load with tab key, switch tabs updates active panel', () => {
    render(<ShareableDevEvalHarness initialTab="research" />)
    expect(panelState('dev-eval-panel-research')).toBe('active')

    fireEvent.mouseDown(screen.getByTestId('dev-eval-tab-docs'))
    expect(panelState('dev-eval-panel-docs')).toBe('active')
    expect(panelState('dev-eval-panel-research')).toBe('inactive')
    expect(
      screen
        .getByTestId('developer-evaluation-guide')
        .getAttribute('data-active-tab'),
    ).toBe('docs')

    fireEvent.mouseDown(screen.getByTestId('dev-eval-tab-simple'))
    expect(panelState('dev-eval-panel-simple')).toBe('active')
  })

  it('shareable harness: invalid initial tab falls back to simple', () => {
    render(<ShareableDevEvalHarness initialTab="garbage" />)
    expect(
      screen
        .getByTestId('developer-evaluation-guide')
        .getAttribute('data-active-tab'),
    ).toBe('simple')
    expect(panelState('dev-eval-panel-simple')).toBe('active')
  })
})
