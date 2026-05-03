import type { ParsedLinkageEdge, ParsedPoem } from '#/types/parsedPoem'

import { anchorPairForLinkageEdge } from '#/lib/footPositionFromLines'

export type LinkageOverviewRow = {
  index1: number
  edge: ParsedLinkageEdge
  fromLine1: number
  fromWord1: number
  toLine1: number
  toWord1: number
  crossLine: boolean
}

/** Build ordered rows for the தளை overview table (bond-after-from-foot order = WASM order). */
export function buildLinkageOverviewRows(data: ParsedPoem): LinkageOverviewRow[] {
  const edges = data.linkage ?? []
  const lines = data.lines
  return edges.map((edge, i) => {
    const a = anchorPairForLinkageEdge(lines, edge)
    return {
      index1: i + 1,
      edge,
      ...a,
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
