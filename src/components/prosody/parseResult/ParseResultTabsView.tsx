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
}

export function ParseResultTabsView({
  parsed,
  resultJson,
  poemText,
  live,
  pinLiveEndWhileEditing,
  autoFollowLivePreview,
  hasText,
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
      <div className="px-4 pt-4">
        <Tabs defaultValue="live">
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
          <TabsContent value="live" className="mt-3 pb-1 outline-none" {...(forceMount ?? {})}>
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
      <JsonActionsFooter jsonString={resultJson} />
    </>
  )
}
