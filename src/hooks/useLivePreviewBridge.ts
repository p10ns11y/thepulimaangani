import { useEffect, useRef } from 'react'
import type { ActorRefFrom } from 'xstate'

import { LivePreviewController } from '#/lib/livePreviewController'
import { prosodyLabMachine } from '#/machines/prosodyLab.machine'

/**
 * Debounced live preview WASM parse → `prosody.LIVE.STATE`.
 *
 * Controller is stable across poem-text changes (only recreated when the actor
 * or debounce policy changes) so in-flight first-load parses are not cancelled
 * by unrelated re-renders and cache stays warm while typing settles.
 */
export function useLivePreviewBridge(
  prosodyRef: ActorRefFrom<typeof prosodyLabMachine> | undefined,
  previewSource: string,
  debounceMs: number,
) {
  const controllerRef = useRef<LivePreviewController | null>(null)

  useEffect(() => {
    if (!prosodyRef) {
      controllerRef.current?.dispose()
      controllerRef.current = null
      return
    }
    const controller = new LivePreviewController(debounceMs, (live) => {
      prosodyRef.send({ type: 'prosody.LIVE.STATE', live })
    })
    controllerRef.current = controller
    controller.setSource(previewSource)
    return () => {
      controller.dispose()
      if (controllerRef.current === controller) {
        controllerRef.current = null
      }
    }
    // previewSource is applied in the effect below so text edits do not dispose
    // the controller mid-debounce / mid-WASM.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional stable controller
  }, [prosodyRef, debounceMs])

  useEffect(() => {
    controllerRef.current?.setSource(previewSource)
  }, [previewSource])
}
