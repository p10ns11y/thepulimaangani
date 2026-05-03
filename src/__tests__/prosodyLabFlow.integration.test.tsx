/**
 * @vitest-environment jsdom
 *
 * Fake timers skip LivePreviewController debounce (300–420ms) so CI spends time on WASM only.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AppActorProvider } from '#/components/AppActorProvider'
import { ProsodyLab } from '#/components/prosody/ProsodyLab'

/** WASM compile + parse can still be slow on cold CI; debounce is no longer in this budget. */
const SYNC_OPTIONS = { timeout: 15_000 }

/** Skip live-preview debounce (`LivePreviewController` uses `setTimeout`). */
async function flushLivePreviewDebounce() {
  await vi.runAllTimersAsync()
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
    vi.useFakeTimers({
      toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows Structure analysis after live parse syncs from default sample', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Prosodic structure/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )
  })

  it('updates poem when switching metre tab so Structure reflects new sample after sync', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )

    fireEvent.click(screen.getByRole('tab', { name: /ஆசிரியப்பா/i }))
    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Prosodic structure/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )
  })

  it('opens editor from poem preview and applies draft', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )

    fireEvent.click(screen.getByRole('button', { name: /Edit poem/i }))

    const ta = await screen.findByRole('textbox')
    fireEvent.change(ta, { target: { value: '' } })
    fireEvent.change(ta, { target: { value: 'தமிழ் அழகு' } })

    fireEvent.click(screen.getByRole('button', { name: /Done/i }))

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )
  })

  it('refresh parse completes without error', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await flushLivePreviewDebounce()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refresh parse/i })).toBeEnabled()
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('button', { name: /Refresh parse/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Refresh parse/i })).toBeEnabled()
    }, SYNC_OPTIONS)
  })

  it('Text flow tab shows metre summary lines', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await flushLivePreviewDebounce()

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: /Analysis summary/i })).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )

    fireEvent.click(screen.getByRole('tab', { name: /Text flow/i }))

    await waitFor(
      () => {
        expect(screen.getByText(/மீட்டர்:/)).toBeInTheDocument()
      },
      SYNC_OPTIONS,
    )
  })
})
