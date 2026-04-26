import type { ParsedSyllable } from '#/types/parsedPoem'

function wordChars(word: string): string {
  return word.replace(/\s/g, '')
}

/**
 * Maps consecutive parser syllables to each whitespace-delimited **word** on one physical line.
 * Uses concatenated syllable text; leftover syllables attach to the last word.
 */
export function alignSyllablesToWords(
  lineText: string,
  syllables: ParsedSyllable[],
): { word: string; syllables: ParsedSyllable[] }[] {
  const normalized = lineText.replace(/\r\n/g, '\n')
  const rawWords = normalized.split(/\s+/).filter((w) => w.length > 0)

  if (rawWords.length === 0) {
    if (!normalized.trim()) return []
    return [{ word: normalized, syllables: syllables.slice() }]
  }

  const out: { word: string; syllables: ParsedSyllable[] }[] = []
  let si = 0

  for (const word of rawWords) {
    const target = wordChars(word)
    const chunk: ParsedSyllable[] = []
    let acc = ''

    while (si < syllables.length && acc.length < target.length) {
      chunk.push(syllables[si]!)
      acc += syllables[si]!.text
      si++
    }

    out.push({ word, syllables: chunk })
  }

  if (si < syllables.length && out.length > 0) {
    const last = out[out.length - 1]!
    last.syllables.push(...syllables.slice(si))
  } else if (si < syllables.length && out.length === 0) {
    out.push({ word: normalized.trim() || '—', syllables: syllables.slice(si) })
  }

  return out.filter((g) => g.syllables.length > 0)
}
