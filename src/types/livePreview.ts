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
  /** Raw WASM JSON string from the last successful `runWasmParse` (Structure / export / copy). */
  rawJson: string | null
  message: string | null
  /** Increments on each successful parse; drives chip enter animations without blanking. */
  layoutVersion: number
}

export const DEFAULT_LIVE_PREVIEW: LivePreviewState = {
  status: 'idle',
  parsed: null,
  rawJson: null,
  message: null,
  layoutVersion: 0,
}
