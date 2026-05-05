import { splitGraphemes } from '#/lib/grapheme'
import type { ParsedPoem } from '#/types/parsedPoem'

/** Prefer WASM `letter_count` when it is a finite number; else grapheme count of normalized poem text. */
export function resolveTotalLetters(data: ParsedPoem): number | null {
  const letterCountFromWasm = data.letter_count
  if (typeof letterCountFromWasm === 'number' && Number.isFinite(letterCountFromWasm)) {
    return letterCountFromWasm
  }
  return null
}

export function graphemeCountOriginalText(data: ParsedPoem): number {
  return splitGraphemes(data.original_text.normalize('NFC')).length
}

/** Single user-facing total: parser when numeric, else grapheme fallback. */
export function formatTotalLetters(data: ParsedPoem): string {
  const resolvedLetterTotal = resolveTotalLetters(data)
  if (resolvedLetterTotal !== null) return String(resolvedLetterTotal)
  return String(graphemeCountOriginalText(data))
}
