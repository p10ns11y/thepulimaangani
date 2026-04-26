/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'

import { applyLook, LOOK_STORAGE_KEY, normalizeStoredLookString } from '#/lib/applyLook'

describe('applyLook', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-look')
    document.documentElement.style.colorScheme = ''
  })

  it('sets data-look and color-scheme for redfill', () => {
    applyLook('redfill')
    expect(document.documentElement.dataset.look).toBe('redfill')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('sets data-look and color-scheme for real', () => {
    applyLook('real')
    expect(document.documentElement.dataset.look).toBe('real')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('LOOK_STORAGE_KEY matches shell script and AppShellSync', () => {
    expect(LOOK_STORAGE_KEY).toBe('look')
  })

  it('normalizes legacy fantasy storage to redfill', () => {
    expect(normalizeStoredLookString('fantasy')).toBe('redfill')
  })
})
