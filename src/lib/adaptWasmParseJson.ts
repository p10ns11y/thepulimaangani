import type { ParsedFoot, ParsedLine, ParsedPoem, ParsedSyllable } from '#/types/parsedPoem'

function isFootish(value: unknown): value is ParsedFoot {
  if (!value || typeof value !== 'object') return false
  const f = value as Record<string, unknown>
  return typeof f.foot_type === 'string' && Array.isArray(f.syllables)
}

function normalizeSyllable(raw: unknown): ParsedSyllable | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  if (typeof s.text !== 'string') return null
  const st = s.syllable_type
  const syllable_type = typeof st === 'string' ? st : 'Nirai'
  const line_index = typeof s.line_index === 'number' ? s.line_index : undefined
  const word_index_in_line =
    typeof s.word_index_in_line === 'number' ? s.word_index_in_line : undefined
  return {
    text: s.text,
    syllable_type,
    ...(line_index !== undefined ? { line_index } : {}),
    ...(word_index_in_line !== undefined ? { word_index_in_line } : {}),
  }
}

function normalizeFeet(raw: unknown[]): ParsedFoot[] {
  const out: ParsedFoot[] = []
  for (const item of raw) {
    if (!isFootish(item)) continue
    const syllables = item.syllables
      .map(normalizeSyllable)
      .filter((x): x is ParsedSyllable => x != null)
    if (syllables.length === 0) continue
    out.push({ foot_type: item.foot_type, syllables })
  }
  return out
}

function syllablesFromSyllableNodes(syllNodes: unknown[]): ParsedSyllable[] {
  const syllables: ParsedSyllable[] = []
  for (const sn of syllNodes) {
    if (!sn || typeof sn !== 'object') continue
    const node = sn as Record<string, unknown>
    const inner = node.inner
    const raw = inner !== undefined && inner !== null && typeof inner === 'object' ? inner : sn
    const syl = normalizeSyllable(raw)
    if (syl) syllables.push(syl)
  }
  return syllables
}

/** Matches Rust `foot_pattern`: hyphenated Ner/Nirai tokens for one linguistic word. */
function machineFootPatternFromSyllables(syllables: ParsedSyllable[]): string {
  return syllables.map((s) => (s.syllable_type === 'Ner' ? 'Ner' : 'Nirai')).join('-')
}

function normalizeLines(rawLines: unknown, feet: ParsedFoot[]): ParsedLine[] {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    if (feet.length === 0) return []
    return [{ line_class: '—', feet }]
  }

  const lines: ParsedLine[] = []
  for (const row of rawLines) {
    if (!row || typeof row !== 'object') continue
    const L = row as Record<string, unknown>
    const line_class = typeof L.line_class === 'string' ? L.line_class : '—'
    const lineFeet = Array.isArray(L.feet) ? normalizeFeet(L.feet as unknown[]) : []
    if (lineFeet.length === 0) continue
    lines.push({ line_class, feet: lineFeet })
  }
  if (lines.length === 0 && feet.length > 0) {
    return [{ line_class: '—', feet }]
  }
  return lines
}

/** Build `ParsedLine[]` from Rust `ParseResult.poem` (WordNode feet mirror top-level `feet`). */
function linesFromPoemNode(poem: unknown): ParsedLine[] | null {
  if (!poem || typeof poem !== 'object') return null
  const p = poem as Record<string, unknown>
  const rawLines = p.lines
  if (!Array.isArray(rawLines) || rawLines.length === 0) return null

  const out: ParsedLine[] = []
  for (const row of rawLines) {
    if (!row || typeof row !== 'object') continue
    const L = row as Record<string, unknown>
    const line_class = typeof L.line_class === 'string' ? L.line_class : '—'
    const words = L.words
    const linguisticWords = L.linguistic_words

    const lineFeet: ParsedFoot[] = []

    if (Array.isArray(words) && words.length > 0) {
      for (const w of words) {
        if (!w || typeof w !== 'object') continue
        const W = w as Record<string, unknown>
        const foot_type = typeof W.foot_type === 'string' ? W.foot_type : ''
        const syllNodes = W.syllables
        if (!Array.isArray(syllNodes)) continue
        const syllables = syllablesFromSyllableNodes(syllNodes)
        if (syllables.length === 0 || !foot_type) continue
        lineFeet.push({ foot_type, syllables })
      }
    } else if (Array.isArray(linguisticWords) && linguisticWords.length > 0) {
      for (const lw of linguisticWords) {
        if (!lw || typeof lw !== 'object') continue
        const LW = lw as Record<string, unknown>
        const syllNodes = LW.syllables
        if (!Array.isArray(syllNodes)) continue
        const syllables = syllablesFromSyllableNodes(syllNodes)
        if (syllables.length === 0) continue
        lineFeet.push({
          foot_type: machineFootPatternFromSyllables(syllables),
          syllables,
        })
      }
    }

    if (lineFeet.length === 0) continue
    out.push({ line_class, feet: lineFeet })
  }
  return out.length > 0 ? out : null
}

/**
 * Maps Rust `ParseResult` JSON into {@link ParsedPoem}.
 * Prefers **`poem.lines[].words`** when present; falls back to **`poem.lines[].linguistic_words`** (same syllables, machine foot pattern); otherwise uses top-level `lines` or a single synthetic line from `feet`.
 */
export function adaptWasmJsonToParsedPoem(data: unknown): ParsedPoem | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.original_text !== 'string' || !Array.isArray(o.syllables)) return null

  const feet = Array.isArray(o.feet) ? normalizeFeet(o.feet as unknown[]) : []
  const fromPoem = linesFromPoemNode(o.poem)
  const lines =
    fromPoem && fromPoem.length > 0 ? fromPoem : normalizeLines(o.lines, feet)

  const metreRaw = o.metre_type
  const metre_type =
    typeof metreRaw === 'string'
      ? metreRaw
      : metreRaw === null || metreRaw === undefined
        ? '—'
        : JSON.stringify(metreRaw)

  const letter_count = (o.letter_count ?? 0) as ParsedPoem['letter_count']
  const vikalpa_count = (o.vikalpa_count ?? 0) as ParsedPoem['vikalpa_count']
  const errors = Array.isArray(o.errors) ? (o.errors as string[]).filter((e) => typeof e === 'string') : undefined

  return {
    original_text: o.original_text,
    metre_type,
    letter_count,
    vikalpa_count,
    syllables: o.syllables,
    lines,
    ...(errors && errors.length > 0 ? { errors } : {}),
  }
}
