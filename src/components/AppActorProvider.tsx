import { createActorContext, useSelector } from '@xstate/react'
import type { ActorRefFrom } from 'xstate'

import { appMachine } from '#/machines/app.machine'
import { prosodyLabMachine } from '#/machines/prosodyLab.machine'
import type { ProsodyContext } from '#/machines/prosodyLab.machine'

const app = createActorContext(appMachine)

export const AppActorProvider = app.Provider
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
