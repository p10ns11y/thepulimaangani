import {
  getLinkageSpecialDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import type {
  ParsedLine,
  ParsedLinkageEdge,
  ParsedPoem,
  ParsedPresentationTalai,
} from '#/types/parsedPoem'

/** 1-based line and word-on-line for global foot index (matches `foot_index_global` on feet). */
export function lineWordForGlobalFootIndex(
  lines: ParsedLine[],
  globalFootIndex: number,
): { line1: number; word1: number } | null {
  for (let li = 0; li < lines.length; li++) {
    const feet = lines[li].feet
    for (let wi = 0; wi < feet.length; wi++) {
      const g = feet[wi].foot_index_global
      if (g === globalFootIndex) {
        return { line1: li + 1, word1: wi + 1 }
      }
    }
  }
  return null
}

/** Prefer WASM `from`/`to`; else derive from foot indices + line layout. */
export function anchorPairForLinkageEdge(
  lines: ParsedLine[],
  edge: ParsedLinkageEdge,
): {
  fromLine1: number
  fromWord1: number
  toLine1: number
  toWord1: number
  crossLine: boolean
} {
  const fromPos =
    edge.from != null
      ? {
          line1: edge.from.line_index + 1,
          word1: edge.from.word_index_in_line + 1,
        }
      : lineWordForGlobalFootIndex(lines, edge.from_foot)
  const toPos =
    edge.to != null
      ? {
          line1: edge.to.line_index + 1,
          word1: edge.to.word_index_in_line + 1,
        }
      : lineWordForGlobalFootIndex(lines, edge.to_foot)

  const fromLine1 = fromPos?.line1 ?? 1
  const fromWord1 = fromPos?.word1 ?? 1
  const toLine1 = toPos?.line1 ?? 1
  const toWord1 = toPos?.word1 ?? 1

  return {
    fromLine1,
    fromWord1,
    toLine1,
    toWord1,
    crossLine: fromLine1 !== toLine1,
  }
}

export type LinkageOverviewRow = {
  index1: number
  edge: ParsedLinkageEdge
  fromLine1: number
  fromWord1: number
  toLine1: number
  toWord1: number
  crossLine: boolean
  /** Optional Tamil label from `presentation.talai` when aligned with this edge. */
  presentationTalaiType?: string
}

/** Match WASM `presentation.talai` row to a linkage edge (same `from`/`to` foot indices). */
function presentationRowForEdge(
  data: ParsedPoem,
  edge: ParsedLinkageEdge,
): ParsedPresentationTalai | undefined {
  const rows = data.presentation?.talai
  if (!rows) return undefined
  return rows.find((t) => t.from === edge.from_foot && t.to === edge.to_foot)
}

/**
 * Build bond rows in WASM order. Prefer **`presentation.talai` physical lines** for span/cross-line
 * (matches Avalokitam-style line breaks); fall back to `linkage.from`/`to` or foot layout.
 */
export function buildLinkageOverviewRows(data: ParsedPoem): LinkageOverviewRow[] {
  const edges = data.linkage ?? []
  const lines = data.lines
  return edges.map((edge, i) => {
    const pres = presentationRowForEdge(data, edge)
    const base = anchorPairForLinkageEdge(lines, edge)

    let fromLine1 = base.fromLine1
    let toLine1 = base.toLine1
    let crossLine = base.crossLine

    if (pres) {
      fromLine1 = pres.from_line + 1
      toLine1 = pres.to_line + 1
      crossLine = pres.from_line !== pres.to_line
    }

    return {
      index1: i + 1,
      edge,
      fromLine1,
      fromWord1: base.fromWord1,
      toLine1,
      toWord1: base.toWord1,
      crossLine,
      presentationTalaiType: pres?.talai_type,
    }
  })
}

/** Count coarse linkage_type keys for summary chips. */
export function linkageCoarseCounts(edges: ParsedLinkageEdge[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const e of edges) {
    const k = e.linkage_type || '—'
    m[k] = (m[k] ?? 0) + 1
  }
  return m
}

/** Map bond-after-from-foot index → row (one edge per consecutive pair). */
export function linkageRowsByFromFoot(rows: LinkageOverviewRow[]): Map<number, LinkageOverviewRow> {
  const m = new Map<number, LinkageOverviewRow>()
  for (const r of rows) {
    m.set(r.edge.from_foot, r)
  }
  return m
}

/**
 * Prefer `presentation.talai` Tamil string; else `displayLabels` maps.
 * Fidelity contract: `prosodyDisplayContract` tests.
 */
export function bondDisplayLabel(row: LinkageOverviewRow): string {
  const pres = row.presentationTalaiType?.trim()
  if (pres && pres.length > 0) return pres
  const e = row.edge
  if (e.linkage_special_type && e.linkage_special_type !== 'Unknown') {
    return getLinkageSpecialDisplay(e.linkage_special_type)
  }
  return getLinkageTypeDisplay(e.linkage_type)
}
