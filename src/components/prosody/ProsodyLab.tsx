import { ChevronRight, PanelLeftOpen } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from '@xstate/react'

import { useProsodyActorRefFromApp } from '#/components/AppActorProvider'
import { Button } from '#/components/ui/button'
import { useLivePreviewBridge } from '#/hooks/useLivePreviewBridge'
import { usePrefersReducedMotion } from '#/hooks/usePrefersReducedMotion'
import type { TypewriterPhysicsCue } from '#/hooks/useTypewriterPaperPhysics'
import { useTypewriterSound } from '#/hooks/useTypewriterSound'
import {
  prosodyLabGridClass,
  readInputRailExpanded,
  writeInputRailExpanded,
} from '#/lib/prosodyLabLayoutPreferences'
import {
  readPaperPhysicsEnabled,
  readTypewriterSoundEnabled,
  writePaperPhysicsEnabled,
  writeTypewriterSoundEnabled,
} from '#/lib/typewriterEditorPreferences'
import { cn } from '#/lib/utils'
import { getFlatRows, METRE_TAB_LABEL } from '#/machines/prosodyLab.defaults'

import { ParseResultPanel } from './ParseResultPanel'
import { PoemAndParseCard } from './PoemAndParseCard'
import { PoemEditDialog } from './PoemEditDialog'
import { PoemEditLiveContextRail } from './PoemEditLiveContextRail'
import { SamplesCard } from './SamplesCard'

function previewDebounceMs(editorOpen: boolean) {
  // Vitest runs Vite with `mode: 'test'` — zero debounce keeps integration tests fast without fake timers
  // (fake `setTimeout` breaks React 19's hook dispatcher in RTL).
  if (import.meta.env.MODE === 'test') return 0
  return editorOpen ? 300 : 420
}

function previewSource(editorOpen: boolean, poemText: string, poemDraft: string) {
  return editorOpen ? poemDraft : poemText
}

export function ProsodyLab() {
  const initialParseSentRef = useRef(false)
  const [editorFocusLine, setEditorFocusLine] = useState(0)
  const [paperPhysicsOn, setPaperPhysicsOn] = useState(() => readPaperPhysicsEnabled())
  const [typewriterSoundOn, setTypewriterSoundOn] = useState(() => readTypewriterSoundEnabled())
  /** Left sample picker + poem rail — collapse for wide Structure reading. */
  const [inputRailExpanded, setInputRailExpanded] = useState(() => readInputRailExpanded())
  const reducedMotion = usePrefersReducedMotion()
  const prosodyRef = useProsodyActorRefFromApp()
  const ctx = useSelector(prosodyRef, (s) => s?.context)
  const previewSrc = ctx ? previewSource(ctx.editorOpen, ctx.poemText, ctx.poemDraft) : ''
  const debounceMs = ctx ? previewDebounceMs(ctx.editorOpen) : 420

  const setInputRail = useCallback((expanded: boolean) => {
    writeInputRailExpanded(expanded)
    setInputRailExpanded(expanded)
  }, [])

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

  /** Seed manual parse JSON once so Structure/Text flow match CI until live preview completes. */
  useEffect(() => {
    if (!prosodyRef || initialParseSentRef.current) return
    initialParseSentRef.current = true
    prosodyRef.send({ type: 'prosody.PARSE' })
  }, [prosodyRef])

  useEffect(() => {
    if (!ctx?.editorOpen) return
    setPaperPhysicsOn(readPaperPhysicsEnabled())
    setTypewriterSoundOn(readTypewriterSoundEnabled())
  }, [ctx?.editorOpen])

  if (!prosodyRef || !ctx) {
    return null
  }

  const send = prosodyRef.send.bind(prosodyRef)
  const poemTextForResults = previewSource(ctx.editorOpen, ctx.poemText, ctx.poemDraft)
  /** Tamil metre · variation label (same as sample selector summary). */
  const sampleSummaryTa = useMemo(() => {
    const rows = getFlatRows(ctx.metreKey)
    const variationTa = rows.find((r) => r.en === ctx.selectedEn)?.ta ?? ctx.selectedEn
    return `${METRE_TAB_LABEL[ctx.metreKey]} · ${variationTa}`
  }, [ctx.metreKey, ctx.selectedEn])
  const openEditor = () => {
    send({ type: 'prosody.EDITOR.OPEN' })
  }
  const openNewPoem = () => {
    send({ type: 'prosody.EDITOR.NEW' })
  }

  return (
    <main
      className={cn(
        'page-wrap px-3 pt-4 sm:px-4 sm:pt-5',
        ctx.editorOpen ? 'pb-[min(52vh,32rem)] sm:pb-[min(50vh,30rem)]' : 'pb-8',
      )}
    >
      {/*
        Both columns start at the same top edge (items-start).
        Learn + More space live inside the first left card — no floating header row.
      */}
      <div
        className={cn(
          'mx-auto grid max-w-[min(1200px,100%)] gap-4 lg:items-start lg:gap-5',
          prosodyLabGridClass(inputRailExpanded),
          !inputRailExpanded && 'max-w-[min(1400px,100%)]',
        )}
      >
        {inputRailExpanded ? (
          <div
            className="prosody-input-rail flex min-h-0 min-w-0 flex-col gap-3"
            data-testid="prosody-input-rail"
            id="prosody-input-rail-body"
          >
            <SamplesCard
              metreKey={ctx.metreKey}
              selectedEn={ctx.selectedEn}
              onMetreChange={(k) => {
                send({ type: 'prosody.METRE.SET', metreKey: k })
              }}
              onSampleSelect={(en) => {
                send({ type: 'prosody.SAMPLE.SELECT', en })
              }}
              onCollapseRail={() => setInputRail(false)}
            />
            <PoemAndParseCard
              poemText={ctx.poemText}
              editorOpen={ctx.editorOpen}
              poemDraft={ctx.poemDraft}
              poemEditBaseline={ctx.poemEditBaseline}
              validationError={ctx.parse.validationError}
            />
          </div>
        ) : (
          <div
            className="prosody-input-rail-collapsed border-rim/40 bg-surface-1/70 flex min-h-[2.75rem] flex-wrap items-center gap-2 rounded-xl border px-3 py-2 lg:col-span-1"
            data-testid="prosody-input-rail-collapsed"
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              aria-expanded={false}
              data-testid="prosody-input-rail-expand"
              onClick={() => setInputRail(true)}
            >
              <PanelLeftOpen className="size-3.5" aria-hidden />
              <span className="font-semibold">Learn</span>
              <ChevronRight className="size-3.5 opacity-70" aria-hidden />
            </Button>
            <span className="text-muted-foreground min-w-0 flex-1 truncate text-[0.72rem] leading-snug">
              <span className="text-foreground/90 font-tamil font-medium">{sampleSummaryTa}</span>
              <span className="text-muted-foreground/80"> · Read mode</span>
            </span>
          </div>
        )}

        <div
          className={cn(
            'min-w-0 lg:self-start',
            'motion-safe:transition-[filter,opacity] motion-safe:duration-200',
            ctx.editorOpen ? 'opacity-85 blur-[1.25px]' : null,
          )}
        >
          <ParseResultPanel
            result={ctx.parse.result}
            poemText={poemTextForResults}
            live={ctx.live}
            pinLiveEndWhileEditing={ctx.editorOpen}
            onOpenEditor={openEditor}
            onOpenNew={openNewPoem}
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
