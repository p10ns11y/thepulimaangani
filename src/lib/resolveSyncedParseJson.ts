import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import type { LivePreviewState } from '#/types/livePreview'

export type ResolveSyncedParseJsonArgs = {
  poemText: string
  live: LivePreviewState
  manualResult: string | null
}

/**
 * Picks which raw WASM JSON string drives Structure / Text flow / export so it matches the text
 * the user sees (debounced live parse preferred; manual refresh when aligned).
 */
export function resolveSyncedParseJson(args: ResolveSyncedParseJsonArgs): string | null {
  const previewNorm = normalizePoemText(args.poemText)

  const normForRaw = (raw: string): string | null => {
    try {
      const data: unknown = JSON.parse(raw)
      const p = adaptWasmJsonToParsedPoem(data)
      return p ? normalizePoemText(p.original_text) : null
    } catch {
      return null
    }
  }

  // Fast path: live preview already holds aligned parsed + raw (avoids JSON re-parse edge cases).
  if (
    args.live.status === 'ready' &&
    args.live.parsed &&
    args.live.rawJson &&
    normalizePoemText(args.live.parsed.original_text) === previewNorm
  ) {
    return args.live.rawJson
  }

  const candidates: string[] = []
  if (args.live.rawJson) candidates.push(args.live.rawJson)
  if (args.manualResult) candidates.push(args.manualResult)

  for (const raw of candidates) {
    const n = normForRaw(raw)
    if (n === previewNorm) return raw
  }

  return null
}
