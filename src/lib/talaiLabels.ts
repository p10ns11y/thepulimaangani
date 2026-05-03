import {
  getLinkageSpecialDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import type { LinkageOverviewRow } from '#/lib/linkageOverview'

/** Fidelity: prefer `presentation.talai` Tamil string; else `displayLabels` maps. See `prosodyDisplayContract.ts`. */
export function bondDisplayLabel(row: LinkageOverviewRow): string {
  const pres = row.presentationTalaiType?.trim()
  if (pres && pres.length > 0) return pres
  const e = row.edge
  if (e.linkage_special_type && e.linkage_special_type !== 'Unknown') {
    return getLinkageSpecialDisplay(e.linkage_special_type)
  }
  return getLinkageTypeDisplay(e.linkage_type)
}

/** Map bond-after-from-foot index → row (one edge per consecutive pair). */
export function linkageRowsByFromFoot(rows: LinkageOverviewRow[]): Map<number, LinkageOverviewRow> {
  const m = new Map<number, LinkageOverviewRow>()
  for (const r of rows) {
    m.set(r.edge.from_foot, r)
  }
  return m
}
