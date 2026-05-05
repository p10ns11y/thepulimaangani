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
  const rawWords = normalized.split(/\s+/).filter((token) => token.length > 0)

  if (rawWords.length === 0) {
    if (!normalized.trim()) return []
    return [{ word: normalized, syllables: syllables.slice() }]
  }

  const wordGroups: { word: string; syllables: ParsedSyllable[] }[] = []
  let syllableCursorIndex = 0

  for (const word of rawWords) {
    const targetCharRun = wordChars(word)
    const syllablesForWord: ParsedSyllable[] = []
    let concatenatedSyllableText = ''

    while (syllableCursorIndex < syllables.length && concatenatedSyllableText.length < targetCharRun.length) {
      syllablesForWord.push(syllables[syllableCursorIndex]!)
      concatenatedSyllableText += syllables[syllableCursorIndex]!.text
      syllableCursorIndex++
    }

    wordGroups.push({ word, syllables: syllablesForWord })
  }

  if (syllableCursorIndex < syllables.length && wordGroups.length > 0) {
    const lastWordGroup = wordGroups[wordGroups.length - 1]!
    lastWordGroup.syllables.push(...syllables.slice(syllableCursorIndex))
  } else if (syllableCursorIndex < syllables.length && wordGroups.length === 0) {
    wordGroups.push({ word: normalized.trim() || '—', syllables: syllables.slice(syllableCursorIndex) })
  }

  return wordGroups.filter((wordGroup) => wordGroup.syllables.length > 0)
}
