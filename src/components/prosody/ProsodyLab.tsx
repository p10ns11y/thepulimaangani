import { useCallback, useEffect, useState } from 'react'
import { useSelector } from '@xstate/react'

import { useProsodyActorRefFromApp } from '#/components/AppActorProvider'
import { useLivePreviewBridge } from '#/hooks/useLivePreviewBridge'
import { usePrefersReducedMotion } from '#/hooks/usePrefersReducedMotion'
import type { TypewriterPhysicsCue } from '#/hooks/useTypewriterPaperPhysics'
import { useTypewriterSound } from '#/hooks/useTypewriterSound'
import {
  readPaperPhysicsEnabled,
  readTypewriterSoundEnabled,
  writePaperPhysicsEnabled,
  writeTypewriterSoundEnabled,
} from '#/lib/typewriterEditorPreferences'
import { cn } from '#/lib/utils'

import { ParseResultPanel } from './ParseResultPanel'
import { PoemAndParseCard } from './PoemAndParseCard'
import { PoemEditDialog } from './PoemEditDialog'
import { PoemEditLiveContextRail } from './PoemEditLiveContextRail'
import { SamplesCard } from './SamplesCard'

function previewDebounceMs(editorOpen: boolean) {
  return editorOpen ? 300 : 420
}

function previewSource(editorOpen: boolean, poemText: string, poemDraft: string) {
  return editorOpen ? poemDraft : poemText
}

export function ProsodyLab() {
  const [editorFocusLine, setEditorFocusLine] = useState(0)
  const [paperPhysicsOn, setPaperPhysicsOn] = useState(() => readPaperPhysicsEnabled())
  const [typewriterSoundOn, setTypewriterSoundOn] = useState(() => readTypewriterSoundEnabled())
  const reducedMotion = usePrefersReducedMotion()
  const prosodyRef = useProsodyActorRefFromApp()
  const ctx = useSelector(prosodyRef, (s) => s?.context)
  const previewSrc = ctx ? previewSource(ctx.editorOpen, ctx.poemText, ctx.poemDraft) : ''
  const debounceMs = ctx ? previewDebounceMs(ctx.editorOpen) : 420
  const [frozenResultLive, setFrozenResultLive] = useState(ctx?.live ?? null)

  const { playCue, resume } = useTypewriterSound(
    typewriterSoundOn && !reducedMotion,
    ctx?.editorOpen ?? false,
  )

  const onSoundCue = useCallback(
    (cue: TypewriterPhysicsCue) => {
      void playCue(cue)
    },
    [playCue],
  )

  useLivePreviewBridge(prosodyRef, previewSrc, debounceMs)

  useEffect(() => {
    if (!ctx) return
    // Keep result panel stable while editing; refresh only when editor is closed.
    if (!ctx.editorOpen) {
      setFrozenResultLive(ctx.live)
    }
  }, [ctx])

  useEffect(() => {
    if (!ctx?.editorOpen) return
    setPaperPhysicsOn(readPaperPhysicsEnabled())
    setTypewriterSoundOn(readTypewriterSoundEnabled())
  }, [ctx?.editorOpen])

  if (!prosodyRef || !ctx) {
    return null
  }

  const send = prosodyRef.send.bind(prosodyRef)
  const resultPoemText = ctx.poemText
  const resultLive = ctx.editorOpen ? (frozenResultLive ?? ctx.live) : ctx.live

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

        <div
          className={cn(
            'min-w-0 lg:self-start',
            'motion-safe:transition-[filter,opacity] motion-safe:duration-200',
            ctx.editorOpen ? 'opacity-85 blur-[1.25px]' : null,
          )}
        >
          <ParseResultPanel
            result={ctx.parse.result}
            poemText={resultPoemText}
            live={resultLive}
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
        onCursorLineChange={setEditorFocusLine}
        paperPhysicsEnabled={paperPhysicsOn}
        onPaperPhysicsEnabledChange={(on) => {
          writePaperPhysicsEnabled(on)
          setPaperPhysicsOn(on)
        }}
        typewriterSoundEnabled={typewriterSoundOn}
        onTypewriterSoundEnabledChange={(on) => {
          writeTypewriterSoundEnabled(on)
          setTypewriterSoundOn(on)
          if (on) void resume()
        }}
        liveContextRail={
          ctx.editorOpen ? (
            <PoemEditLiveContextRail
              poemText={ctx.poemDraft}
              live={ctx.live}
              focusLine={editorFocusLine}
              editorOpen={ctx.editorOpen}
              physicsEnabled={paperPhysicsOn}
              soundCuesEnabled={typewriterSoundOn && !reducedMotion}
              onSoundCue={onSoundCue}
            />
          ) : null
        }
      />
    </main>
  )
}
