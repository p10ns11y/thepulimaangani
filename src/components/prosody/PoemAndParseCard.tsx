import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'

import { PoemFitPreview } from './PoemFitPreview'

const cardClass = 'luxe-prosody-card luxe-sheen-hover bg-transparent overflow-hidden rounded-xl'

type PoemAndParseCardProps = {
  poemText: string
  editorOpen: boolean
  poemDraft: string
  validationError: string | null
  loading: boolean
  onOpenEditor: () => void
  onParse: () => void
}

export function PoemAndParseCard({
  poemText,
  editorOpen,
  poemDraft,
  validationError,
  loading,
  onOpenEditor,
  onParse,
}: PoemAndParseCardProps) {
  return (
    <Card className={cardClass}>
      <CardHeader className="px-4 py-3 pb-2">
        <CardTitle className="text-balance text-base font-semibold tracking-tight">Poem &amp; parse</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4 pb-4 pt-0">
        <PoemFitPreview
          text={poemText}
          draftForDiff={editorOpen ? poemDraft : undefined}
          onOpenEditor={onOpenEditor}
        />
        {validationError ? (
          <div className="border-destructive/35 bg-destructive/8 rounded-lg border px-3 py-2">
            <p className="text-destructive m-0 text-sm">{validationError}</p>
          </div>
        ) : null}
        <Separator />
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onParse}
            disabled={loading}
            className="h-9 w-fit min-w-[7.5rem] rounded-md px-4 text-sm font-medium"
          >
            {loading ? 'Parsing…' : 'Parse poem'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
