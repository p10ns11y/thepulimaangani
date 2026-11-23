import { describe, expect, it } from 'vitest'

import { getLineClassDisplay } from '#/components/prosody/displayLabels'

describe('adi line class labels', () => {
  it('maps seer-count classes through kazhinediladi', () => {
    expect(getLineClassDisplay('Kuraladi')).toBe('குறளடி')
    expect(getLineClassDisplay('Cinthadi')).toBe('சிந்தடி')
    expect(getLineClassDisplay('Alavadi')).toBe('அளவடி')
    expect(getLineClassDisplay('Nediladi')).toBe('நெடிலடி')
    expect(getLineClassDisplay('Kazhinediladi')).toBe('கழிநெடிலடி')
    expect(getLineClassDisplay('kazhineTilaTi')).toBe('கழிநெடிலடி')
  })
})