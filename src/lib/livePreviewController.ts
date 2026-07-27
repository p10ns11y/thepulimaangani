import { normalizePoemText } from '#/lib/poemTextNormalize'
import { runWasmParse } from '#/lib/wasmParse'
import { wasmJsonToParsedPoem } from '#/lib/wasmWireParseResult'
import type { ParsedPoem } from '#/types/parsedPoem'
import type { LivePreviewState } from '#/types/livePreview'
import { DEFAULT_LIVE_PREVIEW } from '#/types/livePreview'

const VALIDATION_ERR_RE = /Please enter|Tamil characters|meaningful analysis/

type Listener = (state: LivePreviewState) => void

/**
 * Port of the former `useDebouncedParsedPoem` effect: debounced WASM parse for live syllable colouring.
 */
export class LivePreviewController {
  /** Browser `setTimeout` id; avoid `NodeJS.Timeout` vs `number` under mixed DOM/Node typings. */
  private timer: number | null = null
  private cancelled = false
  private latestText = ''
  private lastParsedNorm: string | null = null
  private lastReadyParsed: ParsedPoem | null = null
  private lastRawJson: string | null = null
  private layoutVersion = 0
  private debounceMs: number
  /** Transient WASM load failures after deploy — one automatic retry per source text. */
  private loadRetryForNorm: string | null = null
  /** Last state passed to `onUpdate`; updated on every transition. */
  private lastEmittedLiveState: LivePreviewState = DEFAULT_LIVE_PREVIEW
  private readonly onUpdate: Listener

  constructor(debounceMs: number, onUpdate: Listener) {
    this.debounceMs = debounceMs
    this.onUpdate = onUpdate
  }

  setDebounceMs(ms: number) {
    this.debounceMs = ms
  }

  /** Call whenever preview source or debounce policy changes. */
  setSource(poemText: string) {
    this.latestText = poemText
    this.runEffect()
  }

  private runEffect() {
    const poemText = this.latestText
    this.clearTimer()
    this.cancelled = false

    const trimmed = poemText.trim()
    if (!trimmed) {
      this.lastParsedNorm = null
      this.lastReadyParsed = null
      this.lastRawJson = null
      this.layoutVersion = 0
      this.loadRetryForNorm = null
      this.lastEmittedLiveState = DEFAULT_LIVE_PREVIEW
      this.onUpdate(this.lastEmittedLiveState)
      return
    }

    const norm = normalizePoemText(poemText)
    const cached = this.lastReadyParsed
    if (cached && normalizePoemText(cached.original_text) === norm) {
      this.lastParsedNorm = norm
      this.lastEmittedLiveState = {
        status: 'ready',
        parsed: cached,
        rawJson: this.lastRawJson,
        message: null,
        layoutVersion: this.layoutVersion,
      }
      this.onUpdate(this.lastEmittedLiveState)
      return
    }

    if (this.lastParsedNorm === null || norm !== this.lastParsedNorm) {
      this.lastEmittedLiveState = {
        status: 'syncing',
        parsed: this.lastReadyParsed ?? this.lastEmittedLiveState.parsed,
        rawJson: this.lastRawJson ?? this.lastEmittedLiveState.rawJson,
        message: null,
        layoutVersion: this.lastEmittedLiveState.layoutVersion,
      }
      this.onUpdate(this.lastEmittedLiveState)
    }

    this.timer = window.setTimeout(() => {
      void this.afterTimeout(poemText, norm)
    }, this.debounceMs)
  }

  private async afterTimeout(poemText: string, norm: string) {
    if (this.cancelled) return
    if (normalizePoemText(this.latestText) !== norm) return

    this.lastEmittedLiveState = {
      status: 'pending',
      parsed: this.lastReadyParsed ?? this.lastEmittedLiveState.parsed,
      rawJson: this.lastRawJson ?? this.lastEmittedLiveState.rawJson,
      message: null,
      layoutVersion: this.lastEmittedLiveState.layoutVersion,
    }
    this.onUpdate(this.lastEmittedLiveState)

    try {
      const wasmJsonString = await runWasmParse(poemText)
      if (this.cancelled) return
      if (normalizePoemText(this.latestText) !== norm) return

      const wirePayload: unknown = JSON.parse(wasmJsonString)
      const parsedPoem = wasmJsonToParsedPoem(wirePayload)
      if (!parsedPoem) {
        this.lastReadyParsed = null
        this.lastParsedNorm = null
        this.lastRawJson = null
        this.layoutVersion = 0
        this.lastEmittedLiveState = {
          status: 'error',
          parsed: null,
          rawJson: null,
          message: 'Unexpected parser output.',
          layoutVersion: 0,
        }
        this.onUpdate(this.lastEmittedLiveState)
        return
      }

      this.lastParsedNorm = normalizePoemText(parsedPoem.original_text)
      this.lastReadyParsed = parsedPoem
      this.lastRawJson = wasmJsonString
      this.layoutVersion += 1
      this.loadRetryForNorm = null
      this.lastEmittedLiveState = {
        status: 'ready',
        parsed: parsedPoem,
        rawJson: wasmJsonString,
        message: null,
        layoutVersion: this.layoutVersion,
      }
      this.onUpdate(this.lastEmittedLiveState)
    } catch (e) {
      if (this.cancelled) return
      if (normalizePoemText(this.latestText) !== norm) return

      this.lastReadyParsed = null
      this.lastParsedNorm = null
      this.lastRawJson = null
      this.layoutVersion = 0
      const message = e instanceof Error ? e.message : 'Parse failed.'
      const isValidation = VALIDATION_ERR_RE.test(message)
      this.lastEmittedLiveState = {
        status: isValidation ? 'invalid' : 'error',
        parsed: null,
        rawJson: null,
        message,
        layoutVersion: 0,
      }
      this.onUpdate(this.lastEmittedLiveState)

      // Cold deploy / CDN: first WASM fetch can fail once. Retry once without
      // requiring a full page reload (validation errors are not retried).
      const canRetry =
        !isValidation &&
        this.loadRetryForNorm !== norm &&
        !this.cancelled &&
        normalizePoemText(this.latestText) === norm
      if (canRetry) {
        this.loadRetryForNorm = norm
        this.clearTimer()
        this.timer = window.setTimeout(() => {
          if (this.cancelled) return
          if (normalizePoemText(this.latestText) !== norm) return
          void this.afterTimeout(poemText, norm)
        }, 600)
      }
    }
  }

  private clearTimer() {
    if (this.timer != null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  dispose() {
    this.cancelled = true
    this.clearTimer()
  }
}
