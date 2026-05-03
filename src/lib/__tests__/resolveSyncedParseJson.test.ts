import { describe, expect, it } from 'vitest'

import { resolveSyncedParseJson } from '#/lib/resolveSyncedParseJson'
import { wasmLivePreviewControllerStub } from '#/lib/__tests__/fixtures/wasmParseJsonBuilders'
import { DEFAULT_LIVE_PREVIEW } from '#/types/livePreview'

describe('resolveSyncedParseJson', () => {
  const poemText = 'தமிழ்'
  const raw = JSON.stringify(wasmLivePreviewControllerStub(poemText))

  it('returns live rawJson when it matches normalized poem text', () => {
    expect(
      resolveSyncedParseJson({
        poemText,
        live: {
          ...DEFAULT_LIVE_PREVIEW,
          status: 'ready',
          parsed: null,
          rawJson: raw,
          layoutVersion: 1,
        },
        manualResult: null,
      }),
    ).toBe(raw)
  })

  it('prefers live rawJson over manual when both match', () => {
    const manual = JSON.stringify(wasmLivePreviewControllerStub(poemText))
    const liveRaw = JSON.stringify(wasmLivePreviewControllerStub(poemText))
    expect(
      resolveSyncedParseJson({
        poemText,
        live: {
          ...DEFAULT_LIVE_PREVIEW,
          rawJson: liveRaw,
          status: 'ready',
          layoutVersion: 1,
        },
        manualResult: manual,
      }),
    ).toBe(liveRaw)
  })

  it('falls back to manual result when live has no matching rawJson', () => {
    expect(
      resolveSyncedParseJson({
        poemText,
        live: { ...DEFAULT_LIVE_PREVIEW, rawJson: null },
        manualResult: raw,
      }),
    ).toBe(raw)
  })

  it('returns null when neither candidate matches the current poem', () => {
    expect(
      resolveSyncedParseJson({
        poemText: 'வேறு',
        live: {
          ...DEFAULT_LIVE_PREVIEW,
          rawJson: raw,
        },
        manualResult: null,
      }),
    ).toBe(null)
  })

  it('returns null for invalid JSON in candidates', () => {
    expect(
      resolveSyncedParseJson({
        poemText,
        live: {
          ...DEFAULT_LIVE_PREVIEW,
          rawJson: '{not json',
        },
        manualResult: null,
      }),
    ).toBe(null)
  })
})
