/**
 * Normalize WASM / UI syllable class for Ner vs Nirai display.
 * Keep pure so chips and Live share one classification path.
 */
export function isNerSyllableType(syllableType: string | null | undefined): boolean {
  if (typeof syllableType !== 'string') return false
  const t = syllableType.trim().toLowerCase()
  return t === 'ner' || t === 'நேர்'
}
