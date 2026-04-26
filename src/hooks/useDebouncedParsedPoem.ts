import { useEffect, useRef, useState } from 'react'

import { adaptWasmJsonToParsedPoem } from '#/lib/adaptWasmParseJson'
import { normalizePoemText } from '#/lib/poemTextNormalize'
import { runWasmParse } from '#/lib/wasmParse'
import type { ParsedPoem } from '#/types/parsedPoem'

export type LivePreviewStatus =
  | 'idle'
  | 'syncing'
  | 'pending'
  | 'ready'
  | 'invalid'
  | 'error'

export type LivePreviewState = {
  status: LivePreviewStatus
  parsed: ParsedPoem | null
  message: string | null
  /** Increments on each successful parse; drives chip enter animations without blanking. */
  layoutVersion: number
}

const DEFAULT_STATE: LivePreviewState = {
  status: 'idle',
  parsed: null,
  message: null,
  layoutVersion: 0,
}

const VALIDATION_ERR_RE = /Please enter|Tamil characters|meaningful analysis/

/**
 * Debounced WASM parse while the user types, for live syllable colouring.
 * Keeps the last successful `parsed` visible during `syncing` / `pending` so the UI does not
 * flash empty; chips gently dim until the new layout lands (`layoutVersion` bumps on success).
 */
export function useDebouncedParsedPoem(poemText: string, debounceMs = 420): LivePreviewState {
  const [state, setState] = useState<LivePreviewState>(DEFAULT_STATE)
  const latestRef = useRef(poemText)
  const lastParsedNormRef = useRef<string | null>(null)
  const lastReadyParsedRef = useRef<ParsedPoem | null>(null)
  const layoutVersionRef = useRef(0)
  latestRef.current = poemText

  useEffect(() => {
    const trimmed = poemText.trim()
    if (!trimmed) {
      lastParsedNormRef.current = null
      lastReadyParsedRef.current = null
      layoutVersionRef.current = 0
      setState(DEFAULT_STATE)
      return
    }

    const norm = normalizePoemText(poemText)
    const cached = lastReadyParsedRef.current
    if (cached && normalizePoemText(cached.original_text) === norm) {
      lastParsedNormRef.current = norm
      setState({
        status: 'ready',
        parsed: cached,
        message: null,
        layoutVersion: layoutVersionRef.current,
      })
      return
    }

    if (lastParsedNormRef.current === null || norm !== lastParsedNormRef.current) {
      setState((prev) => ({
        status: 'syncing',
        parsed: lastReadyParsedRef.current ?? prev.parsed,
        message: null,
        layoutVersion: prev.layoutVersion,
      }))
    }

    let cancelled = false

    const t = window.setTimeout(() => {
      void (async () => {
        if (cancelled) return
        if (normalizePoemText(latestRef.current) !== norm) return

        setState((prev) => ({
          status: 'pending',
          parsed: lastReadyParsedRef.current ?? prev.parsed,
          message: null,
          layoutVersion: prev.layoutVersion,
        }))

        try {
          const raw = await runWasmParse(poemText)
          if (cancelled) return
          if (normalizePoemText(latestRef.current) !== norm) return

          const rawJson: unknown = JSON.parse(raw)
          const data = adaptWasmJsonToParsedPoem(rawJson)
          if (!data) {
            lastReadyParsedRef.current = null
            lastParsedNormRef.current = null
            layoutVersionRef.current = 0
            setState({
              status: 'error',
              parsed: null,
              message: 'Unexpected parser output.',
              layoutVersion: 0,
            })
            return
          }

          lastParsedNormRef.current = normalizePoemText(data.original_text)
          lastReadyParsedRef.current = data
          layoutVersionRef.current += 1
          setState({
            status: 'ready',
            parsed: data,
            message: null,
            layoutVersion: layoutVersionRef.current,
          })
        } catch (e) {
          if (cancelled) return
          if (normalizePoemText(latestRef.current) !== norm) return

          lastReadyParsedRef.current = null
          lastParsedNormRef.current = null
          layoutVersionRef.current = 0
          const message = e instanceof Error ? e.message : 'Parse failed.'
          const isValidation = VALIDATION_ERR_RE.test(message)
          setState({
            status: isValidation ? 'invalid' : 'error',
            parsed: null,
            message,
            layoutVersion: 0,
          })
        }
      })()
    }, debounceMs)

    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [poemText, debounceMs])

  return state
}
