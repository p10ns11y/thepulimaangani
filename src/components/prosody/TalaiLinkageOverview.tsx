import { useMemo, useState } from 'react'

import {
  getLinkageSpecialDisplay,
  getLinkageTypeDisplay,
} from '#/components/prosody/displayLabels'
import { buildLinkageOverviewRows, linkageCoarseCounts } from '#/lib/linkageOverview'
import type { ParsedPoem } from '#/types/parsedPoem'

type TalaiLinkageOverviewProps = {
  data: ParsedPoem
}

/**
 * Bond-first தளை table + coarse summary. Maps to ten UX dimensions used for typewriter/prosody review:
 * (1) bond order, (2) cross-line visibility, (3–4) coarse+fine labels, (5) validity, (6–7) line/word anchors,
 * (8) Tamil-first labels, (9) scan-friendly table + chips, (10) collapsible detail on small screens.
 */
export function TalaiLinkageOverview({ data }: TalaiLinkageOverviewProps) {
  const rows = useMemo(() => buildLinkageOverviewRows(data), [data])
  const coarse = useMemo(() => linkageCoarseCounts(data.linkage ?? []), [data.linkage])
  const [open, setOpen] = useState(true)

  if (rows.length === 0) {
    return (
      <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
        <h3 className="text-foreground mb-2 text-sm font-medium">தளை (linkage)</h3>
        <p className="text-muted-foreground m-0 text-xs leading-relaxed">
          No consecutive-foot bonds in this parse (single foot or parser omitted linkage).
        </p>
      </div>
    )
  }

  return (
    <div className="luxe-inset-surface rounded-lg p-3 shadow-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <h3 className="text-foreground m-0 text-sm font-medium">தளை (linkage) overview</h3>
        <span className="text-muted-foreground text-xs tabular-nums">
          {rows.length} bond{rows.length === 1 ? '' : 's'}
        </span>
      </button>
      <p className="text-muted-foreground mt-1 mb-2 text-xs leading-relaxed">
        Bonds read in foot order: cross-line pairs are flagged. Coarse family supports metre hints; fine row is the
        classical bond name.
      </p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.entries(coarse).map(([k, n]) => (
          <span
            key={k}
            className="border-rim/40 bg-surface-2/90 text-foreground inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
          >
            {getLinkageTypeDisplay(k)} · {n}
          </span>
        ))}
      </div>
      {open ? (
        <div className="overflow-x-auto rounded-md border border-rim/30">
          <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-rim/35 bg-surface-2/50">
                <th className="text-muted-foreground px-2 py-2 font-medium">#</th>
                <th className="text-muted-foreground px-2 py-2 font-medium">From</th>
                <th className="text-muted-foreground px-1 py-2 font-medium" aria-hidden>
                  →
                </th>
                <th className="text-muted-foreground px-2 py-2 font-medium">To</th>
                <th className="text-muted-foreground px-2 py-2 font-medium">Span</th>
                <th className="text-muted-foreground px-2 py-2 font-medium">Coarse</th>
                <th className="text-muted-foreground px-2 py-2 font-medium">Fine</th>
                <th className="text-muted-foreground px-2 py-2 font-medium">OK</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`bond-${r.index1}-${r.edge.from_foot}-${r.edge.to_foot}`}
                  className="border-b border-rim/20 odd:bg-surface-1/40"
                >
                  <td className="text-muted-foreground px-2 py-1.5 tabular-nums">{r.index1}</td>
                  <td className="text-foreground px-2 py-1.5 font-tamil tabular-nums">
                    L{r.fromLine1}·W{r.fromWord1}
                    <span className="text-muted-foreground ml-1 text-[0.65rem]">
                      ·foot {r.edge.from_foot}
                    </span>
                  </td>
                  <td className="px-1 py-1.5 text-center text-muted-foreground">→</td>
                  <td className="text-foreground px-2 py-1.5 font-tamil tabular-nums">
                    L{r.toLine1}·W{r.toWord1}
                    <span className="text-muted-foreground ml-1 text-[0.65rem]">
                      ·foot {r.edge.to_foot}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    {r.crossLine ? (
                      <span className="text-foreground rounded bg-[color:color-mix(in_oklab,var(--gem-diamond)_18%,transparent)] px-1.5 py-0.5">
                        Cross-line
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Same line</span>
                    )}
                  </td>
                  <td className="text-foreground px-2 py-1.5 font-tamil">
                    {getLinkageTypeDisplay(r.edge.linkage_type)}
                  </td>
                  <td className="text-foreground px-2 py-1.5 font-tamil">
                    {getLinkageSpecialDisplay(r.edge.linkage_special_type)}
                  </td>
                  <td className="px-2 py-1.5">
                    {r.edge.is_valid ? (
                      <span className="text-muted-foreground">✓</span>
                    ) : (
                      <span className="text-destructive font-medium">✗</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
