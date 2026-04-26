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

export const DEFAULT_LIVE_PREVIEW: LivePreviewState = {
  status: 'idle',
  parsed: null,
  message: null,
  layoutVersion: 0,
}
