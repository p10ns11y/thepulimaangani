import type { ParseResultWire } from '#/generated/parseResultWire'
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

function recordLooksLikeWasmFoot(value: unknown): value is ParsedFoot {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.foot_type === 'string' && Array.isArray(record.syllables)
}

function normalizeSyllable(raw: unknown): ParsedSyllable | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  if (typeof record.text !== 'string') return null
  const syllableTypeRaw = record.syllable_type
  const syllable_type = typeof syllableTypeRaw === 'string' ? syllableTypeRaw : 'Nirai'
  const line_index = typeof record.line_index === 'number' ? record.line_index : undefined
  const word_index_in_line =
    typeof record.word_index_in_line === 'number' ? record.word_index_in_line : undefined
  return {
    text: record.text,
    syllable_type,
    ...(line_index !== undefined ? { line_index } : {}),
    ...(word_index_in_line !== undefined ? { word_index_in_line } : {}),
  }
}

/** Unwrap `SyllableNode` (`inner`) or accept flat `{ text, syllable_type }` shapes. */
function normalizeSyllableFromTree(raw: unknown): ParsedSyllable | null {
  if (!raw || typeof raw !== 'object') return null
  const node = raw as Record<string, unknown>
  const inner = node.inner
  if (inner && typeof inner === 'object') {
    return normalizeSyllable(inner)
  }
  return normalizeSyllable(raw)
}

function footPatternFromSyllables(syllables: ParsedSyllable[]): string {
  return syllables
    .map((syllable) => (syllable.syllable_type === 'Nirai' ? 'Nirai' : 'Ner'))
    .join('-')
}

/** Feet from WASM `lines[].feet` / top-level `feet`; preserves `foot_index_global`. */
function normalizeFeet(raw: unknown[]): ParsedFoot[] {
  const feet: ParsedFoot[] = []
  for (const rawFoot of raw) {
    if (!recordLooksLikeWasmFoot(rawFoot)) continue
    const footRecord = rawFoot as unknown as Record<string, unknown>
    const syllables = (footRecord.syllables as unknown[])
      .map(normalizeSyllable)
      .filter((syllable): syllable is ParsedSyllable => syllable != null)
    if (syllables.length === 0) continue
    const globalFootIndex =
      typeof footRecord.foot_index_global === 'number'
        ? (footRecord.foot_index_global as number)
        : undefined
    feet.push({
      foot_type: footRecord.foot_type as string,
      syllables,
      ...(globalFootIndex !== undefined ? { foot_index_global: globalFootIndex } : {}),
    })
  }
  return feet
}

function parseFootPosition(raw: unknown): ParsedFootPosition | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const record = raw as Record<string, unknown>
  const foot_index = record.foot_index
  const line_index = record.line_index
  const word_index_in_line = record.word_index_in_line
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
  const edges: ParsedLinkageEdge[] = []
  for (const rawEdge of raw) {
    if (!rawEdge || typeof rawEdge !== 'object') continue
    const edgeRecord = rawEdge as Record<string, unknown>
    const from_foot = edgeRecord.from_foot
    const to_foot = edgeRecord.to_foot
    const linkage_type =
      typeof edgeRecord.linkage_type === 'string' ? edgeRecord.linkage_type : null
    if (typeof from_foot !== 'number' || typeof to_foot !== 'number' || linkage_type == null) {
      continue
    }
    const linkage_special_type =
      typeof edgeRecord.linkage_special_type === 'string'
        ? edgeRecord.linkage_special_type
        : 'Unknown'
    const fromPosition = parseFootPosition(edgeRecord.from)
    const toPosition = parseFootPosition(edgeRecord.to)
    edges.push({
      from_foot,
      to_foot,
      linkage_type,
      linkage_special_type,
      is_valid: typeof edgeRecord.is_valid === 'boolean' ? edgeRecord.is_valid : true,
      ...(fromPosition ? { from: fromPosition } : {}),
      ...(toPosition ? { to: toPosition } : {}),
    })
  }
  return edges
}

function normalizePresentation(raw: unknown): ParsedPresentation | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const presentationRecord = raw as Record<string, unknown>
  const feetRaw = presentationRecord.feet
  const talaiRaw = presentationRecord.talai
  if (!Array.isArray(feetRaw) || !Array.isArray(talaiRaw)) return undefined

  const feet: ParsedPresentation['feet'] = []
  for (const rawFoot of feetRaw) {
    if (!rawFoot || typeof rawFoot !== 'object') continue
    const footRow = rawFoot as Record<string, unknown>
    if (typeof footRow.text !== 'string' || typeof footRow.foot_type !== 'string') continue
    const tamilRaw = footRow.foot_type_tamil
    const latinRaw = footRow.foot_type_latin
    const tamilLabel =
      typeof tamilRaw === 'string' && tamilRaw.trim().length > 0 ? tamilRaw.trim() : undefined
    const latinLabel =
      typeof latinRaw === 'string' && latinRaw.trim().length > 0 ? latinRaw.trim() : undefined
    feet.push({
      text: footRow.text,
      foot_type: footRow.foot_type,
      ...(tamilLabel ? { foot_type_tamil: tamilLabel } : {}),
      ...(latinLabel ? { foot_type_latin: latinLabel } : {}),
    })
  }

  const talai: ParsedPresentation['talai'] = []
  for (const rawTalai of talaiRaw) {
    if (!rawTalai || typeof rawTalai !== 'object') continue
    const talaiRow = rawTalai as Record<string, unknown>
    const fromFootIndex = talaiRow.from
    const toFootIndex = talaiRow.to
    const from_line = talaiRow.from_line
    const to_line = talaiRow.to_line
    const talai_type = talaiRow.talai_type
    if (
      typeof fromFootIndex !== 'number' ||
      typeof toFootIndex !== 'number' ||
      typeof from_line !== 'number' ||
      typeof to_line !== 'number' ||
      typeof talai_type !== 'string'
    ) {
      continue
    }
    talai.push({
      from: fromFootIndex,
      to: toFootIndex,
      from_line,
      to_line,
      talai_type,
      is_valid: typeof talaiRow.is_valid === 'boolean' ? talaiRow.is_valid : true,
    })
  }

  const metre_type = presentationRecord.metre_type
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
      const globalFootIndex = foot.foot_index_global
      if (
        typeof globalFootIndex !== 'number' ||
        globalFootIndex < 0 ||
        globalFootIndex >= presentation.feet.length
      ) {
        return foot
      }
      const displayLabel = presentation.feet[globalFootIndex]?.foot_type
      if (typeof displayLabel !== 'string' || displayLabel.length === 0) return foot
      const presentationFootRow = presentation.feet[globalFootIndex]
      const footWithPresentationLabels: ParsedFoot = { ...foot, display_foot_type: displayLabel }
      const tamilTrimmed = presentationFootRow?.foot_type_tamil?.trim()
      const latinTrimmed = presentationFootRow?.foot_type_latin?.trim()
      if (tamilTrimmed && tamilTrimmed.length > 0) {
        footWithPresentationLabels.display_foot_type_tamil = tamilTrimmed
      }
      if (latinTrimmed && latinTrimmed.length > 0) {
        footWithPresentationLabels.display_foot_type_latin = latinTrimmed
      }
      return footWithPresentationLabels
    }),
  }))
}

/**
 * `ParseResult.poem` hierarchical lines → legacy `ParsedLine[]`.
 * Mirrors Rust `flat_lines_from_poem`: prefer `linguistic_words`, else `words` (feet).
 */
function linesFromPoemTree(poem: unknown): ParsedLine[] | null {
  if (!poem || typeof poem !== 'object') return null
  const poemRecord = poem as Record<string, unknown>
  const poemLineNodes = poemRecord.lines
  if (!Array.isArray(poemLineNodes) || poemLineNodes.length === 0) return null

  const lines: ParsedLine[] = []
  let nextGlobalFootIndex = 0
  for (const rawLine of poemLineNodes) {
    if (!rawLine || typeof rawLine !== 'object') continue
    const lineRecord = rawLine as Record<string, unknown>
    const line_class = typeof lineRecord.line_class === 'string' ? lineRecord.line_class : '—'
    const linguisticWordsRaw = lineRecord.linguistic_words
    const wordNodesRaw = lineRecord.words
    const linguistic_words = Array.isArray(linguisticWordsRaw) ? linguisticWordsRaw : []
    const wordNodes = Array.isArray(wordNodesRaw) ? wordNodesRaw : []

    const feet: ParsedFoot[] = []
    if (linguistic_words.length > 0) {
      for (const rawLinguisticWord of linguistic_words) {
        if (!rawLinguisticWord || typeof rawLinguisticWord !== 'object') continue
        const linguisticWordRecord = rawLinguisticWord as Record<string, unknown>
        const rawSyllables = linguisticWordRecord.syllables
        if (!Array.isArray(rawSyllables)) continue
        const syllables = rawSyllables
          .map(normalizeSyllableFromTree)
          .filter((syllable): syllable is ParsedSyllable => syllable != null)
        if (syllables.length === 0) continue
        const foot_type = footPatternFromSyllables(syllables)
        const assignedGlobalIndex = nextGlobalFootIndex
        nextGlobalFootIndex += 1
        feet.push({ foot_type, syllables, foot_index_global: assignedGlobalIndex })
      }
    } else if (wordNodes.length > 0) {
      for (const rawWordNode of wordNodes) {
        if (!rawWordNode || typeof rawWordNode !== 'object') continue
        const wordNodeRecord = rawWordNode as Record<string, unknown>
        const foot_type = typeof wordNodeRecord.foot_type === 'string' ? wordNodeRecord.foot_type : ''
        const rawSyllables = wordNodeRecord.syllables
        if (!Array.isArray(rawSyllables) || !foot_type) continue
        const syllables = rawSyllables
          .map(normalizeSyllableFromTree)
          .filter((syllable): syllable is ParsedSyllable => syllable != null)
        if (syllables.length === 0) continue
        const wasmGlobalFootIndex =
          typeof wordNodeRecord.foot_index_global === 'number'
            ? (wordNodeRecord.foot_index_global as number)
            : undefined
        feet.push({
          foot_type,
          syllables,
          ...(wasmGlobalFootIndex !== undefined ? { foot_index_global: wasmGlobalFootIndex } : {}),
        })
      }
    }

    if (feet.length === 0) continue
    lines.push({ line_class, feet })
  }
  return lines.length > 0 ? lines : null
}

/** `ParseResult.lines` from WASM (physical lines → feet). Fallback: one line of top-level `feet`. */
function linesFromWasm(rawLines: unknown, topLevelFeet: ParsedFoot[]): ParsedLine[] {
  if (!Array.isArray(rawLines) || rawLines.length === 0) {
    if (topLevelFeet.length === 0) return []
    return [{ line_class: '—', feet: topLevelFeet }]
  }

  const lines: ParsedLine[] = []
  for (const rawLine of rawLines) {
    if (!rawLine || typeof rawLine !== 'object') continue
    const lineRecord = rawLine as Record<string, unknown>
    const line_class = typeof lineRecord.line_class === 'string' ? lineRecord.line_class : '—'
    const lineFeet = Array.isArray(lineRecord.feet)
      ? normalizeFeet(lineRecord.feet as unknown[])
      : []
    if (lineFeet.length === 0) continue
    lines.push({ line_class, feet: lineFeet })
  }
  if (lines.length === 0 && topLevelFeet.length > 0) {
    return [{ line_class: '—', feet: topLevelFeet }]
  }
  return lines
}

/**
 * WASM → {@link ParsedPoem}. Top-level **`lines`** (feet per row) or **`poem`** (tree: `linguistic_words` / `words`);
 * otherwise one line from top-level **`feet`**. **`foot_index_global`** matches linkage / presentation.
 *
 * Input shape matches OpenAPI **`ParseResult`** (`#/generated/parseResultWire`); extra keys are allowed at runtime.
 */
export function adaptWasmJsonToParsedPoem(
  data: ParseResultWire & Record<string, unknown>,
): ParsedPoem | null {
  if (!data || typeof data !== 'object') return null
  const parseResult = data as Record<string, unknown>
  if (typeof parseResult.original_text !== 'string' || !Array.isArray(parseResult.syllables)) {
    return null
  }

  const topLevelFeet = Array.isArray(parseResult.feet)
    ? normalizeFeet(parseResult.feet as unknown[])
    : []
  const presentation = normalizePresentation(parseResult.presentation)

  const metreRaw = parseResult.metre_type
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

  const letter_count = (parseResult.letter_count ?? 0) as ParsedPoem['letter_count']
  const vikalpa_count = (parseResult.vikalpa_count ?? 0) as ParsedPoem['vikalpa_count']
  const errors = Array.isArray(parseResult.errors)
    ? (parseResult.errors as string[]).filter((message) => typeof message === 'string')
    : undefined

  const linesFromPoemHierarchy = linesFromPoemTree(parseResult.poem)
  const linesBeforePresentationLabels =
    linesFromPoemHierarchy ?? linesFromWasm(parseResult.lines, topLevelFeet)
  const lines = mergePresentationFeet(linesBeforePresentationLabels, presentation)

  const linkage = normalizeLinkage(parseResult.linkage)

  const topMetreHypothesesRaw = parseResult.top_k_metre_hypotheses
  const top_k_metre_hypotheses = Array.isArray(topMetreHypothesesRaw)
    ? (topMetreHypothesesRaw as unknown[])
        .map((rawHypothesis): ParsedMetreHypothesis | null => {
          if (!rawHypothesis || typeof rawHypothesis !== 'object') return null
          const hypothesisRecord = rawHypothesis as Record<string, unknown>
          const metre_type =
            typeof hypothesisRecord.metre_type === 'string'
              ? hypothesisRecord.metre_type
              : hypothesisRecord.metre_type != null
                ? JSON.stringify(hypothesisRecord.metre_type)
                : ''
          const aggregate_score =
            typeof hypothesisRecord.aggregate_score === 'number'
              ? hypothesisRecord.aggregate_score
              : Number.NaN
          if (!metre_type || Number.isNaN(aggregate_score)) return null
          const metre_probability =
            typeof hypothesisRecord.metre_probability === 'number' &&
            Number.isFinite(hypothesisRecord.metre_probability)
              ? hypothesisRecord.metre_probability
              : undefined
          const metre_rank =
            typeof hypothesisRecord.metre_rank === 'number' &&
            Number.isFinite(hypothesisRecord.metre_rank)
              ? hypothesisRecord.metre_rank
              : undefined
          return {
            metre_type,
            aggregate_score,
            violations: Array.isArray(hypothesisRecord.violations)
              ? hypothesisRecord.violations
              : [],
            rule_ids: Array.isArray(hypothesisRecord.rule_ids) ? hypothesisRecord.rule_ids : [],
            ...(metre_probability !== undefined ? { metre_probability } : {}),
            ...(metre_rank !== undefined ? { metre_rank } : {}),
          }
        })
        .filter((hypothesis): hypothesis is ParsedMetreHypothesis => hypothesis != null)
    : undefined

  const parseFeaturesRaw = parseResult.parse_features
  let parse_features: ParsedParseFeatures | undefined
  if (parseFeaturesRaw && typeof parseFeaturesRaw === 'object') {
    const parseFeaturesRecord = parseFeaturesRaw as Record<string, unknown>
    const schema_version =
      typeof parseFeaturesRecord.schema_version === 'number' ? parseFeaturesRecord.schema_version : 0
    const denseVectorRaw = parseFeaturesRecord.dense
    if (
      Array.isArray(denseVectorRaw) &&
      denseVectorRaw.every((value) => typeof value === 'number')
    ) {
      parse_features = {
        schema_version,
        dense: denseVectorRaw as number[],
      }
    }
  }

  const entropy =
    typeof parseResult.metre_entropy_bits === 'number' &&
    Number.isFinite(parseResult.metre_entropy_bits)
      ? parseResult.metre_entropy_bits
      : undefined
  const margin =
    typeof parseResult.metre_epistemic_margin === 'number' &&
    Number.isFinite(parseResult.metre_epistemic_margin)
      ? parseResult.metre_epistemic_margin
      : undefined

  return {
    original_text: parseResult.original_text,
    metre_type,
    ...(entropy !== undefined ? { metre_entropy_bits: entropy } : {}),
    ...(margin !== undefined ? { metre_epistemic_margin: margin } : {}),
    letter_count,
    vikalpa_count,
    syllables: parseResult.syllables,
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
