/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'

import { applyLook, LOOK_STORAGE_KEY, normalizeStoredLookString } from '#/lib/applyLook'
import { LEGACY_LOOK_STORAGE_MISSPELLING } from '#/lib/legacyLookStorage'

describe('applyLook', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-look')
    document.documentElement.style.colorScheme = ''
  })

  it('sets data-look and color-scheme for redpill', () => {
    applyLook('redpill')
    expect(document.documentElement.dataset.look).toBe('redpill')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('sets data-look and color-scheme for real', () => {
    applyLook('real')
    expect(document.documentElement.dataset.look).toBe('real')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('LOOK_STORAGE_KEY matches shell script and AppActorProvider look sync', () => {
    expect(LOOK_STORAGE_KEY).toBe('look')
  })

  it('normalizes legacy look storage values to redpill', () => {
    expect(normalizeStoredLookString('fantasy')).toBe('redpill')
    expect(normalizeStoredLookString(LEGACY_LOOK_STORAGE_MISSPELLING)).toBe('redpill')
  })
})
