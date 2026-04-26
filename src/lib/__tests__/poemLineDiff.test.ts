import { describe, expect, it } from 'vitest'

import { getChangedLineIndices, lineDiffOps } from '#/lib/poemLineDiff'

describe('lineDiffOps', () => {
  it('returns a single equal op when lines match', () => {
    expect(lineDiffOps('a\nb', 'a\nb')).toEqual([
      { type: 'equal', line: 'a' },
      { type: 'equal', line: 'b' },
    ])
  })

  it('emits delete then insert for a one-line replacement', () => {
    expect(lineDiffOps('a\nb', 'a\nc')).toEqual([
      { type: 'equal', line: 'a' },
      { type: 'delete', line: 'b' },
      { type: 'insert', line: 'c' },
    ])
  })

  it('emits delete for a removed middle line', () => {
    expect(lineDiffOps('a\nb\nc', 'a\nc')).toEqual([
      { type: 'equal', line: 'a' },
      { type: 'delete', line: 'b' },
      { type: 'equal', line: 'c' },
    ])
  })
})

describe('getChangedLineIndices', () => {
  it('lists draft indices of insert steps only', () => {
    expect(getChangedLineIndices('a\nb', 'a\nc')).toEqual([1])
    expect(getChangedLineIndices('a', 'a\nb')).toEqual([1])
  })

  it('is empty when the diff is deletions only', () => {
    expect(getChangedLineIndices('a\nb', 'a')).toEqual([])
  })
})
