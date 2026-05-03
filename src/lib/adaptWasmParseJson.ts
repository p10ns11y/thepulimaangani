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

/** Assign poem-wide `foot_index_global` in traversal order (line order, then foot order). */
function assignGlobalFootIndices(lines: ParsedLine[]): ParsedLine[] {
  let g = 0
  return lines.map((line) => ({
    ...line,
    feet: line.feet.map((foot) => {
      const next =
        foot.foot_index_global === undefined
          ? { ...foot, foot_index_global: g }
          : foot
      g += 1
      return next
    }),
  }))
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
    const linkage_type =
      typeof e.linkage_type === 'string'
        ? e.linkage_type
        : typeof e.talai_type === 'string'
          ? e.talai_type
          : null
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
    feet.push({ text: f.text, foot_type: f.foot_type })
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
      return { ...foot, display_foot_type: label }
    }),
  }))
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

    if (Array.isArray(linguisticWords) && linguisticWords.length > 0) {
      for (const lw of linguisticWords) {
        if (!lw || typeof lw !== 'object') continue
        const LW = lw as Record<string, unknown>
        const syllNodes = LW.syllables
        if (!Array.isArray(syllNodes)) continue
        const syllables = syllablesFromSyllableNodes(syllNodes)
        if (syllables.length === 0) continue
        const fig =
          typeof LW.word_index_in_line === 'number' ? LW.word_index_in_line : undefined
        lineFeet.push({
          foot_type: machineFootPatternFromSyllables(syllables),
          syllables,
          ...(fig !== undefined ? { foot_index_global: fig } : {}),
        })
      }
    } else if (Array.isArray(words) && words.length > 0) {
      for (const w of words) {
        if (!w || typeof w !== 'object') continue
        const W = w as Record<string, unknown>
        const foot_type = typeof W.foot_type === 'string' ? W.foot_type : ''
        const syllNodes = W.syllables
        if (!Array.isArray(syllNodes)) continue
        const syllables = syllablesFromSyllableNodes(syllNodes)
        if (syllables.length === 0 || !foot_type) continue
        const fig =
          typeof W.foot_index_global === 'number' ? W.foot_index_global : undefined
        lineFeet.push({
          foot_type,
          syllables,
          ...(fig !== undefined ? { foot_index_global: fig } : {}),
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
 * Prefers **`poem.lines[].linguistic_words`** when present (aligned with physical lines); otherwise **`words`**; then top-level `lines` or feet fallback.
 */
export function adaptWasmJsonToParsedPoem(data: unknown): ParsedPoem | null {
  if (!data || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (typeof o.original_text !== 'string' || !Array.isArray(o.syllables)) return null

  const feet = Array.isArray(o.feet) ? normalizeFeet(o.feet as unknown[]) : []
  const fromPoem = linesFromPoemNode(o.poem)
  const linesRaw =
    fromPoem && fromPoem.length > 0 ? fromPoem : normalizeLines(o.lines, feet)
  const lines = assignGlobalFootIndices(linesRaw)

  const linkageRaw = normalizeLinkage(o.linkage)
  const linkage = linkageRaw.length > 0 ? linkageRaw : normalizeLinkage(o.talai)

  const presentation = normalizePresentation(o.presentation)

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
          return {
            metre_type,
            aggregate_score,
            violations: Array.isArray(h.violations) ? h.violations : [],
            rule_ids: Array.isArray(h.rule_ids) ? h.rule_ids : [],
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

  const linesWithPresFeet = mergePresentationFeet(lines, presentation)

  return {
    original_text: o.original_text,
    metre_type,
    letter_count,
    vikalpa_count,
    syllables: o.syllables,
    lines: linesWithPresFeet,
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
