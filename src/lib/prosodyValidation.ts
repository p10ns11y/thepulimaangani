const TAMIL_BLOCK = /[\u0B80-\u0BFF]/

export function isTamilText(text: string): boolean {
  return TAMIL_BLOCK.test(text)
}

/** Returns an English user message when invalid; `null` when OK. */
export function validatePoemInput(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) {
    return 'Please enter some text to analyze.'
  }
  if (!isTamilText(trimmed)) {
    return 'Please enter text containing Tamil characters (தமிழ் எழுத்துக்கள்).'
  }
  if (trimmed.length < 2) {
    return 'Please enter more text for meaningful analysis.'
  }
  return null
}
