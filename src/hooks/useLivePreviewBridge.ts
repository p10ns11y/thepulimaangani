import { useEffect } from 'react'
import type { ActorRefFrom } from 'xstate'

import { LivePreviewController } from '#/lib/livePreviewController'
import { prosodyLabMachine } from '#/machines/prosodyLab.machine'

/**
 * Debounced live preview WASM parse → `prosody.LIVE.STATE` (replaces the old `useDebouncedParsedPoem` hook).
 */
export function useLivePreviewBridge(
  prosodyRef: ActorRefFrom<typeof prosodyLabMachine> | undefined,
  previewSource: string,
  debounceMs: number,
) {
  useEffect(() => {
    if (!prosodyRef) return
    const c = new LivePreviewController(debounceMs, (live) => {
      prosodyRef.send({ type: 'prosody.LIVE.STATE', live })
    })
    c.setSource(previewSource)
    return () => {
      c.dispose()
    }
  }, [prosodyRef, previewSource, debounceMs])
}
