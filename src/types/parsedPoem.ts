export interface ParsedSyllable {
  text: string
  syllable_type: string
  /** From WASM when present: physical line index for this syllable. */
  line_index?: number
  /** From WASM when present: linguistic word index within that line. */
  word_index_in_line?: number
}

/** Position of a foot in the poem (Rust `FootPosition`; optional on older JSON). */
export interface ParsedFootPosition {
  foot_index: number
  line_index: number
  word_index_in_line: number
}

/** One bond after `from_foot` (same indices as Rust `ParseResult.linkage`). */
export interface ParsedLinkageEdge {
  from_foot: number
  to_foot: number
  linkage_type: string
  linkage_special_type: string
  is_valid: boolean
  /** Present when WASM embeds Rust `from` / `to` — preferred for cross-line display. */
  from?: ParsedFootPosition
  to?: ParsedFootPosition
}

export interface ParsedFoot {
  foot_type: string
  /** Tamil classical label from WASM `presentation.feet` when present. */
  display_foot_type?: string
  syllables: ParsedSyllable[]
  /** Poem-wide foot index when known (from WASM `poem` tree); used for தளை lookup. */
  foot_index_global?: number
}

export interface ParsedLine {
  line_class: string
  feet: ParsedFoot[]
}

/** WASM `presentation.feet[]` — Tamil foot labels aligned with poem-wide foot order. */
export interface ParsedPresentationFoot {
  text: string
  foot_type: string
}

/** WASM `presentation.talai[]` — human தளை line (from / to indices match linkage). */
export interface ParsedPresentationTalai {
  from: number
  to: number
  from_line: number
  to_line: number
  talai_type: string
  is_valid: boolean
}

/** Optional block from Rust `ParseResult.presentation` (WASM JSON). */
export interface ParsedPresentation {
  metre_type?: string | null
  feet: ParsedPresentationFoot[]
  talai: ParsedPresentationTalai[]
}

/** One metre hypothesis from WASM `top_k_metre_hypotheses`. */
export interface ParsedMetreHypothesis {
  metre_type: string
  aggregate_score: number
  violations: unknown[]
  rule_ids: unknown[]
}

/** Dense 51-float snapshot when WASM includes `parse_features`. */
export interface ParsedParseFeatures {
  schema_version: number
  dense: number[]
}

export interface ParsedPoem {
  original_text: string
  metre_type: string
  letter_count: string | number | Record<string, unknown>
  vikalpa_count: string | number
  syllables: unknown[]
  lines: ParsedLine[]
  /** Consecutive-foot bonds from WASM (`linkage` / `talai`); empty when absent. */
  linkage?: ParsedLinkageEdge[]
  /** Rust presentation layer: Tamil labels for metre, feet, தளை (same JSON as other clients). */
  presentation?: ParsedPresentation
  /** When present: coarse metre candidates with scores (WASM `top_k_metre_hypotheses`). */
  top_k_metre_hypotheses?: ParsedMetreHypothesis[]
  /** When present: 51-dim parse feature vector (WASM `parse_features`). */
  parse_features?: ParsedParseFeatures
  errors?: string[]
}

export function isParsedPoem(value: unknown): value is ParsedPoem {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    typeof o.original_text === 'string' &&
    typeof o.metre_type === 'string' &&
    Array.isArray(o.lines) &&
    Array.isArray(o.syllables)
  )
}
