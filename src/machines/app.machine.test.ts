import { createActor } from 'xstate'
import type { AnyActorRef } from 'xstate'
import { describe, expect, it } from 'vitest'

import { appMachine } from './app.machine'

describe('appMachine', () => {
  it('toggles look between real and fantasy', () => {
    const app = createActor(appMachine)
    app.start()
    expect(app.getSnapshot().context.look).toBe('real')
    app.send({ type: 'app.LOOK.TOGGLE' })
    expect(app.getSnapshot().context.look).toBe('fantasy')
    app.send({ type: 'app.LOOK.TOGGLE' })
    expect(app.getSnapshot().context.look).toBe('real')
  })

  it('sets look with LOOK.SET', () => {
    const app = createActor(appMachine)
    app.start()
    app.send({ type: 'app.LOOK.SET', look: 'fantasy' })
    expect(app.getSnapshot().context.look).toBe('fantasy')
    app.send({ type: 'app.LOOK.SET', look: 'real' })
    expect(app.getSnapshot().context.look).toBe('real')
  })

  it('invokes prosody child actor', () => {
    const app = createActor(appMachine)
    app.start()
    const pro = app.getSnapshot().children['prosody'] as AnyActorRef | undefined
    expect(pro).toBeDefined()
    const before = pro!.getSnapshot().context
    pro!.send({ type: 'prosody.EDITOR.OPEN' })
    const after = pro!.getSnapshot().context
    expect(after.editorOpen).toBe(true)
    expect(after.poemDraft).toBe(before.poemText)
  })
})
