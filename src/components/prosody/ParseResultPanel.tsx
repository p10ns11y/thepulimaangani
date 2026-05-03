import { useMemo } from 'react'

import { Card, CardContent } from '#/components/ui/card'
import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { cn } from '#/lib/utils'
import type { LivePreviewState } from '#/types/livePreview'

import { PARSE_RESULT_PANEL_CLASS } from './parseResult/parseResultPanelClass'
import { ParseResultEmptyState } from './parseResult/ParseResultEmptyState'
import { ParseResultErrorState } from './parseResult/ParseResultErrorState'
import { ParseResultLiveOnlyState } from './parseResult/ParseResultLiveOnlyState'
import { ParseResultTabsView } from './parseResult/ParseResultTabsView'

/** Prefer debounced live JSON when it matches the poem; else manual-parse snapshot so tabs stay aligned. */
function resolveSyncedParseJson(args: {
  poemText: string
  live: LivePreviewState
  manualResult: string | null
}): string | null {
  const previewNorm = normalizePoemText(args.poemText)

  const normForRaw = (raw: string): string | null => {
    try {
      const data: unknown = JSON.parse(raw)
      const p = adaptWasmJsonToParsedPoem(data)
      return p ? normalizePoemText(p.original_text) : null
    } catch {
      return null
    }
  }

  const candidates: string[] = []
  if (args.live.rawJson) candidates.push(args.live.rawJson)
  if (args.manualResult) candidates.push(args.manualResult)

  for (const raw of candidates) {
    const n = normForRaw(raw)
    if (n === previewNorm) return raw
  }

  return null
}

type ParseResultPanelProps = {
  result: string | null
  poemText: string
  live: LivePreviewState
  /** When true, auto-scrolls the live preview to the end on updates only if the user is already at the end (intersection) — avoids fighting scroll when reading higher lines. */
  pinLiveEndWhileEditing?: boolean
  /** Explicit opt-in for follow mode; default keeps editing calm with no forced scrolling. */
  autoFollowLivePreview?: boolean
  className?: string
}

/**
 * Picks a parse result view: empty, parse error, live-only, or full tabs + JSON actions.
 */
export function ParseResultPanel({
  result,
  poemText,
  live,
  pinLiveEndWhileEditing = false,
  autoFollowLivePreview = false,
  className,
}: ParseResultPanelProps) {
  const syncedJson = useMemo(
    () => resolveSyncedParseJson({ poemText, live, manualResult: result }),
    [poemText, live, result],
  )

  const parsed = useMemo(() => {
    if (!syncedJson) return null
    try {
      const data: unknown = JSON.parse(syncedJson)
      return adaptWasmJsonToParsedPoem(data)
    } catch {
      return null
    }
  }, [syncedJson])

  const hasText = poemText.trim().length > 0

  if (!hasText && !syncedJson) {
    return <ParseResultEmptyState className={className} />
  }

  if (syncedJson && !parsed) {
    return (
      <ParseResultErrorState
        result={syncedJson}
        poemText={poemText}
        live={live}
        pinLiveEndWhileEditing={pinLiveEndWhileEditing}
        autoFollowLivePreview={autoFollowLivePreview}
        hasText={hasText}
        className={className}
      />
    )
  }

  if (!parsed) {
    return (
      <ParseResultLiveOnlyState
        poemText={poemText}
        live={live}
        pinLiveEndWhileEditing={pinLiveEndWhileEditing}
        autoFollowLivePreview={autoFollowLivePreview}
        hasText={hasText}
        className={className}
      />
    )
  }

  return (
    <Card className={cn(PARSE_RESULT_PANEL_CLASS, className)}>
      <CardContent className="flex flex-col gap-0 p-0">
        <ParseResultTabsView
          parsed={parsed}
          resultJson={syncedJson}
          poemText={poemText}
          live={live}
          pinLiveEndWhileEditing={pinLiveEndWhileEditing}
          autoFollowLivePreview={autoFollowLivePreview}
          hasText={hasText}
        />
      </CardContent>
    </Card>
  )
}

export { JsonActionsFooter } from './parseResult/JsonActionsFooter'
export { LiveSyllableWithSentinel } from './parseResult/LiveSyllableWithSentinel'
