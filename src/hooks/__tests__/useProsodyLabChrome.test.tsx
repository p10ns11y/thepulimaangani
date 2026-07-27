/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useProsodyLabChrome } from '#/hooks/useProsodyLabChrome'
import { INPUT_RAIL_EXPANDED_KEY, readInputRailExpanded } from '#/lib/prosodyLabLayoutPreferences'
import {
  readPaperPhysicsEnabled,
  readTypewriterSoundEnabled,
} from '#/lib/typewriterEditorPreferences'

const PHYSICS_KEY = 'thepulimaangani.typewriter.paperPhysics'
const SOUND_KEY = 'thepulimaangani.typewriter.sound'

describe('useProsodyLabChrome', () => {
  afterEach(() => {
    window.localStorage.removeItem(INPUT_RAIL_EXPANDED_KEY)
    window.localStorage.removeItem(PHYSICS_KEY)
    window.localStorage.removeItem(SOUND_KEY)
  })

  it('hydrates from preference helpers and persists rail/physics/sound via setters', () => {
    window.localStorage.setItem(INPUT_RAIL_EXPANDED_KEY, '0')
    window.localStorage.setItem(PHYSICS_KEY, '0')
    window.localStorage.setItem(SOUND_KEY, '1')

    const { result } = renderHook(() => useProsodyLabChrome())
    expect(result.current.inputRailExpanded).toBe(false)
    expect(result.current.paperPhysicsOn).toBe(false)
    expect(result.current.typewriterSoundOn).toBe(true)

    act(() => {
      result.current.setInputRail(true)
      result.current.setPaperPhysicsOn(true)
      result.current.setTypewriterSoundOn(false)
    })

    expect(result.current.inputRailExpanded).toBe(true)
    expect(result.current.paperPhysicsOn).toBe(true)
    expect(result.current.typewriterSoundOn).toBe(false)

    // Real shipped helpers must see the writes (not a parallel mock of storage keys only).
    expect(readInputRailExpanded()).toBe(true)
    expect(readPaperPhysicsEnabled()).toBe(true)
    expect(readTypewriterSoundEnabled()).toBe(false)
  })
})
