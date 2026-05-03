/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LivePreviewController } from '#/lib/livePreviewController'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { wasmLivePreviewControllerStub } from '#/lib/__tests__/fixtures/wasmParseJsonBuilders'
import { runWasmParse } from '#/lib/wasmParse'
import type { LivePreviewState } from '#/types/livePreview'

vi.mock('#/lib/wasmParse', () => ({
  runWasmParse: vi.fn(async (text: string) => {
    const canon = text.replace(/\r\n/g, '\n')
    return JSON.stringify(wasmLivePreviewControllerStub(canon))
  }),
}))

describe('LivePreviewController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('cache key: trailing newline vs none yields different normalizePoemText(parsed.original_text)', async () => {
    const states: LivePreviewState[] = []
    const c = new LivePreviewController(0, (s) => {
      states.push(structuredClone(s))
    })

    c.setSource('அ\n')
    await vi.runAllTimersAsync()

    const readyAfterFirst = states.filter((s) => s.status === 'ready' && s.parsed != null)
    expect(readyAfterFirst.length).toBeGreaterThan(0)
    const normFirst = normalizePoemText(readyAfterFirst[readyAfterFirst.length - 1]!.parsed!.original_text)

    c.setSource('அ')
    await vi.runAllTimersAsync()

    const readyAfterSecond = states.filter((s) => s.status === 'ready' && s.parsed != null)
    const last = readyAfterSecond[readyAfterSecond.length - 1]!
    const normSecond = normalizePoemText(last.parsed!.original_text)
    expect(normFirst).not.toBe(normSecond)

    c.dispose()
  })

  it('does not call WASM when normalized editor text matches the last ready parse (cache hit)', async () => {
    const wasmSpy = vi.mocked(runWasmParse)

    const states: LivePreviewState[] = []
    const c = new LivePreviewController(0, (s) => {
      states.push(structuredClone(s))
    })

    c.setSource('அ')
    await vi.runAllTimersAsync()
    expect(wasmSpy.mock.calls.length).toBe(1)
    expect(states.some((s) => s.status === 'ready' && s.parsed != null)).toBe(true)
    const ready = states.filter((s) => s.status === 'ready' && s.parsed != null)
    expect(ready[ready.length - 1]?.rawJson).toMatch(/^\{/)

    wasmSpy.mockClear()

    c.setSource('அ')
    await vi.runAllTimersAsync()
    expect(wasmSpy.mock.calls.length).toBe(0)

    c.dispose()
  })
})
