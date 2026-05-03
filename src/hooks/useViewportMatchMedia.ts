import { useEffect, useState } from 'react'

/**
 * `true` when `window.matchMedia(query)` matches. SSR / first paint: `false` until mounted.
 */
export function useViewportMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const m = window.matchMedia(query)
    const apply = () => setMatches(m.matches)
    apply()
    m.addEventListener('change', apply)
    return () => m.removeEventListener('change', apply)
  }, [query])

  return matches
}
