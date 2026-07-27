/**
 * @vitest-environment jsdom
 *
 * Live preview debounce is 0 when `import.meta.env.MODE === 'test'` (ProsodyLab).
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AppActorProvider } from '#/components/AppActorProvider'
import { ProsodyLab } from '#/components/prosody/ProsodyLab'

const SYNC_OPTIONS = { timeout: 15_000 }

/** Panel mounts parse tabs after WASM completes (Structure tab exists for Live-only and full modes). */
function waitForParseTabs(options = SYNC_OPTIONS) {
  return waitFor(() => {
    screen.getByRole('tab', { name: /^Structure$/i })
  }, options)
}

/** Radix hides inactive tab panels from the a11y tree; assert on document text after activating a tab. */
function waitForDocText(re: RegExp, options = SYNC_OPTIONS) {
  return waitFor(() => {
    expect(document.body.textContent).toMatch(re)
  }, options)
}

function mockViewportAndObservers() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  global.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
    root = null
    rootMargin = ''
    thresholds = []
  } as unknown as typeof IntersectionObserver
}

describe('ProsodyLab integration (real WASM from public/wasm)', () => {
  beforeEach(() => {
    mockViewportAndObservers()
  })

  it('shows Structure analysis after live parse syncs from default sample', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitForParseTabs()

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitForDocText(/Prosodic structure/)
  })

  it('updates poem when switching metre tab so Structure reflects new sample after sync', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitForParseTabs()

    fireEvent.click(screen.getByRole('tab', { name: /ஆசிரியப்பா/i }))

    await waitForParseTabs()

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitForDocText(/Prosodic structure/)
  })

  it('opens editor from Edit next to Live/Structure/Text flow tabs and applies draft', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitForParseTabs()

    fireEvent.click(screen.getByRole('button', { name: /Edit poem/i }))

    const ta = await screen.findByRole('textbox')
    fireEvent.change(ta, { target: { value: '' } })
    fireEvent.change(ta, { target: { value: 'தமிழ் அழகு' } })

    fireEvent.click(screen.getByRole('button', { name: /Done/i }))

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    await waitForParseTabs()
  })

  it('Text flow tab shows Textual insights', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitForParseTabs()

    fireEvent.click(screen.getByRole('tab', { name: /Text flow/i }))

    await waitForDocText(/Textual insights/)
  })

  it('collapses left Learn rail for full-width Structure reading, then expands', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitForParseTabs()

    expect(screen.getByTestId('prosody-input-rail')).toBeTruthy()
    expect(screen.getByTestId('samples-card')).toBeTruthy()
    expect(screen.getByText(/^Learn$/)).toBeTruthy()
    expect(screen.queryByText(/^Samples$/)).toBeNull()
    expect(screen.queryByText(/Poem & parse/i)).toBeNull()

    // Selector container expands/hides independently of the left rail
    expect(screen.getByTestId('samples-picker-body')).toBeTruthy()
    fireEvent.click(screen.getByTestId('samples-selector-toggle'))
    expect(screen.queryByTestId('samples-picker-body')).toBeNull()
    fireEvent.click(screen.getByTestId('samples-selector-toggle'))
    expect(screen.getByTestId('samples-picker-body')).toBeTruthy()

    fireEvent.click(screen.getByTestId('prosody-input-rail-collapse'))

    expect(screen.getByTestId('prosody-input-rail-collapsed')).toBeTruthy()
    expect(screen.queryByTestId('prosody-input-rail')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitForDocText(/Prosodic structure/)

    fireEvent.click(screen.getByTestId('prosody-input-rail-expand'))
    expect(screen.getByTestId('prosody-input-rail')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Refresh$/i })).toBeNull()
  })
})
