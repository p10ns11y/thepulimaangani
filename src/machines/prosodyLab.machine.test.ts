import { createActor } from 'xstate'
import { describe, expect, it } from 'vitest'

import { getFlatRows } from './prosodyLab.defaults'
import { prosodyLabMachine } from './prosodyLab.machine'

describe('prosodyLabMachine', () => {
  it('opens editor and seeds draft from poem text', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    const before = a.getSnapshot().context
    a.send({ type: 'prosody.EDITOR.OPEN' })
    const after = a.getSnapshot().context
    expect(after.editorOpen).toBe(true)
    expect(after.poemDraft).toBe(before.poemText)
  })

  it('applies draft to poem and closes editor', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    a.send({ type: 'prosody.EDITOR.OPEN' })
    a.send({ type: 'prosody.DRAFT.SET', text: 'தமிழ்' })
    a.send({ type: 'prosody.EDITOR.APPLY' })
    const ctx = a.getSnapshot().context
    expect(ctx.poemText).toBe('தமிழ்')
    expect(ctx.editorOpen).toBe(false)
  })

  it('keeps sample selection within the active metre after METRE.SET', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    a.send({ type: 'prosody.METRE.SET', metreKey: 'aciriyappa' })
    const ctx = a.getSnapshot().context
    const flat = getFlatRows('aciriyappa')
    expect(ctx.metreKey).toBe('aciriyappa')
    expect(flat.some((r) => r.en === ctx.selectedEn)).toBe(true)
  })
})
