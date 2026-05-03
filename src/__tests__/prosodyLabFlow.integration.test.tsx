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

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitFor(() => {
      screen.getByRole('heading', { name: /Prosodic structure/i })
    }, SYNC_OPTIONS)
  })

  it('updates poem when switching metre tab so Structure reflects new sample after sync', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('tab', { name: /ஆசிரியப்பா/i }))

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('tab', { name: /^Structure$/i }))
    await waitFor(() => {
      screen.getByRole('heading', { name: /Prosodic structure/i })
    }, SYNC_OPTIONS)
  })

  it('opens editor from poem preview and applies draft', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('button', { name: /Edit poem/i }))

    const ta = await screen.findByRole('textbox')
    fireEvent.change(ta, { target: { value: '' } })
    fireEvent.change(ta, { target: { value: 'தமிழ் அழகு' } })

    fireEvent.click(screen.getByRole('button', { name: /Done/i }))

    await waitFor(() => {
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)
  })

  it('refresh parse completes without error', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitFor(() => {
      const b = screen.getByRole('button', { name: /Refresh parse/i }) as HTMLButtonElement
      expect(b.disabled).toBe(false)
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('button', { name: /Refresh parse/i }))

    await waitFor(() => {
      const b = screen.getByRole('button', { name: /Refresh parse/i }) as HTMLButtonElement
      expect(b.disabled).toBe(false)
    }, SYNC_OPTIONS)
  })

  it('Text flow tab shows metre summary lines', async () => {
    render(
      <AppActorProvider>
        <ProsodyLab />
      </AppActorProvider>,
    )

    await waitFor(() => {
      screen.getByRole('heading', { name: /Analysis summary/i })
    }, SYNC_OPTIONS)

    fireEvent.click(screen.getByRole('tab', { name: /Text flow/i }))

    await waitFor(() => {
      screen.getByText(/மீட்டர்:/)
    }, SYNC_OPTIONS)
  })
})
