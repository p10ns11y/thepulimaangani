import { assign, fromPromise, setup } from 'xstate'

import { validatePoemInput } from '#/lib/prosodyValidation'
import { runWasmParse } from '#/lib/wasmParse'
import { defaultSampleRow, getFlatRows, type MetreKey } from '#/machines/prosodyLab.defaults'
import { DEFAULT_LIVE_PREVIEW, type LivePreviewState } from '#/types/livePreview'

export type ProsodyParseSlice = {
  result: string | null
  loading: boolean
  validationError: string | null
}

export type ProsodyContext = {
  metreKey: MetreKey
  selectedEn: string
  poemText: string
  editorOpen: boolean
  poemDraft: string
  parse: ProsodyParseSlice
  live: LivePreviewState
}

export type ProsodyEvent =
  | { type: 'prosody.METRE.SET'; metreKey: MetreKey }
  | { type: 'prosody.SAMPLE.SELECT'; en: string }
  | { type: 'prosody.EDITOR.OPEN' }
  | { type: 'prosody.EDITOR.CLOSE' }
  | { type: 'prosody.DRAFT.SET'; text: string }
  | { type: 'prosody.EDITOR.APPLY' }
  | { type: 'prosody.PARSE' }
  | { type: 'prosody.LIVE.STATE'; live: LivePreviewState }

function previewSource(ctx: ProsodyContext): string {
  return ctx.editorOpen ? ctx.poemDraft : ctx.poemText
}

function initialContext(): ProsodyContext {
  return {
    metreKey: 'venpaa',
    selectedEn: defaultSampleRow.en,
    poemText: defaultSampleRow.example,
    editorOpen: false,
    poemDraft: defaultSampleRow.example,
    parse: { result: null, loading: false, validationError: null },
    live: DEFAULT_LIVE_PREVIEW,
  }
}

const parsePoemLogic = fromPromise(
  async ({ input }: { input: { text: string } }): Promise<string> => {
    const err = validatePoemInput(input.text)
    if (err) {
      throw new Error(err)
    }
    return runWasmParse(input.text)
  },
)

export const prosodyLabMachine = setup({
  types: {
    context: {} as ProsodyContext,
    events: {} as ProsodyEvent,
  },
  actors: { parsePoem: parsePoemLogic },
  actions: {
    applyMetre: assign(({ context, event }) => {
      if (event.type !== 'prosody.METRE.SET') return {}
      const key = event.metreKey
      const flat = getFlatRows(key)
      const ens = new Set(flat.map((r) => r.en))
      let selectedEn = context.selectedEn
      let poemText = context.poemText
      if (!ens.has(selectedEn)) {
        const first = flat[0]
        if (first) {
          selectedEn = first.en
          poemText = first.example
        }
      }
      return { metreKey: key, selectedEn, poemText, editorOpen: false }
    }),
    selectSample: assign(({ context, event }) => {
      if (event.type !== 'prosody.SAMPLE.SELECT') return {}
      const flat = getFlatRows(context.metreKey)
      const hit = flat.find((r) => r.en === event.en)
      return { selectedEn: event.en, poemText: hit?.example ?? context.poemText, editorOpen: false }
    }),
    openEditor: assign(({ context, event }) => {
      if (event.type !== 'prosody.EDITOR.OPEN') return {}
      return { editorOpen: true, poemDraft: context.poemText }
    }),
    closeEditor: assign(({ event }) => {
      if (event.type !== 'prosody.EDITOR.CLOSE') return {}
      return { editorOpen: false }
    }),
    setDraft: assign(({ event }) => {
      if (event.type !== 'prosody.DRAFT.SET') return {}
      return { poemDraft: event.text }
    }),
    applyDraft: assign(({ context, event }) => {
      if (event.type !== 'prosody.EDITOR.APPLY') return {}
      return { poemText: context.poemDraft, editorOpen: false }
    }),
    setLive: assign(({ event }) => {
      if (event.type !== 'prosody.LIVE.STATE') return {}
      return { live: event.live }
    }),
    setParseLoading: assign({
      parse: ({ context }) => ({
        ...context.parse,
        loading: true,
        validationError: null,
      }),
    }),
    parseSuccess: assign({
      parse: ({ event }) => {
        const out = (event as unknown as { output: unknown }).output
        if (typeof out === 'string') {
          return { result: out, loading: false, validationError: null as string | null }
        }
        return { result: null, loading: false, validationError: 'Invalid parse result.' }
      },
    }),
    parseFailure: assign({
      parse: ({ event }) => {
        const errUnknown = (event as unknown as { error: unknown }).error
        const message =
          errUnknown instanceof Error
            ? errUnknown.message
            : 'An error occurred while analyzing the poem. Please try again.'
        return { result: null, loading: false, validationError: message }
      },
    }),
  },
}).createMachine({
  id: 'prosodyLab',
  context: initialContext,
  initial: 'ready',
  states: {
    ready: {
      on: {
        'prosody.METRE.SET': { actions: 'applyMetre' },
        'prosody.SAMPLE.SELECT': { actions: 'selectSample' },
        'prosody.EDITOR.OPEN': { actions: 'openEditor' },
        'prosody.EDITOR.CLOSE': { actions: 'closeEditor' },
        'prosody.DRAFT.SET': { actions: 'setDraft' },
        'prosody.EDITOR.APPLY': { actions: 'applyDraft' },
        'prosody.LIVE.STATE': { actions: 'setLive' },
        'prosody.PARSE': { target: 'parsing' },
      },
    },
    parsing: {
      entry: 'setParseLoading',
      invoke: {
        id: 'parsePoem',
        src: 'parsePoem',
        input: ({ context }) => ({ text: previewSource(context) }),
        onDone: {
          target: 'ready',
          actions: 'parseSuccess',
        },
        onError: {
          target: 'ready',
          actions: 'parseFailure',
        },
      },
    },
  },
})
