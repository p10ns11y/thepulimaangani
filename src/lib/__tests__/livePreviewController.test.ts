/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LivePreviewController } from '#/lib/livePreviewController'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import type { LivePreviewState } from '#/types/livePreview'

vi.mock('#/lib/wasmParse', () => ({
  runWasmParse: vi.fn(async (text: string) => {
    const norm = text.replace(/\r\n/g, '\n')
    return JSON.stringify({
      original_text: norm,
      normalized_text: norm,
      letter_count: 0,
      vikalpa_count: 0,
      syllables: [{ text: 'a', syllable_type: 'Ner' }],
      feet: [{ foot_type: 'Ner', syllables: [{ text: 'a', syllable_type: 'Ner' }] }],
      lines: [
        { line_class: '—', feet: [{ foot_type: 'Ner', syllables: [{ text: 'a', syllable_type: 'Ner' }] }] },
      ],
      poem: { lines: [], syllables_flat: [], normalized_text: norm, linkage: [] },
      linkage: [],
      talai: [],
      metre_type: null,
      errors: [],
    })
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

  it('uses normalizePoemText for cache; trailing newline vs none are different parses', async () => {
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
})
