import type {
  ParsedFoot,
  ParsedFootPosition,
  ParsedLine,
  ParsedLinkageEdge,
  ParsedMetreHypothesis,
  ParsedParseFeatures,
  ParsedPoem,
  ParsedPresentation,
  ParsedSyllable,
} from '#/types/parsedPoem'

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

/** Unwrap `SyllableNode` (`inner`) or accept flat `{ text, syllable_type }` shapes. */
function normalizeSyllableFromTree(raw: unknown): ParsedSyllable | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const inner = r.inner
  if (inner && typeof inner === 'object') {
    return normalizeSyllable(inner)
  }
  return normalizeSyllable(raw)
}

function footPatternFromSyllables(syllables: ParsedSyllable[]): string {
  return syllables
    .map((s) => (s.syllable_type === 'Nirai' ? 'Nirai' : 'Ner'))
    .join('-')
}

/** Feet from WASM `lines[].feet` / top-level `feet`; preserves `foot_index_global`. */
function normalizeFeet(raw: unknown[]): ParsedFoot[] {
  const out: ParsedFoot[] = []
  for (const item of raw) {
    if (!isFootish(item)) continue
    const row = item as unknown as Record<string, unknown>
    const syllables = (row.syllables as unknown[])
      .map(normalizeSyllable)
      .filter((x): x is ParsedSyllable => x != null)
    if (syllables.length === 0) continue
    const g =
      typeof row.foot_index_global === 'number' ? (row.foot_index_global as number) : undefined
    out.push({
      foot_type: row.foot_type as string,
      syllables,
      ...(g !== undefined ? { foot_index_global: g } : {}),
    })
  }
  return out
}

function parseFootPosition(raw: unknown): ParsedFootPosition | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Record<string, unknown>
  const foot_index = p.foot_index
  const line_index = p.line_index
  const word_index_in_line = p.word_index_in_line
  if (
    typeof foot_index !== 'number' ||
    typeof line_index !== 'number' ||
    typeof word_index_in_line !== 'number'
  ) {
    return undefined
  }
  return { foot_index, line_index, word_index_in_line }
}

function normalizeLinkage(raw: unknown): ParsedLinkageEdge[] {
  if (!Array.isArray(raw)) return []
  const out: ParsedLinkageEdge[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const e = item as Record<string, unknown>
    const from_foot = e.from_foot
    const to_foot = e.to_foot
    const linkage_type = typeof e.linkage_type === 'string' ? e.linkage_type : null
    if (typeof from_foot !== 'number' || typeof to_foot !== 'number' || linkage_type == null) {
      continue
    }
    const linkage_special_type =
      typeof e.linkage_special_type === 'string' ? e.linkage_special_type : 'Unknown'
    const from = parseFootPosition(e.from)
    const to = parseFootPosition(e.to)
    out.push({
      from_foot,
      to_foot,
      linkage_type,
      linkage_special_type,
      is_valid: typeof e.is_valid === 'boolean' ? e.is_valid : true,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    })
  }
  return out
}

function normalizePresentation(raw: unknown): ParsedPresentation | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const p = raw as Record<string, unknown>
  const feetRaw = p.feet
  const talaiRaw = p.talai
  if (!Array.isArray(feetRaw) || !Array.isArray(talaiRaw)) return undefined

  const feet: ParsedPresentation['feet'] = []
  for (const item of feetRaw) {
    if (!item || typeof item !== 'object') continue
    const f = item as Record<string, unknown>
    if (typeof f.text !== 'string' || typeof f.foot_type !== 'string') continue
    const tamilRaw = f.foot_type_tamil
    const latinRaw = f.foot_type_latin
    const tamil =
      typeof tamilRaw === 'string' && tamilRaw.trim().length > 0 ? tamilRaw.trim() : undefined
    const latin =
      typeof latinRaw === 'string' && latinRaw.trim().length > 0 ? latinRaw.trim() : undefined
    feet.push({
      text: f.text,
      foot_type: f.foot_type,
      ...(tamil ? { foot_type_tamil: tamil } : {}),
      ...(latin ? { foot_type_latin: latin } : {}),
    })
  }

  const talai: ParsedPresentation['talai'] = []
  for (const item of talaiRaw) {
    if (!item || typeof item !== 'object') continue
    const t = item as Record<string, unknown>
    const from = t.from
    const to = t.to
    const from_line = t.from_line
    const to_line = t.to_line
    const talai_type = t.talai_type
    if (
      typeof from !== 'number' ||
      typeof to !== 'number' ||
      typeof from_line !== 'number' ||
      typeof to_line !== 'number' ||
      typeof talai_type !== 'string'
    ) {
      continue
    }
    talai.push({
      from,
      to,
      from_line,
      to_line,
      talai_type,
      is_valid: typeof t.is_valid === 'boolean' ? t.is_valid : true,
    })
  }

  const metre_type = p.metre_type
  const metreStr =
    typeof metre_type === 'string'
      ? metre_type
      : metre_type === null || metre_type === undefined
        ? undefined
        : String(metre_type)

  return { metre_type: metreStr, feet, talai }
}

function mergePresentationFeet(
  lines: ParsedLine[],
  presentation: ParsedPresentation | undefined,
): ParsedLine[] {
  if (!presentation || presentation.feet.length === 0) return lines
  return lines.map((line) => ({
    ...line,
    feet: line.feet.map((foot) => {
      const g = foot.foot_index_global
      if (typeof g !== 'number' || g < 0 || g >= presentation.feet.length) return foot
      const label = presentation.feet[g]?.foot_type
      if (typeof label !== 'string' || label.length === 0) return foot
      const row = presentation.feet[g]
      const next: ParsedFoot = { ...foot, display_foot_type: label }
      const tt = row?.foot_type_tamil?.trim()
      const tl = row?.foot_type_latin?.trim()
      if (tt && tt.length > 0) next.display_foot_type_tamil = tt
      if (tl && tl.length > 0) next.display_foot_type_latin = tl
      return next
    }),
  }))
}

/**
 * `ParseResult.poem` hierarchical lines → legacy `ParsedLine[]`.
 * Mirrors Rust `flat_lines_from_poem`: prefer `linguistic_words`, else `words` (feet).
 */
function linesFromPoemTree(poem: unknown): ParsedLine[] | null {
  if (!poem || typeof poem !== 'object') return null
  const root = poem as Record<string, unknown>
  const rows = root.lines
  if (!Array.isArray(rows) || rows.length === 0) return null

  const lines: ParsedLine[] = []
  let nextGlobal = 0
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const L = row as Record<string, unknown>
    const line_class = typeof L.line_class === 'string' ? L.line_class : '—'
    const linguisticRaw = L.linguistic_words
    const wordsRaw = L.words
    const linguistic_words = Array.isArray(linguisticRaw) ? linguisticRaw : []
    const words = Array.isArray(wordsRaw) ? wordsRaw : []

    const feet: ParsedFoot[] = []
    if (linguistic_words.length > 0) {
      for (const lw of linguistic_words) {
        if (!lw || typeof lw !== 'object') continue
        const w = lw as Record<string, unknown>
        const sylRaw = w.syllables
        if (!Array.isArray(sylRaw)) continue
        const syllables = sylRaw
          .map(normalizeSyllableFromTree)
          .filter((x): x is ParsedSyllable => x != null)
        if (syllables.length === 0) continue
        const foot_type = footPatternFromSyllables(syllables)
        const g = nextGlobal
        nextGlobal += 1
        feet.push({ foot_type, syllables, foot_index_global: g })
      }
    } else if (words.length > 0) {
      for (const wn of words) {
        if (!wn || typeof wn !== 'object') continue
        const w = wn as Record<string, unknown>
        const foot_type = typeof w.foot_type === 'string' ? w.foot_type : ''
        const sylRaw = w.syllables
        if (!Array.isArray(sylRaw) || !foot_type) continue
        const syllables = sylRaw
          .map(normalizeSyllableFromTree)
          .filter((x): x is ParsedSyllable => x != null)
        if (syllables.length === 0) continue
        const g =
          typeof w.foot_index_global === 'number' ? (w.foot_index_global as number) : undefined
        feet.push({
          foot_type,
          syllables,
          ...(g !== undefined ? { foot_index_global: g } : {}),
        })
      }
    }

    if (feet.length === 0) continue
    lines.push({ line_class, feet })
  }
  return lines.length > 0 ? lines : null
}

/** `ParseResult.lines` from WASM (physical lines → feet). Fallback: one line of top-level `feet`. */
function linesFromWasm(rawLines: unknown, topFeet: ParsedFoot[]): ParsedLine[] {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    if (topFeet.length === 0) return []
    return [{ line_class: '—', feet: topFeet }]
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
  if (lines.length === 0 && topFeet.length > 0) {
    return [{ line_class: '—', feet: topFeet }]
  }
  return lines
}

/**
 * WASM → {@link ParsedPoem}. Top-level **`lines`** (feet per row) or **`poem`** (tree: `linguistic_words` / `words`);
 * otherwise one line from top-level **`feet`**. **`foot_index_global`** matches linkage / presentation.
 */
export function adaptWasmJsonToParsedPoem(data: unknown): ParsedPoem | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.original_text !== 'string' || !Array.isArray(o.syllables)) return null

  const topFeet = Array.isArray(o.feet) ? normalizeFeet(o.feet as unknown[]) : []
  const presentation = normalizePresentation(o.presentation)

  const metreRaw = o.metre_type
  const metreFromPres =
    presentation?.metre_type != null &&
    typeof presentation.metre_type === 'string' &&
    presentation.metre_type.length > 0
      ? presentation.metre_type
      : null
  const metre_type =
    metreFromPres ??
    (typeof metreRaw === 'string'
      ? metreRaw
      : metreRaw === null || metreRaw === undefined
        ? '—'
        : JSON.stringify(metreRaw))

  const letter_count = (o.letter_count ?? 0) as ParsedPoem['letter_count']
  const vikalpa_count = (o.vikalpa_count ?? 0) as ParsedPoem['vikalpa_count']
  const errors = Array.isArray(o.errors) ? (o.errors as string[]).filter((e) => typeof e === 'string') : undefined

  const fromPoem = linesFromPoemTree(o.poem)
  const linesRaw = fromPoem ?? linesFromWasm(o.lines, topFeet)
  const lines = mergePresentationFeet(linesRaw, presentation)

  const linkage = normalizeLinkage(o.linkage)

  const topKRaw = o.top_k_metre_hypotheses
  const top_k_metre_hypotheses = Array.isArray(topKRaw)
    ? (topKRaw as unknown[])
        .map((row): ParsedMetreHypothesis | null => {
          if (!row || typeof row !== 'object') return null
          const h = row as Record<string, unknown>
          const metre_type =
            typeof h.metre_type === 'string'
              ? h.metre_type
              : h.metre_type != null
                ? JSON.stringify(h.metre_type)
                : ''
          const aggregate_score =
            typeof h.aggregate_score === 'number' ? h.aggregate_score : Number.NaN
          if (!metre_type || Number.isNaN(aggregate_score)) return null
          const metre_probability =
            typeof h.metre_probability === 'number' && Number.isFinite(h.metre_probability)
              ? h.metre_probability
              : undefined
          const metre_rank =
            typeof h.metre_rank === 'number' && Number.isFinite(h.metre_rank) ? h.metre_rank : undefined
          return {
            metre_type,
            aggregate_score,
            violations: Array.isArray(h.violations) ? h.violations : [],
            rule_ids: Array.isArray(h.rule_ids) ? h.rule_ids : [],
            ...(metre_probability !== undefined ? { metre_probability } : {}),
            ...(metre_rank !== undefined ? { metre_rank } : {}),
          }
        })
        .filter((x): x is ParsedMetreHypothesis => x != null)
    : undefined

  const pfRaw = o.parse_features
  let parse_features: ParsedParseFeatures | undefined
  if (pfRaw && typeof pfRaw === 'object') {
    const pf = pfRaw as Record<string, unknown>
    const schema_version = typeof pf.schema_version === 'number' ? pf.schema_version : 0
    const denseRaw = pf.dense
    if (Array.isArray(denseRaw) && denseRaw.every((x) => typeof x === 'number')) {
      parse_features = {
        schema_version,
        dense: denseRaw as number[],
      }
    }
  }

  const entropy =
    typeof o.metre_entropy_bits === 'number' && Number.isFinite(o.metre_entropy_bits)
      ? o.metre_entropy_bits
      : undefined
  const margin =
    typeof o.metre_epistemic_margin === 'number' && Number.isFinite(o.metre_epistemic_margin)
      ? o.metre_epistemic_margin
      : undefined

  return {
    original_text: o.original_text,
    metre_type,
    ...(entropy !== undefined ? { metre_entropy_bits: entropy } : {}),
    ...(margin !== undefined ? { metre_epistemic_margin: margin } : {}),
    letter_count,
    vikalpa_count,
    syllables: o.syllables,
    lines,
    ...(linkage.length > 0 ? { linkage } : {}),
    ...(presentation && (presentation.feet.length > 0 || presentation.talai.length > 0)
      ? { presentation }
      : {}),
    ...(top_k_metre_hypotheses && top_k_metre_hypotheses.length > 0
      ? { top_k_metre_hypotheses }
      : {}),
    ...(parse_features ? { parse_features } : {}),
    ...(errors && errors.length > 0 ? { errors } : {}),
  }
}
