import { createActor } from 'xstate'
import { describe, expect, it } from 'vitest'

import { appMachine } from '#/machines/app.machine'

describe('appMachine prosody invoke', () => {
  it('exposes the prosody actor under the id expected by useProsodyActorRefFromApp', () => {
    const a = createActor(appMachine)
    a.start()
    const snap = a.getSnapshot()
    expect(snap.children.prosody).toBeDefined()
  })
})
