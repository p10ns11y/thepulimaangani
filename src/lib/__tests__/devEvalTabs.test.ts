import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DEV_EVAL_TAB,
  DEV_EVAL_TAB_KEYS,
  DEV_EVAL_TAB_LABELS,
  parseDevEvalTab,
  validateDevEvalSearch,
} from '#/lib/devEvalTabs'

describe('devEvalTabs', () => {
  it('accepts the three shareable tab keys', () => {
    expect(DEV_EVAL_TAB_KEYS).toEqual(['simple', 'research', 'docs'])
    expect(parseDevEvalTab('simple')).toBe('simple')
    expect(parseDevEvalTab('research')).toBe('research')
    expect(parseDevEvalTab('docs')).toBe('docs')
  })

  it('falls back to Simple guide for missing or invalid tab', () => {
    expect(parseDevEvalTab(undefined)).toBe(DEFAULT_DEV_EVAL_TAB)
    expect(parseDevEvalTab(null)).toBe('simple')
    expect(parseDevEvalTab('')).toBe('simple')
    expect(parseDevEvalTab('nope')).toBe('simple')
    expect(parseDevEvalTab(1)).toBe('simple')
    expect(parseDevEvalTab(['research'])).toBe('simple')
  })

  it('validateDevEvalSearch mirrors parse for route search', () => {
    expect(validateDevEvalSearch({})).toEqual({ tab: 'simple' })
    expect(validateDevEvalSearch({ tab: 'research' })).toEqual({
      tab: 'research',
    })
    expect(validateDevEvalSearch({ tab: 'docs', extra: 1 })).toEqual({
      tab: 'docs',
    })
    expect(validateDevEvalSearch({ tab: 'bogus' })).toEqual({ tab: 'simple' })
  })

  it('labels match the three UI tab names', () => {
    expect(DEV_EVAL_TAB_LABELS.simple).toBe('Simple guide')
    expect(DEV_EVAL_TAB_LABELS.research).toBe('Research fields')
    expect(DEV_EVAL_TAB_LABELS.docs).toBe('Training & docs')
  })
})
