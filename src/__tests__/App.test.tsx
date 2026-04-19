import { describe, it, expect } from 'vitest'

describe('Basic Tests', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle Tamil text validation', () => {
    const isTamilText = (text: string): boolean => {
      const tamilRegex = /[\u0B80-\u0BFF]/
      return tamilRegex.test(text)
    }

    expect(isTamilText('தமிழ்')).toBe(true)
    expect(isTamilText('Hello')).toBe(false)
    expect(isTamilText('')).toBe(false)
    expect(isTamilText('தமிழ் 123')).toBe(true) // Mixed with numbers
    expect(isTamilText('தமிழ் English')).toBe(true) // Mixed with English
  })

  it('should validate input correctly', () => {
    const validateInput = (text: string): string | null => {
      const trimmed = text.trim()
      if (!trimmed) {
        return 'Please enter some text to analyze.'
      }
      if (!/[\u0B80-\u0BFF]/.test(trimmed)) {
        return 'Please enter text containing Tamil characters (தமிழ் எழுத்துக்கள்).'
      }
      if (trimmed.length < 2) {
        return 'Please enter more text for meaningful analysis.'
      }
      return null
    }

    expect(validateInput('')).toBe('Please enter some text to analyze.')
    expect(validateInput('   ')).toBe('Please enter some text to analyze.')
    expect(validateInput('Hello')).toBe('Please enter text containing Tamil characters (தமிழ் எழுத்துக்கள்).')
    expect(validateInput('த')).toBe('Please enter more text for meaningful analysis.')
    expect(validateInput('தமிழ்')).toBe(null)
    expect(validateInput('தமிழ் இலக்கியம்')).toBe(null)
  })

  it('should handle various Tamil Unicode characters', () => {
    const isTamilText = (text: string): boolean => {
      const tamilRegex = /[\u0B80-\u0BFF]/
      return tamilRegex.test(text)
    }

    // Test various Tamil characters
    const tamilChars = ['அ', 'ஆ', 'க', 'ங', 'ச', 'ஜ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம', 'ய', 'ர', 'ல', 'ள', 'ழ', 'வ', 'ஶ', 'ஷ', 'ஸ', 'ஹ', '்', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', 'ஃ']

    for (const char of tamilChars) {
      expect(isTamilText(char)).toBe(true)
    }
  })
})