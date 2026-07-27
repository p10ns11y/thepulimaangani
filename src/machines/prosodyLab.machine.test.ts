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

  it('opens New poem with empty typewriter and keeps previous as baseline', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    const before = a.getSnapshot().context.poemText
    a.send({ type: 'prosody.EDITOR.NEW' })
    const ctx = a.getSnapshot().context
    expect(ctx.editorOpen).toBe(true)
    expect(ctx.poemDraft).toBe('')
    expect(ctx.poemEditBaseline).toBe(before)
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

  it('keeps edit baseline after Done for left-preview diff highlighting', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    const before = a.getSnapshot().context.poemText
    a.send({ type: 'prosody.EDITOR.OPEN' })
    expect(a.getSnapshot().context.poemEditBaseline).toBe(before)
    a.send({ type: 'prosody.DRAFT.SET', text: 'புதிய வரி' })
    a.send({ type: 'prosody.EDITOR.APPLY' })
    const ctx = a.getSnapshot().context
    expect(ctx.poemText).toBe('புதிய வரி')
    expect(ctx.poemEditBaseline).toBe(before)
    expect(ctx.poemEditBaseline).not.toBe(ctx.poemText)
    // Done must not be followed by CLOSE in UI; if CLOSE ran, baseline would clear
    expect(ctx.editorOpen).toBe(false)
  })

  it('APPLY then CLOSE would clear baseline (documents why Done must not CLOSE)', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    const before = a.getSnapshot().context.poemText
    a.send({ type: 'prosody.EDITOR.OPEN' })
    a.send({ type: 'prosody.DRAFT.SET', text: 'x' })
    a.send({ type: 'prosody.EDITOR.APPLY' })
    expect(a.getSnapshot().context.poemEditBaseline).toBe(before)
    a.send({ type: 'prosody.EDITOR.CLOSE' })
    expect(a.getSnapshot().context.poemEditBaseline).toBeNull()
  })

  it('clears edit baseline on cancel close', () => {
    const a = createActor(prosodyLabMachine)
    a.start()
    a.send({ type: 'prosody.EDITOR.OPEN' })
    a.send({ type: 'prosody.DRAFT.SET', text: 'x' })
    a.send({ type: 'prosody.EDITOR.CLOSE' })
    expect(a.getSnapshot().context.poemEditBaseline).toBeNull()
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
