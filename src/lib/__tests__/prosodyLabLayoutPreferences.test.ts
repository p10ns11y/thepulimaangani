/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'

import {
  INPUT_RAIL_EXPANDED_KEY,
  prosodyLabGridClass,
  readInputRailExpanded,
  writeInputRailExpanded,
} from '#/lib/prosodyLabLayoutPreferences'

describe('prosodyLabLayoutPreferences', () => {
  afterEach(() => {
    window.localStorage.removeItem(INPUT_RAIL_EXPANDED_KEY)
  })

  it('defaults expanded when unset (discoverable samples)', () => {
    expect(readInputRailExpanded()).toBe(true)
  })

  it('round-trips expanded flag through localStorage', () => {
    writeInputRailExpanded(false)
    expect(window.localStorage.getItem(INPUT_RAIL_EXPANDED_KEY)).toBe('0')
    expect(readInputRailExpanded()).toBe(false)
    writeInputRailExpanded(true)
    expect(readInputRailExpanded()).toBe(true)
  })

  it('maps expanded → split grid, collapsed → full-width results', () => {
    const open = prosodyLabGridClass(true)
    const closed = prosodyLabGridClass(false)
    expect(open).toMatch(/38\.2fr/)
    expect(open).toMatch(/61\.8fr/)
    expect(closed).toBe('lg:grid-cols-1')
    expect(closed).not.toMatch(/38\.2/)
  })
})
