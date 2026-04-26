/** Unicode grapheme clusters; falls back to code units if `Intl.Segmenter` is missing. */
export function splitGraphemes(text: string): string[] {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.Segmenter === 'undefined') {
      return [...text]
    }
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return Array.from(seg.segment(text), (s) => s.segment)
  } catch {
    return [...text]
  }
}
