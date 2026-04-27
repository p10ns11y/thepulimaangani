import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import type { LivePreviewState } from '#/types/livePreview'

import { LiveSyllableWithSentinel } from './LiveSyllableWithSentinel'
import { PARSE_RESULT_PANEL_CLASS } from './parseResultPanelClass'

type ParseResultLiveOnlyStateProps = {
  poemText: string
  live: LivePreviewState
  pinLiveEndWhileEditing: boolean
  autoFollowLivePreview: boolean
  hasText: boolean
  className?: string
}

export function ParseResultLiveOnlyState({
  poemText,
  live,
  pinLiveEndWhileEditing,
  autoFollowLivePreview,
  hasText,
  className,
}: ParseResultLiveOnlyStateProps) {
  const liveBlock = hasText ? (
    <LiveSyllableWithSentinel
      poemText={poemText}
      live={live}
      pinEnd={pinLiveEndWhileEditing}
      autoFollow={autoFollowLivePreview}
      calmWhileEditing={pinLiveEndWhileEditing}
    />
  ) : (
    <p className="text-muted-foreground m-0 text-sm">Add poem text to preview syllables.</p>
  )

  return (
    <Card className={cn(PARSE_RESULT_PANEL_CLASS, className)}>
      <CardContent className="px-4 py-4">{liveBlock}</CardContent>
    </Card>
  )
}
