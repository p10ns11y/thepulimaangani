import { useMemo } from 'react'

import { Card, CardContent } from '#/components/ui/card'
import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { cn } from '#/lib/utils'
import type { LivePreviewState } from '#/types/livePreview'

import { PARSE_RESULT_PANEL_CLASS } from './parseResult/parseResultPanelClass'
import { ParseResultEmptyState } from './parseResult/ParseResultEmptyState'
import { ParseResultErrorState } from './parseResult/ParseResultErrorState'
import { ParseResultLiveOnlyState } from './parseResult/ParseResultLiveOnlyState'
import { ParseResultTabsView } from './parseResult/ParseResultTabsView'

type ParseResultPanelProps = {
  result: string | null
  poemText: string
  live: LivePreviewState
  /** When true, auto-scrolls the live preview to the end on updates only if the user is already at the end (intersection) — avoids fighting scroll when reading higher lines. */
  pinLiveEndWhileEditing?: boolean
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
  className,
}: ParseResultPanelProps) {
  const parsed = useMemo(() => {
    if (!result) return null
    try {
      const data: unknown = JSON.parse(result)
      return adaptWasmJsonToParsedPoem(data)
    } catch {
      return null
    }
  }, [result])

  const hasText = poemText.trim().length > 0

  if (!hasText && !result) {
    return <ParseResultEmptyState className={className} />
  }

  if (result && !parsed) {
    return (
      <ParseResultErrorState
        result={result}
        poemText={poemText}
        live={live}
        pinLiveEndWhileEditing={pinLiveEndWhileEditing}
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
        hasText={hasText}
        className={className}
      />
    )
  }

  if (!result) {
    return null
  }

  return (
    <Card className={cn(PARSE_RESULT_PANEL_CLASS, className)}>
      <CardContent className="flex flex-col gap-0 p-0">
        <ParseResultTabsView
          parsed={parsed}
          resultJson={result}
          poemText={poemText}
          live={live}
          pinLiveEndWhileEditing={pinLiveEndWhileEditing}
          hasText={hasText}
        />
      </CardContent>
    </Card>
  )
}

export { JsonActionsFooter } from './parseResult/JsonActionsFooter'
export { LiveSyllableWithSentinel } from './parseResult/LiveSyllableWithSentinel'
