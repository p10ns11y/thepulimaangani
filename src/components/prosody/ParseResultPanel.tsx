import { useMemo } from 'react'

import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import type { LivePreviewState } from '#/hooks/useDebouncedParsedPoem'
import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { cn } from '#/lib/utils'

import { PretextLineViewport } from './PretextLineViewport'
import { TAMIL_PRETEXT_FONT_COMPACT } from './pretextConstants'
import { buildParseFlowText } from './parseFlowText'
import { StructuredParseResult } from './StructuredParseResult'
import { SyllableLivePreview } from './SyllableLivePreview'

type ParseResultPanelProps = {
  result: string | null
  poemText: string
  live: LivePreviewState
  className?: string
}

const panelClass = 'border bg-card shadow-sm overflow-hidden rounded-xl'

function JsonActionsFooter({ jsonString }: { jsonString: string }) {
  return (
    <div
      className={cn(
        'border-border/80 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3',
        'bg-muted/25 supports-[backdrop-filter]:backdrop-blur-[2px]',
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs transition-[transform,box-shadow] duration-200 hover:shadow-sm active:scale-[0.98]"
        onClick={() => void navigator.clipboard.writeText(jsonString)}
      >
        Copy JSON
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs transition-[transform,box-shadow] duration-200 hover:shadow-sm active:scale-[0.98]"
        onClick={() => {
          const blob = new Blob([jsonString], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'tamil-prosody-analysis.json'
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        Export JSON
      </Button>
    </div>
  )
}

export function ParseResultPanel({ result, poemText, live, className }: ParseResultPanelProps) {
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
    return (
      <Card className={cn(panelClass, className)}>
        <CardContent className="text-muted-foreground px-4 py-8 text-center text-balance text-sm leading-relaxed">
          Enter Tamil text for live syllables. Parse to unlock Structure and Text flow.
        </CardContent>
      </Card>
    )
  }

  if (result && !parsed) {
    return (
      <Card className={cn(panelClass, className)}>
        <CardContent className="space-y-4 px-4 py-4">
          {hasText ? <SyllableLivePreview poemText={poemText} live={live} variant="compact" /> : null}
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

  const liveBlock = hasText ? (
    <SyllableLivePreview poemText={poemText} live={live} variant="compact" />
  ) : (
    <p className="text-muted-foreground m-0 text-sm">Add poem text to preview syllables.</p>
  )

  if (!parsed) {
    return (
      <Card className={cn(panelClass, className)}>
        <CardContent className="px-4 py-4">{liveBlock}</CardContent>
      </Card>
    )
  }

  if (!result) {
    return null
  }
  const jsonString = result
  const flowTextResolved = buildParseFlowText(parsed)

  return (
    <Card className={cn(panelClass, className)}>
      <CardContent className="flex flex-col gap-0 p-0">
        <div className="px-4 pt-4">
          <Tabs defaultValue="live">
            <TabsList className="bg-muted/50 h-auto w-full justify-start gap-0.5 p-1 sm:w-fit">
              <TabsTrigger value="live" className="text-xs sm:text-sm">
                Live
              </TabsTrigger>
              <TabsTrigger value="structure" className="text-xs sm:text-sm">
                Structure
              </TabsTrigger>
              <TabsTrigger value="flow" className="text-xs sm:text-sm">
                Text flow
              </TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-3 pb-1 outline-none">
              {liveBlock}
            </TabsContent>
            <TabsContent value="structure" className="mt-3 pb-1 outline-none">
              <StructuredParseResult data={parsed} />
            </TabsContent>
            <TabsContent value="flow" className="mt-3 pb-1 outline-none">
              <p className="text-muted-foreground mb-2 text-balance text-xs leading-relaxed sm:text-sm">
                Metre and counts — line wrapping for narrow columns. Source text is in the editor.
              </p>
              <div className="bg-muted/20 rounded-lg border p-3 sm:p-4">
                <PretextLineViewport
                  text={flowTextResolved}
                  lineHeightPx={26}
                  font={TAMIL_PRETEXT_FONT_COMPACT}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <JsonActionsFooter jsonString={jsonString} />
      </CardContent>
    </Card>
  )
}
