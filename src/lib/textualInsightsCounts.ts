import { splitGraphemes } from '#/lib/grapheme'
import type { ParsedPoem } from '#/types/parsedPoem'

/** Prefer WASM `letter_count` when it is a finite number; else grapheme count of normalized poem text. */
export function resolveTotalLetters(data: ParsedPoem): number | null {
  const lc = data.letter_count
  if (typeof lc === 'number' && Number.isFinite(lc)) {
    return lc
  }
  return null
}

export function graphemeCountOriginalText(data: ParsedPoem): number {
  return splitGraphemes(data.original_text.normalize('NFC')).length
}

/** Single user-facing total: parser when numeric, else grapheme fallback. */
export function formatTotalLetters(data: ParsedPoem): string {
  const n = resolveTotalLetters(data)
  if (n !== null) return String(n)
  return String(graphemeCountOriginalText(data))
}
