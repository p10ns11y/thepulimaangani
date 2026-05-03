/**
 * Ensures parser `original_text` aligns with UI poem text so `resolveSyncedParseJson` can sync tabs.
 */
import { describe, expect, it } from 'vitest'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { runWasmParse } from '#/lib/wasmParse'
import { defaultSampleRow } from '#/machines/prosodyLab.defaults'

describe('WASM original_text vs default sample', () => {
  it('matches the kalivenpaa sample string after normalization', async () => {
    const text = defaultSampleRow.example
    const raw = await runWasmParse(text)
    const j = JSON.parse(raw) as { original_text?: string }
    expect(typeof j.original_text).toBe('string')
    expect(normalizePoemText(j.original_text!)).toBe(normalizePoemText(text))
  })

  it('produces JSON that adaptWasmJsonToParsedPoem accepts (Structure tab needs parsed shape)', async () => {
    const text = defaultSampleRow.example
    const raw = await runWasmParse(text)
    const data: unknown = JSON.parse(raw)
    expect(adaptWasmJsonToParsedPoem(data)).not.toBeNull()
  })
})
