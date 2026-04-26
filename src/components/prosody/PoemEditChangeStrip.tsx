import type { LivePreviewState } from '#/types/livePreview'
import { getChangedLineIndices, lineDiffOps, syllableCountsPerPhysicalLine } from '#/lib/poemLineDiff'
import { cn } from '#/lib/utils'

const MAX_LINES_SHOWN = 4

type PoemEditChangeStripProps = {
  base: string
  draft: string
  live: LivePreviewState
  className?: string
}

/**
 * Compact line/syllable hint for the editor header: which physical lines differ and
 * current syllable counts from the debounced live parse (when ready).
 */
export function PoemEditChangeStrip({ base, draft, live, className }: PoemEditChangeStripProps) {
  const ops = lineDiffOps(base, draft)
  if (!ops.some((o) => o.type !== 'equal')) return null

  const nDelete = ops.filter((o) => o.type === 'delete').length
  const changed = getChangedLineIndices(base, draft)

  const busy = live.status === 'syncing' || live.status === 'pending'
  const parsed = live.status === 'ready' ? live.parsed : null
  const counts = parsed ? syllableCountsPerPhysicalLine(draft, parsed) : null

  const shown = changed.slice(0, MAX_LINES_SHOWN)
  const rest = changed.length - shown.length

  const parts = shown.map((idx) => {
    const lineNo = idx + 1
    const n = counts?.[idx]
    if (n === undefined) {
      return `அடி ${lineNo}: —`
    }
    return `அடி ${lineNo}: ${n} சீர்`
  })

  return (
    <p
      className={cn(
        'font-tamil text-foreground/90 m-0 text-[0.65rem] leading-snug sm:text-xs',
        busy ? 'opacity-80' : null,
        className,
      )}
    >
      <span className="text-muted-foreground mr-1">மாற்றம்:</span>
      {nDelete > 0 ? (
        <span className="text-[color:color-mix(in_oklab,var(--gem-ruby)_80%,var(--sea-ink)_20%)] mr-1">
          நீக்கம் {nDelete} அடி
        </span>
      ) : null}
      {nDelete > 0 && changed.length > 0 ? <span className="text-muted-foreground mx-0.5">·</span> : null}
      {changed.length > 0 ? (
        <>
          {parts.join(' · ')}
          {rest > 0 ? <span className="text-muted-foreground"> · +{rest}</span> : null}
        </>
      ) : null}
      {busy ? <span className="text-muted-foreground ml-1">(பகுப்பாய்வு…)</span> : null}
    </p>
  )
}
