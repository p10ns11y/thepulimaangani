import { useLayoutEffect, useRef, type ReactNode } from 'react'

import { createActorContext, useSelector } from '@xstate/react'
import type { ActorRefFrom } from 'xstate'

import { applyLook, LOOK_STORAGE_KEY, normalizeStoredLookString } from '#/lib/applyLook'
import { appMachine } from '#/machines/app.machine'
import type { AppLook } from '#/machines/app.machine'
import { prosodyLabMachine } from '#/machines/prosodyLab.machine'
import type { ProsodyContext } from '#/machines/prosodyLab.machine'

const app = createActorContext(appMachine)

function readStoredLook(): AppLook | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LOOK_STORAGE_KEY)
    if (raw === null) return null
    const v = normalizeStoredLookString(raw)
    if (raw !== v) {
      try {
        window.localStorage.setItem(LOOK_STORAGE_KEY, v)
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
 * Uses `app.useActorRef` / `app.useSelector` from the same `createActorContext` instance as the
 * surrounding Provider (not the re-exported hooks) so this always runs under `ActorProvider`,
 * including odd TanStack Start / error-boundary composition cases.
 */
function AppShellSync() {
  const actor = app.useActorRef()
  const look = app.useSelector((s) => s.context.look)
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

/**
 * Root XState provider. Inlines shell look sync as the first child so it cannot render outside
 * the actor context.
 */
export function AppActorProvider({ children }: { children: ReactNode }) {
  return (
    <app.Provider>
      <AppShellSync />
      {children}
    </app.Provider>
  )
}

export const useAppActorRef = app.useActorRef
export const useAppSelector = app.useSelector

/** Invoked prosody child ref from the app root machine (home / lab). */
export function useProsodyActorRefFromApp(): ActorRefFrom<typeof prosodyLabMachine> | undefined {
  const appRef = useAppActorRef()
  return useSelector(appRef, (s) => s.children['prosody'] as ActorRefFrom<typeof prosodyLabMachine> | undefined)
}

export function useProsodyContextFromApp(): ProsodyContext | undefined {
  const ref = useProsodyActorRefFromApp()
  return useSelector(ref, (snap) => snap?.context)
}
