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
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const feetOnLine = lines[lineIndex].feet
    for (let wordIndexOnLine = 0; wordIndexOnLine < feetOnLine.length; wordIndexOnLine++) {
      const footGlobalIndex = feetOnLine[wordIndexOnLine].foot_index_global
      if (footGlobalIndex === globalFootIndex) {
        return { line1: lineIndex + 1, word1: wordIndexOnLine + 1 }
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
  const presentationTalaiRows = data.presentation?.talai
  if (!presentationTalaiRows) return undefined
  return presentationTalaiRows.find(
    (talaiRow) => talaiRow.from === edge.from_foot && talaiRow.to === edge.to_foot,
  )
}

/**
 * Build bond rows in WASM order. Prefer **`presentation.talai` physical lines** for span/cross-line
 * (matches Avalokitam-style line breaks); fall back to `linkage.from`/`to` or foot layout.
 */
export function buildLinkageOverviewRows(data: ParsedPoem): LinkageOverviewRow[] {
  const linkageEdges = data.linkage ?? []
  const physicalLines = data.lines
  return linkageEdges.map((edge, edgeOrdinalZero) => {
    const presentationTalaiRow = presentationRowForEdge(data, edge)
    const anchorPair = anchorPairForLinkageEdge(physicalLines, edge)

    let fromLine1 = anchorPair.fromLine1
    let toLine1 = anchorPair.toLine1
    let crossLine = anchorPair.crossLine

    if (presentationTalaiRow) {
      fromLine1 = presentationTalaiRow.from_line + 1
      toLine1 = presentationTalaiRow.to_line + 1
      crossLine = presentationTalaiRow.from_line !== presentationTalaiRow.to_line
    }

    return {
      index1: edgeOrdinalZero + 1,
      edge,
      fromLine1,
      fromWord1: anchorPair.fromWord1,
      toLine1,
      toWord1: anchorPair.toWord1,
      crossLine,
      presentationTalaiType: presentationTalaiRow?.talai_type,
    }
  })
}

/** Count coarse linkage_type keys for summary chips. */
export function linkageCoarseCounts(edges: ParsedLinkageEdge[]): Record<string, number> {
  const countsByLinkageType: Record<string, number> = {}
  for (const edge of edges) {
    const linkageFamilyKey = edge.linkage_type || '—'
    countsByLinkageType[linkageFamilyKey] = (countsByLinkageType[linkageFamilyKey] ?? 0) + 1
  }
  return countsByLinkageType
}

/** Map bond-after-from-foot index → row (one edge per consecutive pair). */
export function linkageRowsByFromFoot(rows: LinkageOverviewRow[]): Map<number, LinkageOverviewRow> {
  const rowBySourceFootIndex = new Map<number, LinkageOverviewRow>()
  for (const overviewRow of rows) {
    rowBySourceFootIndex.set(overviewRow.edge.from_foot, overviewRow)
  }
  return rowBySourceFootIndex
}

/**
 * Prefer `presentation.talai` Tamil string; else `displayLabels` maps.
 * Fidelity contract: `prosodyDisplayContract` tests.
 */
export function bondDisplayLabel(row: LinkageOverviewRow): string {
  const tamilFromPresentation = row.presentationTalaiType?.trim()
  if (tamilFromPresentation && tamilFromPresentation.length > 0) return tamilFromPresentation
  const linkageEdge = row.edge
  if (linkageEdge.linkage_special_type && linkageEdge.linkage_special_type !== 'Unknown') {
    return getLinkageSpecialDisplay(linkageEdge.linkage_special_type)
  }
  return getLinkageTypeDisplay(linkageEdge.linkage_type)
}
