import { Card, CardContent } from '#/components/ui/card'

import { PoemFitPreview } from './PoemFitPreview'

const cardClass = 'luxe-prosody-card luxe-sheen-hover bg-transparent overflow-hidden rounded-xl'

type PoemAndParseCardProps = {
  poemText: string
  editorOpen: boolean
  poemDraft: string
  /** Pre-edit snapshot for live + post-Done line highlighting. */
  poemEditBaseline: string | null
  validationError: string | null
}

/**
 * Left rail: read-only poem with optional line-diff vs edit baseline.
 * Edit is on the results tab bar; parse is driven by live preview (no Refresh).
 */
export function PoemAndParseCard({
  poemText,
  editorOpen,
  poemDraft,
  poemEditBaseline,
  validationError,
}: PoemAndParseCardProps) {
  const base = poemEditBaseline ?? poemText
  const current = editorOpen ? poemDraft : poemText
  const showDiff = base !== current

  return (
    <Card className={cardClass}>
      <CardContent className="flex flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4">
        <PoemFitPreview text={base} draftForDiff={showDiff ? current : undefined} />
        {validationError ? (
          <div className="border-destructive/35 bg-destructive/8 rounded-lg border px-3 py-2">
            <p className="text-destructive m-0 text-sm">{validationError}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
