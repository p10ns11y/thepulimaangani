import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import type { LivePreviewState } from '#/types/livePreview'

import { LiveSyllableWithSentinel } from './LiveSyllableWithSentinel'
import { PARSE_RESULT_PANEL_CLASS } from './parseResultPanelClass'

type ParseResultErrorStateProps = {
  result: string
  poemText: string
  live: LivePreviewState
  pinLiveEndWhileEditing: boolean
  autoFollowLivePreview: boolean
  hasText: boolean
  className?: string
}

export function ParseResultErrorState({
  result,
  poemText,
  live,
  pinLiveEndWhileEditing,
  autoFollowLivePreview,
  hasText,
  className,
}: ParseResultErrorStateProps) {
  return (
    <Card className={cn(PARSE_RESULT_PANEL_CLASS, className)}>
      <CardContent className="space-y-4 px-4 py-4">
        {hasText ? (
          <LiveSyllableWithSentinel
            poemText={poemText}
            live={live}
            pinEnd={pinLiveEndWhileEditing}
            autoFollow={autoFollowLivePreview}
            calmWhileEditing={pinLiveEndWhileEditing}
          />
        ) : null}
        <div className="border-destructive/40 bg-destructive/10 rounded-lg border p-3">
          <h4 className="text-destructive mb-1.5 text-sm font-medium">Parse error</h4>
          <pre className="text-destructive m-0 whitespace-pre-wrap break-words text-xs leading-relaxed">
            {result}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
