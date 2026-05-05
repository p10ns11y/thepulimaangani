import type {
  ParsedLinkageEdge,
  ParsedPoem,
  ParsedPresentationTalai,
} from '#/types/parsedPoem'

import { anchorPairForLinkageEdge } from '#/lib/prosody/parse/footPositionFromLines'

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
