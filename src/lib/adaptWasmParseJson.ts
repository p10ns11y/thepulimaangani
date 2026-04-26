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
  return { text: s.text, syllable_type }
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

/**
 * Maps Rust `ParseResult` JSON into {@link ParsedPoem}.
 * Rust currently leaves `lines` empty and puts prosody in top-level `feet`; we synthesize one line when needed.
 */
export function adaptWasmJsonToParsedPoem(data: unknown): ParsedPoem | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.original_text !== 'string' || !Array.isArray(o.syllables)) return null

  const feet = Array.isArray(o.feet) ? normalizeFeet(o.feet as unknown[]) : []
  const lines = normalizeLines(o.lines, feet)

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
