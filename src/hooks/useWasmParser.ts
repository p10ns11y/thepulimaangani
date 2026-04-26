import { useCallback, useState } from 'react'

import { validatePoemInput } from '#/lib/prosodyValidation'
import { runWasmParse } from '#/lib/wasmParse'

export function useWasmParser() {
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const parse = useCallback(async (poemText: string) => {
    const inputError = validatePoemInput(poemText)
    if (inputError) {
      setValidationError(inputError)
      setResult(null)
      return
    }

    setValidationError(null)
    setLoading(true)
    try {
      const parseResult = await runWasmParse(poemText)
      setResult(parseResult)
    } catch (error) {
      console.error('Parsing error:', error)
      setValidationError(
        error instanceof Error
          ? error.message
          : 'An error occurred while analyzing the poem. Please try again.',
      )
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setValidationError(null)
  }, [])

  return { parse, result, loading, validationError, clearResult }
}
