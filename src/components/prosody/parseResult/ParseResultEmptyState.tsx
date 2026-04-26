import { Card, CardContent } from '#/components/ui/card'
import { cn } from '#/lib/utils'

import { PARSE_RESULT_PANEL_CLASS } from './parseResultPanelClass'

type ParseResultEmptyStateProps = { className?: string }

export function ParseResultEmptyState({ className }: ParseResultEmptyStateProps) {
  return (
    <Card className={cn(PARSE_RESULT_PANEL_CLASS, className)}>
      <CardContent className="text-muted-foreground px-4 py-8 text-center text-balance text-sm leading-relaxed">
        Enter Tamil text for live syllables. Parse to unlock Structure and Text flow.
      </CardContent>
    </Card>
  )
}
