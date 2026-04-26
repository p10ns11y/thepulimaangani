import { useLayoutEffect, useRef } from 'react'

import { useAppActorRef, useAppSelector } from '#/components/AppActorProvider'
import { applyLook, LOOK_STORAGE_KEY, normalizeStoredLookString } from '#/lib/applyLook'
import type { AppLook } from '#/machines/app.machine'

function readStoredLook(): AppLook | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOOK_STORAGE_KEY)
    if (raw === null) return null
    const v = normalizeStoredLookString(raw)
    if (raw === 'fantasy' && v === 'redfill') {
      try {
        window.localStorage.setItem(LOOK_STORAGE_KEY, 'redfill')
      } catch {
        /* ignore */
      }
    }
    return v
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Hydrates `look` from localStorage once, then syncs `data-look` + storage from the machine.
 *
 * Important: on the first client commit, `useAppSelector(look)` can still be the default `real`
 * while `localStorage` and the inline FOUC script already say `redfill`. A plain `applyLook(look)`
 * would clobber the correct `documentElement.dataset` before the next render. Always apply
 * `actor.getSnapshot().context.look` after the optional rehydration send.
 */
export function AppShellSync() {
  const actor = useAppActorRef()
  const look = useAppSelector((s) => s.context.look)
  const didHydrate = useRef(false)

  useLayoutEffect(() => {
    if (!didHydrate.current) {
      const stored = readStoredLook()
      if (stored && stored !== actor.getSnapshot().context.look) {
        actor.send({ type: 'app.LOOK.SET', look: stored })
      }
      didHydrate.current = true
    }
    const resolved = actor.getSnapshot().context.look
    applyLook(resolved)
    try {
      window.localStorage.setItem(LOOK_STORAGE_KEY, resolved)
    } catch {
      /* ignore */
    }
  }, [actor, look])

  return null
}
