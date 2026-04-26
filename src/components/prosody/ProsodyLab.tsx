import { useSelector } from '@xstate/react'

import { useProsodyActorRefFromApp } from '#/components/AppActorProvider'
import { useLivePreviewBridge } from '#/hooks/useLivePreviewBridge'
import { cn } from '#/lib/utils'

import { ParseResultPanel } from './ParseResultPanel'
import { PoemAndParseCard } from './PoemAndParseCard'
import { PoemEditChangeStrip } from './PoemEditChangeStrip'
import { PoemEditDialog } from './PoemEditDialog'
import { SamplesCard } from './SamplesCard'

function previewDebounceMs(editorOpen: boolean) {
  return editorOpen ? 300 : 420
}

function previewSource(editorOpen: boolean, poemText: string, poemDraft: string) {
  return editorOpen ? poemDraft : poemText
}

export function ProsodyLab() {
  const prosodyRef = useProsodyActorRefFromApp()
  const ctx = useSelector(prosodyRef, (s) => s?.context)
  const previewSrc = ctx ? previewSource(ctx.editorOpen, ctx.poemText, ctx.poemDraft) : ''
  const debounceMs = ctx ? previewDebounceMs(ctx.editorOpen) : 420

  useLivePreviewBridge(prosodyRef, previewSrc, debounceMs)

  if (!prosodyRef || !ctx) {
    return null
  }

  const send = prosodyRef.send.bind(prosodyRef)

  return (
    <main
      className={cn(
        'page-wrap px-3 pt-4 sm:px-4 sm:pt-5',
        ctx.editorOpen ? 'pb-[min(52vh,32rem)] sm:pb-[min(50vh,30rem)]' : 'pb-8',
      )}
    >
      <div className="mx-auto grid max-w-[min(1200px,100%)] gap-5 lg:grid-cols-[minmax(0,38.2fr)_minmax(0,61.8fr)] lg:items-start lg:gap-6">
        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <PoemAndParseCard
            poemText={ctx.poemText}
            editorOpen={ctx.editorOpen}
            poemDraft={ctx.poemDraft}
            validationError={ctx.parse.validationError}
            loading={ctx.parse.loading}
            onOpenEditor={() => {
              send({ type: 'prosody.EDITOR.OPEN' })
            }}
            onParse={() => {
              send({ type: 'prosody.PARSE' })
            }}
          />
          <SamplesCard
            metreKey={ctx.metreKey}
            selectedEn={ctx.selectedEn}
            onMetreChange={(k) => {
              send({ type: 'prosody.METRE.SET', metreKey: k })
            }}
            onSampleSelect={(en) => {
              send({ type: 'prosody.SAMPLE.SELECT', en })
            }}
          />
        </div>

        <div className="min-w-0 lg:self-start">
          <ParseResultPanel
            result={ctx.parse.result}
            poemText={previewSrc}
            live={ctx.live}
            pinLiveEndWhileEditing={ctx.editorOpen}
          />
        </div>
      </div>
      <PoemEditDialog
        open={ctx.editorOpen}
        onOpenChange={(o) => {
          if (!o) send({ type: 'prosody.EDITOR.CLOSE' })
        }}
        value={ctx.poemDraft}
        onChange={(t) => {
          send({ type: 'prosody.DRAFT.SET', text: t })
        }}
        onApply={() => {
          send({ type: 'prosody.EDITOR.APPLY' })
        }}
        changeStrip={
          ctx.editorOpen ? (
            <PoemEditChangeStrip base={ctx.poemText} draft={ctx.poemDraft} live={ctx.live} />
          ) : null
        }
      />
    </main>
  )
}
