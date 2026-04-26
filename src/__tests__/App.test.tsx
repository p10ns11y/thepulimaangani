import { describe, it, expect } from 'vitest'

import { isTamilText, validatePoemInput } from '#/lib/prosodyValidation'

describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle Tamil text validation', () => {
    expect(isTamilText('தமிழ்')).toBe(true)
    expect(isTamilText('Hello')).toBe(false)
    expect(isTamilText('')).toBe(false)
    expect(isTamilText('தமிழ் 123')).toBe(true)
    expect(isTamilText('தமிழ் English')).toBe(true)
  })

  it('should validate input correctly', () => {
    expect(validatePoemInput('')).toBe('Please enter some text to analyze.')
    expect(validatePoemInput('   ')).toBe('Please enter some text to analyze.')
    expect(validatePoemInput('Hello')).toBe(
      'Please enter text containing Tamil characters (தமிழ் எழுத்துக்கள்).',
    )
    expect(validatePoemInput('த')).toBe('Please enter more text for meaningful analysis.')
    expect(validatePoemInput('தமிழ்')).toBe(null)
    expect(validatePoemInput('தமிழ் இலக்கியம்')).toBe(null)
  })

  it('should handle various Tamil Unicode characters', () => {
    const tamilChars = [
      'அ', 'ஆ', 'க', 'ங', 'ச', 'ஜ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'ள', 'ழ', 'வ', 'ஶ',
      'ஷ', 'ஸ', 'ஹ', '்', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', 'ஃ',
    ]

    for (const char of tamilChars) {
      expect(isTamilText(char)).toBe(true)
    }
  })
})