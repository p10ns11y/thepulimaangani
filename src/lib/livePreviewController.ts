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
  private prev: LivePreviewState = DEFAULT_LIVE_PREVIEW
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
      this.prev = DEFAULT_LIVE_PREVIEW
      this.onUpdate(this.prev)
      return
    }

    const norm = normalizePoemText(poemText)
    const cached = this.lastReadyParsed
    if (cached && normalizePoemText(cached.original_text) === norm) {
      this.lastParsedNorm = norm
      this.prev = {
        status: 'ready',
        parsed: cached,
        rawJson: this.lastRawJson,
        message: null,
        layoutVersion: this.layoutVersion,
      }
      this.onUpdate(this.prev)
      return
    }

    if (this.lastParsedNorm === null || norm !== this.lastParsedNorm) {
      this.prev = {
        status: 'syncing',
        parsed: this.lastReadyParsed ?? this.prev.parsed,
        rawJson: this.lastRawJson ?? this.prev.rawJson,
        message: null,
        layoutVersion: this.prev.layoutVersion,
      }
      this.onUpdate(this.prev)
    }

    this.timer = window.setTimeout(() => {
      void this.afterTimeout(poemText, norm)
    }, this.debounceMs)
  }

  private async afterTimeout(poemText: string, norm: string) {
    if (this.cancelled) return
    if (normalizePoemText(this.latestText) !== norm) return

    this.prev = {
      status: 'pending',
      parsed: this.lastReadyParsed ?? this.prev.parsed,
      rawJson: this.lastRawJson ?? this.prev.rawJson,
      message: null,
      layoutVersion: this.prev.layoutVersion,
    }
    this.onUpdate(this.prev)

    try {
      const raw = await runWasmParse(poemText)
      if (this.cancelled) return
      if (normalizePoemText(this.latestText) !== norm) return

      const rawJson: unknown = JSON.parse(raw)
      const data = wasmJsonToParsedPoem(rawJson)
      if (!data) {
        this.lastReadyParsed = null
        this.lastParsedNorm = null
        this.lastRawJson = null
        this.layoutVersion = 0
        this.prev = {
          status: 'error',
          parsed: null,
          rawJson: null,
          message: 'Unexpected parser output.',
          layoutVersion: 0,
        }
        this.onUpdate(this.prev)
        return
      }

      this.lastParsedNorm = normalizePoemText(data.original_text)
      this.lastReadyParsed = data
      this.lastRawJson = raw
      this.layoutVersion += 1
      this.prev = {
        status: 'ready',
        parsed: data,
        rawJson: raw,
        message: null,
        layoutVersion: this.layoutVersion,
      }
      this.onUpdate(this.prev)
    } catch (e) {
      if (this.cancelled) return
      if (normalizePoemText(this.latestText) !== norm) return

      this.lastReadyParsed = null
      this.lastParsedNorm = null
      this.lastRawJson = null
      this.layoutVersion = 0
      const message = e instanceof Error ? e.message : 'Parse failed.'
      const isValidation = VALIDATION_ERR_RE.test(message)
      this.prev = {
        status: isValidation ? 'invalid' : 'error',
        parsed: null,
        rawJson: null,
        message,
        layoutVersion: 0,
      }
      this.onUpdate(this.prev)
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
