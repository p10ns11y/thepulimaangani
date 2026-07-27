import { FilePlus2, Pencil } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { ParsedPoem } from '#/types/parsedPoem'
import type { LivePreviewState } from '#/types/livePreview'

import { StructuredParseResult } from '../StructuredParseResult'
import { TextualInsights } from '../TextualInsights'

import { JsonActionsFooter } from './JsonActionsFooter'
import { LiveSyllableWithSentinel } from './LiveSyllableWithSentinel'

type ParseResultTabsViewProps = {
  parsed: ParsedPoem
  resultJson: string
  poemText: string
  live: LivePreviewState
  pinLiveEndWhileEditing: boolean
  autoFollowLivePreview: boolean
  hasText: boolean
  onOpenEditor?: () => void
  onOpenNew?: () => void
}

export function ParseResultTabsView({
  parsed,
  resultJson,
  poemText,
  live,
  pinLiveEndWhileEditing,
  autoFollowLivePreview,
  hasText,
  onOpenEditor,
  onOpenNew,
}: ParseResultTabsViewProps) {
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
  const forceMount =
    import.meta.env.MODE === 'test' ? ({ forceMount: true } as { forceMount: true }) : undefined

  return (
    <>
      <div className="px-3 pt-3 sm:px-4 sm:pt-3.5">
        <Tabs defaultValue="live">
          <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
            <TabsList className="bg-surface-3/75 border-rim/40 h-auto w-full justify-start gap-0.5 border p-1 sm:w-fit">
              <TabsTrigger
                value="live"
                className="luxe-gem-focus text-xs data-active:border-rim/55 data-active:bg-surface-1/95 data-active:shadow-sm sm:text-sm"
              >
                Live
              </TabsTrigger>
              <TabsTrigger
                value="structure"
                className="luxe-gem-focus text-xs data-active:border-rim/55 data-active:bg-surface-1/95 data-active:shadow-sm sm:text-sm"
              >
                Structure
              </TabsTrigger>
              <TabsTrigger
                value="flow"
                className="luxe-gem-focus text-xs data-active:border-rim/55 data-active:bg-surface-1/95 data-active:shadow-sm sm:text-sm"
              >
                Text flow
              </TabsTrigger>
            </TabsList>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {onOpenNew ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium"
                  onClick={onOpenNew}
                  aria-label="New poem, opens empty typewriter"
                >
                  <FilePlus2 className="size-3.5 opacity-80" aria-hidden />
                  New
                </Button>
              ) : null}
              {onOpenEditor ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium"
                  onClick={onOpenEditor}
                  aria-label="Edit poem, opens bottom editor"
                >
                  <Pencil className="size-3.5 opacity-80" aria-hidden />
                  Edit
                </Button>
              ) : null}
            </div>
          </div>
          {/* mx-auto + w-fit: center the Live shell; content stays LTR (flex items-start in preview) */}
          <TabsContent
            value="live"
            className="mx-auto mt-3 w-fit max-w-full pb-1 outline-none"
            {...(forceMount ?? {})}
          >
            {liveBlock}
          </TabsContent>
          <TabsContent value="structure" className="mt-3 pb-1 outline-none" {...(forceMount ?? {})}>
            <StructuredParseResult data={parsed} />
          </TabsContent>
          <TabsContent value="flow" className="mt-3 pb-1 outline-none" {...(forceMount ?? {})}>
            <TextualInsights data={parsed} />
          </TabsContent>
        </Tabs>
      </div>
      <JsonActionsFooter jsonString={resultJson} poemText={poemText} parsed={parsed} />
    </>
  )
}